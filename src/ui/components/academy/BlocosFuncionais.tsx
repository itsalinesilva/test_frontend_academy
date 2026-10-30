import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Heart, Pause, Play, Repeat, Turtle, X } from 'lucide-react';
import type { LessonBlock } from '../../../domain/academy';
import { Card } from '../base/Card';
import { Waveform } from '../domain/Waveform';
import { PianoRoll } from '../domain/PianoRoll';
import { Tuner } from '../domain/Tuner';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { frequencyOf } from '../../../domain/pitch';
import { useAudioCapture } from '../../hooks/useAudioCapture';

/**
 * A BIBLIOTECA DE BLOCOS FUNCIONAIS.
 *
 * 🔴 POR QUE ESTES BLOCOS, E POR QUE AGORA
 * ----------------------------------------
 * A auditoria de paridade (`docs/claude/02_REFERENCE_PARITY_AUDIT.md`) mediu
 * **24 componentes construídos e nunca usados**, em 57 pontos de aplicação —
 * `Player`, `PianoRoll`, `Tuner`, `Waveform` entre eles. Eram peças prontas
 * esperando quem as chamasse.
 *
 * O que faltava não era componente: era **poder usá-los sem escrever código**.
 * Um pentagrama só entrava numa lição se alguém editasse `seed-theory-course.ts`
 * e publicasse de novo — e quem escreve conteúdo não publica código.
 *
 * 🔴 NADA AQUI É MOSTRUÁRIO
 * -------------------------
 * Todo bloco faz o que promete. O player toca de verdade e a forma de onda é
 * **derivada das notas**; o afinador ouve pelo microfone e diz quando não está
 * ouvindo. Um mostrador que se mexe sem sinal é o pior tipo de mentira —
 * parece instrumento.
 */

/** "C#4" → Hz. Devolve `null` para o que não é nota. */
function hz(nota: string): number | null {
  return frequencyOf(nota.trim());
}

/** "C#4" → número MIDI, para o rolo de piano. */
function midi(nota: string): number | null {
  const f = hz(nota);
  return f === null ? null : Math.round(69 + 12 * Math.log2(f / 440));
}

// ---------------------------------------------------------------------------
// PLAYER
// ---------------------------------------------------------------------------

/**
 * 🔴 A FORMA DE ONDA É DERIVADA DO SOM, e não desenhada.
 *
 * Desenhar picos aleatórios daria um gráfico bonito que não corresponde a nada
 * — enfeite com aparência de medição, que é o antipadrão que este repositório
 * persegue desde a liga com Bach em primeiro lugar.
 *
 * O que se faz aqui é somar as senoides das notas no tempo e amostrar a
 * envoltória. Para acorde, todas soam juntas e a onda é uma só; para sequência,
 * cada nota ocupa sua fatia — e a forma **mostra** a diferença.
 */
function picosDasNotas(notas: string[], modo: 'SEQUENCE' | 'CHORD', barras = 64): number[] {
  const frequencias = notas.map(hz).filter((f): f is number => f !== null);
  if (frequencias.length === 0) return [];

  const picos: number[] = [];

  for (let i = 0; i < barras; i++) {
    const t = i / barras;

    if (modo === 'CHORD') {
      /** Todas juntas: a amplitude é a soma, com decaimento ao longo do tempo. */
      const soma = frequencias.reduce((a, f) => a + Math.abs(Math.sin(2 * Math.PI * f * t * 0.01)), 0);
      picos.push(Math.min(1, (soma / frequencias.length) * Math.exp(-t * 1.2)));
    } else {
      /** Em sequência: cada nota tem sua fatia, com ataque e queda. */
      const qual = Math.min(frequencias.length - 1, Math.floor(t * frequencias.length));
      const dentroDaFatia = (t * frequencias.length) % 1;
      const envoltoria = Math.sin(Math.PI * dentroDaFatia);
      const f = frequencias[qual];
      picos.push(Math.min(1, Math.abs(Math.sin(2 * Math.PI * f * t * 0.02)) * envoltoria));
    }
  }

  return picos;
}

export const BlocoPlayer: React.FC<{ bloco: Extract<LessonBlock, { kind: 'PLAYER' }> }> = ({
  bloco,
}) => {
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [repetir, setRepetir] = useState(false);
  const timer = useRef<number | null>(null);

  const picos = useMemo(
    () => picosDasNotas(bloco.notes, bloco.playMode),
    [bloco.notes, bloco.playMode]
  );

  const frequencias = useMemo(
    () => bloco.notes.map(hz).filter((f): f is number => f !== null),
    [bloco.notes]
  );

  /** Quanto o trecho dura, em segundos. É o que a barra percorre. */
  const duracao = useMemo(() => {
    const porNota = 60 / (bloco.bpm ?? 90);
    return bloco.playMode === 'CHORD' ? 2 : Math.max(1, frequencias.length * porNota);
  }, [bloco.bpm, bloco.playMode, frequencias.length]);

  const parar = useCallback(() => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setTocando(false);
    setProgresso(0);
  }, []);

  useEffect(() => () => parar(), [parar]);

  const tocar = useCallback(
    (metade = false) => {
      if (frequencias.length === 0) return;

      const fator = metade ? 2 : 1;
      const passo = (duracao * fator) / frequencias.length;

      if (bloco.playMode === 'CHORD') webAudioSynth.playChord(frequencias, 2 * fator);
      else webAudioSynth.playSequence(frequencias, passo);

      setTocando(true);
      setProgresso(0);

      const inicio = Date.now();
      if (timer.current !== null) window.clearInterval(timer.current);

      timer.current = window.setInterval(() => {
        const decorrido = (Date.now() - inicio) / 1000;
        const pct = Math.min(100, (decorrido / (duracao * fator)) * 100);
        setProgresso(pct);

        if (pct >= 100) {
          if (repetir) {
            setProgresso(0);
            tocar(metade);
          } else {
            parar();
          }
        }
      }, 50);
    },
    [bloco.playMode, duracao, frequencias, parar, repetir]
  );

  return (
    <figure className="not-prose space-y-2">
      <Card variant="default" padding="md">
        <figcaption className="text-sm font-semibold text-stone-900">{bloco.title}</figcaption>
        {bloco.description && (
          <p className="mt-0.5 text-xs text-stone-600">{bloco.description}</p>
        )}

        {frequencias.length === 0 ? (
          /*
            Declarado, e não em branco. Um player sem som que parece um player
            faz a pessoa clicar três vezes antes de concluir que está quebrado.
          */
          <p className="mt-3 text-xs text-stone-600">
            Este trecho não tem nota legível, e por isso não há o que tocar.
          </p>
        ) : (
          <>
            <div className="mt-3">
              <Waveform peaks={picos} progressPercentage={progresso} height={56} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => (tocando ? parar() : tocar())}
                aria-label={tocando ? 'Parar' : 'Ouvir'}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-anil-800 text-white hover:bg-anil-700"
              >
                {tocando ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              {bloco.permiteMeiaVelocidade !== false && (
                <button
                  type="button"
                  onClick={() => tocar(true)}
                  aria-label="Ouvir a meia velocidade"
                  title="Meia velocidade — é o que torna audível a condução de vozes"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-anil-100 text-anil-800 hover:bg-anil-200"
                >
                  <Turtle className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setRepetir((r) => !r)}
                aria-pressed={repetir}
                aria-label="Repetir"
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  repetir ? 'bg-anil-800 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                <Repeat className="h-4 w-4" />
              </button>

              <span className="ml-auto font-mono text-[11px] text-stone-500">
                {bloco.notes.join(' ')}
              </span>
            </div>
          </>
        )}
      </Card>
    </figure>
  );
};

// ---------------------------------------------------------------------------
// PIANO ROLL
// ---------------------------------------------------------------------------

export const BlocoPianoRoll: React.FC<{
  bloco: Extract<LessonBlock, { kind: 'PIANO_ROLL' }>;
}> = ({ bloco }) => {
  const notas = bloco.notas
    .map((n, i) => {
      const p = midi(n.nota);
      return p === null
        ? null
        : {
            id: `${bloco.id}-${i}`,
            pitch: p,
            startBeat: n.inicioEmTempos,
            durationBeats: n.duracaoEmTempos,
            velocity: 100,
          };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null);

  /** A extensão desenhada nasce das notas: nem sobra teclado, nem corta nota. */
  const maisGrave = notas.length ? Math.min(...notas.map((n) => n.pitch)) : 60;
  const maisAgudo = notas.length ? Math.max(...notas.map((n) => n.pitch)) : 72;
  const oitavas = Math.max(1, Math.ceil((maisAgudo - maisGrave + 2) / 12));

  return (
    <figure className="not-prose space-y-2">
      {bloco.title && <figcaption className="text-sm font-semibold text-stone-900">{bloco.title}</figcaption>}
      <Card variant="default" padding="md" className="overflow-x-auto">
        <PianoRoll
          id={bloco.id}
          notes={notas}
          totalBeats={bloco.totalDeTempos ?? 16}
          startPitch={maisGrave + oitavas * 12}
          octavesCount={oitavas}
        />
      </Card>
      {bloco.caption && <p className="text-xs text-stone-600">{bloco.caption}</p>}
    </figure>
  );
};

// ---------------------------------------------------------------------------
// TUNER LAB — o bloco que OUVE
// ---------------------------------------------------------------------------

/**
 * 🔴 O AFINADOR DIZ QUANDO NÃO ESTÁ OUVINDO.
 *
 * `useAudioCapture` devolve o estado da captura. Sem permissão, sem
 * dispositivo, ou sem sinal audível, o painel **declara** isso — em vez de
 * mostrar um ponteiro parado no zero, que quem olha lê como "afinado".
 */
export const BlocoAfinador: React.FC<{
  bloco: Extract<LessonBlock, { kind: 'TUNER_LAB' }>;
}> = ({ bloco }) => {
  const captura = useAudioCapture();
  const alvoHz = hz(bloco.notaAlvo);
  const tolerancia = bloco.toleranciaCents ?? 10;

  const ouvindo = captura.estado === 'capturando';
  const detectada = captura.leitura.frequenciaHz;

  const cents =
    detectada !== null && alvoHz ? Math.round(1200 * Math.log2(detectada / alvoHz)) : null;

  const dentro = cents !== null && Math.abs(cents) <= tolerancia;

  /**
   * 🔴 A MENSAGEM DEPENDE DO ESTADO, e não só do número.
   *
   * Sem isto, "0 cents" significaria ao mesmo tempo "afinado" e "não estou
   * ouvindo nada" — e as duas coisas são opostas. Um mostrador parado no zero
   * é lido como afinado por qualquer pessoa.
   */
  const recado = !alvoHz
    ? null
    : captura.estado === 'negado'
      ? 'O microfone não foi liberado, e por isso nada está sendo medido.'
      : captura.estado === 'indisponivel'
        ? 'Este navegador não expõe captura de áudio, e por isso nada está sendo medido.'
        : captura.estado === 'solicitando_permissao'
          ? 'Pedindo acesso ao microfone…'
          : !ouvindo
            ? 'Toque no afinador para começar a medir.'
            : cents === null
              ? 'Ouvindo, e ainda sem som audível.'
              : dentro
                ? `Dentro da faixa: ${cents > 0 ? '+' : ''}${cents} cents.`
                : `${cents > 0 ? '+' : ''}${cents} cents — ${cents > 0 ? 'um pouco alto' : 'um pouco baixo'}.`;

  return (
    <figure className="not-prose space-y-2">
      <Card variant="default" padding="md">
        <figcaption className="text-sm font-semibold text-stone-900">{bloco.title}</figcaption>
        <p className="mt-0.5 text-xs text-stone-600">
          {bloco.prompt ?? `Cante ou toque ${bloco.notaAlvo}.`}
          {alvoHz && <span className="ml-1 font-mono">({alvoHz.toFixed(1)} Hz)</span>}
        </p>

        {!alvoHz ? (
          <p className="mt-3 text-xs text-red-700">
            A nota alvo "{bloco.notaAlvo}" não é legível — use notação científica, como A4.
          </p>
        ) : (
          <>
            <div className="mt-3">
              <Tuner
                id={bloco.id}
                detectedFreq={detectada ?? undefined}
                targetFreq={alvoHz}
                centsOffset={cents ?? 0}
                toleranceCents={tolerancia}
                isListening={ouvindo}
                onToggleListening={() => (ouvindo ? captura.cancelar() : captura.iniciar())}
              />
            </div>

            <p
              role="status"
              className={`mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                !ouvindo
                  ? 'bg-stone-100 text-stone-700'
                  : cents === null
                    ? 'bg-amber-50 text-amber-900'
                    : dentro
                      ? 'bg-emerald-50 text-emerald-950'
                      : 'bg-stone-100 text-stone-800'
              }`}
            >
              {recado}
            </p>
          </>
        )}
      </Card>
    </figure>
  );
};

// ---------------------------------------------------------------------------
// TABELA
// ---------------------------------------------------------------------------

export const BlocoTabela: React.FC<{ bloco: Extract<LessonBlock, { kind: 'TABELA' }> }> = ({
  bloco,
}) => (
  <figure className="not-prose space-y-2">
    {bloco.title && <figcaption className="text-sm font-semibold text-stone-900">{bloco.title}</figcaption>}
    <div className="overflow-x-auto rounded-xl border border-stone-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-stone-50">
            {bloco.colunas.map((c) => (
              /* `scope` é o que faz a tabela ser lida como tabela, e não como sopa de células. */
              <th
                key={c}
                scope="col"
                className="border-b border-stone-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-stone-600"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloco.linhas.map((linha, i) => (
            <tr key={i} className="odd:bg-white even:bg-stone-50/50">
              {linha.map((celula, j) => (
                <td key={j} className="border-b border-stone-100 px-3 py-2 text-stone-800">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {bloco.caption && <p className="text-xs text-stone-600">{bloco.caption}</p>}
  </figure>
);

// ---------------------------------------------------------------------------
// CITAÇÃO
// ---------------------------------------------------------------------------

export const BlocoCitacao: React.FC<{ bloco: Extract<LessonBlock, { kind: 'CITACAO' }> }> = ({
  bloco,
}) => (
  <figure className="not-prose border-l-4 border-anil-700 bg-anil-50/40 py-3 pl-4 pr-3">
    <blockquote className="font-serif text-base italic leading-relaxed text-stone-800">
      {bloco.texto}
    </blockquote>
    {/* A fonte é obrigatória pelo contrato — citação sem atribuição é plágio começando. */}
    <figcaption className="mt-2 text-xs text-stone-600">
      — {bloco.fonte}
      {bloco.localizacao && <span className="text-stone-500">, {bloco.localizacao}</span>}
    </figcaption>
  </figure>
);

// ---------------------------------------------------------------------------
// LINHA DO TEMPO
// ---------------------------------------------------------------------------

export const BlocoLinhaDoTempo: React.FC<{
  bloco: Extract<LessonBlock, { kind: 'LINHA_DO_TEMPO' }>;
}> = ({ bloco }) => {
  /**
   * 🔴 A DISTÂNCIA NO DESENHO É A DISTÂNCIA NO TEMPO.
   *
   * Espaçar os marcos por igual transformaria a linha do tempo numa lista com
   * datas — e o que ela existe para mostrar é justamente o intervalo: dois
   * séculos de silêncio entre dois marcos é o conteúdo, não o espaço em branco.
   */
  const marcos = [...bloco.marcos].sort((a, b) => a.ano - b.ano);
  const primeiro = marcos[0]?.ano ?? 0;
  const ultimo = marcos[marcos.length - 1]?.ano ?? primeiro;
  const vao = Math.max(1, ultimo - primeiro);

  return (
    <figure className="not-prose space-y-2">
      <figcaption className="text-sm font-semibold text-stone-900">{bloco.title}</figcaption>

      <Card variant="default" padding="md">
        <ol className="relative border-l-2 border-stone-200 pl-5">
          {marcos.map((m, i) => (
            <li
              key={`${m.ano}-${i}`}
              className="relative"
              style={{
                /** A margem é proporcional ao intervalo até o marco anterior. */
                marginTop:
                  i === 0 ? 0 : `${Math.max(12, ((m.ano - marcos[i - 1].ano) / vao) * 160)}px`,
              }}
            >
              <span
                className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-anil-800"
                aria-hidden="true"
              />
              <p className="font-mono text-xs font-bold text-anil-800">{m.ano}</p>
              <p className="text-sm font-semibold text-stone-900">{m.titulo}</p>
              {m.texto && <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{m.texto}</p>}
            </li>
          ))}
        </ol>
      </Card>

      {bloco.caption && <p className="text-xs text-stone-600">{bloco.caption}</p>}
    </figure>
  );
};

// ---------------------------------------------------------------------------
// SESSÃO DE EXERCÍCIOS — o loop do Duolingo
// ---------------------------------------------------------------------------

/**
 * 🔴 O LOOP CANÔNICO, DENTRO DA LIÇÃO.
 *
 * A forma vem do wireframe de paridade
 * (`docs/claude/wireframes/03_PRACTICE_DUOLINGO_ASTRA.md` §5): barra de
 * progresso e vidas no topo, enunciado, alternativas, e a **faixa de veredito
 * que sobe de baixo** — com a explicação, e o botão de continuar.
 *
 * A faixa é a peça que mais importa e a que mais se perde: quem erra precisa
 * ler por quê **sem sair da pergunta**. Uma tela separada de resultado quebra
 * o loop, e foi o que a auditoria mediu em `ImmediateFeedbackScreen`.
 */
export const BlocoSessaoDeExercicios: React.FC<{
  bloco: Extract<LessonBlock, { kind: 'SESSAO_DE_EXERCICIOS' }>;
}> = ({ bloco }) => {
  const [indice, setIndice] = useState(0);
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const [conferida, setConferida] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [vidasPerdidas, setVidasPerdidas] = useState(0);

  const vidas = bloco.vidas ?? 0;
  const q = bloco.questoes[indice];
  const acabou = indice >= bloco.questoes.length;
  const semVidas = vidas > 0 && vidasPerdidas >= vidas;

  function conferir() {
    if (escolhida === null) return;
    const certo = escolhida === q.corretaIndex;
    setConferida(certo);
    if (certo) setAcertos((a) => a + 1);
    else setVidasPerdidas((v) => v + 1);
  }

  function seguir() {
    setIndice((i) => i + 1);
    setEscolhida(null);
    setConferida(null);
  }

  function recomecar() {
    setIndice(0);
    setEscolhida(null);
    setConferida(null);
    setAcertos(0);
    setVidasPerdidas(0);
  }

  if (bloco.questoes.length === 0) {
    return (
      <Card variant="default" padding="md">
        <p className="text-sm text-stone-600">Esta sessão ainda não tem questão nenhuma.</p>
      </Card>
    );
  }

  if (acabou || semVidas) {
    return (
      <Card variant="default" padding="md">
        <p className="font-serif text-base font-bold text-stone-900">
          {semVidas ? 'A sessão encerrou' : 'Sessão concluída'}
        </p>
        <p className="mt-1 text-sm text-stone-700">
          {acertos} de {bloco.questoes.length} {acertos === 1 ? 'certa' : 'certas'}.
          {semVidas && ' As vidas acabaram — recomeçar é o caminho.'}
        </p>
        <button
          type="button"
          onClick={recomecar}
          className="mt-3 rounded-lg bg-anil-800 px-4 py-2 text-sm font-semibold text-white"
        >
          Fazer de novo
        </button>
      </Card>
    );
  }

  const pct = Math.round((indice / bloco.questoes.length) * 100);

  return (
    <section className="not-prose rounded-xl border border-stone-200 bg-white" aria-label={bloco.title}>
      {/* ---- topo: progresso, vidas ---- */}
      <header className="flex items-center gap-3 border-b border-stone-100 p-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da sessão"
        >
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
        </div>

        <span className="shrink-0 font-mono text-[11px] text-stone-500">
          {indice + 1}/{bloco.questoes.length}
        </span>

        {vidas > 0 && (
          <span className="flex shrink-0 items-center gap-0.5" aria-label={`${vidas - vidasPerdidas} vidas`}>
            {Array.from({ length: vidas }, (_, i) => (
              <Heart
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < vidas - vidasPerdidas ? 'fill-red-500 text-red-500' : 'text-stone-300'
                }`}
                aria-hidden="true"
              />
            ))}
          </span>
        )}
      </header>

      {/* ---- a pergunta ---- */}
      <div className="p-4">
        <p className="text-sm font-medium leading-relaxed text-stone-900">{q.enunciado}</p>

        {q.notas && q.notas.length > 0 && (
          <div className="mt-3">
            <BlocoPlayer
              bloco={{
                kind: 'PLAYER',
                id: `${q.id}_player`,
                title: 'Ouça',
                notes: q.notas,
                playMode: q.playMode ?? 'SEQUENCE',
              }}
            />
          </div>
        )}

        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {q.alternativas.map((alt, i) => {
            const marcada = escolhida === i;
            const correta = i === q.corretaIndex;

            let estilo = 'border-stone-200 bg-white text-stone-800 hover:border-stone-400';
            if (conferida !== null) {
              if (correta) estilo = 'border-emerald-500 bg-emerald-50 font-bold text-emerald-950';
              else if (marcada) estilo = 'border-red-500 bg-red-50 font-bold text-red-950';
              else estilo = 'border-stone-200 bg-stone-50 text-stone-400';
            } else if (marcada) {
              estilo = 'border-anil-700 bg-anil-50 font-medium text-anil-950';
            }

            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={conferida !== null}
                  aria-pressed={marcada}
                  onClick={() => setEscolhida(i)}
                  className={`w-full rounded-lg border-2 p-3 text-left text-sm transition-all ${estilo}`}
                >
                  {alt}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ---- a faixa de veredito, que sobe de baixo ---- */}
      {conferida === null ? (
        <footer className="flex justify-end border-t border-stone-100 p-3">
          <button
            type="button"
            disabled={escolhida === null}
            onClick={conferir}
            className="rounded-lg bg-anil-800 px-5 py-2 text-sm font-semibold text-white disabled:bg-stone-300"
          >
            Verificar
          </button>
        </footer>
      ) : (
        <footer
          role="status"
          className={`border-t p-3 ${
            conferida ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <p
            className={`flex items-center gap-1.5 text-sm font-bold ${
              conferida ? 'text-emerald-900' : 'text-red-900'
            }`}
          >
            {conferida ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {conferida ? 'Certo' : 'Não foi dessa vez'}
          </p>

          {/*
            A resposta certa é dita a quem errou. Esconder obrigaria a pessoa a
            adivinhar de novo, e o que ensina é saber qual era.
          */}
          {!conferida && (
            <p className="mt-1 text-xs text-red-950">
              A resposta é <strong>{q.alternativas[q.corretaIndex]}</strong>.
            </p>
          )}

          <p className={`mt-1 text-xs leading-relaxed ${conferida ? 'text-emerald-950' : 'text-red-950'}`}>
            {q.explicacao}
          </p>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={seguir}
              className="rounded-lg bg-anil-800 px-5 py-2 text-sm font-semibold text-white"
            >
              Continuar
            </button>
          </div>
        </footer>
      )}
    </section>
  );
};
