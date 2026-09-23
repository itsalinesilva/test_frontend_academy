import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { mesaRepository } from '../../../repositories/mesa.repository';
import { Gravacao, Reproducao, motorDoNavegador } from '../../../infrastructure/audio/motor-da-mesa';
import {
  LIMITE_DE_PISTAS,
  PistaDaMesa,
  ProjetoDaMesa,
  codificarWav,
  ganhoDoVolume,
  mixar,
  novaPista,
  picosDasAmostras,
  pistasAudiveis,
  relogio,
} from '../../../domain/mesa-de-audio';
import { ArrowLeft, Circle, Download, Play, Plus, Square, Trash2 } from 'lucide-react';

/**
 * A MESA DE ÁUDIO — gravar, ouvir junto, mixar, levar (E-9).
 *
 * Era vitrine: quatro pistas "SATB" fixas, transporte que só mudava de cor,
 * relógio parado, desfazer sem ação e onda desenhada por fórmula. Agora cada
 * pista grava do microfone, as audíveis tocam juntas com volume, mudo e solo
 * de verdade, a onda é a do que foi gravado, e a mixagem sai em WAV.
 *
 * Gravar numa pista toca as OUTRAS ao mesmo tempo, como guia: é assim que se
 * grava voz por voz, ouvindo as que já estão lá.
 *
 * `/studio/project/novo` começa um projeto; `/studio/project/<id>` abre um do
 * caderno de quem está logado.
 */

type Decodificada = { amostras: Float32Array; taxa: number };

export const DawProjectScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const { userId } = useCurrentUser();
  const pedido = params.id;
  const motor = motorDoNavegador;

  const [projeto, setProjeto] = useState<ProjetoDaMesa>(() => ({
    id: `mesa_${Date.now().toString(36)}`,
    autorId: userId ?? '',
    titulo: '',
    pistas: [novaPista(1)],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  }));
  const [aviso, setAviso] = useState<string | null>(null);
  const [gravandoEm, setGravandoEm] = useState<string | null>(null);
  const [tocando, setTocando] = useState(false);
  const [decorrido, setDecorrido] = useState(0);

  const gravacao = useRef<Gravacao | null>(null);
  const reproducao = useRef<Reproducao | null>(null);
  const decodificadas = useRef(new Map<string, Decodificada>());
  const relogioRef = useRef<{ inicio: number; id: number } | null>(null);

  const idAberto = useRef(projeto.id);
  idAberto.current = projeto.id;

  /**
   * Abrir um projeto guardado — só o da própria pessoa.
   *
   * O projeto que JÁ ESTÁ ABERTO não é relido: a leitura do armazenamento
   * chegaria depois das edições em curso e as desfaria. (O defeito que o
   * teste de ponta a ponta pegou — "Coro" gravado como "Co" — era a tela ser
   * remontada ao trocar de rota; ver `atualizar`.)
   */
  useEffect(() => {
    if (!pedido || pedido === 'novo' || pedido === idAberto.current) return;
    let vivo = true;
    mesaRepository.buscar(pedido).then((p) => {
      if (!vivo) return;
      if (!p || (userId && p.autorId !== userId)) setAviso('Este projeto não está no seu estúdio.');
      else setProjeto(p);
    });
    return () => {
      vivo = false;
    };
  }, [pedido, userId]);

  /** Guarda a cada mudança, com sessão. O endereço passa a ser o do projeto. */
  const atualizar = useCallback(
    async (novo: ProjetoDaMesa) => {
      setProjeto(novo);
      if (!userId) return;
      await mesaRepository.salvar({ ...novo, autorId: userId });
      /**
       * O endereço passa a ser o do projeto — sem passar pelo roteador. Pelo
       * roteador, a troca de rota refazia a checagem de acesso e REMONTAVA a
       * tela no meio da digitação: as teclas desse intervalo se perdiam, e
       * "Coro" ficava "Co". Recarregar a página reabre o projeto do mesmo jeito.
       */
      const alvo = `#/studio/project/${novo.id}`;
      if (typeof window !== 'undefined' && window.location.hash !== alvo) {
        window.history.replaceState(null, '', alvo);
      }
    },
    [userId]
  );

  const mudarPista = (id: string, mudanca: Partial<PistaDaMesa>) =>
    atualizar({ ...projeto, pistas: projeto.pistas.map((p) => (p.id === id ? { ...p, ...mudanca } : p)) });

  const iniciarRelogio = () => {
    const inicio = performance.now();
    const id = window.setInterval(() => setDecorrido((performance.now() - inicio) / 1000), 100);
    relogioRef.current = { inicio, id };
  };
  const pararRelogio = () => {
    if (relogioRef.current) window.clearInterval(relogioRef.current.id);
    relogioRef.current = null;
  };

  const carregar = async (pista: PistaDaMesa): Promise<Decodificada | null> => {
    if (!pista.gravacaoId) return null;
    const ja = decodificadas.current.get(pista.gravacaoId);
    if (ja) return ja;
    const audio = await mesaRepository.gravacoes.ler(pista.gravacaoId);
    if (!audio) return null;
    const d = await motor.decodificar(audio);
    decodificadas.current.set(pista.gravacaoId, d);
    return d;
  };

  const tocarAudiveis = async (excetoId?: string) => {
    const soam = pistasAudiveis(projeto.pistas).filter((p) => p.id !== excetoId);
    const prontas = (await Promise.all(soam.map(async (p) => ({ p, d: await carregar(p) })))).filter(
      (x): x is { p: PistaDaMesa; d: Decodificada } => x.d !== null
    );
    /** Guia vazio não toca: a primeira pista grava em silêncio, sem abrir áudio à toa. */
    if (excetoId && prontas.length === 0) return null;
    return motor.tocar(
      prontas.map(({ p, d }) => ({ ...d, ganho: ganhoDoVolume(p.volume) })),
      () => {
        if (!excetoId) {
          setTocando(false);
          pararRelogio();
        }
      }
    );
  };

  const tocar = async () => {
    if (tocando) return parar();
    setDecorrido(0);
    setTocando(true);
    iniciarRelogio();
    reproducao.current = await tocarAudiveis();
  };

  const parar = () => {
    reproducao.current?.parar();
    reproducao.current = null;
    setTocando(false);
    pararRelogio();
  };

  const gravar = async (pista: PistaDaMesa) => {
    if (gravandoEm) return;
    try {
      gravacao.current = await motor.gravar();
    } catch {
      setAviso('O microfone não foi liberado. Sem ele, não há o que gravar.');
      return;
    }
    setGravandoEm(pista.id);
    setDecorrido(0);
    iniciarRelogio();
    /** As outras pistas tocam como guia. */
    reproducao.current = await tocarAudiveis(pista.id);
  };

  const pararGravacao = async () => {
    const pista = projeto.pistas.find((p) => p.id === gravandoEm);
    const g = gravacao.current;
    gravacao.current = null;
    setGravandoEm(null);
    reproducao.current?.parar();
    pararRelogio();
    if (!pista || !g) return;

    const audio = await g.parar();
    const gravacaoId = `grav_${Date.now().toString(36)}`;
    await mesaRepository.gravacoes.guardar(gravacaoId, audio);
    const d = await motor.decodificar(audio);
    decodificadas.current.set(gravacaoId, d);
    if (pista.gravacaoId) await mesaRepository.gravacoes.apagar(pista.gravacaoId);
    await mudarPista(pista.id, {
      gravacaoId,
      duracaoSegundos: d.amostras.length / d.taxa,
      picos: picosDasAmostras(d.amostras),
    });
  };

  const apagarGravacao = async (pista: PistaDaMesa) => {
    if (pista.gravacaoId) await mesaRepository.gravacoes.apagar(pista.gravacaoId);
    await mudarPista(pista.id, { gravacaoId: undefined, duracaoSegundos: undefined, picos: undefined });
  };

  const exportar = async () => {
    const soam = pistasAudiveis(projeto.pistas);
    const prontas = (await Promise.all(soam.map(async (p) => ({ p, d: await carregar(p) })))).filter(
      (x): x is { p: PistaDaMesa; d: Decodificada } => x.d !== null
    );
    if (prontas.length === 0) {
      setAviso('Não há pista audível com gravação para mixar.');
      return;
    }
    const wav = codificarWav(
      mixar(prontas.map(({ p, d }) => ({ amostras: d.amostras, ganho: ganhoDoVolume(p.volume) }))),
      prontas[0].d.taxa
    );
    const url = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projeto.titulo || 'mixagem').replace(/[^\w-]+/g, '-')}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => () => {
    reproducao.current?.parar();
    pararRelogio();
  }, []);

  const disponivel = motor.disponivel();

  return (
    <ScreenContainer
      id="daw-project"
      title="Mesa de áudio"
      subtitle="Grave pista por pista, ouça as vozes juntas, e leve a mixagem em WAV."
      badgeLabel="Estúdio"
      badgeVariant="neutral"
      primaryAction={{ label: 'Voltar ao estúdio', icon: ArrowLeft, onClick: () => navigate('/studio') }}
    >
      <div className="space-y-4">
        {!disponivel && (
          <p role="status" className="rounded-lg border border-ouro-300 bg-ouro-50 p-3 text-xs text-stone-800">
            Este navegador não oferece gravação de áudio. As pistas já gravadas tocam; gravar novas, não.
          </p>
        )}
        {aviso && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-900">
            {aviso}
          </p>
        )}

        <label className="flex max-w-md flex-col gap-1 text-xs">
          <span className="font-semibold text-stone-700">Título do projeto</span>
          <input
            value={projeto.titulo}
            onChange={(e) => void atualizar({ ...projeto, titulo: e.target.value })}
            className="rounded border border-stone-300 bg-stone-50 px-2 py-1"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-800 bg-stone-900 p-3 text-stone-100">
          <button
            type="button"
            onClick={() => void tocar()}
            disabled={!!gravandoEm || pistasAudiveis(projeto.pistas).length === 0}
            aria-label={tocando ? 'Parar' : 'Tocar'}
            className="rounded-full bg-anil-800 p-2 text-white disabled:opacity-40"
          >
            {tocando ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
          </button>
          <span className="rounded border border-stone-800 bg-stone-950 px-3 py-1 font-mono text-xs" aria-label="Tempo decorrido">
            <span className={gravandoEm ? 'text-red-400' : 'text-stone-200'}>{relogio(decorrido)}</span>
          </span>
          <button
            type="button"
            onClick={() => void exportar()}
            className="ml-auto flex items-center gap-1.5 rounded border border-stone-700 px-3 py-1 text-xs"
          >
            <Download className="h-3.5 w-3.5" /> Exportar mixagem (WAV)
          </button>
        </div>

        <ul className="divide-y divide-stone-100 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {projeto.pistas.map((pista) => (
            <li key={pista.id} className="flex flex-col items-stretch sm:flex-row sm:items-center">
              <div className="w-full shrink-0 space-y-2 border-r border-stone-200 bg-stone-50 p-3 sm:w-72">
                <div className="flex items-center gap-1">
                  <input
                    aria-label="Nome da pista"
                    value={pista.nome}
                    onChange={(e) => void mudarPista(pista.id, { nome: e.target.value })}
                    className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 text-xs font-bold text-stone-900 hover:border-stone-300"
                  />
                  <button
                    type="button"
                    aria-pressed={pista.mudo}
                    aria-label={`Mudo em ${pista.nome}`}
                    onClick={() => void mudarPista(pista.id, { mudo: !pista.mudo })}
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${pista.mudo ? 'bg-anil-800 text-white' : 'bg-stone-200 text-stone-600'}`}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    aria-pressed={pista.solo}
                    aria-label={`Solo em ${pista.nome}`}
                    onClick={() => void mudarPista(pista.id, { solo: !pista.solo })}
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${pista.solo ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}`}
                  >
                    S
                  </button>
                </div>
                <label className="flex items-center gap-2 font-mono text-[11px] text-stone-500">
                  <span>VOL</span>
                  <input
                    aria-label={`Volume de ${pista.nome}`}
                    type="range"
                    min={0}
                    max={100}
                    value={pista.volume}
                    onChange={(e) => void mudarPista(pista.id, { volume: Number(e.target.value) })}
                    className="h-1 w-full accent-anil-800"
                  />
                  <span className="w-6 text-right">{pista.volume}</span>
                </label>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {gravandoEm === pista.id ? (
                    <button type="button" onClick={() => void pararGravacao()} className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 font-semibold text-white">
                      <Square className="h-3 w-3 fill-current" /> Parar gravação
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!disponivel || !!gravandoEm || tocando}
                      onClick={() => void gravar(pista)}
                      className="flex items-center gap-1 rounded border border-stone-300 px-2 py-1 text-red-700 disabled:opacity-40"
                    >
                      <Circle className="h-3 w-3 fill-current" /> {pista.gravacaoId ? 'Regravar' : 'Gravar'}
                    </button>
                  )}
                  {pista.gravacaoId && (
                    <button type="button" onClick={() => void apagarGravacao(pista)} className="rounded px-2 py-1 text-stone-600 hover:bg-stone-100">
                      Apagar gravação
                    </button>
                  )}
                  {projeto.pistas.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remover ${pista.nome}`}
                      onClick={async () => {
                        if (pista.gravacaoId) await mesaRepository.gravacoes.apagar(pista.gravacaoId);
                        await atualizar({ ...projeto, pistas: projeto.pistas.filter((p) => p.id !== pista.id) });
                      }}
                      className="ml-auto rounded p-1 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex min-h-[64px] flex-1 items-center p-3">
                {pista.picos?.length ? (
                  <svg viewBox={`0 0 ${pista.picos.length} 40`} preserveAspectRatio="none" className="h-10 w-full" role="img" aria-label={`Forma de onda de ${pista.nome}, ${pista.duracaoSegundos?.toFixed(1)} segundos`}>
                    {pista.picos.map((p, i) => (
                      <rect key={i} x={i + 0.15} width={0.7} y={20 - p * 18} height={Math.max(0.5, p * 36)} fill="#57534e" />
                    ))}
                  </svg>
                ) : (
                  <p className="text-xs text-stone-400">{gravandoEm === pista.id ? 'Gravando…' : 'Sem gravação.'}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={projeto.pistas.length >= LIMITE_DE_PISTAS}
          onClick={() => void atualizar({ ...projeto, pistas: [...projeto.pistas, novaPista(projeto.pistas.length + 1)] })}
          className="flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-700 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Acrescentar pista
        </button>

        {!userId && (
          <p className="text-[11px] text-stone-500">
            Sem conta, a mesa funciona — grava, toca e exporta —, mas o projeto não fica guardado ao fechar a aba.
          </p>
        )}
      </div>
    </ScreenContainer>
  );
};
