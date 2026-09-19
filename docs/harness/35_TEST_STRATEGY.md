# 35 · Estratégia de teste

> Substitui a versão anterior, que listava categorias sem dizer **em que
> ordem**, **o que cada camada responde** nem **o que nenhuma alcança**.
>
> Comando único: `npm run verificar`.

---

## 1 · A ordem, e por que é esta

A ordem não é burocrática: **cada camada só é confiável se a anterior
passou**. Testar fluxo com tipos quebrados produz erro que não é do fluxo;
testar integração com dado vazando produz resultado que não significa nada.

```
  0  FORMA        tsc + eslint            o código é o que diz ser
  1  VERDADE      npm run qa              a tela não mente
  2  DOMÍNIO      testes puros            a regra está certa
  3  PERSISTÊNCIA localStorage real       o que se faz sobrevive
  4  ISOLAMENTO   dois usuários           o dado de um não chega ao outro
  5  ROTA         auditoria + audiência   todo caminho chega a algum lugar
  6  FLUXO        jsdom ponta a ponta     o percurso inteiro funciona
  7  COESÃO       conteúdo × conteúdo     o que a tela diz bate com o resto
  8  NAVEGADOR    manual                  o que jsdom não alcança
```

As camadas 0 a 7 rodam por comando. **A 8 não** — e o documento diz isso em
vez de fingir cobertura.

---

## 2 · Camada por camada

### 0 · Forma — `tsc --noEmit` · `eslint`

Tipo, importação não usada, parâmetro esquecido. Rápido e barato: nada abaixo
disto vale rodar enquanto isto falha.

`noUnusedLocals` e `noUnusedParameters` estão ligados de propósito. Foi um
parâmetro não usado — `_userId` — que denunciou o vazamento de dados descrito
na camada 4.

### 1 · Verdade — `npm run qa`

**A camada que nenhuma ferramenta de linguagem cobre.** Compila, passa no
lint, a tela abre — e o produto afirma coisas falsas.

Verifica: dado fabricado, botão falso, sucesso sem efeito, conjunto de dados
escrito na tela, vazamento entre alunos, privilégio decidido no cliente,
promessa de titulação indevida, citação de fonte, acessibilidade, ortografia,
tela órfã, destino de navegação inexistente.

Descrita em `72_QUALITY_SWEEP.md`, inclusive o que **não** alcança.

### 2 · Domínio — funções puras, ambiente `node`

Regra sem interface e sem armazenamento. É onde mora a maior densidade de
casos, porque é onde o erro é mais barato de achar.

| Arquivo | Responde |
|---|---|
| `carga-horaria.test.ts` | A carga é **medida**, não arbitrada: 160 palavras por minuto, minutos por tipo de bloco, 3 a 5 min por questão conforme o tamanho |
| `booklet.test.ts` | A prova cobre todas as competências antes de completar; o sorteio é determinístico com a mesma semente |
| `frequencia-e-avaliacoes.test.ts` | O calendário fecha a semana; dia futuro não é falta; a sequência não quebra à meia-noite |
| `avaliacao-dos-cursos.test.ts` | Média de lista vazia é `null`, nunca `0`; só avalia quem concluiu |
| `edicao-editorial.test.ts` | A correção aplica no bloco certo e só nele |
| `kids-account.test.ts` | Derivação de senha infantil, com o custo que a torna cara de atacar |

### 3 · Persistência — `@vitest-environment jsdom`, `localStorage` real

> **Sem servidor, se o `localStorage` não guardar, ninguém guarda.** Um
> progresso que some é um curso refeito do zero.

O teste cria o repositório, grava, **constrói uma instância nova** e lê. A
instância nova é o mais perto que se chega de recarregar a página.

`tests/persistencia-e-isolamento.test.ts` e `tests/edicao-editorial.test.ts`.

Cobre: progresso, avaliação, frequência, domínio de habilidade, sessão de
prática, sala, inscrição em evento, tópico de fórum, correção editorial,
livreto.

### 4 · Isolamento — dois usuários, mesmo dispositivo

O armazenamento é **do dispositivo**, não da conta. Computador de casa, de
escola ou de biblioteca é dividido. Se a leitura não filtrar por quem está
logado, o segundo aluno vê o primeiro — e não precisa de ataque para isso,
basta usar o produto.

Padrão dos casos: grava como Ana, lê como Bruno, exige vazio.

### 5 · Rota e audiência

`tests/audiencia-das-rotas.test.ts` + `scripts/auditar-rotas.mjs`.

- Toda tela é alcançável por alguma rota — sem órfã.
- Toda rota declara a quem serve, **com o motivo escrito**.
- Vence o prefixo mais específico: `/academy` é pública, `/academy/meu-aprendizado` não.
- Nenhuma tela pública promete ao visitante o que só o aluno tem.
- Todo `navigate('/x')` literal aponta para rota que existe.

### 6 · Fluxo — percurso inteiro, em jsdom

Vários passos encadeados, do jeito que a pessoa faz. É onde se pega a quebra
que nenhum passo isolado mostra.

`tests/fluxos-da-plataforma.test.ts`.

### 7 · Coesão contextual

Conteúdo contra conteúdo: o capítulo 5 do livreto corresponde à lição 5 do
curso, a competência cobrada é ensinada, o livro reflete o catálogo atual.

Foi aqui que se descobriu que **os dezesseis capítulos do livreto de Teoria
estavam desalinhados** — o capítulo 5 perguntava sobre intervalos enquanto a
lição 5 ensinava semitons.

`tests/integridade-do-academy.test.ts`.

### 8 · Navegador de verdade — **manual**

Os testes rodam em jsdom, que **não tem layout, não calcula `scrollLeft` e
não toca som**.

O defeito do campo de busca — texto empurrado para fora da vista durante a
animação de largura, porque o navegador ajustava `scrollLeft` num contêiner
com `overflow-hidden` — **não é reproduzível em jsdom**. Só apareceu abrindo
o navegador.

Roteiro em `74_QUALITY_RITUAL.md` §4.

---

## 3 · O que responder em cada dimensão

Tabela de consulta: dado um risco, onde ele é coberto.

| Dimensão | Camada | Onde |
|---|---|---|
| Regra de negócio | 2 | `tests/*.test.ts` de domínio |
| Dado fabricado | 1 | `qa` → dado fabricado, dados na tela |
| Controle que não age | 1 | `qa` → botão falso, sucesso sem efeito |
| Persistência do aluno | 3 | `persistencia-e-isolamento` |
| Persistência editorial | 3 | `edicao-editorial` |
| Vazamento aluno ↔ aluno | 4 | `persistencia-e-isolamento` |
| Vazamento aluno ↔ admin | 4 | `fluxos-da-plataforma` |
| Autoridade administrativa | 1, 6 | `qa`, `server-authority` |
| Rota e caminho | 5 | `audiencia-das-rotas` |
| Visitante × logado | 1, 5 | `qa`, `audiencia-das-rotas` |
| Fluxo ponta a ponta | 6 | `fluxos-da-plataforma` |
| Coesão de conteúdo | 7 | `integridade-do-academy` |
| Histórico e auditoria | 3, 6 | `fluxos-da-plataforma` |
| Acessibilidade | 1 | `qa` → quatro verificações, teto zero |
| Ortografia e pontuação | 1 | `qa` → texto |
| **Gramática de verdade** | — | **humano.** Ver §5 |
| **Aparência** | — | **humano** |
| **Mobile** | — | **humano** |
| **Cópia no Drive** | — | **não verificado.** Exige conta Google real |

---

## 4 · Regra de regressão

Todo defeito encontrado vira caso de teste. E o caso **descreve o defeito, não
a correção**:

```ts
it('o domínio de habilidade de Ana não aparece para Bruno', async () => {
  /**
   * REGRESSÃO — `listMasteriesByUser(_userId)` recebia o identificador,
   * ignorava, e devolvia a tabela inteira. Quem abrisse o Practice depois
   * de Ana veria o desempenho dela por habilidade.
   */
```

O comentário é o que impede alguém apagar o caso numa refatoração por não
entender para que servia.

---

## 5 · O que esta estratégia NÃO cobre

Repetido de `72_QUALITY_SWEEP.md` porque um leitor pode chegar por
aqui, e porque **não declarar o limite é o erro que a estratégia inteira
existe para prevenir**.

1. **Gramática.** Concordância, regência, coesão, e se a frase cabe no lugar.
   Há lista fechada de acentuação — que exclui de propósito "esta/está",
   "pratica" e "publica", porque as duas formas existem. Os 126 capítulos
   **nunca passaram por revisão humana**.
2. **Correção musical do conteúdo.** Que o capítulo 5 corresponda à lição 5
   está testado; que o que ele ensina esteja certo, não.
3. **Aparência** — contraste, espaçamento, hierarquia.
4. **Navegador real** — camada 8, manual.
5. **Mobile** — nenhuma verificação toca largura, alvo de toque ou gesto.
6. **Cópia no Drive** — exige conta Google real e rodada de ponta a ponta.
7. **`navigate(variavel)`** — só destinos literais.
8. **Se a regra de negócio está certa.** Garante-se que a plataforma não
   promete titulação reconhecida. Se 16 horas é carga justa para Teoria é
   decisão pedagógica, documentada em `src/domain/carga-horaria.ts`.

---

## 6 · Rodar

```bash
npm run verificar     # 0 → 7, em ordem
npm run qa            # só a camada 1, legível
npm test              # 2 → 7
npx vitest run tests/persistencia-e-isolamento.test.ts
```

Periodicidade e roteiro manual: `74_QUALITY_RITUAL.md`.
