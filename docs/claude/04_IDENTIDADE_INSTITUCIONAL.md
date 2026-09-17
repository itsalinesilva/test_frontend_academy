# DOCUMENTO FUNDACIONAL DE IDENTIDADE

## Conservatório Muscicapa — nome, brasão, sistema cromático e aplicações

> **Natureza deste documento.** Ele fixa o que é verificável e separa o que é
> fundamentação simbólica do que seria afirmação científica. Essa separação foi
> pedida explicitamente na formulação da marca e é a única razão pela qual o
> documento pode ser publicado: uma narrativa de identidade que se apresenta
> como fato contestável fragiliza a instituição em vez de sustentá-la.
>
> Tudo na **Parte I** foi medido ou contado no arquivo do brasão.
> Tudo na **Parte II** é decisão simbólica — legítima, deliberada, e declarada
> como tal.
> A **Parte III** lista o que ainda precisa da fundadora antes de ir a público.

---

# PARTE I — O QUE FOI MEDIDO

## 1. Arquivo de origem

`public/Conservatório-Muscicapa-brasão-logo.jpg` — 1200 × 896 px, JPEG,
ilustração pintada sobre fundo creme uniforme.

| Derivado | Como foi produzido |
|---|---|
| `public/brasao-muscicapa.png` | Fundo removido por preenchimento a partir das bordas, não por limiar global. A diferença importa: o creme **dentro** do brasão — punho da espada, reflexos do dourado — é preservado, enquanto o fundo some. 61,1% dos pixels tornaram-se transparentes. Recorte útil: 879 × 853. |
| `brasao-muscicapa-{512,256,128,64}.png` | Reduções por reamostragem Lanczos. |
| `public/favicon.svg` | Redução conceitual, desenhada — **não** é o brasão. Ver §12. |

## 2. Paleta medida

As cores institucionais **não foram escolhidas: foram medidas**, por
amostragem do arquivo. Isso é o que garante que a interface e o brasão
pertençam à mesma peça.

| Cor | Onde no brasão | Âncora medida | Matiz | Passo na rampa |
|---|---|---|---|---|
| **Anil** | Campo do escudo | `#1B3357` | 216° | 900 |
| **Ouro** | Moldura de volutas, abelha, punhos | `#947D53` | 39° | 600 |
| **Verde-oliva** | Plumagem da ave à direita | `#60603C` | 60° | 700 |
| **Terra** | Plumagem da ave central | `#7A5138` | 23° | 700 |
| Aço | Lâminas | `#B4A890` – `#C0B490` | — | não virou token |
| Fundo do arquivo | — | `#F5F0E2` | — | removido |

Extremos do campo azul: `#142541` (mais escuro) → `#2B4C6D` (mais claro).

### 2.1 Contraste — todas as conferências passam

| Par | Razão | WCAG 2.2 |
|---|---|---|
| anil-900 sobre branco | 13,50:1 | AAA |
| anil-800 sobre branco | 11,47:1 | AAA |
| anil-700 sobre branco | 9,22:1 | AAA |
| branco sobre botão anil-800 | 11,47:1 | AAA |
| ouro-600 sobre branco | 5,31:1 | AA |
| ouro-400 sobre anil-900 | 5,38:1 | AA |
| verde-700 sobre branco | 6,48:1 | AA |

Nenhuma combinação institucional de texto fica abaixo de 4,5:1.

**Regra derivada disso:** o ouro é moldura e acento cerimonial, nunca texto
corrido. Sobre branco ele só fecha contraste a partir do passo 600, e um
certificado precisa continuar legível fotocopiado em preto e branco.

## 3. Elementos contados no brasão

| Elemento | Contagem | Como foi obtido |
|---|---|---|
| Aves | 3 | Inspeção visual |
| Abelha | 1 | Inspeção visual |
| Armas cruzadas | 2 | Espada (esquerda do observador) e bastão/cetro com orbe e coroa (direita) |
| Estrelas no campo | **~20 confirmadas** | Detecção automática de manchas claras compactas sobre o campo azul |

### 3.1 Duas ressalvas factuais sobre as estrelas

**A contagem de 27 não foi confirmada.** A detecção automática encontrou 29
manchas claras, das quais cerca de 20 são inequivocamente estrelas; as demais
são artefatos de borda, o bico da ave central e ruído de compressão. Algumas
estrelas podem estar ocultas sob as asas. **O número exato precisa ser
confirmado no arquivo vetorial de origem**, não neste JPEG.

**"27 estrelas na ordenação exata do Cruzeiro do Sul" reúne duas coisas
diferentes.** O Cruzeiro do Sul (*Crux*) tem **cinco** estrelas. As **27** são
a convenção da bandeira brasileira — 26 estados e o Distrito Federal —
distribuídas por **nove** constelações, das quais Crux é apenas uma.

Não é um defeito do brasão: ter 27 estrelas **e** ter o Cruzeiro do Sul entre
elas é perfeitamente coerente. O que não se sustenta é a formulação "27
estrelas do Cruzeiro do Sul". Duas redações corretas:

> "Vinte e sete estrelas, à maneira do firmamento brasileiro, entre as quais
> se destaca o Cruzeiro do Sul."

> "O Cruzeiro do Sul, cinco estrelas, sobre o campo de anil."

A escolha é da fundadora. Registrada aqui porque um documento que reivindica
precisão heráldica não pode conter uma imprecisão astronômica.

## 4. Discrepância a resolver: esquerda de quem?

A formulação de identidade atribui posições assim:

| Ave | Posição declarada | Cor no arquivo |
|---|---|---|
| Juruviara (*Vireo olivaceus*) | superior **esquerda** | — |
| Araponga-da-Amazônia (*Procnias albus*) | superior **direita** | — |
| Uirapuru (*Cyphorhinus arada*) | centro inferior | marrom/ruivo ✓ |

No arquivo, a ave **à esquerda do observador é branca** e a **à direita é
verde-oliva**. Ora: *Procnias albus* é a ave branca; *Vireo olivaceus* é a
oliva. Pela leitura do observador, as posições estariam **trocadas**.

**Mas provavelmente não estão.** Em heráldica, *destra* e *sinistra* são do
ponto de vista de **quem porta** o escudo — a destra do portador aparece à
**esquerda** de quem olha. Se a formulação usa a convenção heráldica correta,
"Juruviara à esquerda" significa à direita do observador, que é exatamente
onde está a ave oliva. **Então o documento está certo e a leitura ingênua é
que erra.**

O problema não é o conteúdo: é a ambiguidade. **O documento final precisa
declarar qual convenção usa**, em uma linha, logo antes da primeira menção de
posição. Sem isso, metade dos leitores vai concluir que o brasão contradiz o
próprio manual.

O uirapuru ao centro é inequívoco nas duas convenções.

---

# PARTE II — FUNDAMENTAÇÃO SIMBÓLICA

> Tudo nesta parte é decisão de identidade, não afirmação verificável. É assim
> que deve ser lida e assim que deve ser publicada.

## 5. O nome

**MUSCA** (mosca) + **CAPERE** (capturar) → **MUSCICAPA**, "aquele que
captura moscas". *Muscicapidae* é a família zoológica formada sobre o gênero
com o sufixo `-idae`.

A transposição institucional:

> capturar o inseto → capturar o som → capturar a nota → dominar o som.

O alvo não é decorativo. É o que está em movimento, no ar, fora do alcance
imediato — e que só se alcança com perseguição deliberada.

**OUVIR · PERSEGUIR · CAPTURAR · DOMINAR.**

## 6. As três aves, os três critérios

| Dimensão | Ave | Princípio institucional |
|---|---|---|
| Quantidade / constância | Juruviara | disciplina, repetição, estudo diário |
| Complexidade / repertório | Uirapuru | técnica, musicalidade, elaboração |
| Potência / projeção | Araponga | força, alcance, presença |

Não são três animais bonitos: são **três critérios distintos de excelência
acústica**, e o músico formado precisa dos três. Quem só tem constância
repete o erro; quem só tem potência é ouvido e não é seguido; quem só tem
complexidade não sustenta o que construiu.

A composição é triangular: dois polos no alto — **constância ↔ potência** — e
a **complexidade** no eixo inferior, sustentando. Os bicos convergem para o
mesmo ponto: três naturezas, um alvo.

### 6.1 O que fica fora da publicação

O material de origem associa às espécies números de vocalizações e de decibéis.
**Esses números não entram em nenhum texto público** enquanto não forem
verificados contra a literatura primária. Eles fundamentam a escolha das
espécies; não são alegações da instituição.

Isso não enfraquece o brasão. A juruviara representa constância porque foi
escolhida para isso — não porque um número específico seja citável.

## 7. A disputa

Os três pássaros não competem entre si. Representam a competição do músico
consigo mesmo: com a própria limitação, com a execução anterior, com a
inconsistência. A disputa é interna.

## 8. Espada e bastão

Não constam da formulação simbólica original e estão no brasão. Registro do
que se lê visualmente, para a fundadora decidir o significado:

- **Espada** — o gume, o rigor, o corte que separa o que serve do que não
  serve. Em heráldica, também a defesa do que se guarda.
- **Bastão/cetro** com orbe e coroa — a autoridade que confere, a legitimidade
  de outorgar grau. É o braço que assina o diploma.

Cruzados atrás do escudo, na tradição heráldica, marcam uma instituição que
**guarda** e **confere** — o que é literalmente a função de um conservatório.

**Pendente de decisão da fundadora.**

---

# PARTE III — SISTEMA APLICADO

## 9. Tokens implementados

`src/index.css` — quatro rampas de onze passos (`anil`, `ouro`, `verde`,
`terra`), disponíveis como utilitários Tailwind (`bg-anil-800`,
`text-ouro-600`, …).

## 10. O vermelho saiu da marca e ficou como sinal

500 substituições em 128 arquivos trocaram o vermelho institucional pelo anil.
O vermelho **permanece** em erro, perigo e saturação de áudio.

A troca melhorou a interface por um motivo que não é estético: **enquanto o
vermelho era a cor da marca, um alerta vermelho não se distinguia de um botão
comum.** Agora se distingue.

## 11. Documentos emitidos

Anil no texto e nos títulos, ouro na moldura e no selo. A ressalva de curso
livre (§13) é desenhada pelo componente, fora do template — não pode ser
removida editando a matriz nem esquecida ao criar uma nova.

## 12. Marca reduzida

`public/favicon.svg` **não é o brasão**. Aos 16 px, três aves, duas armas
cruzadas e uma moldura de volutas viram uma mancha ilegível.

O que sobrevive à redução é o que identifica: **escudo anil, abelha em ouro
no alto, Cruzeiro do Sul no campo** — cinco estrelas, com as magnitudes
relativas traduzidas em tamanho. Alvo e sul, sem tentar caber o que não cabe.

Provisória e editável.

## 13. Natureza dos cursos — obrigação, não detalhe

> **Curso livre de qualificação profissional. Certificação própria do
> Conservatório Muscicapa, sem vínculo com o MEC.**

Aparece em todo certificado e credencial, no rodapé, e é fixada em
`RESSALVA_CURSO_LIVRE`. Três testes garantem que ela não sai: que diz o que
precisa dizer, que não é elemento editável do template, e que as matrizes
deixam o rodapé livre para ela.

Curso livre é categoria legítima e regulada — a ressalva não é demérito. Ela
existe porque **quem recebe o certificado vai apresentá-lo a um empregador ou
a uma secretaria**, e essas pessoas precisam saber o que estão lendo sem
perguntar. Um documento que se deixa confundir com diploma reconhecido
prejudica primeiro quem o recebeu.

Deve constar também dos termos de uso e da página de cada curso — **pendente**.

---

# PARTE IV — PENDÊNCIAS

| # | Pendência | De quem |
|---|---|---|
| I-1 | Contagem exata das estrelas, no arquivo vetorial | fundadora |
| I-2 | Redação correta sobre 27 estrelas × Cruzeiro do Sul (§3.1) | fundadora |
| I-3 | Declarar a convenção heráldica de posição (§4) | fundadora |
| I-4 | Significado oficial da espada e do bastão (§8) | fundadora |
| I-5 | Verificar os dados bioacústicos antes de qualquer uso público (§6.1) | pesquisa |
| I-6 | Brasão em vetor — o JPEG não escala para impressão grande | fundadora |
| I-7 | Silhueta monocromática para selo e marca d'água | implementação |
| I-8 | Ressalva de curso livre nos termos de uso e nas páginas de curso | implementação |
| I-9 | Tipografia institucional — hoje serifada genérica | fundadora |
| I-10 | Versões monocromática e invertida do brasão | implementação |

---

## Colofão

Nada aqui pode ser publicado como afirmação da instituição antes de sair da
Parte IV. A Parte I é verificável hoje. A Parte II é declaradamente simbólica.
Essa separação é o que torna o documento defensável.
