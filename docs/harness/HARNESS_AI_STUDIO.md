# Harness AI Studio — padrões de engenharia

> Para geração assistida de código no AI Studio, onde o agente **não tem o
> repositório inteiro em mãos** nem terminal para rodar a suíte.
>
> O harness conversacional é outro documento: `HARNESS_CLAUDE.md`.
>
> Este arquivo substitui `39_AI_STUDIO_PROMPTS.md` como contrato. Os prompts
> daquele documento continuam válidos como roteiro de missão; **as regras
> abaixo valem sobre eles**.

---

## 0 · Por que este harness existe

O AI Studio produz código rápido e plausível. Foi assim que este repositório
ganhou, entre outras coisas:

- três cursos inventados no catálogo, com professora morta em 1896;
- dezesseis botões que abriam um alerta em vez de agir — e cinco deles
  **afirmavam ter agido**;
- uma tela de auditoria de segurança relatando um ataque que nunca houve;
- um catálogo paralelo de 197 linhas que nenhuma tela consumia;
- noventa e quatro campos de formulário sem rótulo acessível.

Nada disso é erro de sintaxe. **Compila, passa no lint e a tela abre.** É
código plausível descrevendo um produto que não existe.

Este harness existe para que a próxima geração não repita.

---

## 1 · A restrição que define tudo

> **Sem contexto completo, a tendência é preencher a lacuna com algo
> plausível. É exatamente isso que não pode acontecer.**

Quando faltar informação, a resposta certa é **declarar a lacuna**, não
inventar um preenchimento razoável.

| Situação | Errado | Certo |
|---|---|---|
| Não sei quais cursos existem | Inventar três | Ler `src/data/seed-academy-content.ts`; se não tiver acesso, dizer |
| Não sei se há repositório | Escrever a lista na tela | Declarar a dependência e o contrato que ela precisa cumprir |
| Não sei o que o botão faz | `alert('…')` | Não desenhar o botão |
| Não sei o formato do dado | Inventar um | Pedir o tipo, ou ler `src/domain/` |

---

## 2 · Antes de gerar qualquer código

Ler, nesta ordem:

1. **`73_ANTIPATTERNS.md`** — o que já foi construído errado aqui e não pode voltar
2. `18_FRONTEND_ARCHITECTURE.md` — camadas e onde cada coisa mora
3. `17_DESIGN_SYSTEM.md` — tokens, paleta, primitivas
4. `16_SCREEN_CONTRACTS.md` — o contrato da tela a construir
5. `04_DOMAIN_MODEL.md` — os tipos

Produzir, **antes da primeira linha de código**:

- mapa de dependências do que vai ser tocado;
- o que já existe e será reaproveitado;
- contradições encontradas entre documento e código;
- qual contrato governa cada decisão.

---

## 3 · Camadas — e o que nunca atravessa

```
  ui/           telas e componentes · não conhecem armazenamento
   ↓
  services/     casos de uso · orquestram, não persistem
   ↓
  repositories/ persistência · a ÚNICA camada que fala com localStorage
   ↓
  domain/       tipos e regras puras · não importam nada de ui nem de infra
```

**Proibido, e cada um já aconteceu:**

- tela lendo `localStorage` direto;
- regra de negócio duplicada entre `domain/` e componente;
- `domain/` importando de `ui/`;
- repositório desenhando interface;
- **segunda coleção descrevendo a mesma entidade.**

### Dado nunca mora na tela

```tsx
// ERRADO — antipadrão A1, o que mais custou neste projeto
const salas = [
  { id: 'sala-1', teacher: 'Profa. Dra. Clara Schumann', membersCount: 16 },
];

// CERTO
const [salas, setSalas] = useState<Sala[] | null>(null);
useEffect(() => {
  roomsRepository.listar().then(setSalas).catch(() => setSalas([]));
}, []);
```

Configuração de interface — abas, filtros, itens de menu, etapas de assistente
— **é** estrutura da tela e mora nela. A distinção: dado do produto carrega
pessoa, data, contagem ou situação; configuração carrega rótulo e ícone.

---

## 4 · Todo controle age

```tsx
// ERRADO — as três formas
<button onClick={() => {}}>Salvar</button>
<button onClick={() => alert('Importar arquivo')}>Importar</button>
<button onClick={() => alert('Inscrição confirmada!')}>Inscrever</button>
//                       ↑ esta é a pior: afirma ter feito

// ERRADO — sucesso sem efeito, a versão silenciosa
const salvar = () => {
  setSalvo(true);
  setTimeout(() => setSalvo(false), 3000);
};

// CERTO
const salvar = async () => {
  setSalvando(true);
  try {
    await repositorio.salvar(rascunho);
    setSalvo(true);
  } catch {
    setErro('Não foi possível salvar.');
  } finally {
    setSalvando(false);
  }
};
```

**Se o recurso não existe, o controle não existe.** Uma tela com menos botões
e nenhum mentiroso é melhor que o contrário.

---

## 5 · Estados governados pelos dados

Toda tela que busca algo atravessa quatro estados, e os quatro são
alcançáveis pelo que o repositório devolve:

```tsx
<ScreenContainer
  state={
    dados === null ? 'loading'
    : erro ? 'error'
    : visiveis.length === 0 ? 'empty'
    : 'populated'
  }
  emptyProps={{
    title: 'Nenhuma sala de aula aberta',
    description:
      'Ainda não há turmas no Conservatório. O conteúdo dos cursos está ' +
      'disponível para estudo independente enquanto isso.',
  }}
>
```

O estado vazio **diz o que existe no lugar**. "Nenhum resultado" sozinho é
beco sem saída.

---

## 6 · Isolamento por usuário — não negociável

Não há banco de dados. Tudo vive no `localStorage` de um navegador **que pode
ser compartilhado**.

```ts
// ERRADO — vazou o desempenho de todo mundo que usou o navegador
public async listMasteriesByUser(_userId: string) {
  return this.storage.get<MasteryRecord[]>(CHAVE) || [];
}

// CERTO
public async listMasteriesByUser(userId: string) {
  return (this.storage.get<MasteryRecord[]>(CHAVE) || [])
    .filter((m) => m.userId === userId);
}
```

Vale **sem exceção**, inclusive quando "só tem um usuário mesmo".

### Três categorias de chave, que nunca se misturam

| Categoria | Exemplos | A publicação reescreve? |
|---|---|---|
| Conteúdo publicado | cursos, módulos, lições | **Sim** |
| Dado do aluno | progresso, tentativas, certificados, histórico | **Nunca** |
| Trabalho editorial | correções de texto, livretos | **Nunca** |

---

## 7 · Autoridade vem do servidor

```ts
// ERRADO — quem editar o localStorage vira administrador
if (user.email === 'alguem@exemplo.com') liberar();
if (user.primaryRole === 'ADMIN') liberar();

// CERTO — a sessão traz isAdmin porque o SERVIDOR a assinou
const { ehAdmin } = useUsuarioAtual();
```

A allowlist é variável de ambiente do servidor. Allowlist vazia ⇒ nenhum
administrador. Exibir o papel é legítimo; **decidir acesso com ele, não**.

---

## 8 · Acessibilidade não é etapa final

```tsx
// ERRADO — quem navega por teclado NÃO CONSEGUE responder a prova
<div onClick={() => escolher(opcao)}>{opcao.texto}</div>

// CERTO
<button type="button" aria-pressed={escolhida} onClick={() => escolher(opcao)}>
  {opcao.texto}
</button>
```

```tsx
// ERRADO — irmãos, sem vínculo. Clicar no texto não foca o campo.
<label>Clave</label>
<select value={clave} />

// CERTO
<label htmlFor="clave">Clave</label>
<select id="clave" value={clave} />
```

- Ícone sozinho em botão exige `aria-label` **descrevendo a ação**.
- Placeholder **não é rótulo**: some ao digitar.
- `role="presentation"` no fundo de diálogo — é atalho de mouse, e Esc é o
  caminho garantido.

---

## 9 · Texto

Português do Brasil, com acentuação correta. Reticências tipográficas (`…`),
nunca três pontos.

**Proibido, e cada um tem verificação:**

- prometer titulação reconhecida — o Conservatório é **curso livre**;
- citar fonte, obra, autor de referência ou universidade **em qualquer lugar**;
- inglês em interface em português;
- marcador de trabalho inacabado escapando para a tela.

---

## 10 · Roteiro por área

Os prompts 00–12 de `39_AI_STUDIO_PROMPTS.md` continuam servindo de roteiro.
O que muda é o critério de aceitação de cada um:

| Prompt | Acrescentar |
|---|---|
| 01 Shell | Toda rota declara audiência em `audiencia.ts`, com o motivo escrito |
| 02 Auth | Só Google. Sem senha. `isAdmin` da sessão assinada |
| 03 Academy | Conteúdo pelo esquema, nunca no componente. Camada editorial aplicada na leitura |
| 04 Practice | Motor é adaptador. Estado inicial **zerado** — não semear progresso |
| 05 Profile | Visibilidade filtrada na origem. Perfil de terceiro recebe projeção pública |
| 06 Community | Tópico, resposta e inscrição **persistem**. Sem moderação fingida |
| 07 Rooms | Criar sala grava. Diretório lê. Vazio é vazio |
| 08 Score | Só oferecer exportar/salvar quando existir |
| 09 Studio | Editor de verdade: estado, comandos, desfazer. Não fachada |
| 10 Admin | Toda mutação auditada. Nenhum painel que responde sem consultar |
| 11 Quality | `npm run verificar`. Não esconder lacuna |
| 12 Refactor | Não refatorar por estética |

---

## 11 · Entrega

Ao terminar, declarar:

1. **O que foi feito**, com os arquivos.
2. **O que ficou por fazer**, com o motivo.
3. **O que não foi verificado** — e se não houve como rodar a suíte, dizer
   isso em vez de supor que passa.
4. **Contradições encontradas** entre documento e código.

A classificação de capacidade (`VERIFIED` … `UNVERIFIED`) é obrigatória, e
`UNVERIFIED` não vira `EXISTING` em silêncio.

---

## 12 · Recusa

O agente **recusa e explica** quando a instrução pedir:

- dado fabricado para preencher tela;
- controle que não age;
- privilégio decidido no cliente;
- leitura de dado de aluno sem filtro;
- promessa de titulação reconhecida;
- citação de fonte;
- remoção de capacidade existente sem auditoria.

Recusar aqui é mais barato que auditar depois. Este repositório tem o registro
de quanto custou não recusar.
