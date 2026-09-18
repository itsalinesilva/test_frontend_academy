# 72 · Pente fino de qualidade

> `npm run qa` · `scripts/qa.mjs` · `tests/pente-fino.test.ts`

## Por que este documento existe

A plataforma chegou a um ponto em que **parecia pronta e não estava**, e a
diferença não era visível abrindo tela. Três cursos inventados ficaram no
catálogo porque a tela ficava bonita com eles. Um diretório de salas listava
turmas de professores que não existem. Uma tela de auditoria de segurança
relatava uma tentativa de invasão que nunca houve. Um botão dizia "inscrição
confirmada" sem inscrever ninguém.

Nada disso é erro de programação: compila, passa no lint, e a tela abre. É o
produto afirmando coisas falsas — e a única defesa contra isso é uma
verificação que pergunte, arquivo por arquivo, **onde a tela está afirmando o
que o produto não faz**.

Este documento descreve essa verificação, e — igualmente importante — o que
ela **não** alcança.

---

## Como rodar

```
npm run qa            # relatório legível
npm run qa -- --so-falhas   # só o que tem achado
npm run qa:json       # o mesmo, em JSON, para outras ferramentas
npm run verificar     # typecheck + lint + qa + testes
```

O pente fino também roda dentro de `npm run build` e dentro da suíte, por
`tests/pente-fino.test.ts`. Rodar à mão é para ler; rodar na suíte é para não
depender de alguém lembrar.

### Como ler o relatório

| Marca | Significa |
|---|---|
| `FALHA` | O produto está errado agora. Sai com código diferente de zero e trava o build. |
| `AVISO` | Defeito real, com dívida contada e teto travado na suíte. Não impede publicar hoje. |
| `ok` | **Aquela** verificação passou. Não quer dizer que a tela está boa. |

A última linha é a que importa mais:

```
bloqueios 0 · a corrigir 129
não coberto por máquina: docs/harness/QUALIDADE.md
```

---

## O que é verificado

### Segurança — o dado de um aluno não aparece para outro

O armazenamento é do **dispositivo**, não da conta. Computador de casa, de
escola ou de biblioteca é dividido. Se uma leitura não filtrar por quem está
logado, o segundo aluno vê o primeiro — sem ataque nenhum, bastando usar o
produto. É o modo de falha natural desta arquitetura, e por isso tem a seção
mais dura.

| Verificação | O que quebra se falhar |
|---|---|
| leitura de dado de aluno filtra por usuário | `listMasteriesByUser(_userId)` ignorava o identificador e devolvia o desempenho de todo mundo |
| nenhuma chave de armazenamento colide | dois repositórios gravando na mesma chave; o aluno perde progresso sem ninguém descobrir |
| publicar conteúdo não apaga dado do aluno | a republicação do catálogo passando por cima de progresso, certificados e histórico |
| privilégio de admin não é decidido no cliente | bastaria editar o `localStorage` para virar administrador |
| nenhum dado pessoal vai ao console | vaza em qualquer máquina com o inspetor aberto |
| nenhuma injeção de HTML sem sanitização | conteúdo do aluno virando script |
| encerrar sessão apaga a sessão local | a conta seguinte herdando a sessão da anterior |

### Negócio — a plataforma não promete o que não entrega

| Verificação | Regra |
|---|---|
| nenhuma promessa de titulação reconhecida | O Conservatório oferece **curso livre**. "Diploma reconhecido", "curso superior" e "validade nacional" são propaganda enganosa, não deslize de redação. |
| a ressalva de curso livre está escrita | Não basta não mentir: a condição precisa estar **dita**, no documento impresso, onde a pessoa forma expectativa. |
| nenhum dado fabricado no catálogo | Pessoa inventada, foto de banco de imagens, usuário fictício, endereço de exemplo. |
| **nenhum conjunto de dados escrito na tela** | Uma tela que declara um vetor de registros com pessoa, data ou contagem está fabricando. Dado mora em repositório. |
| **nenhum botão falso** | Controle que só abre `alert`, ou cujo `onClick` não faz nada. |
| **nenhum sucesso anunciado sem efeito** | A versão silenciosa do anterior: acende "Salvo!" por três segundos e não grava. |
| nada prometido para "em breve" | Dívida que o aluno paga: ele procurou, achou, e não pode usar. |
| todo o repertório é de domínio público | Obra protegida sem licença é problema jurídico, não detalhe de catálogo. |

### Rotas e fluxo

| Verificação | O que pega |
|---|---|
| nenhuma tela órfã | tela que existe no código e nenhuma rota abre |
| nenhuma tela vaza conteúdo de logado | "Ver meus certificados" numa tela que um visitante abre |
| todo destino de navegação existe | `navigate('/x')` para uma rota que ninguém atende |

### Texto

Bloqueiam: codificação corrompida, marcador de trabalho inacabado, markdown
quebrado no conteúdo do aluno. Estão em aviso: acentuação, pontuação e inglês
vazando em interface em português.

### Usabilidade

Nome acessível em botão só com ícone, rótulo em campo de formulário, `alt` em
imagem, alcance por teclado em elemento clicável. Todas em aviso, com teto
travado na suíte — ver a seção de dívida.

---

## O que este pente fino NÃO cobre

Esta seção é a mais importante do documento. Uma ferramenta de qualidade que
não declara os próprios limites induz exatamente o erro que ela existe para
evitar: alguém lê "0 bloqueios" e conclui "está pronto".

**Não é verificado por máquina, e continua não sendo até alguém verificar:**

1. **Gramática de verdade.** Concordância, regência, coesão, e se a frase faz
   sentido no lugar em que está. O que há é uma lista fechada de palavras
   acentuadas — e mesmo essa exclui de propósito "esta/está", "pratica" e
   "publica", porque as duas formas existem e decidir exige ler a frase. Os
   126 capítulos dos cinco cursos **nunca passaram por revisão humana**.

2. **Se o conteúdo ensina certo.** O pente fino confere que o capítulo 5 do
   livreto corresponde à lição 5 do curso — isso está em
   `tests/integridade-do-academy.test.ts`. Não confere se o que a lição 5
   ensina sobre semitons está musicalmente correto.

3. **Aparência.** Nada aqui olha pixel, contraste, espaçamento ou hierarquia
   visual. A paridade com as telas de referência foi medida por
   `scripts/measure-parity.mjs`, que conta estrutura declarada, não desenho.

4. **Comportamento no navegador de verdade.** Os testes rodam em jsdom, que
   não tem layout, não calcula `scrollLeft` e não toca som. O defeito do campo
   de busca — texto empurrado para fora da vista durante a animação de largura
   — **não é reproduzível em jsdom**, e foi encontrado só abrindo o navegador.

5. **Mobile.** Nenhuma verificação toca em largura de tela, alvo de toque ou
   gesto.

6. **A cópia de segurança no Drive.** Que o `localStorage` guarda está provado
   em `tests/persistencia-e-isolamento.test.ts`. Que o JSON chega ao Drive da
   pessoa, **não está** — exige conta Google real e uma rodada de ponta a
   ponta.

7. **`navigate(variavel)`.** Só destinos literais são conferidos. Navegação
   montada em tempo de execução escapa.

8. **Se a regra de negócio está certa.** O pente fino garante que a plataforma
   não promete titulação reconhecida. Não tem como saber se a carga horária de
   16 horas do curso de Teoria é justa — isso é decisão pedagógica, e está
   documentada em `src/domain/carga-horaria.ts`.

---

## A dívida, e como ela é contada

`tests/pente-fino.test.ts` trava cada verificação num **teto medido**, e o
teto só desce.

| Verificação | No levantamento | Hoje |
|---|---:|---:|
| todo botão tem nome acessível | 13 | **0** |
| todo campo tem rótulo | 94 | **0** |
| toda imagem tem alt | 0 | **0** |
| todo clicável alcançável pelo teclado | 22 | **0** |

O teto começou sendo o estado real, não uma meta — travá-lo em zero antes de
as correções existirem transformaria a suíte numa mentira, que é o problema
que este trabalho inteiro existe para corrigir. As 129 correções foram feitas,
e por isso os tetos são zero agora.

Continuam escritos como teto porque é a forma que registra o caminho: se um
número voltar a subir, a suíte diz de quanto para quanto, e em qual arquivo.

---

## Como acrescentar uma verificação

Um checador recebe o repositório lido e devolve **achados**. Achado tem
arquivo, linha e o que está errado — sem isso não é achado, é opinião.

```js
// scripts/qa/<assunto>.mjs
import { interfaces } from './nucleo.mjs';

export function checarAlgumaCoisa() {
  const achados = [];
  for (const { arquivo, codigo } of interfaces()) {
    // `codigo` vem sem comentários: o comentário que EXPLICA um problema
    // não pode ser acusado como se fosse o problema.
  }
  return achados;
}
```

Depois, registre em `scripts/qa.mjs` com a gravidade certa, e acrescente o
caso em `tests/pente-fino.test.ts`.

**Duas regras aprendidas errando:**

- *Confira o checador contra texto correto antes de confiar nele.* A busca de
  marcadores rodava com `/i`, e "em **todo** o catálogo" casava com `TODO`. Um
  relatório que acusa texto perfeito ensina a ignorar o relatório.
- *Comentário não é código.* Sem removê-los, o comentário que documenta por
  que a ressalva de curso livre existe era acusado como a promessa indevida
  que ele previne.

---

## Histórico

Criado em setembro de 2026, junto com a remoção dos achados que ele
encontrou na primeira execução. O relatório completo daquela execução, e o que
foi feito com cada achado, está no commit que introduziu `scripts/qa.mjs`.
