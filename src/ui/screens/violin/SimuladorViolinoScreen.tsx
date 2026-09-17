import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { useRouter } from '../../navigation/router';
import { BracoDoViolino } from '../../components/violin/BracoDoViolino';
import { EsteiraDeNotas } from '../../components/violin/EsteiraDeNotas';
import { PainelDeCaptura } from '../../components/practice/PainelDeCaptura';
import { useCapturaAcustica } from '../../hooks/useCapturaAcustica';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';
import { PARTITURAS_VIOLINO } from '../../../data/seed-violin-scores';
import {
  PartituraExecutavel,
  Veredito,
  julgarNota,
  julgarExecucao,
  ResultadoDaExecucao,
  AmostraDetectada,
  batidaParaMs,
  duracaoEmBatidas,
  simplificar,
  NivelDeSimplificacao,
  EXPLICACAO_VEREDITO,
} from '../../../domain/score-follow';
import { notaMaisProxima } from '../../../domain/practice-measurement';
import { Play, Square, Info, Gauge, RotateCcw } from 'lucide-react';

/**
 * Simulador de violino com acompanhamento de partitura.
 *
 * A peça corre, o ponteiro fica parado, o braço mostra onde pisar e o
 * microfone julga nota a nota — afinação e tempo separadamente.
 *
 * TRÊS DECISÕES QUE DEFINEM A EXPERIÊNCIA
 * ---------------------------------------
 * 1. **O julgamento é diferido em uma nota.** Uma nota só é julgada depois
 *    que sua janela fecha. Julgar no instante do ataque produziria veredito
 *    antes de o som existir por completo, e a vibração do violino leva algumas
 *    dezenas de milissegundos para estabilizar a altura.
 *
 * 2. **Andamento reduzido não é trapaça.** Tocar devagar é o método de
 *    estudo, não uma facilitação — e a janela de julgamento acompanha o
 *    andamento, então 60 BPM não é "mais fácil de acertar", é mais fácil de
 *    EXECUTAR. O placar registra o andamento usado.
 *
 * 3. **Sem microfone, não se joga.** A alternativa seria aceitar toques na
 *    tela e chamar isso de prática de violino. Não é.
 */

type Fase = 'preparo' | 'contagem' | 'tocando' | 'resultado';

export const SimuladorViolinoScreen: React.FC = () => {
  const { navigate, params } = useRouter();
  const { userId } = useUsuarioAtual();
  const captura = useCapturaAcustica();

  const [partituraBase, setPartituraBase] = useState<PartituraExecutavel>(
    PARTITURAS_VIOLINO.find((p) => p.id === params.id) ?? PARTITURAS_VIOLINO[0]
  );
  const [nivel, setNivel] = useState<NivelDeSimplificacao>('original');
  const [bpm, setBpm] = useState(partituraBase.bpmOriginal);
  const [fase, setFase] = useState<Fase>('preparo');
  const [decorridoMs, setDecorridoMs] = useState(0);
  const [contagem, setContagem] = useState(4);
  const [vereditos, setVereditos] = useState<Record<string, Veredito>>({});
  const [ultimo, setUltimo] = useState<{ nota: string; veredito: Veredito } | null>(null);
  const [resultado, setResultado] = useState<ResultadoDaExecucao | null>(null);

  const amostrasRef = useRef<AmostraDetectada[]>([]);
  const inicioRef = useRef(0);
  const quadroRef = useRef<number | null>(null);
  const julgadasRef = useRef<Set<string>>(new Set());

  const partitura = nivel === 'original' ? partituraBase : simplificar(partituraBase, nivel);
  const totalBatidas = duracaoEmBatidas(partitura);
  const duracaoTotalMs = batidaParaMs(totalBatidas, bpm);

  // Acumula o que o microfone entrega, com carimbo de tempo.
  useEffect(() => {
    if (fase !== 'tocando' || captura.leitura.frequenciaHz === null) return;
    amostrasRef.current.push({
      ms: performance.now() - inicioRef.current,
      frequenciaHz: captura.leitura.frequenciaHz,
    });
  }, [captura.leitura, fase]);

  const parar = useCallback(() => {
    if (quadroRef.current !== null) cancelAnimationFrame(quadroRef.current);
    quadroRef.current = null;
  }, []);

  useEffect(() => parar, [parar]);

  const encerrar = useCallback(() => {
    parar();
    const r = julgarExecucao(partitura, amostrasRef.current, bpm);
    setResultado(r);
    setVereditos(Object.fromEntries(r.julgamentos.map((j) => [j.notaId, j.veredito])));
    setFase('resultado');
    captura.cancelar();
  }, [partitura, bpm, parar, captura]);

  const rodar = useCallback(() => {
    const passo = () => {
      const agora = performance.now() - inicioRef.current;
      setDecorridoMs(agora);

      // Julga as notas cuja janela já fechou. Diferir em uma nota evita
      // veredito antes de o som estabilizar.
      for (const nota of partitura.notas) {
        if (nota.nota === null || julgadasRef.current.has(nota.id)) continue;
        const fimDaJanela = batidaParaMs(nota.inicioBatida, bpm) + Math.max(90, batidaParaMs(nota.duracaoBatidas, bpm) * 0.6);
        if (agora > fimDaJanela) {
          julgadasRef.current.add(nota.id);
          const j = julgarNota(nota, amostrasRef.current, bpm);
          setVereditos((v) => ({ ...v, [nota.id]: j.veredito }));
          setUltimo({ nota: nota.nota, veredito: j.veredito });
        }
      }

      if (agora >= duracaoTotalMs + 400) {
        encerrar();
        return;
      }
      quadroRef.current = requestAnimationFrame(passo);
    };
    quadroRef.current = requestAnimationFrame(passo);
  }, [partitura, bpm, duracaoTotalMs, encerrar]);

  const comecar = async () => {
    if (captura.estado !== 'capturando') {
      const ok = await captura.iniciar();
      if (!ok) return;
    }
    amostrasRef.current = [];
    julgadasRef.current = new Set();
    setVereditos({});
    setUltimo(null);
    setResultado(null);
    setDecorridoMs(0);

    // Contagem de entrada: um compasso, para o arco já estar em movimento
    // quando a primeira nota chegar.
    setFase('contagem');
    setContagem(partitura.compasso[0]);
    const intervalo = 60000 / bpm;
    let restante = partitura.compasso[0];
    const t = setInterval(() => {
      restante -= 1;
      setContagem(restante);
      if (restante <= 0) {
        clearInterval(t);
        inicioRef.current = performance.now();
        setFase('tocando');
        rodar();
      }
    }, intervalo);
  };

  const batidaAtual = (decorridoMs * bpm) / 60000;
  const proxima = partitura.notas.find(
    (n) => n.nota !== null && n.inicioBatida >= batidaAtual - 0.15
  );
  const seguinte = partitura.notas.find(
    (n) => n.nota !== null && proxima && n.inicioBatida > proxima.inicioBatida
  );
  const detectada =
    captura.leitura.frequenciaHz !== null
      ? notaMaisProxima(captura.leitura.frequenciaHz)
      : null;

  return (
    <PageLayout
      id="simulador-violino"
      form="workspace"
      state="content"
    >
      <PageLayout.Toolbar>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-sm font-bold text-stone-100">
              Simulador de Violino
            </h1>
            <span className="font-mono text-[11px] text-stone-400">{partitura.titulo}</span>
          </div>
          <div className="flex items-center gap-2">
            {fase === 'tocando' ? (
              <Button variant="outline" size="sm" onClick={encerrar}>
                <Square className="mr-1 h-3.5 w-3.5" /> Parar
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={comecar}>
                <Play className="mr-1 h-3.5 w-3.5" />
                {fase === 'resultado' ? 'Tocar de novo' : 'Começar'}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/practice')}>
              Sair
            </Button>
          </div>
        </div>
      </PageLayout.Toolbar>

      {/* ------------------------------------------------ painel: as peças */}
      <PageLayout.Panel>
        <div className="space-y-4 p-3">
          <section className="space-y-1.5">
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Peças
            </h2>
            <ul className="space-y-1">
              {PARTITURAS_VIOLINO.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={fase === 'tocando'}
                    onClick={() => {
                      setPartituraBase(p);
                      setBpm(p.bpmOriginal);
                      setFase('preparo');
                      setResultado(null);
                    }}
                    className={`w-full rounded px-2 py-1.5 text-left text-[11px] transition-colors disabled:opacity-40 ${
                      partituraBase.id === p.id
                        ? 'bg-zinc-700 font-semibold text-stone-100'
                        : 'text-stone-300 hover:bg-zinc-800'
                    }`}
                  >
                    {p.titulo}
                    <span className="block font-mono text-[9px] text-stone-500">
                      {p.tonalidade} · {p.compasso[0]}/{p.compasso[1]} · {p.bpmOriginal} BPM
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-1.5 border-t border-zinc-800 pt-3">
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Versão
            </h2>
            {(['original', 'intermediario', 'iniciante'] as NivelDeSimplificacao[]).map((n) => (
              <button
                key={n}
                type="button"
                disabled={fase === 'tocando'}
                onClick={() => setNivel(n)}
                className={`w-full rounded px-2 py-1 text-left text-[11px] disabled:opacity-40 ${
                  nivel === n ? 'bg-zinc-700 font-semibold text-stone-100' : 'text-stone-300 hover:bg-zinc-800'
                }`}
              >
                {n === 'original' ? 'Original' : n === 'intermediario' ? 'Intermediária' : 'Iniciante'}
              </button>
            ))}
            <p className="text-[10px] leading-relaxed text-stone-500">
              As versões reduzidas tocam menos notas no mesmo esqueleto rítmico — o contorno da
              melodia permanece, para você chegar à original reconhecendo a peça.
            </p>
          </section>

          <section className="space-y-2 border-t border-zinc-800 pt-3">
            <h2 className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              <Gauge className="h-3 w-3" /> Andamento
            </h2>
            <input
              type="range"
              min={40}
              max={Math.max(120, partitura.bpmOriginal + 30)}
              value={bpm}
              disabled={fase === 'tocando'}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full accent-ouro-500"
              aria-label="Andamento em batidas por minuto"
            />
            <div className="flex items-center justify-between font-mono text-[11px] text-stone-300">
              <span>{bpm} BPM</span>
              <button
                type="button"
                disabled={fase === 'tocando'}
                onClick={() => setBpm(partitura.bpmOriginal)}
                className="text-[10px] text-stone-500 hover:text-stone-300 disabled:opacity-40"
              >
                original: {partitura.bpmOriginal}
              </button>
            </div>
            <p className="text-[10px] leading-relaxed text-stone-500">
              Tocar devagar não é facilitar: a janela de julgamento acompanha o andamento. É mais
              fácil de executar, não de acertar.
            </p>
          </section>
        </div>
      </PageLayout.Panel>

      {/* ------------------------------------------------------ centro */}
      <PageLayout.Main>
        <div className="space-y-4 p-4">
          {fase === 'preparo' && (
            <div className="space-y-3">
              <PainelDeCaptura
                estado={captura.estado}
                leitura={captura.leitura}
                notaAlvo={partitura.notas.find((n) => n.nota)?.nota ?? undefined}
                onIniciar={() => void captura.iniciar()}
                onCancelar={captura.cancelar}
              />

              <Card variant="default" padding="md" className="space-y-2 border-zinc-700 bg-zinc-800/60">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-100">
                  <Info className="h-3.5 w-3.5" /> Para a medição sair confiável
                </p>
                <ul className="space-y-1 text-[11px] leading-relaxed text-stone-400">
                  <li>
                    <strong className="text-stone-300">Ambiente sem eco.</strong> Sala com cortina
                    ou tapete mede melhor que cozinha e banheiro: a reverberação faz o microfone
                    ouvir duas vezes a mesma nota.
                  </li>
                  <li>
                    <strong className="text-stone-300">Microfone a um metro.</strong> Perto demais
                    satura no forte; longe demais some no piano. O do notebook serve.
                  </li>
                  <li>
                    <strong className="text-stone-300">Fone de ouvido, se usar o metrônomo.</strong>{' '}
                    Pelo alto-falante, o clique entra no microfone e é contado como ataque.
                  </li>
                  <li>
                    <strong className="text-stone-300">Afine antes.</strong> Um violino desafinado
                    faz a peça inteira ser julgada fora — e o afinador acima serve para isso.
                  </li>
                  <li>
                    <strong className="text-stone-300">Nada é enviado.</strong> A análise acontece
                    no seu aparelho; nenhum áudio sai daqui nem é gravado.
                  </li>
                </ul>
              </Card>
            </div>
          )}

          {fase === 'contagem' && (
            <div className="flex h-56 items-center justify-center">
              <span className="font-mono text-7xl font-bold text-ouro-400">{contagem}</span>
            </div>
          )}

          {(fase === 'tocando' || fase === 'resultado') && (
            <EsteiraDeNotas
              partitura={partitura}
              bpm={bpm}
              decorridoMs={fase === 'resultado' ? duracaoTotalMs : decorridoMs}
              vereditos={vereditos}
            />
          )}

          {fase === 'tocando' && ultimo && (
            <div
              className={`rounded-lg p-3 text-center font-mono text-sm font-bold ${
                ultimo.veredito === 'PERFEITO'
                  ? 'bg-emerald-900/40 text-emerald-300'
                  : ultimo.veredito === 'BOM'
                    ? 'bg-lime-900/40 text-lime-300'
                    : ultimo.veredito === 'ALTURA_ERRADA'
                      ? 'bg-red-900/40 text-red-300'
                      : 'bg-amber-900/40 text-amber-300'
              }`}
              aria-live="polite"
            >
              {ultimo.nota} · {ultimo.veredito.replace('_', ' ')}
            </div>
          )}

          {fase === 'resultado' && resultado && (
            <Card variant="default" padding="lg" className="space-y-4 border-zinc-700 bg-zinc-800/60">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-base font-bold text-stone-100">Execução concluída</h2>
                <span className="font-mono text-3xl font-bold text-ouro-400">
                  {resultado.precisao}
                  <span className="text-sm text-stone-500">/100</span>
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                {(
                  [
                    ['Notas certas', `${resultado.acertos} de ${resultado.notasJulgadas}`],
                    ['Maior sequência', `${resultado.maiorSequencia}`],
                    [
                      'Desvio de tempo',
                      resultado.desvioMedioMs !== null ? `${resultado.desvioMedioMs} ms` : '—',
                    ],
                    [
                      'Desvio de afinação',
                      resultado.desvioMedioCents !== null ? `${resultado.desvioMedioCents} cents` : '—',
                    ],
                  ] as [string, string][]
                ).map(([r, v]) => (
                  <div key={r} className="rounded border border-zinc-700 p-2">
                    <dt className="font-mono text-[10px] uppercase text-stone-500">{r}</dt>
                    <dd className="font-mono text-base font-bold text-stone-100">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-1 border-t border-zinc-700 pt-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                  Nota a nota
                </p>
                <ul className="flex flex-wrap gap-1">
                  {resultado.julgamentos
                    .filter((j) => j.esperada !== null)
                    .map((j) => (
                      <li
                        key={j.notaId}
                        title={`${j.esperada}: ${EXPLICACAO_VEREDITO[j.veredito]}${j.desvioMs !== null ? ` (${j.desvioMs > 0 ? '+' : ''}${j.desvioMs} ms, ${j.desvioCents} cents)` : ''}`}
                        className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                          j.veredito === 'PERFEITO'
                            ? 'bg-emerald-900/60 text-emerald-300'
                            : j.veredito === 'BOM'
                              ? 'bg-lime-900/60 text-lime-300'
                              : j.veredito === 'ALTURA_ERRADA'
                                ? 'bg-red-900/60 text-red-300'
                                : j.veredito === 'NAO_TOCADA'
                                  ? 'bg-zinc-700 text-stone-400'
                                  : 'bg-amber-900/60 text-amber-300'
                        }`}
                      >
                        {j.esperada}
                      </li>
                    ))}
                </ul>
              </div>

              {!userId && (
                <p className="rounded border border-amber-800 bg-amber-950/40 p-2 text-[11px] leading-relaxed text-amber-300">
                  Você não está autenticado, então este resultado não foi guardado. Entre para que
                  as execuções fiquem no seu histórico e contem para a prática.
                </p>
              )}

              <Button variant="outline" size="sm" onClick={comecar}>
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> Tocar de novo
              </Button>
            </Card>
          )}
        </div>
      </PageLayout.Main>

      {/* ------------------------------------------------ inspetor: o braço */}
      <PageLayout.Inspector>
        <div className="space-y-3 p-3">
          <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Braço
          </h2>
          <div className="flex justify-center">
            <BracoDoViolino
              notaAlvo={fase === 'tocando' ? proxima?.nota ?? null : partitura.notas.find((n) => n.nota)?.nota ?? null}
              notaSeguinte={fase === 'tocando' ? seguinte?.nota ?? null : null}
              notaDetectada={detectada?.nota ?? null}
              desvioCents={detectada?.desvioCents ?? null}
              mostrarTodasAsNotas={fase !== 'tocando'}
              larguraExibicao={232}
            />
          </div>
          <p className="text-[10px] leading-relaxed text-stone-500">
            As distâncias entre os dedos diminuem conforme se sobe — é assim no instrumento, e é
            assim no desenho. ↓ e ↑ marcam dedo baixo e alto.
          </p>
        </div>
      </PageLayout.Inspector>
    </PageLayout>
  );
};
