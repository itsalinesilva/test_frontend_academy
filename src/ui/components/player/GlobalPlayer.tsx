import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, List } from 'lucide-react';
import { clsx } from 'clsx';
import {
  REPERTORIO_DO_PLAYER,
  PERIODOS,
  FaixaDoPlayer,
  Periodo,
} from '../../../data/seed-player-repertoire';

export interface GlobalPlayerProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Player de referência.
 *
 * PARA QUE ELE EXISTE
 * -------------------
 * Para dar o som à mão enquanto se estuda. Um diapasão em lá 440 antes de
 * afinar, uma escala menor harmônica para conferir o salto entre VI e VII,
 * uma cadência perfeita para ouvir o que o capítulo acabou de descrever, ou
 * uma peça do repertório de domínio público como fundo. É material de
 * consulta, não um serviço de streaming.
 *
 * COMO ELE SE APRESENTA
 * ---------------------
 * Fechado sobre o conteúdo, sem moldura pesada: uma faixa estreita no canto,
 * translúcida, com o que se usa — tocar, pular, volume — e o nome do que está
 * tocando. A lista de faixas fica atrás de um botão, e só aparece quando
 * pedida. O que não é controle não ocupa espaço.
 */
export const GlobalPlayer: React.FC<GlobalPlayerProps> = ({
  id = 'global-player',
  isOpen,
  onClose,
}) => {
  const [indice, setIndice] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [mudo, setMudo] = useState(false);
  const [listaAberta, setListaAberta] = useState(false);
  const [periodo, setPeriodo] = useState<Periodo | 'todos'>('todos');
  const [decorrido, setDecorrido] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const osciladores = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const agendados = useRef<number[]>([]);
  const relogio = useRef<number | null>(null);

  const faixa: FaixaDoPlayer = REPERTORIO_DO_PLAYER[indice];

  const doPeriodo = useMemo(
    () =>
      periodo === 'todos'
        ? REPERTORIO_DO_PLAYER
        : REPERTORIO_DO_PLAYER.filter((f) => f.periodo === periodo),
    [periodo]
  );

  const contexto = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const parar = useCallback(() => {
    agendados.current.forEach((t) => window.clearTimeout(t));
    agendados.current = [];

    osciladores.current.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch {
        // o nó já terminou sozinho
      }
    });
    osciladores.current = [];

    if (relogio.current) {
      window.clearInterval(relogio.current);
      relogio.current = null;
    }
  }, []);

  const tocar = useCallback(() => {
    parar();
    const ctx = contexto();
    const mestre = ctx.createGain();
    mestre.gain.setValueAtTime(mudo ? 0 : volume * 0.3, ctx.currentTime);
    mestre.connect(ctx.destination);

    let acumulado = 0;

    faixa.notas.forEach(([freq, tempos]) => {
      const dur = tempos * (60 / faixa.bpm);

      if (freq > 0) {
        const t = window.setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            g.gain.setValueAtTime(0.001, ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.03);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur * 0.95);
            osc.connect(g);
            g.connect(mestre);
            osc.start();
            osc.stop(ctx.currentTime + dur);
            osciladores.current.push({ osc, gain: g });
          } catch {
            // contexto suspenso pelo navegador; o clique seguinte o retoma
          }
        }, acumulado * 1000);
        agendados.current.push(t);
      }

      acumulado += dur;
    });

    const total = faixa.duracaoSegundos;
    const inicio = Date.now();
    relogio.current = window.setInterval(() => {
      const t = (Date.now() - inicio) / 1000;
      if (t >= total) {
        setDecorrido(total);
        setTocando(false);
        parar();
      } else {
        setDecorrido(t);
      }
    }, 120);
  }, [faixa, contexto, mudo, volume, parar]);

  useEffect(() => {
    if (tocando) tocar();
    else parar();
    return parar;
  }, [tocando, tocar, parar]);

  const irPara = (i: number) => {
    parar();
    setDecorrido(0);
    setIndice(((i % REPERTORIO_DO_PLAYER.length) + REPERTORIO_DO_PLAYER.length) % REPERTORIO_DO_PLAYER.length);
  };

  if (!isOpen) return null;

  const progresso = faixa.duracaoSegundos > 0 ? (decorrido / faixa.duracaoSegundos) * 100 : 0;
  const mmss = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <aside
      id={id}
      aria-label="Player de referência"
      className="fixed bottom-16 right-2 z-40 w-[min(22rem,calc(100vw-1rem))] select-none rounded-xl bg-anil-950/80 text-stone-100 shadow-lg ring-1 ring-white/10 backdrop-blur-md lg:bottom-4 lg:right-4"
    >
      {listaAberta && (
        <div className="border-b border-white/10">
          <div className="flex flex-wrap gap-1 px-3 pt-2.5">
            {(['todos', ...PERIODOS] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriodo(p)}
                className={clsx(
                  'rounded-full px-2 py-0.5 text-[10px] transition-colors',
                  periodo === p
                    ? 'bg-white/15 text-white'
                    : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
                )}
              >
                {p === 'todos' ? 'tudo' : p}
              </button>
            ))}
          </div>

          <ul className="max-h-56 overflow-y-auto px-1.5 py-1.5">
            {doPeriodo.map((f) => {
              const i = REPERTORIO_DO_PLAYER.indexOf(f);
              const atual = i === indice;
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => {
                      irPara(i);
                      setTocando(true);
                    }}
                    className={clsx(
                      'flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                      atual ? 'bg-white/10' : 'hover:bg-white/5'
                    )}
                  >
                    <span
                      className={clsx(
                        'min-w-0 flex-1 truncate text-xs',
                        atual ? 'text-ouro-400' : 'text-stone-200'
                      )}
                    >
                      {f.titulo}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-stone-500">
                      {mmss(f.duracaoSegundos)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="px-3 py-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="min-w-0 flex-1 truncate text-xs font-medium text-white">{faixa.titulo}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar player"
            className="shrink-0 text-stone-500 transition-colors hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-0.5 truncate text-[11px] text-stone-400">
          {faixa.autor} · {faixa.tonalidade}
          {faixa.compasso !== '—' && ` · ${faixa.compasso}`}
        </p>

        <div
          className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={Math.round(progresso)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da faixa"
        >
          <div
            className="h-full bg-ouro-400 transition-[width] duration-150"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => irPara(indice - 1)}
            aria-label="Faixa anterior"
            className="rounded p-1 text-stone-400 transition-colors hover:text-white"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setTocando((v) => !v)}
            aria-label={tocando ? 'Pausar' : 'Tocar'}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            {tocando ? <Pause className="h-3.5 w-3.5" /> : <Play className="ml-0.5 h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => irPara(indice + 1)}
            aria-label="Próxima faixa"
            className="rounded p-1 text-stone-400 transition-colors hover:text-white"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>

          <span className="ml-1 shrink-0 font-mono text-[10px] text-stone-500">
            {mmss(decorrido)}/{mmss(faixa.duracaoSegundos)}
          </span>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setMudo((v) => !v)}
            aria-label={mudo ? 'Ativar som' : 'Silenciar'}
            className="rounded p-1 text-stone-400 transition-colors hover:text-white"
          >
            {mudo ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={mudo ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setMudo(false);
            }}
            aria-label="Volume"
            className="h-0.5 w-12 cursor-pointer appearance-none rounded-full bg-white/20 accent-ouro-400"
          />

          <button
            type="button"
            onClick={() => setListaAberta((v) => !v)}
            aria-label="Repertório"
            aria-expanded={listaAberta}
            className={clsx(
              'ml-0.5 rounded p-1 transition-colors',
              listaAberta ? 'text-ouro-400' : 'text-stone-400 hover:text-white'
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
