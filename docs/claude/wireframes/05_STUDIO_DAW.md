# WIREFRAMES — 05 · ESTÚDIO (referência estrutural: DAW profissional)

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/studio`, `/studio/project/:id`, `/studio/voice-ear`
**Forma:** D `WORKSPACE` · **Densidade:** `INSTRUMENT` · **Tema:** escuro obrigatório

> **O que clonamos:** a ergonomia de suítes de padrão industrial — linha do tempo multipista com régua de compassos, cabeçalhos de pista com Mute/Solo/Rec/fader, mixer de canais com medidores, piano roll, barra de transporte fixa, e inspetor contextual.
>
> **O que adaptamos:** o Estúdio é o **laboratório do músico da plataforma**. Não competimos com Pro Tools: o escopo é gravar execução, montar arranjo a partir da partitura canônica, mixar de forma simples e **gerar evidência auditada**. Menos recursos, mesma gramática.

---

## 1. ESTADO ATUAL

4 telas, **0 serviços**, 6 `alert()`. `MixerChannel`, `PianoRoll`, `Recorder` e `InstrumentKeyboard` existem e estão **órfãos**. `domain/creation.ts` tem 224 linhas — sem repositório nem serviço. Paridade estimada: ~25% estrutural, ~5% funcional.

---

## 2. `/studio/project/:id` — Forma D

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Projetos │ Coral SATB · BWV 262   [Salvar] [Exportar▾] [Evidência]    │
│  ▸ sticky top-0 · fundo #18181B                                         │
├──────────┬──────────────────────────────────────────────┬───────────────┤
│ PAINEL   │  ÁREA DE TRABALHO                            │ INSPETOR      │
│ 240px    │                                              │ 280px         │
│          │  ┌────────────────────────────────────────┐  │               │
│ ▸ Pistas │  │ RÉGUA  1    2    3    4    5    6      │  │ PISTA         │
│  [+ Áudio]  │        ├────┼────┼────┼────┼────┤      │  │ Soprano       │
│  [+ MIDI]│  └────────────────────────────────────────┘  │               │
│  [+ Inst]│  ┌────────────────────────────────────────┐  │ Volume  ─●──  │
│          │  │ Soprano  [M][S][●]  ▂▅▇▅▂  ▁▂▃         │  │  -3,2 dB      │
│ ▸ Arquivos  │  ├────────────────────────────────────────┤ │ Pan   ──●──  │
│  arrastar│  │ Contralto[M][S][●]  ▂▃▅▃▂              │  │  C            │
│  MP3 aqui│  ├────────────────────────────────────────┤  │               │
│          │  │ Tenor    [M][S][●]  ▃▅▆▅▃              │  │ ▸ Inserções   │
│ ▸ Partitura │  ├────────────────────────────────────────┤ │  [+ EQ]      │
│  importar│  │ Baixo    [M][S][●]  ▅▆▇▆▅              │  │  [+ Reverb]   │
│  →trilhas│  └────────────────────────────────────────┘  │               │
│          │           ▲ playhead carmim #991b1b          │ ▸ Envio       │
│ ▸ Mixer  │  ┌────────────────────────────────────────┐  │               │
│  [abrir] │  │ PIANO ROLL (pista MIDI selecionada)     │  │ ▸ Origem      │
│          │  │ C5│ ▓▓▓                                 │  │  Partitura    │
│          │  │ B4│      ▓▓▓▓                           │  │  BWV 262      │
│          │  │ A4│ ▓▓        ▓▓▓                       │  │  [ver →]      │
│          │  │ G4│      ▓▓▓                            │  │               │
│          │  └────────────────────────────────────────┘  │               │
├──────────┴──────────────────────────────────────────────┴───────────────┤
│ TRANSPORTE ▸ sticky bottom-0                                            │
│ [◀◀][▶][■][●][⟳]   001|02|480   ♩=72   4/4   [🔊 metrônomo]  -6,2 dB ▂▅ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Regiões

| Região | Componente | Situação |
| :--- | :--- | :--- |
| Cabeçalho de pista | `Track` | existe |
| Linha do tempo / régua | `Timeline` · `TimelineContainer` | existe |
| Forma de onda do clipe | `Waveform` | existe |
| Piano roll | `PianoRoll` | **órfão** |
| Canal do mixer | `MixerChannel` | **órfão** |
| Gravação | `Recorder` | **órfão** |
| Teclado virtual | `InstrumentKeyboard` | **órfão** |
| Transporte | — | **criar** |

### 2.2 Vista de mixer

```
┌─────────────────────────────────────────────────────────┐
│ MIXER                                        [fechar ✕] │
├────────┬────────┬────────┬────────┬────────┬────────────┤
│Soprano │Contral.│ Tenor  │ Baixo  │ Bus 1  │  MASTER    │
│        │        │        │        │        │            │
│ ▸ EQ   │ ▸ EQ   │        │        │ Reverb │            │
│ ▸ Comp │        │        │        │        │            │
│ ──●──  │ ──●──  │ ──●──  │ ──●──  │ ──●──  │  ──●──     │
│  pan   │  pan   │  pan   │  pan   │        │            │
│  ║     │  ║     │  ║     │  ║     │  ║     │   ║        │
│  ║ ▇   │  ║ ▅   │  ║ ▆   │  ║ ▇   │  ║ ▃   │   ║ ▇▇    │
│  ║ ▇   │  ║ ▅   │  ║ ▆   │  ║ ▇   │  ║ ▃   │   ║ ▇▇    │
│  ●     │  ●     │  ●     │  ●     │  ●     │   ●        │
│ -3.2   │ -4.1   │ -2.8   │ -1.5   │ -8.0   │  -6.2      │
│ [M][S] │ [M][S] │ [M][S] │ [M][S] │ [M][S] │            │
└────────┴────────┴────────┴────────┴────────┴────────────┘
```
Cada canal é **um** `MixerChannel`. Medidor com pico e RMS, retenção de pico, indicação de clipe.

---

## 3. ESCOPO — o que entra e o que não entra

| Capacidade | Escopo | Motivo |
| :--- | :--- | :--- |
| Pistas de áudio e MIDI | ✅ | núcleo |
| Gravação pelo microfone | ✅ | gera evidência |
| Importar MP3 do usuário | ✅ | ADR-001.C — processado localmente |
| Importar partitura → trilhas MIDI | ✅ | regra constitucional 3 |
| Piano roll com edição e velocity | ✅ | núcleo |
| Volume, pan, mute, solo, medidor | ✅ | núcleo |
| Metrônomo, BPM, fórmula de compasso | ✅ | núcleo |
| Desfazer/refazer | ✅ | **inegociável** num editor |
| Persistência do projeto | ✅ | localStorage + Drive |
| Renderizar mixdown e stems | ✅ | `OfflineAudioContext` |
| EQ, compressor, reverb básicos | 🟡 v2 | `BiquadFilter`, `Convolver` |
| Automação de parâmetros | 🟡 v2 | |
| Edição destrutiva, comping, take lanes | ❌ | fora do escopo pedagógico |
| VST/AU, latência sub-10ms, surround | ❌ | inviável no navegador |

**Declarar escopo é parte da paridade.** Fingir recurso que não existe — como os 6 `alert()` atuais — é pior que não ter.

---

## 4. `/studio` — HUB · Forma B

Projetos recentes em grade com capa gerada da forma de onda, duração, nº de pistas e data. Ações: novo projeto vazio, **novo a partir de partitura**, importar áudio. Trilho: atalhos para Laboratório de Voz, Editor de Partitura e Afinador.

---

## 5. `/studio/voice-ear` — LABORATÓRIO · Forma D

```
┌─────────────────────────────────────────────────────────────────┐
│ Laboratório de Voz & Percepção        [A4=440 ▾] [Temperamento▾]│
├──────────┬──────────────────────────────────────┬───────────────┤
│ MODO     │                                      │ SESSÃO        │
│ ▸ Afinador│            LÁ                        │               │
│ ▸ Percep. │            A4                        │ ▸ tempo 4:12  │
│ ▸ Extensão│         441,8 Hz                     │ ▸ afinação    │
│ ▸ Vibrato │                                      │   média +4c   │
│          │  -50 ──────────┬──●────────── +50     │ ▸ estabilid.  │
│ ENTRADA  │                0                      │   ▓▓▓▓░ 82%   │
│ [Microf.▾]│           +7 cents                   │               │
│ ▁▂▅▇▅▂   │                                      │ ▸ extensão    │
│ clareza  │  ┌────────────────────────────────┐   │   G3 – F5     │
│  0,92    │  │ TRAJETÓRIA (10 s)              │   │               │
│          │  │ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ alvo       │   │ [Gravar como  │
│ [●REC]   │  │   ╭─╮   ╭────╮                 │   │  evidência]   │
│          │  │ ──╯ ╰───╯    ╰──               │   │               │
│          │  └────────────────────────────────┘   │               │
├──────────┴──────────────────────────────────────┴───────────────┤
│ [ Iniciar captação ]   Entrada: Microfone padrão · 48 kHz        │
└─────────────────────────────────────────────────────────────────┘
```

**Defeito crítico atual:** a tela não chama `getUserMedia`, não instancia `AudioContext` e não importa o `engineGateway`. Alterna entre duas strings fixas; a barra de cents tem largura fixa de 52%; "85% de Precisão" está escrito no JSX. **O motor de detecção de altura existe, é correto, e está desconectado.**

---

## 6. MATRIZ DE APLICAÇÃO

| Rota | Forma | Painéis | Situação |
| :--- | :---: | :--- | :--- |
| `/studio` | B | trilho de ferramentas | hardcoded |
| `/studio/project/:id` | D | esquerda + inspetor + transporte | visual, sem áudio |
| `/studio/voice-ear` | D | modos + sessão | **100% simulado** |

---

## 7. DEPENDÊNCIAS BLOQUEANTES

| Dependência | Situação |
| :--- | :--- |
| `creation.repository` + `studio.service` | inexistentes |
| Grafo WebAudio por canal (ganho, pan, medidor, master) | inexistente |
| `AudioWorklet` para detecção de altura | inexistente (hoje O(n²) na thread principal) |
| `getUserMedia` + gravação | inexistente |
| `OfflineAudioContext` para render | inexistente |
| Pilha de desfazer/refazer | inexistente |
| Armazenamento de áudio | inexistente |
| Importação MusicXML → MIDI | inexistente |
| `MixerChannel` `PianoRoll` `Recorder` `InstrumentKeyboard` | **órfãos** |
