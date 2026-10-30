import React, { useEffect, useMemo, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { ScoreContainer } from '../../components/domain/ScoreContainer';
import { CirculationBar } from '../../components/navigation/CirculationBar';
import { Button } from '../../components/base/Button';
import { acervoService } from '../../../services/application/acervo.service';
import { FaixaDoPlayer } from '../../../data/seed-player-repertoire';
import { compassosDaFaixa, compassosQueTransbordam } from '../../../domain/partitura-da-faixa';
import { useTocarFaixa } from '../../hooks/useTocarFaixa';
import { FileMusic, ArrowRight, BookOpen } from 'lucide-react';

/**
 * A PARTITURA DO ESTÚDIO — agora ligada ao Acervo (RT-3, PZ-C).
 *
 * O QUE HAVIA
 * -----------
 * Três "obras Urtext" escritas na própria tela, que só trocavam o título: a
 * pauta mostrava sempre os mesmos quatro compassos de exemplo, com todas as
 * notas na mesma altura. "Auditar" tocava um motivo fixo. Armadura e fórmula
 * trocavam um rótulo e mais nada. E o botão "Abrir na partitura" da ficha da
 * obra chegava aqui sem que a obra chegasse junto.
 *
 * O QUE HÁ
 * --------
 * A obra vem do endereço (`?obra=<id>`) pelo serviço do Acervo, que diz qual
 * transcrição própria a escreve. Sem obra, escolhe-se do repertório que a
 * plataforma de fato tem escrito. A pauta desenha a escrita da faixa, o
 * player toca as notas dela, e o andamento muda o que se ouve.
 *
 * Os controles que não mudavam nada saíram. Transpor e trocar a fórmula
 * exigem reescrever a partitura; oferecê-los sem isso seria enfeite.
 */
export const ScoreScreen: React.FC = () => {
  const { navigate, query } = useRouter();
  const obraId = query.get('obra');

  const repertorio = useMemo(() => acervoService.repertorioComPartitura(), []);
  const [faixa, setFaixa] = useState<FaixaDoPlayer | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [bpm, setBpm] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    if (!obraId) return;

    acervoService.fichaDaObra(obraId).then((ficha) => {
      if (!vivo) return;
      if (!ficha) {
        setAviso('A obra pedida não está no acervo.');
        return;
      }
      const daObra = acervoService.faixaDaObra(ficha.obra);
      if (!daObra) {
        setAviso('Esta obra ainda não tem edição que a pauta desenhe.');
        return;
      }
      setAviso(null);
      setFaixa(daObra);
      setBpm(null);
    });

    return () => {
      vivo = false;
    };
  }, [obraId]);

  const tocada = useMemo(() => (faixa && bpm ? { ...faixa, bpm } : faixa), [faixa, bpm]);
  const { tocando, alternar, parar } = useTocarFaixa(tocada);

  const compassos = useMemo(() => (faixa ? compassosDaFaixa(faixa) : []), [faixa]);
  const transbordam = useMemo(
    () => (faixa ? compassosQueTransbordam(compassos, faixa.compasso) : []),
    [compassos, faixa]
  );

  const abrir = (f: FaixaDoPlayer) => {
    parar();
    setFaixa(f);
    setBpm(null);
    setAviso(null);
  };

  return (
    <ScreenContainer
      id="score-hub"
      title="Partituras"
      subtitle="As transcrições próprias do Conservatório, escritas na pauta e tocadas nota a nota."
      badgeLabel="Estúdio"
      badgeVariant="brand"
      state={faixa ? 'populated' : 'empty'}
      primaryAction={{
        label: 'Ir ao Estúdio',
        icon: ArrowRight,
        onClick: () => navigate('/studio'),
      }}
      secondaryActions={[{ label: 'Voltar ao Acervo', onClick: () => navigate('/acervo') }]}
      emptyProps={{
        title: aviso ?? 'Nenhuma partitura aberta',
        description: `Escolha uma das ${repertorio.length} peças escritas do repertório, ou abra uma obra pela ficha dela no Acervo.`,
        actionLabel: 'Abrir a primeira peça',
        onAction: () => repertorio[0] && abrir(repertorio[0]),
      }}
    >
      <div className="space-y-6">
        <CirculationBar id="score-circulation" />

        {aviso && faixa && (
          <p role="status" className="rounded-lg border border-ouro-300 bg-ouro-50 p-3 text-xs text-stone-800">
            {aviso}
          </p>
        )}

        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-anil-800" />
            <label className="flex flex-1 items-center gap-2 text-xs">
              <span className="font-serif font-bold text-stone-900">Repertório escrito</span>
              <select
                aria-label="Peça do repertório"
                value={faixa?.id ?? ''}
                onChange={(e) => {
                  const f = repertorio.find((r) => r.id === e.target.value);
                  if (f) abrir(f);
                }}
                className="min-w-0 flex-1 rounded border border-stone-300 bg-stone-50 px-2 py-1 text-xs"
              >
                <option value="" disabled>
                  Escolha uma peça…
                </option>
                {repertorio.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.autor} — {f.titulo}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {faixa && (
          <>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-stone-200 bg-white p-3.5 text-xs shadow-xs">
              <label className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-700">Ler em clave de</span>
                <select
                  aria-label="Clave"
                  value={clef}
                  onChange={(e) => setClef(e.target.value as 'treble' | 'bass')}
                  className="rounded border border-stone-300 bg-stone-50 px-2 py-1 text-xs"
                >
                  <option value="treble">Sol</option>
                  <option value="bass">Fá</option>
                </select>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-700">Andamento</span>
                <input
                  aria-label="Andamento"
                  type="number"
                  min={30}
                  max={240}
                  value={bpm ?? faixa.bpm}
                  onChange={(e) => setBpm(Math.max(30, Math.min(240, Number(e.target.value) || faixa.bpm)))}
                  className="w-16 rounded border border-stone-300 bg-stone-50 px-2 py-1 font-mono text-xs"
                />
                <span className="text-stone-500">BPM</span>
              </label>

              <span className="font-mono text-[11px] text-stone-500">
                {faixa.tonalidade} · {faixa.compasso} · {compassos.length} compassos
              </span>
            </div>

            <ScoreContainer
              id="active-editor-score"
              title={faixa.titulo}
              composer={faixa.autor}
              clef={clef}
              keySignature={faixa.tonalidade}
              timeSignature={faixa.compasso}
              tempo={bpm ?? faixa.bpm}
              measures={compassos.map((c) => ({
                measureNumber: c.numero,
                notes: c.notas.map((n) => n.nome ?? '_'),
                tempos: c.notas.map((n) => n.tempos),
              }))}
              isPlaying={tocando}
              onTogglePlay={alternar}
              onResetPlayback={parar}
            />

            {transbordam.length > 0 && (
              <p className="text-[11px] text-stone-500">
                Nos compassos {transbordam.join(', ')} há nota que atravessa a barra; a ligadura ainda
                não é desenhada, e a nota aparece inteira no compasso em que começa.
              </p>
            )}
          </>
        )}

        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-100 p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-full bg-red-100 p-2 text-anil-800">
              <FileMusic className="h-4 w-4" />
            </div>
            <p className="text-[11px] text-stone-600">
              Cada peça aqui é transcrição própria, de obra em domínio público — a mesma que a ficha
              da obra toca no Acervo.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/acervo')}>
            Ver no Acervo
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};
