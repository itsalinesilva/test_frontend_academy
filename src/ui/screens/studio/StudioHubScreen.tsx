import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { VisitorInvitation } from '../../components/visitor/VisitorInvitation';
import { Card } from '../../components/base/Card';
import { Plus, Sliders, Mic, FileMusic, Trash2 } from 'lucide-react';
import { cadernoRepository } from '../../../repositories/caderno.repository';
import { PartituraDoCaderno, agruparPorPasta } from '../../../domain/caderno';
import { mesaRepository } from '../../../repositories/mesa.repository';
import { ProjetoDaMesa } from '../../../domain/mesa-de-audio';

export const StudioHubScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId, carregando: sessaoCarregando } = useCurrentUser();
  const [caderno, setCaderno] = useState<PartituraDoCaderno[]>([]);
  /** A pasta que se está vendo; `null` é todas. */
  const [pastaAberta, setPastaAberta] = useState<string | null>(null);

  const [projetosDeAudio, setProjetosDeAudio] = useState<ProjetoDaMesa[]>([]);

  const recarregar = useCallback(async () => {
    setCaderno(userId ? await cadernoRepository.listar(userId) : []);
    setProjetosDeAudio(userId ? await mesaRepository.listar(userId) : []);
  }, [userId]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  /**
   * NAO ha lista de projetos, e esta linha e a correcao.
   *
   * Havia dois projetos escritos neste arquivo — "Arranjo Coral SATB" com 4
   * pistas e "Tomada de Audio - Violino Solo BWV 1001" com 2 —, cada um com
   * andamento, tonalidade e "Ha 1 dia" de ultima modificacao. Nenhum existia:
   * o Estudio nao tem repositorio de projetos, e `DawProjectScreen` tambem
   * nao grava nada.
   *
   * Quem abrisse o Estudio via dois trabalhos seus que nunca fez, e ao clicar
   * caia numa mesa de mixagem vazia.
   *
   * Persistir projeto do Estudio e recurso de verdade, e esta aberto em
   * `D.3` do CLAUDE_TODO. Ate la, o Estudio mostra as ferramentas que tem e
   * diz que nao ha projeto — que e a informacao correta.
   *
   * O CADERNO DE PARTITURAS, esse, existe (M-10): o que a pessoa escreve no
   * editor fica guardado em nome dela, e a lista abaixo e a lista de verdade.
   */

  return (
    <ScreenContainer
      id="studio-hub"
      title="Estúdio & Criação Musical"
      subtitle="Ambiente integrado de composição, edição de partituras (Score) e produção de áudio digital (DAW)."
      badgeLabel="Motor de Criação"
      badgeVariant="brand"
      primaryAction={{
        label: 'Nova partitura',
        icon: Plus,
        onClick: () => navigate('/studio/score'),
      }}
      secondaryActions={[
        {
          label: 'Laboratório de Voz & Afinação',
          icon: Mic,
          onClick: () => navigate('/studio/voice-ear'),
        },
      ]}
      emptyProps={{
        title: 'Nenhum projeto de produção criado',
        description:
          'As ferramentas abaixo funcionam agora. Guardar o projeto entre sessões ainda não — por isso nada aparece aqui.',
      }}
    >
      <div className="space-y-6">
        {/**
         * O Estúdio é público porque as ferramentas servem a quem ainda não
         * entrou: afinar um instrumento não exige matrícula. O convite diz o
         * que muda depois de entrar — guardar o que se escreveu.
         */}
        {!sessaoCarregando && !userId && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <VisitorInvitation
              space="Estúdio"
              summary="As ferramentas de ofício: afinador, metrônomo, escuta e escrita de partitura."
              steps={[
                {
                  title: 'Use sem conta',
                  description: 'Afinar e ouvir não exige matrícula nem cadastro.',
                },
                {
                  title: 'Entre para guardar',
                  description: 'Com conta, o que você escrever fica no seu caderno de partituras.',
                },
                {
                  title: 'Leve embora',
                  description:
                    'A partitura é sua, e sai daqui em MusicXML e MIDI — formatos que outros programas abrem.',
                },
              ]}
              primaryLabel="Entrar e guardar o que eu escrever"
              onPrimary={() => navigate('/auth/login')}
              secondaryLabel="Conhecer a Academia"
              onSecondary={() => navigate('/academia')}
            />
          </div>
        )}

        {/* Quick Tools Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            variant="default"
            padding="md"
            interactive
            className="cursor-pointer flex items-center gap-3"
            onClick={() => navigate('/studio/project/novo')}
          >
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900">
              <Sliders className="w-5 h-5 text-anil-800" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Mesa de áudio</p>
              <p className="text-xs text-stone-500">Gravar pistas, ouvir juntas, exportar WAV</p>
            </div>
          </Card>

          <Card
            variant="default"
            padding="md"
            interactive
            className="cursor-pointer flex items-center gap-3"
            onClick={() => navigate('/studio/score')}
          >
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900">
              <FileMusic className="w-5 h-5 text-anil-800" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Editor de Partituras</p>
              <p className="text-xs text-stone-500">
                Escrever, tocar, guardar e baixar em MusicXML e MIDI
              </p>
            </div>
          </Card>

          <Card
            variant="default"
            padding="md"
            interactive
            className="cursor-pointer flex items-center gap-3"
            onClick={() => navigate('/studio/voice-ear')}
          >
            <div className="p-2.5 bg-stone-100 rounded-md text-stone-900">
              <Mic className="w-5 h-5 text-anil-800" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Voz, Afinador & Ouvido</p>
              <p className="text-xs text-stone-500">
                Treinamento de pitch e intervalos em tempo real
              </p>
            </div>
          </Card>
        </div>

        {userId && (
          <section aria-labelledby="titulo-caderno" className="space-y-2">
            <h2 id="titulo-caderno" className="font-serif text-lg font-bold text-stone-900">
              Seu caderno de partituras
            </h2>
            {caderno.length === 0 ? (
              <p className="text-sm text-stone-600">
                Ainda vazio. O que você escrever no editor e guardar aparece aqui.
              </p>
            ) : (
              <>
                {agruparPorPasta(caderno).length > 1 && (
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pastas">
                    {[null, ...agruparPorPasta(caderno).map((g) => g.pasta ?? '')].map((p) => (
                      <button
                        key={p ?? '__todas'}
                        type="button"
                        aria-pressed={pastaAberta === p}
                        onClick={() => setPastaAberta(p)}
                        className={`rounded-full border px-3 py-1 text-xs ${pastaAberta === p ? 'border-anil-800 bg-anil-50 text-anil-900' : 'border-stone-300 text-stone-600'}`}
                      >
                        {p === null ? 'Todas' : p === '' ? 'Sem pasta' : p}
                      </button>
                    ))}
                  </div>
                )}
                {agruparPorPasta(caderno)
                  .filter((g) => pastaAberta === null || (g.pasta ?? '') === pastaAberta)
                  .map((g) => (
                    <div key={g.pasta ?? '__sem'} className="space-y-1">
                      <h3 className="font-mono text-[11px] uppercase tracking-wide text-stone-500">
                        {g.pasta ?? 'Sem pasta'} · {g.itens.length}
                      </h3>
                      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
                        {g.itens.map((p) => (
                          <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/studio/score?id=${p.id}`)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <span className="block truncate text-sm font-medium text-stone-900">
                                {p.titulo}
                              </span>
                              <span className="block font-mono text-[11px] text-stone-500">
                                {p.notas.length} {p.notas.length === 1 ? 'figura' : 'figuras'} ·{' '}
                                {p.formula} · {p.andamento} BPM
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Excluir ${p.titulo}`}
                              onClick={async () => {
                                await cadernoRepository.excluir(p.id);
                                await recarregar();
                              }}
                              className="rounded p-1.5 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </>
            )}
          </section>
        )}

        {userId && projetosDeAudio.length > 0 && (
          <section aria-labelledby="titulo-audio" className="space-y-2">
            <h2 id="titulo-audio" className="font-serif text-lg font-bold text-stone-900">
              Seus projetos de áudio
            </h2>
            <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
              {projetosDeAudio.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/studio/project/${p.id}`)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm font-medium text-stone-900">
                      {p.titulo || 'Sem título'}
                    </span>
                    <span className="block font-mono text-[11px] text-stone-500">
                      {p.pistas.length} {p.pistas.length === 1 ? 'pista' : 'pistas'} ·{' '}
                      {p.pistas.filter((x) => x.gravacaoId).length} gravadas
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir o projeto ${p.titulo || 'sem título'}`}
                    onClick={async () => {
                      await mesaRepository.excluir(p.id);
                      await recarregar();
                    }}
                    className="rounded p-1.5 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </ScreenContainer>
  );
};
