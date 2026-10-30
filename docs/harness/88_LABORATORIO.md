# 88 — O LABORATÓRIO: estrutura, painel e mapa

Documento **interno**. Define o que a tela do Laboratório é, o que cada região
dela faz, e de onde cada capacidade veio. A paridade com as duas referências
está em `docs/parity/VOL2_ASTRA_DUOLINGO.md`; aqui está a forma que o
Conservatório dá a elas.

---

## 0 · O estado de onde se parte, dito sem rodeio

O Laboratório **abre**, e é só isso que se pode afirmar dele. A tela de entrada
existe; a estrutura descrita abaixo **não foi construída**. Escrever este
documento não a constrói — ele existe para que a construção não invente a forma
pelo caminho.

Três links da barra principal estavam **mortos** até esta rodada:

| link | apontava para | o outlet serve |
| :--- | :--- | :--- |
| Meta do dia | `/practice/daily` | `/practice/daily-goal` |
| Catálogo de cursos | `/academia/catalogo` | `/academia/catalog` |
| Minha grade | `/academia/grade` | `/academia/meu-aprendizado` |

🔴 O verificador de destino de navegação não pegou nenhum, e **não é defeito
dele**: ele lê chamadas `navigate('...')` literais no código, e sub-rota de
pilar é **dado**. Dado que vira caminho agora tem prova própria, em
`tests/ui/pilares-sub-rotas.test.tsx`, que abre as catorze entradas da barra
com o roteador de verdade.

---

## 1 · As três regiões, e por que são três

```
┌──────────────────────────────────────────────┬─────────────────────┐
│  NAVBAR FIXA:  Feed · Lições · Práticas      │                     │
├──────────────────────────────────────────────┤   PAINEL LATERAL    │
│                                              │       FIXO          │
│                                              │                     │
│   CENTRO — muda conforme a aba               │   tudo o que está   │
│                                              │   em andamento      │
│                                              │                     │
└──────────────────────────────────────────────┴─────────────────────┘
```

**A navbar é fixa e tem três entradas.** Não mais. Cada uma responde a uma
pergunta diferente, e é isso que justifica serem três em vez de uma lista:

| aba | a pergunta | o que mostra |
| :--- | :--- | :--- |
| **Feed** | *o que eu deixei aberto?* | só processos **em andamento** |
| **Lições** | *o que eu posso estudar?* | o mapa inteiro de lições do meu perfil |
| **Práticas** | *onde e quando isso aconteceu?* | o mapa geográfico, por era |

**O painel lateral é fixo e não muda de aba.** Ele é o mesmo nas três, porque
o que ele mostra — o que está em andamento e sendo medido — não depende de onde
a pessoa está olhando.

---

## 2 · O painel lateral: o que está sendo calculado agora

É o **painel de controle de tudo que tem ascendência em curso**. Não é resumo
de perfil, e não é histórico: é o que está **subindo ou caindo neste momento**.

### 2.1 · Topo — o calendário de defensiva

O calendário do mês corrente, com os dias praticados marcados. No rodapé dele,
**as 7 defensivas em track** — a semana visível, `D S T Q Q S S`, com o estado
de cada dia.

> Origem: Duolingo B4. O que se adota é a **semana visível**; o que não se
> adota é o constrangimento — zero declarado sem drama já é a regra da casa.

### 2.1a · 🔴 A DEFENSIVA VIRA NÍVEL, por semana fechada

O calendário é o **cronograma**; o detalhe da defensiva fica **abaixo dele**.
Essa ordem não é estética: o mês é o que se olha, e o nível é a conclusão do
que se acabou de ver. Pôr o nível em cima faria o número competir com o mês.

**Sete dias fechados valem um nível.** Catorze valem dois, vinte e um valem
três — o nível é a divisão inteira da sequência por sete.

```
 7 dias  →  nível 1
14 dias  →  nível 2
21 dias  →  nível 3
```

A semana é a unidade porque é o ciclo em que a vida de quem estuda se organiza:
praticar de segunda a domingo é uma decisão que se toma uma vez, e não sete.

**Fechar uma semana libera o resgate do XP do ciclo.** É o que dá sentido a
"sete dias" — não é uma contagem que só enfeita, é um ciclo que fecha e rende.
O resgate é **registro**, e não efeito de abrir a tela: sem contar o que já foi
retirado, a mesma semana renderia todas as vezes que alguém olhasse.

#### 🔴 Cortar a defensiva NÃO pune — só para de subir

Quem interrompe **não perde nível**. A sequência recomeça do zero, e o nível
simplesmente deixa de crescer até a próxima semana fechar. O maior nível já
alcançado fica registrado.

A distinção importa mais do que parece. Punir a interrupção transformaria a
defensiva em **dívida**: quem falta um dia por doença ou viagem voltaria
devendo, e a resposta racional a uma dívida é abandonar. Deixar de subir é
consequência; tirar o que já foi conquistado é castigo — e castigo por não
praticar é o oposto do que um conservatório faz.

Implementado em `src/domain/defensiva.ts`, com `aoQuebrarASequencia()` existindo
como função — e não como comentário — porque é a regra que mais tenta ser
"melhorada" com penalidade.

---

### 2.2 · Abaixo — a hierarquia, e ela é obrigatória

A ordem não é decorativa. O painel mostra **dezenas de medidas**, e uma lista
plana de dezenas de números não informa: esconde. A regra:

```
DESTAQUE      as 3 principais do momento, sempre abertas, sem dropdown
              — a que mais subiu, a que mais caiu, a que está a menos
                de um passo de mudar de faixa

TÓPICOS       cada um num dropdown fechado, com o resumo na cabeça
              — abrir mostra a lista inteira daquele tópico
```

Os tópicos, e o que entra em cada um:

| tópico | o que reúne |
| :--- | :--- |
| **Ligas e classificações** | liga da semana, posição, subida ou queda · classificação de agremiação · de clube · geral |
| **Percursos** | jornadas abertas, com o passo em que pararam |
| **Habilidades** | as que estão em ascensão, e as que decaíram por desuso |
| **Pontuação** | XP da semana, total, e a distância para a próxima faixa |
| **Defensiva** | histórico e classificação defensiva |
| **Métricas de performance** | as medidas gerais do laboratório |

🔴 **O que o painel não pode fazer**: mostrar número inventado, ou mostrar
tabela preenchida com gente que não existe. Quando não há dado, vale o
**esqueleto** — cinza, sem nome, sem número, mostrando a forma. Foi a melhor
solução das capturas (Duolingo B6), e é o contrário do que já aconteceu aqui,
com Bach em primeiro lugar numa liga.

---

## 3 · O Feed: só o que está aberto

O centro do Feed mostra **processos em andamento**, e nada além. Não é catálogo,
não é sugestão, não é descoberta:

- lições que **eu abri** e não terminei
- práticas que **eu abri** e não terminei
- a meta diária, **em processamento**
- qualquer outro processo que eu tenha iniciado a partir do Laboratório

Se não há nada aberto, o Feed diz isso e aponta para Lições. Feed vazio com
sugestões seria a tela mudando de assunto sozinha.

---

## 4 · 🔴 Lições SEGUEM A ÁRVORE ACADÊMICA — não são tópicos soltos

### 4.1 · A árvore, e ela já existia

```
Cadeira  →  Curso  →  Módulo  →  Lição
```

Cada nível é **ordenado**, e a ordem é conteúdo. O aluno escolhe a cadeira pelo
Grêmio a que pertence, escolhe o curso dentro dela, e as disciplinas aparecem
**na sequência** — porque a sequência é o que o curso ensina.

O Laboratório listava **árvores de competência soltas** — teoria, percepção,
ritmo, leitura — sem curso, sem módulo e sem ordem. Eram tópicos ao vento: quem
abria não sabia o que vinha antes, o que vinha depois, nem a que curso aquilo
pertencia.

**A estrutura acadêmica já existia inteira e ordenada.** O Laboratório é que a
ignorava e inventava a própria organização — e duas organizações sobre o mesmo
conteúdo é pior que nenhuma: a pessoa estuda por uma e é avaliada pela outra.

Implementado em `src/domain/arvore-de-licoes.ts`.

### 4.2 · A ordem é SUGESTÃO, e não cadeado

Quem quiser começar pela disciplina 20 da seção 10 **pode**. O sistema não
bloqueia, e não deveria: adulto escolhe por onde entra.

O que ele faz é **dizer onde aquilo fica**:

| o que o sistema faz | o que ele NÃO faz |
| :--- | :--- |
| mostra a sequência inteira, numerada | impedir o acesso fora de ordem |
| aponta a **próxima sugerida** — a primeira não feita | obrigar a completude |
| marca quem foi feita **fora de ordem** | chamar isso de erro |
| conta **seções fechadas** — módulo com todas as lições | fechar seção pela metade |

Completude não é obrigatória. O que é obrigatório é o sistema estar **pronto e
ordenado**, e a sugestão estar **certa**.

### 4.3 · O que a tela mostra

1. **Cadeiras a que pertenço** — cursos abertos, com a árvore inteira e a
   próxima sugerida em destaque.
2. **Abaixo, as demais cadeiras** — visíveis, com o motivo escrito: *é preciso
   juntar-se ao Grêmio*. Cadeado que diz o que falta, e não cadeado mudo.

---

## 4a · 🔴 O visitante faz NIVELAMENTO, e não disciplinas soltas

A seção "aberto a quem chega" mostrava árvores de competência avulsas —
tiradas do nada, sem ordem e sem propósito. Para quem não conhece a plataforma,
isso não é demonstração: é uma lista incompreensível.

**O que ela precisa ser é um nivelamento.** Uma lição que conhece e encaminha:

| passo | o que acontece |
| :--- | :--- |
| 1 | *Que cadeira te interessa?* — história, teoria, violino |
| 2 | *O que você gostaria de praticar?* |
| 3 | Perguntas **na ordem da árvore daquele curso**, da primeira em diante |
| 4 | Quando começa a errar, ali é o ponto: antes disso ele está nivelado |
| 5 | O sistema o encaminha ao módulo certo — *Teoria Musical 3*, por exemplo |

🔴 A lógica do passo 4 é a que importa: **as perguntas seguem a ordenação
real**, e não uma amostra aleatória. Errar na questão N significa que o
pressuposto de N não está firme — e o que vem antes de N se supõe sabido. É por
isso que o nivelamento não pode ser uma lista embaralhada: sem ordem, o erro
não localiza nada.

O resultado catalogado leva a pessoa a estudar **na Academia** a partir dali, e
a praticar **no Laboratório** a partir do mesmo ponto.

### 4a.1 · O que ficou implementado

`src/domain/nivelamento.ts` — a regra inteira, e nenhuma parte dela na tela.

| decisão | onde mora | por que assim |
| :--- | :--- | :--- |
| A ordem das perguntas | `pedagogicalOrder()`, filtrada por `hasGenerator` | É a **mesma** ordem que governa o percurso e as lições. Uma lista própria aqui produziria um diagnóstico que o curso não confirma. |
| O ponto de entrada | primeira dimensão errada **duas vezes** | Um erro só pode ser escorregão. Encerrar nele faria um deslize de um segundo determinar meses de estudo. |
| A confirmação | outra semente, mesma dimensão | Repetir a pergunta mediria memória do clique. |
| O módulo sugerido | `moduloDoDiagnostico(d, modulos)`, casando `order` com o capítulo | Montar `mod_teoria_07` aqui seria uma segunda convenção de identificador, que continuaria compilando no dia em que a primeira mudasse. |
| O nível da pergunta | `Level.RECOGNIZE` | O nivelamento mede **onde a pessoa está**, não quão fundo ela vai. Quem reconhece mas ainda não nomeia já passou do capítulo. |

`src/ui/screens/practice/NivelamentoDoVisitante.tsx` — convite, pergunta,
veredito com explicação, e o resultado com o módulo do acervo.

**A semente é injetável.** Em produção vem do relógio; nos testes é fixa,
porque errar de propósito duas vezes na mesma dimensão exige saber qual é a
resposta certa. Sem isso, a regra que mais importa — a confirmação depois do
erro — ficaria sem prova.

### 4a.2 · O que o nivelamento NÃO cobre, e isso está na tela

Só entram dimensões com gerador. Perguntar sobre cadência sem ter como gerar a
pergunta seria fabricar um teste que não existe.

O recorte **é dito no resultado**, e não numa página de ajuda:
`dimensoesForaDoNivelamento()` devolve as que ficaram de fora, e o rodapé do
diagnóstico conta quantas são. Um teste curto apresentado como completo faria
alguém concluir que domina o curso inteiro por ter passado em seis frentes.

### 4a.3 · O que ficou de fora desta entrega

| pendência | por quê |
| :--- | :--- |
| Passos 1 e 2 (cadeira e interesse) | O diagnóstico hoje é de **Teoria**, que é a cadeira com gerador de exercício. Perguntar "que cadeira te interessa?" e devolver Teoria em qualquer resposta seria uma escolha de mentira. Violino precisa de microfone medido; História, de banco de questões. |
| Guardar o resultado | Sem conta não há onde guardar. O botão é "Entrar para guardar este resultado", e entrar hoje **não** carrega o diagnóstico junto — o vínculo entre a sessão anônima e o perfil ainda não existe. |
| Nivelar dentro do módulo | O diagnóstico aponta o capítulo, não a lição. Para o curso de Teoria dá no mesmo — um capítulo, uma lição —, e deixa de dar quando um capítulo ganhar a segunda. |

---

## 5 · Lições: o mapa completo do meu perfil

A aba **Lições** mostra tudo o que está disponível para mim, e a organização é
por pertencimento:

1. **Seção destacada** — as lições das **minhas agremiações** e das **minhas
   casas**. É o que eu posso fazer agora, por direito de vínculo.

2. **Abaixo, carrossel esmaecido e bloqueado** — a amostra do que existe em
   outros grêmios, com o motivo escrito: *é preciso juntar-se a eles*.

> Origem: Duolingo B2 (requisito explícito no cadeado). O que se adota é
> **dizer o que falta**, e não o cadeado mudo. Mostrar o que existe e está
> fechado é honesto; esconder faria a plataforma parecer menor do que é.

O painel lateral continua fixo aqui.

---

## 5 · 🔴 Práticas é um MAPA — e mapa tem forma geográfica

Esta seção existe porque a versão anterior da tela chamava de "mapa" uma lista
com filtros. Não é.

### 5.1 · A forma

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│         G L O B O   com marcações por região           │
│      cada ponto = compositores daquela região          │
│      zoom aproxima e separa os pontos um a um          │
│                                                        │
├────────────────────────────────────────────────────────┤
│  ◀────────── RÉGUA DE ERAS ──────────▶                 │
│  Antiguidade · Medieval · Renascimento · Barroco ·     │
│  Classicismo · Romantismo · Moderna · Contemporânea    │
├────────────────────────────────────────────────────────┤
│  🔍 busca por texto              ⚙ filtro complexo     │
├────────────────────────────────────────────────────────┤
│  TABELA DE COMPOSITORES correspondente ao estado atual │
└────────────────────────────────────────────────────────┘
```

### 5.2 · As regras que fazem disso um mapa

**O globo é por COMPOSITORES.** Cada região tem os seus, e o marcador carrega
a contagem. Não é por obra: vinte e cinco mil marcadores não são um mapa, são
uma lista desenhada sobre uma imagem — erro já cometido e corrigido no Atlas.

**A régua de eras muda o estado do globo.** Andar nela repovoa as regiões: a
Escandinávia não existe no mapa do Renascimento e aparece depois. É esse
comportamento que separa um mapa de uma imagem com filtros.

**O zoom detalha.** De longe, a região com a contagem; de perto, os pontos de
cada compositor.

**A tabela embaixo corresponde ao estado do globo.** Muda a era, muda a tabela.
Busca por texto sempre visível; o filtro complexo mora atrás de um ícone e
abre quando se clica — a mesma decisão já tomada no Acervo, e pelo mesmo
motivo: onze seletores abertos competindo com o conteúdo.

**Da tabela se abre a ficha.** Compositor → compêndio de obras → biografia. O
mesmo identificador canônico do Acervo: o mapa é uma **vista** do catálogo, e
não um segundo catálogo.

### 5.3 · O que já existe, e o que falta

| peça | estado |
| :--- | :--- |
| Catálogo canônico por região e era | ✅ 1.004 compositores, 8 eras, 8 regiões |
| `atlas.service` — vista do catálogo, marcadores, contagem | ✅ |
| Teto de plotagem com `naoPlotados` declarado | ✅ |
| Régua de eras que repovoa | ◑ existe como chevrons no Acervo |
| **Globo com forma geográfica** | ❌ **não existe** — hoje é lista de regiões |
| **Zoom que separa os pontos** | ❌ |
| Tabela correspondente com busca e filtro | ◑ existe no Acervo, não ligada ao mapa |

---

## 6 · A paridade, linha a linha

O que entra no Laboratório, e de onde:

| # | capacidade | origem | onde entra aqui |
| :--- | :--- | :--- | :--- |
| C4 | Ofensiva com semana visível | Duolingo B4 | painel lateral, topo |
| C5 | Missões diárias com prazo | Duolingo B5 | Feed, como processo aberto |
| C6 | Ligas com **esqueleto** quando vazio | Duolingo B6 | painel, tópico de ligas |
| C9 | Emblemas `N de M`, bloqueados visíveis | Astra A6 | painel, tópico de pontuação |
| C12 | Trocar de curso sem sair da tela | Astra A5 + Duolingo B3 | Lições |
| C13 | **Requisito explícito** no cadeado | Duolingo B2 | Lições, selo por cadeira nomeando o Grêmio |
| — | Cartão de perfil fixo com contadores | Astra A5 | painel lateral |
| — | Pontuação total, semanal e posição | Astra A6 | painel, em destaque |

**O que NÃO se adota**, e está registrado para não voltar:

- `Mais missões em breve` com cadeado (Duolingo B5) — é promessa de
  funcionalidade futura na tela.
- `Profile` na barra abrindo o mesmo que o cartão do canto (Astra A5) — é
  duplicação observada na captura.

---

## 7 · 🔴 A AUDITORIA DO LABORATÓRIO — o que existe, o que falta, o que é lixo

Levantamento feito lendo a tela, e não o que se lembrava dela.

### 7.1 · O que EXISTE e está de pé

| parte | estado | prova |
| :--- | :--- | :--- |
| Navbar padrão da casa, nada acima | de pé | `laboratorio.test.tsx`, caso da barra |
| Feed: só o que está aberto | de pé | `sessoesAbertas()` filtra por `endedAt` ausente |
| Lições pela árvore acadêmica | de pé | 126 lições, 3 cadeiras, 5 cursos, seções numeradas |
| A ordem é sugestão, não cadeado | de pé | nenhuma lição `disabled` — há caso que conta |
| Nivelamento do visitante | de pé | `nivelamento.ts` + 19 casos de domínio, 12 de tela |
| Painel: calendário, hierarquia, destaques | de pé | `PainelDoLaboratorio.tsx` |
| Nível da defensiva acumula na quebra | **corrigido nesta rodada** | `completedCyclesCount` + `aoPraticarHoje` |

### 7.2 · 🔴 O que estava ERRADO, e foi corrigido agora

**A defensiva nunca quebrava.** O serviço somava um dia sempre que a data
mudasse, sem olhar qual data era. Quem praticasse em janeiro e voltasse em
julho encontrava a defensiva intacta, com um dia a mais — a "sequência de 40
dias" podia ser 40 dias espalhados por dois anos. Um contador que nunca quebra
não mede constância, mede visitas.

**E o nível sumia quando ela quebrava.** O painel chamava
`estadoDaDefensiva(streak.currentStreakDays)` — conta de `dias / 7`. Zerar os
dias zerava o nível junto: quem fechou três semanas e faltou um dia via "Sem
defensiva ativa", como se as três semanas nunca tivessem existido. É o oposto
exato da regra.

Os dois vinham da mesma causa: **a transição não existia em lugar nenhum**.
Agora existe, em `aoPraticarHoje`, e decide as três coisas juntas — continuar,
quebrar e fechar ciclo — porque são a mesma decisão sobre as mesmas datas.

### 7.3 · 🔴 LIXO: a segunda árvore, que contradiz a primeira

`SEED_SKILL_TREES` (`src/data/seed-practice-content.ts`) é uma estrutura
**escrita à mão**: 5 "árvores de competência", 32 nós, com `tier`,
`prerequisites` e `masteryLevel` próprios.

É uma segunda organização sobre o mesmo conteúdo — e duas organizações sobre o
mesmo conteúdo é pior que nenhuma: a pessoa estuda por uma e é avaliada pela
outra.

O Laboratório deixou de usá-la nesta rodada. Ela continua viva em:

| onde | o quê |
| :--- | :--- |
| `/practice/skill-tree` | `SkillTreeScreen`, que a desenha inteira |
| 8 telas | botões "ver árvore" apontando para lá — `InteractiveLessonScreen`, `ImmediateFeedbackScreen`, `MicroSkillScreen`, `PracticeProfileScreen`, `PracticeResultScreen`, `SkillDetailScreen` |
| `practice.service` / `practice.repository` | `listSkillTrees`, `getSkillTree`, `findSkillTreeById` |

**O que ela contradiz:** os nós dela (`EAR-01 Intervalos Básicos`, tier 1) não
casam com capítulo nenhum do curso de Teoria, nem com `pedagogicalOrder()`. Os
pré-requisitos dela são outros. As "cinco categorias" dela não são as cadeiras.

**✅ REMOVIDA em 2026-09-22 (LX-1).** Saíram `SEED_SKILL_TREES`, os tipos `SkillTree`/`SkillNode` do domínio, os três métodos de serviço e repositório e `SkillTreeScreen`. Os botões "ver árvore" levam a `/practice?aba=licoes`; o endereço antigo `/practice/skill-tree` abre o Laboratório já na aba Lições. A chave `amd_practice_trees_v1`, semeada em todo navegador que abriu o Laboratório, é apagada na primeira leitura. `tests/ui/arvore-unica.test.tsx` impede que a segunda árvore volte.

Ficam, porque são outra coisa: a entidade `Skill` (as habilidades medidas nas sessões) e o componente visual `SkillNode`, que desenha micro-habilidades.

### 7.4 · O que FALTA, em ordem de peso

| falta | peso | por quê |
| :--- | :--- | :--- |
| **O globo das Práticas** | grande | A aba diz que não existe, e diz certo. O Atlas lê o mesmo catálogo, anda no tempo e desenha lista em vez de geografia. |
| **Arrancar a segunda árvore** (7.3) | grande | Enquanto viver, a plataforma tem duas ordenações concorrentes. |
| Nivelamento por cadeira | médio | Só Teoria tem gerador de exercício. Violino pede microfone medido; História, banco de questões. |
| Guardar o resultado do nivelamento ao entrar | médio | Não há vínculo entre sessão anônima e perfil. |
| `PERFORM` e `APPLY` no gerador | médio | Pauta editável e microfone medido — os dois já estão no `CLAUDE_TODO.md`. |
| Resgate do XP do ciclo | pequeno | `temCicloParaResgatar` existe no domínio; nenhuma tela oferece o resgate. |
| Congelamento (`freezeDaysAvailable`) | pequeno | Campo existe no modelo, e nada o consome. Ou vira regra, ou sai. |
