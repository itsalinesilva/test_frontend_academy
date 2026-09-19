# 79 · Ferramentas do Laboratório

> O que esta camada tem de diferente do resto: são ferramentas de **ofício**.
> Quem usa um afinador não está "engajando" — está afinando um instrumento
> antes de estudar. Ferramenta que atrapalha é pior que ferramenta ausente,
> porque a pessoa já contava com ela.

---

## 1 · Estado real, medido em 18/09/2026

| Ferramenta | Estado | O que falta |
|---|---|---|
| Metrônomo | ◑ toca | **não mede nem grava** — ver `CLAUDE_TODO.md` P.5 |
| Afinador | ◑ detecta altura em `useAudioCapture` | sem tela própria |
| Teste de microfone | ❌ | não existe |
| Editor de partitura | ❌ **fachada** | `ScoreEditorScreen` tem 110 linhas, botão morto (`onAction: () => {}`) e anuncia "suporte a MusicXML e MIDI" que não existe |
| Caderno de partituras | ❌ | não existe |

> A linha do editor é a mais grave: a tela **anuncia uma capacidade que não
> tem**. Isso não é tela incompleta, é promessa falsa — a mesma família do
> ranking com Bach em primeiro.

---

## 2 · Teste de microfone — antes de tudo

Quatro tipos de exercício e todos os simuladores dependem do microfone. Hoje,
quando ele falha, a pessoa descobre **errando** um exercício que respondeu
certo. Isso ensina a coisa errada e destrói a confiança na medição.

O teste responde três perguntas, nesta ordem:

| Pergunta | Como se responde | Se falhar |
|---|---|---|
| Há permissão? | pedir e capturar o erro | explicar como liberar, **por navegador** |
| Está chegando sinal? | nível em tempo real | dizer que está mudo, e sugerir o que ver |
| O sinal serve para medir? | relação sinal/ruído e estabilidade | dizer o que atrapalha — ventilador, sala, ganho |

**A terceira é a que importa.** Sinal chegando não é sinal utilizável: um
microfone captando ruído de fundo constante mede altura errada, e o exercício
vai culpar a pessoa. O teste precisa dizer "dá para medir" ou "não dá, e é por
isto".

Regra dura: **nenhum exercício de microfone começa sem o teste ter passado ao
menos uma vez naquele aparelho.** Quando não passou, o exercício oferece a
forma sem microfone — que sempre existe, por construção da gramática
(`tests/music-grammar.test.ts`).

---

## 3 · Metrônomo

Um metrônomo que só toca é um aplicativo de celular. O nosso existe dentro de
uma plataforma que **mede**, e é isso que ele deve fazer.

| Capacidade | Por quê |
|---|---|
| Andamento em BPM, com fórmula de compasso | o básico |
| Acento no primeiro tempo | é o que torna o compasso audível |
| Subdivisão — colcheia, tercina, semicolcheia | onde mora a dificuldade real |
| **Gravar a batida da pessoa** | sem isto não há medição |
| **Desvio médio em milissegundos, por tempo** | é o diagnóstico: adianta ou atrasa? |
| Andamento progressivo | o modo de estudo que resolve passagem difícil |

A medição reaproveita `practice-measurement.ts`, que já sabe representar
ausência de medida. Tempo não medido é `null`, e nunca zero.

---

## 4 · Afinador

`useAudioCapture` já faz detecção de altura por autocorrelação. Falta a tela e
falta o que a torna um afinador de conservatório:

- **Desvio em cents**, com sinal, e não só "afinado / desafinado"
- **Referência ajustável** — A=440 não é universal; barroco histórico usa 415
- **Temperamento** — igual, justo, pitagórico. `TemperamentSystem` já existe em
  `domain/music.ts`
- **Por corda**, para instrumentos com afinação fixa

---

## 5 · Caderno de partituras

É a peça maior desta camada, e tem três partes que precisam existir juntas —
qualquer uma sozinha é fachada.

### 5.1 · Escrever

| Capacidade | Nível |
|---|---|
| Pauta, clave, armadura, fórmula de compasso | obrigatório |
| Inserir nota por altura e figura | obrigatório |
| Ligadura, ponto, pausa, acidente | obrigatório |
| Compassos, barras, repetição | obrigatório |
| Letra, dinâmica, andamento, articulação | desejável |
| Mais de uma voz / pauta | desejável |

**Não escrever do zero.** Notação musical é um problema resolvido, e resolvido
mal por quem tenta de novo. A base deve ser biblioteca aberta madura —
`VexFlow` para renderizar, `abcjs` ou MusicXML para o formato de troca. O que é
nosso é a integração: tocar, medir, guardar, e a ligação com o Atlas.

### 5.2 · Tocar e testar

A partitura escrita **soa**, pelo mesmo motor de `infrastructure/audio/synth`
que já toca os exercícios. Duas razões:

1. Quem escreve precisa ouvir o que escreveu — é como se corrige erro de
   escrita musical.
2. Um motor único garante que a mesma nota soe igual em toda a plataforma. Dois
   motores divergem, e a pessoa aprende a afinação de um deles.

### 5.3 · Guardar, organizar, baixar

| Capacidade | Regra |
|---|---|
| Salvar no caderno | é **dado do aluno** — publicar conteúdo nunca apaga |
| Pastas nomeadas | criadas por ela, renomeáveis, sem hierarquia obrigatória |
| Mover entre pastas | sem perder histórico |
| Baixar | **MusicXML** e **MIDI**, formatos que outros programas abrem |
| Imprimir | PDF pela impressão do navegador |
| Apagar | com confirmação que diz o que se perde |

> **Baixar não é conveniência, é princípio.** O trabalho é da pessoa. Uma
> plataforma que guarda o que alguém escreveu e não devolve num formato aberto
> está retendo trabalho alheio. O mesmo vale para o backup em Drive.

### 5.4 · O que o caderno NÃO é

Não é biblioteca do Conservatório. O acervo institucional — as obras do Atlas —
é conteúdo publicado, e vive noutra chave. O caderno é do aluno, e só ele lê.
Misturar os dois seria repetir a falha que a camada editorial existe para
impedir.

---

## 6 · Onde cada coisa vive

| Coisa | Categoria de armazenamento |
|---|---|
| Partituras do aluno | **dado do aluno** — nunca republicável |
| Pastas do caderno | **dado do aluno** |
| Preferência de afinador | **dado do aluno** |
| Obras do Atlas | **conteúdo publicado** |
| Correção editorial de obra | **trabalho editorial** |

As três categorias estão em `72_QUALITY_SWEEP.md` e são verificadas por
`scripts/qa/security.mjs`.

---

## 7 · Ordem de construção

Da mais dependente para a menos:

1. **Teste de microfone** — desbloqueia quatro tipos de exercício e todos os simuladores
2. **Metrônomo com medição** — fecha `P.5`, que já está aberto
3. **Afinador** — a detecção já existe; falta a tela
4. **Caderno: escrever e tocar** — o núcleo
5. **Caderno: pastas, salvar, baixar** — o que o torna útil
6. **Ligação com o Atlas** — escrever a partir de uma obra, comparar com a referência

> Construir o editor antes do teste de microfone seria construir o mais caro
> antes do que destrava mais coisa.
