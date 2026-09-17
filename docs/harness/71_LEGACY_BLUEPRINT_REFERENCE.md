# 71 — LEGACY BLUEPRINT REFERENCE

> Historical baseline preserved from the supplied package. It is not authoritative where it conflicts with v3 contracts. Use it to recover detail/intent that predates the Node + Python-engine split.

# ACADEMIA VIRTUAL DO MÚSICO
## Blueprint de Completude Funcional + Plano de Implementação

### Princípio constitucional

> **Nenhuma ferramenta entra na Academia como versão incompleta de uma ferramenta que o mercado já conhece.**

Se a Academia oferece um Studio, ele deve ser um Studio.

Se oferece um editor de partituras, ele deve ser um editor de partituras.

Se oferece um afinador, ele deve ser um afinador funcional e completo.

Se oferece simuladores instrumentais, eles devem permitir prática real dentro daquilo que a tecnologia suporta.

Se oferece um ambiente vocal, ele deve ser um ambiente vocal completo.

Se oferece geração musical, ela deve integrar geração, edição e produção.

A plataforma não deve acumular “features”.

Ela deve oferecer **ferramentas completas integradas em um ecossistema musical completo**.

---

# 1. NOVO PRINCÍPIO DE PRODUTO

A regra anterior:

> “Construir uma versão mínima de cada ferramenta.”

está REVOGADA.

A regra correta é:

> **Construir uma fatia vertical completa de cada ferramenta que for disponibilizada.**

Isso significa que o MVP pode ter menos ferramentas.

Mas as ferramentas que entrarem precisam ser completas.

Exemplo:

ERRADO:

```text
Studio
- tocar MIDI
- gravar áudio
- 3 efeitos
```

CORRETO:

```text
Studio
- projeto
- tracks
- áudio
- MIDI
- instrumentos virtuais
- piano roll
- gravação
- edição
- automação
- mixer
- efeitos
- routing
- arranjo
- exportação
- salvamento
- undo/redo
- quantização
- edição temporal
- edição de pitch
- presets
- etc.
```

A diferença é estrutural.

---

# 2. ACADEMIA NÃO É UM APP COM UMA FEATURE GRANDE

Ela será uma plataforma composta por sistemas especializados.

A arquitetura correta é:

```text
ACADEMIA VIRTUAL DO MÚSICO
│
├── ACADEMY
│
├── MUSIC ATLAS
│
├── PRACTICE LAB
│
├── INSTRUMENT LAB
│
├── VOICE LAB
│
├── SCORE STUDIO
│
├── MUSIC STUDIO / DAW
│
├── EAR & SKILL LAB
│
├── MUSICIAN ID
│
├── COMMUNITY
│
└── MUSIC SCHOOL
```

Esses sistemas compartilham a mesma infraestrutura.

---

# 3. CLASSIFICAÇÃO DEFINITIVA DAS FERRAMENTAS

Antes de implementar qualquer coisa, será criado um:

# TOOL & CAPABILITY CATALOG

Cada ferramenta deverá possuir:

```text
Tool
├── categoria
├── finalidade
├── público
├── entradas
├── saídas
├── capacidades
├── dependências
├── integrações
├── referências de mercado
├── tecnologias disponíveis
├── requisitos de UX
├── requisitos técnicos
├── requisitos pedagógicos
├── requisitos comerciais
└── status de implementação
```

Nenhuma funcionalidade será implementada antes de ser classificada.

---

# 4. MATRIZ DE FERRAMENTAS

## A. CONHECIMENTO

### Academy

- teoria musical;
- história;
- harmonia;
- contraponto;
- análise;
- leitura;
- composição;
- estética;
- terminologia;
- metodologia;
- exercícios;
- avaliações.

---

# 5. MUSIC ATLAS

### Enciclopédia musical

- compositores;
- intérpretes;
- obras;
- movimentos;
- períodos;
- gêneros;
- estilos;
- instrumentos;
- escolas;
- metodologias;
- cronologias;
- locais;
- influências;
- relações.

### Work Explorer

Cada obra terá:

- informações;
- contexto;
- compositor;
- período;
- gênero;
- instrumentação;
- estrutura;
- análise;
- conceitos;
- partitura;
- áudio;
- exercícios;
- prática;
- criação relacionada.

---

# 6. SCORE STUDIO

Este será um **editor de partituras completo**.

Não apenas um visualizador.

O usuário poderá:

- criar uma partitura;
- criar múltiplas pautas;
- escolher instrumentos;
- escolher claves;
- escolher armaduras;
- escolher compassos;
- inserir notas;
- inserir pausas;
- alterar duração;
- inserir acidentes;
- alterar oitavas;
- criar vozes;
- criar quiálteras;
- inserir ligaduras;
- inserir articulações;
- inserir dinâmica;
- inserir expressão;
- inserir andamento;
- inserir letras;
- inserir cifras;
- inserir marcações;
- criar repetições;
- criar codas;
- criar segnos;
- criar anacruses;
- criar mudanças de compasso;
- criar mudanças de tonalidade;
- transpor;
- editar;
- copiar;
- colar;
- mover;
- apagar;
- selecionar;
- ouvir;
- controlar andamento;
- controlar instrumentos;
- usar MIDI;
- usar teclado virtual;
- reproduzir;
- exportar;
- importar;
- salvar;
- versionar;
- compartilhar.

Esse é o nível funcional esperado porque é o padrão que ferramentas como MuseScore já demonstram ser possível oferecer.

---

# 7. SCORE STUDIO — MODOS

## Write

Criação e edição.

## Play

Reprodução.

## Arrange

Organização de instrumentos e partes.

## Engrave

Layout visual.

## Practice

Uso pedagógico da partitura.

## Perform

Execução acompanhada.

## Analyze

Análise musical.

## Collaborate

Compartilhamento e edição colaborativa.

---

# 8. SCORE STUDIO + PRACTICE LAB

Aqui aparece uma diferença importante da Academia.

Uma partitura criada pelo usuário não termina no editor.

Ela pode ser enviada diretamente para:

```text
Score
↓
Practice
↓
Simulator
↓
Ear Training
↓
Recording
↓
Assessment
```

Exemplo:

O aluno cria um exercício de escala.

Ele pode:

1. escrever;
2. ouvir;
3. alterar o andamento;
4. tocar;
5. gravar;
6. comparar;
7. receber avaliação;
8. salvar;
9. transformar em exercício;
10. compartilhar com outro aluno.

---

# 9. MUSIC STUDIO

O Studio será tratado como uma **DAW completa**, não como “Creator Studio educacional”.

O benchmark funcional deve considerar simultaneamente:

- Logic;
- Ableton Live;
- Reaper;
- Cubase;
- Soundtrap;
- BandLab;
- Suno Studio.

Logic, por exemplo, já oferece gravação, takes/comping, MIDI, instrumentos, edição de áudio, pitch/timing, mixer, routing, plugins, automação, notação, exportação e ferramentas de produção.

Ableton adiciona workflow de Session/Arrangement, gravação de múltiplas takes, warping, áudio→MIDI, instrumentos, sampling e performance.

Soundtrap e BandLab demonstram que boa parte dessa experiência pode existir em ambiente web.

Suno mostra a convergência atual entre DAW e IA generativa, incluindo timeline multitrack, stems, upload, edição, MIDI e geração.

---

# 10. MUSIC STUDIO — CAPACIDADES OBRIGATÓRIAS

## Project Engine

- projetos;
- autosave;
- versionamento;
- histórico;
- undo/redo;
- recuperação;
- templates;
- metadados.

## Timeline

- tracks;
- clips;
- regions;
- markers;
- loops;
- sections;
- arrangement;
- snapping;
- zoom;
- seleção;
- edição.

## Audio

- gravação;
- importação;
- edição;
- corte;
- split;
- trim;
- fade;
- crossfade;
- gain;
- normalize;
- reverse;
- stretch;
- pitch;
- warp;
- comping;
- takes.

## MIDI

- gravação;
- edição;
- piano roll;
- quantização;
- velocity;
- duration;
- CC;
- automation;
- transposição;
- humanização;
- arpeggio;
- chord tools.

## Instruments

- piano;
- keyboards;
- organ;
- synth;
- strings;
- brass;
- woodwinds;
- guitar;
- bass;
- drums;
- percussion;
- orchestral;
- world instruments;
- sampled instruments;
- custom instruments.

---

# 11. SYNTH GENERATOR

O Synth Generator é uma ferramenta própria e importante.

Ele não é simplesmente:

> “um sintetizador.”

Ele pode ser:

**instrument generator + synth + playable instrument system.**

O usuário poderá:

- criar timbres;
- configurar osciladores;
- envelopes;
- filtros;
- LFO;
- modulação;
- efeitos;
- sampler;
- wavetable quando suportado;
- presets;
- salvar instrumentos;
- tocar via teclado;
- tocar via MIDI;
- utilizar no Studio;
- utilizar no simulador;
- utilizar em performance.

---

# 12. POR QUE O SYNTH GENERATOR EXISTE

Há pelo menos quatro públicos:

### 1. Produtor

Quer criar timbres.

### 2. Instrumentista

Quer experimentar instrumentos digitais.

### 3. Estudante

Quer estudar som, timbre, síntese e acústica.

### 4. Cantor

Quer criar uma base instrumental para cantar.

Portanto:

```text
SYNTH GENERATOR
      ↓
PLAY
      ↓
RECORD
      ↓
STUDIO
      ↓
SONG
```

---

# 13. VOICE LAB

A voz será tratada como instrumento.

Não como simples “microfone”.

### Ferramentas

- afinador vocal;
- pitch detection;
- exercícios;
- vocal warm-up;
- escalas;
- intervalos;
- solfejo;
- extensão;
- tessitura;
- respiração;
- ritmo;
- gravação;
- playback;
- acompanhamento;
- harmonização;
- efeitos;
- pitch correction;
- análise;
- histórico.

---

# 14. KARAOKE / SING MODE

O usuário poderá selecionar uma música ou base.

Interface:

```text
LETRA
+
PLAYBACK
+
PARTITURA
+
GUIA MELÓDICO
+
PITCH
+
TIMING
+
MICROFONE
```

Durante a execução:

- letra acompanha;
- melodia pode ser exibida;
- usuário canta;
- sistema acompanha pitch;
- timing pode ser analisado;
- gravação pode ser salva.

Depois:

```text
TAKE
↓
ANALYSIS
↓
RETAKE
↓
FINAL PERFORMANCE
```

Isso conecta diretamente o Voice Lab ao Studio.

---

# 15. INSTRUMENT LAB

A Academia terá múltiplos instrumentos.

A arquitetura será baseada em famílias.

### Cordas

- violino;
- viola;
- violoncelo;
- contrabaixo;
- violão;
- guitarra;
- baixo;
- ukulele.

### Teclas

- piano;
- teclado;
- órgão;
- synth.

### Sopros

- flauta;
- clarinete;
- oboé;
- fagote;
- saxofone;
- trompete;
- trompa;
- trombone;
- tuba.

### Percussão

- bateria;
- caixa;
- marimba;
- xilofone;
- percussão geral.

### Voz

- canto;
- vocal;
- coral.

### Outros

A arquitetura deve permitir adicionar instrumentos sem reconstruir o sistema.

---

# 16. SIMULATOR ENGINE

O simulador será separado da interface.

```text
Instrument Definition
↓
Physical Model
↓
Note Mapping
↓
Gesture Mapping
↓
Audio Mapping
↓
Notation Mapping
↓
Practice Mapping
↓
Assessment Mapping
```

Isso permite adicionar novos instrumentos.

---

# 17. SIMULADOR DIGITAL ≠ SUBSTITUTO FÍSICO

O sistema deve distinguir:

### Instrumento físico

Avaliação através de:

- microfone;
- MIDI;
- câmera;
- sensores quando disponíveis.

### Instrumento virtual

O usuário toca dentro do aplicativo.

### Simulação pedagógica

O sistema demonstra:

- posições;
- notas;
- dedilhados;
- movimentos;
- relações.

### Performance digital

O usuário pode tocar instrumentos virtuais sem possuir o instrumento físico.

Essas experiências coexistem.

---

# 18. PRACTICE RECORDING

Toda prática pode ser registrada.

### Áudio

Gravação da execução.

### Vídeo

Gravação da prática.

### MIDI

Eventos de execução.

### Simulator telemetry

Dados internos do simulador.

### Score

Partitura sincronizada.

### Assessment

Resultado.

---

# 19. PRACTICE REPLAY

O usuário poderá voltar a uma sessão.

Ver:

- vídeo;
- áudio;
- partitura;
- notas tocadas;
- erros;
- timing;
- evolução.

A sessão torna-se um objeto persistente.

---

# 20. TUNER LAB

O afinador será um sistema completo.

### Básico

- cromático;
- frequência;
- nota;
- cents;
- A4;
- calibração.

### Instrument-specific

- afinações de guitarra;
- baixo;
- ukulele;
- violino;
- viola;
- cello;
- contrabaixo;
- outros.

### Avançado

- drone;
- referência;
- temperamentos;
- afinações alternativas;
- histórico.

---

# 21. METRONOME LAB

Completo:

- BPM;
- tap tempo;
- compassos;
- subdivisões;
- acentos;
- polirritmia;
- mudança gradual de andamento;
- ritmos;
- presets;
- programação de sequências.

---

# 22. DRONE LAB

Ferramenta para:

- tonalidade;
- nota sustentada;
- afinação;
- modos;
- treino auditivo;
- improvisação;
- vocal;
- instrumento.

---

# 23. CHORD / SCALE LAB

Gerador e explorador:

- escalas;
- modos;
- acordes;
- inversões;
- arpejos;
- progressões;
- voicings;
- tonalidades;
- relações harmônicas.

Pode alimentar:

- Practice;
- Ear Lab;
- Studio;
- Score Studio.

---

# 24. EAR & SKILL LAB

Ferramentas completas para:

- intervalos;
- acordes;
- progressões;
- escalas;
- modos;
- ritmo;
- ditado;
- melodia;
- harmonia;
- timbre;
- sight singing;
- sight reading.

---

# 25. LEARNING ENGINE

O sistema precisa saber:

```text
O QUE O USUÁRIO ESTUDA
↓
O QUE ELE PRATICA
↓
O QUE ELE CONSEGUE FAZER
↓
O QUE ELE AINDA NÃO CONSEGUE
```

Isso alimenta recomendações.

---

# 26. CREATOR AI

A IA musical será um sistema próprio de ferramentas, não um botão “gerar música”.

Pode incluir:

- geração de ideias;
- geração de acompanhamento;
- geração de progressão;
- geração de melodia;
- geração de MIDI;
- geração de arranjo;
- geração de timbre;
- geração de letra;
- geração de variações;
- geração de stems;
- transformação de áudio;
- áudio→MIDI quando tecnicamente possível;
- MIDI→partitura;
- partitura→MIDI;
- análise musical.

A integração deve respeitar direitos autorais e termos dos modelos utilizados.

---

# 27. STEM LAB

Ferramenta completa para:

- separar stems;
- visualizar;
- silenciar;
- editar;
- exportar;
- substituir;
- remixar.

Suno e Logic já mostram o valor desse tipo de fluxo.

---

# 28. MIXER

O Studio precisa possuir:

- volume;
- pan;
- mute;
- solo;
- sends;
- returns;
- buses;
- routing;
- inserts;
- automation;
- metering;
- gain;
- monitoring.

---

# 29. EFFECTS ENGINE

Biblioteca de efeitos:

- EQ;
- compressor;
- limiter;
- gate;
- reverb;
- delay;
- chorus;
- flanger;
- phaser;
- distortion;
- saturation;
- filter;
- pitch;
- modulation;
- stereo;
- dynamics.

BandLab, por exemplo, já oferece uma biblioteca extensa de efeitos e presets, demonstrando o nível esperado de uma ferramenta de produção web.

---

# 30. AUTOMATION

O usuário deverá conseguir automatizar:

- volume;
- pan;
- efeitos;
- parâmetros;
- filtros;
- instrumentos;
- sends;
- outros controles compatíveis.

---

# 31. EXPORT / IMPORT

A plataforma deve ser interoperável.

### Importação

- áudio;
- MIDI;
- MusicXML;
- projetos compatíveis quando tecnicamente/licencialmente possível;
- stems;
- samples.

### Exportação

- WAV;
- MP3;
- MIDI;
- MusicXML;
- PDF;
- stems;
- áudio por faixa;
- formatos adicionais adequados.

---

# 32. COLLABORATIVE STUDIO

O Studio poderá evoluir para:

- compartilhamento;
- comentários;
- colaboração;
- edição;
- presença;
- sessões;
- músicos convidados.

---

# 33. TOOLBOX CENTRAL

Em vez de espalhar pequenas ferramentas pela interface, teremos um Toolbox estruturado.

```text
TOOLS
├── Tuner
├── Metronome
├── Drone
├── Pitch
├── Chord
├── Scale
├── Rhythm
├── Recorder
├── Camera
├── MIDI
├── Piano
├── Synth
├── Sampler
├── Voice
├── Karaoke
├── Ear Training
├── Score
├── Audio Editor
├── Stem Separator
└── Signal / Analysis
```

Mas cada ferramenta pode ser contextualizada.

Exemplo:

Abrir uma obra → abrir Tuner → abrir Metronome → abrir Practice.

---

# 34. PRINCÍPIO DE NÃO DUPLICAÇÃO

Uma ferramenta deve existir uma vez na arquitetura.

Exemplo:

Não criar:

```text
Metronome do Practice
Metronome do Studio
Metronome do Voice
Metronome do Score
```

Criar:

```text
METRONOME ENGINE
```

e diferentes interfaces/contextos.

Isso reduz manutenção e aumenta consistência.

---

# 35. SISTEMA DE DESIGN

O Design System deverá abranger:

- navegação;
- workspace;
- toolbars;
- editors;
- timeline;
- piano roll;
- score;
- mixer;
- player;
- recorder;
- simulator;
- cards;
- dashboards;
- badges;
- passports;
- graphs;
- progress;
- accessibility.

A interface precisa parecer um único produto.

---

# 36. REGRA DE COMPLETUDE

Antes de qualquer ferramenta ser considerada pronta:

### Funcionalidade

Todos os fluxos principais funcionam.

### UX

Todos os estados funcionam:

- vazio;
- carregando;
- erro;
- sucesso;
- offline quando aplicável;
- permissão;
- recuperação.

### Persistência

O trabalho do usuário não desaparece.

### Undo/Redo

Quando aplicável.

### Autosave

Quando aplicável.

### Exportação

Quando aplicável.

### Importação

Quando aplicável.

### Acessibilidade

Teclado, contraste, labels e navegação.

### Performance

Uso real com projetos relevantes.

### Compatibilidade

Navegadores/dispositivos suportados.

### Segurança

Arquivos, permissões, dados e uploads.

### Observabilidade

Logs, métricas e erros.

### Testes

Unitários + integração + E2E nos fluxos críticos.

Só então:

**DONE.**

---

# 37. NOVO PROCESSO DE IMPLEMENTAÇÃO

Não vamos começar codificando telas.

Começaremos fazendo:

# PHASE A — MARKET CAPABILITY AUDIT

Para cada categoria:

1. identificar líderes;
2. identificar recursos;
3. identificar workflows;
4. identificar UX;
5. identificar formatos;
6. identificar protocolos;
7. identificar APIs;
8. identificar open source;
9. identificar bibliotecas;
10. identificar limitações;
11. identificar licenças;
12. identificar o que precisa ser proprietário.

---

# 38. PHASE B — CAPABILITY MATRIX

Criar uma matriz:

| Ferramenta | Benchmark | Capacidades | Open Source | API | Interno | Prioridade |
|---|---|---|---|---|---|---|
| Score | MuseScore/Dorico | completa | sim | parcial | integração | crítica |
| DAW | Logic/Ableton/Reaper | completa | parcial | parcial | integração | crítica |
| Audio Editor | DAW/Suno | completa | sim/parcial | parcial | integração | crítica |
| Synth | Logic/Suno/etc. | completa | sim/parcial | parcial | engine | alta |
| Voice | ferramentas vocais | completa | parcial | parcial | engine | alta |
| Tuner | apps especializados | completa | sim | sim/parcial | integração | alta |
| Metronome | apps especializados | completa | sim | sim | integração | alta |
| Simulator | ferramentas próprias | completa | componentes | — | proprietário | crítica |
| Ear Training | ToneGym/Musicca etc. | completa | componentes | — | pedagógico | crítica |

Essa tabela crescerá para centenas de capacidades.

---

# 39. PHASE C — ARCHITECTURE MAP

Depois:

```text
TOOL
↓
ENGINE
↓
SERVICE
↓
ADAPTER
↓
UI
↓
DATA
↓
GRAPH
```

Exemplo:

```text
Tuner UI
   ↓
Tuner Engine
   ↓
Pitch Detection
   ↓
Audio Input
   ↓
Frequency Analysis
   ↓
Skill Graph
```

---

# 40. PHASE D — BUILD VS INTEGRATE

Para cada capacidade:

### BUY

Usar serviço externo.

### USE OPEN SOURCE

Integrar biblioteca.

### ADAPT

Modificar/encapsular componente permitido.

### BUILD

Construir internamente.

### PARTNER

Licenciar ou estabelecer parceria.

### REPLACE

Criar alternativa própria quando dependência externa for inadequada.

---

# 41. CRITÉRIO DE CONSTRUÇÃO

Não devemos construir porque:

> “seria legal ter nosso próprio sistema.”

Construiremos quando:

- for diferencial;
- for necessário para integração;
- não houver solução adequada;
- houver vantagem arquitetural;
- houver vantagem comercial;
- houver vantagem pedagógica;
- houver necessidade de controle.

---

# 42. PHASE E — DOMAIN MODEL

Antes da interface final:

```text
USER
INSTRUMENT
WORK
SCORE
PROJECT
TRACK
AUDIO
VIDEO
MIDI
EXERCISE
SKILL
METHOD
LESSON
SESSION
PERFORMANCE
EVIDENCE
CREDENTIAL
```

precisam estar relacionados.

---

# 43. PHASE F — DESIGN SYSTEM

Só depois:

- layout;
- navegação;
- componentes;
- estados;
- responsividade;
- workspace;
- editor;
- player;
- simulator.

---

# 44. PHASE G — IMPLEMENTAÇÃO POR VERTICAL SLICE

Exemplo:

## Vertical Slice 01

```text
Usuário
↓
Escolhe piano
↓
Abre uma obra
↓
Abre partitura
↓
Ouve
↓
Abre simulador
↓
Pratica
↓
Metrônomo
↓
Grava áudio/vídeo
↓
Salva sessão
↓
Visualiza evolução
```

Não é uma demo.

É o primeiro pedaço completo da plataforma.

---

# 45. VERTICAL SLICE 02

```text
Usuário
↓
Abre Score Studio
↓
Cria partitura
↓
Escolhe clave
↓
Adiciona instrumentos
↓
Insere notas
↓
Reproduz
↓
Salva
↓
Exporta
↓
Transforma em exercício
↓
Pratica
```

---

# 46. VERTICAL SLICE 03

```text
Usuário
↓
Abre Studio
↓
Cria projeto
↓
Adiciona instrumento virtual
↓
Cria MIDI
↓
Adiciona áudio
↓
Grava voz
↓
Edita
↓
Mixer
↓
Efeitos
↓
Automação
↓
Master
↓
Exporta
```

---

# 47. VERTICAL SLICE 04

```text
Cantor
↓
Escolhe música/base
↓
Karaoke
↓
Letra
↓
Guia melódico
↓
Microfone
↓
Pitch
↓
Timing
↓
Gravação
↓
Análise
↓
Studio
↓
Mixagem
```

---

# 48. VERTICAL SLICE 05

```text
Produtor
↓
Importa áudio
↓
Separa stems
↓
Edita
↓
Adiciona instrumento
↓
Adiciona synth
↓
Grava voz
↓
Mix
↓
Master
↓
Exporta stems
```

---

# 49. VERTICAL SLICE 06

```text
Aluno
↓
Estuda conceito
↓
Resolve exercício
↓
Pratica
↓
Executa
↓
Grava
↓
Sistema avalia
↓
Skill aumenta
↓
Evidência criada
↓
Credential
```

---

# 50. O QUE NÃO FAREMOS

Não faremos:

- “placeholder tool”;
- botões sem backend;
- simulador decorativo;
- editor de partitura somente visual;
- DAW que só reproduz MIDI;
- afinador que apenas mostra frequência;
- karaoke que apenas mostra letra;
- perfil que só mostra badges;
- IA que inventa conteúdo;
- dashboard sem dados reais;
- funcionalidades mockadas apresentadas como concluídas.

---

# 51. O QUE FAREMOS

Cada ferramenta deverá ser:

**Completa → integrada → persistente → interoperável → mensurável → testada.**

---

# 52. DEFINIÇÃO DE “COMPLETA”

“Completa” não significa:

> possuir absolutamente toda função já inventada no mundo.

Significa:

> **atingir cobertura funcional suficiente para competir dentro da categoria para a qual se apresenta.**

Portanto, se dissermos:

> “Studio DAW”

ele precisa possuir o conjunto funcional fundamental de uma DAW moderna.

Se dissermos:

> “Editor de partituras”

precisa possuir o conjunto fundamental de um software moderno de notação.

Se dissermos:

> “Afinador”

precisa resolver adequadamente a tarefa de afinação.

Essa distinção evita tanto subentrega quanto escopo irracional.

---

# 53. NOVO ROADMAP

## FASE 0 — AUDITORIA DO PRODUTO

**2–4 semanas**

Entregáveis:

- catálogo completo de ferramentas;
- capability matrix;
- benchmark de mercado;
- mapa de APIs;
- mapa open source;
- mapa de licenças;
- build/integrate matrix;
- arquitetura preliminar.

---

## FASE 1 — DOMAIN ARCHITECTURE

**4–8 semanas**

- Music Graph;
- Skill Graph;
- Content Model;
- Tool Registry;
- User model;
- Project model;
- Practice Session;
- Score model;
- Studio model;
- Evidence model.

---

## FASE 2 — DESIGN SYSTEM + SHELL

**4–8 semanas**

- navegação;
- identidade visual;
- workspaces;
- tool panels;
- responsive;
- acessibilidade;
- estados;
- componentes.

---

## FASE 3 — SCORE ENGINE

**8–16+ semanas**

Objetivo:

editor de partituras funcionalmente completo.

Integração:

- MusicXML;
- MIDI;
- playback;
- instrumentos;
- Practice Lab;
- Academy.

---

## FASE 4 — AUDIO ENGINE

**8–16+ semanas**

- recording;
- playback;
- waveform;
- editing;
- timeline;
- audio processing;
- routing;
- export.

---

## FASE 5 — MUSIC STUDIO

**12–24+ semanas**

- multitrack;
- MIDI;
- instruments;
- piano roll;
- mixer;
- effects;
- automation;
- arrangement;
- recording;
- export.

A duração aumenta porque aqui estamos falando de uma DAW real, não de um editor simplificado.

---

## FASE 6 — INSTRUMENT ENGINE

**contínua**

Primeiro conjunto completo:

- piano;
- teclado;
- guitarra/violão;
- baixo;
- bateria;
- voz.

Depois:

- cordas;
- sopros;
- teclas adicionais;
- percussão;
- instrumentos digitais.

---

## FASE 7 — VOICE + KARAOKE

**6–12 semanas**

- pitch;
- timing;
- lyrics;
- guide melody;
- recording;
- vocal effects;
- analysis;
- integration with Studio.

---

## FASE 8 — PRACTICE INTELLIGENCE

**6–12 semanas**

- practice tracking;
- recordings;
- video;
- MIDI;
- assessment;
- analytics;
- recommendation.

---

## FASE 9 — EAR & SKILL

**6–12 semanas**

- ear training;
- adaptive exercises;
- skill assessment;
- competency model.

---

## FASE 10 — ACADEMY + ATLAS

Paralela às fases técnicas:

- conteúdo;
- fontes;
- biografias;
- obras;
- teoria;
- história;
- métodos;
- exercícios.

---

## FASE 11 — MUSICIAN ID

- passport;
- score;
- skills;
- credentials;
- portfolio;
- evidence.

---

## FASE 12 — COMMUNITY

- groups;
- challenges;
- collaboration;
- reputation;
- mentoring.

---

## FASE 13 — SCHOOL

- teachers;
- classes;
- curriculum;
- assessments;
- institution.

---

# 54. COMO O DESENVOLVIMENTO DEVE SER ORGANIZADO

Não será:

```text
Frontend
↓
Backend
↓
Feature
```

Será:

```text
REQUIREMENT
↓
CAPABILITY
↓
DOMAIN MODEL
↓
ENGINE
↓
INTEGRATION
↓
API
↓
UI
↓
TEST
↓
OBSERVABILITY
↓
RELEASE
```

---

# 55. CADA FERRAMENTA TERÁ UM DOSSIÊ

Antes de implementá-la:

```text
TOOL SPEC
│
├── propósito
├── benchmark
├── capabilities
├── UX
├── domain entities
├── APIs
├── libraries
├── open source
├── licensing
├── architecture
├── data model
├── integrations
├── accessibility
├── performance
├── security
├── tests
└── acceptance criteria
```

Assim não teremos decisões espalhadas pelo projeto.

---

# 56. PRIMEIRO DOCUMENTO TÉCNICO A SER PRODUZIDO

Antes de começar código novo:

# MASTER TOOL CATALOG

Esse será o próximo documento operacional.

Ele deverá catalogar **cada ferramenta do produto**, incluindo:

1. nome;
2. categoria;
3. finalidade;
4. usuário;
5. benchmark de mercado;
6. capacidades completas;
7. dependências;
8. tecnologia existente;
9. open source;
10. APIs;
11. integração;
12. dados;
13. interface;
14. requisitos pedagógicos;
15. requisitos de performance;
16. critérios de aceite;
17. prioridade;
18. fase de implementação.

---

# 57. PRINCÍPIO COMERCIAL

O usuário não compra:

> “27 features.”

Ele recebe:

> **um ambiente completo para ser músico.**

E esse ambiente pode atender:

- estudante;
- instrumentista;
- cantor;
- compositor;
- produtor;
- professor;
- tutor;
- escola;
- criador de conteúdo musical;
- músico profissional.

A amplitude do produto deixa de ser um problema porque os sistemas compartilham a mesma infraestrutura.

---

# 58. PRINCÍPIO FINAL

A Academia não deverá perguntar:

> “Precisamos mesmo construir um afinador se já existe?”

A pergunta correta será:

> “Existe uma solução suficientemente boa, integrável e legalmente utilizável? Se sim, como incorporamos isso sem reconstruir o que já foi resolvido?”

E:

> “Onde a Academia precisa ser excepcionalmente própria?”

A resposta é:

**formação, integração, conhecimento, Music Graph, Skill Graph, simuladores, experiência, evidência, identidade e ecossistema.**

---

# 59. DEFINIÇÃO OPERACIONAL DA VISÃO

A Academia Virtual do Músico será:

> **um ecossistema musical completo composto por ferramentas completas, conectadas por uma infraestrutura comum de conhecimento, prática, criação, avaliação e identidade.**

Não haverá “ferramentas pela metade”.

Haverá:

**ferramentas completas + integração inteligente.**

---

# 60. PRÓXIMA ETAPA

O próximo passo de implementação não é programar.

É executar:

# MASTER CAPABILITY AUDIT

E produzir a matriz:

```text
CATEGORIA
→ FERRAMENTA
→ CAPACIDADES COMPLETAS
→ MELHORES REFERÊNCIAS
→ OPEN SOURCE
→ BIBLIOTECAS
→ APIS
→ PROTOCOLOS
→ BUILD / INTEGRATE / ADAPT / PARTNER
→ DEPENDÊNCIAS
→ ARQUITETURA
→ CRITÉRIOS DE ACEITE
→ FASE
```

A partir dela, construiremos a arquitetura real do aplicativo.

Esse documento será o elo entre **visão comercial → produto → UX → engenharia → implementação**.