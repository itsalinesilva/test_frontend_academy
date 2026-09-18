import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { atlasRepository, FiltroDoAtlas } from '../../../repositories/atlas.repository';
import { MusicalEra, AtlasWorkPlacement } from '../../../domain/gamification';
import { Regiao, Genero } from '../../../data/seed-atlas';
import { Tribe, TribeStatus } from '../../../domain/tribe';
import { Network, Calendar, Globe2, Music, Library, Users } from 'lucide-react';

/**
 * O Atlas.
 *
 * O QUE HAVIA AQUI
 * ----------------
 * Cinco eras escritas dentro deste arquivo, com contagem de obras inventada:
 * "Barroco — 142 obras canônicas", numa plataforma que **não tem acervo de
 * obras nenhum**. Abaixo, três obras também escritas aqui, cada uma com
 * proveniência detalhada — autógrafo, primeira edição, acervo de museu —,
 * como se o Conservatório as tivesse catalogado.
 *
 * E "Música Brasileira de Tradição" aparecia como **era**. Não é: é uma
 * região, e ela atravessa várias eras. Ver
 * `docs/harness/75_TAXONOMIA_DO_ATLAS.md`.
 *
 * O QUE HÁ AGORA
 * --------------
 * Os três eixos do catálogo, lidos do repositório:
 *
 *   ERA     quando   ·  oito recortes, os que os cursos de História ensinam
 *   REGIÃO  onde     ·  eixo que faltava, e sem o qual "Brasil" virava era
 *   TRIBO   com quem ·  a população nichada — violinistas, historiadores
 *
 * A contagem de obras é **contada**. Enquanto o acervo estiver vazio, é zero
 * — e a tela diz isso, em vez de inventar cento e quarenta e dois.
 */
const TODOS = 'todos';

export const WorldsAtlasScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [eras, setEras] = useState<MusicalEra[] | null>(null);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [tribos, setTribos] = useState<Tribe[]>([]);
  const [obras, setObras] = useState<AtlasWorkPlacement[]>([]);
  const [totalNoAcervo, setTotalNoAcervo] = useState(0);

  const [eraId, setEraId] = useState<string>(TODOS);
  const [regiaoId, setRegiaoId] = useState<string>(TODOS);
  const [generoId, setGeneroId] = useState<string>(TODOS);
  const [triboId, setTriboId] = useState<string>(TODOS);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [e, r, g, t, total] = await Promise.all([
        atlasRepository.listarEras(),
        atlasRepository.listarRegioes(),
        atlasRepository.listarGeneros(),
        atlasRepository.listarTribos(),
        atlasRepository.contarObras(),
      ]);
      if (!vivo) return;
      setEras(e);
      setRegioes(r);
      setGeneros(g);
      setTribos(t);
      setTotalNoAcervo(total);
    })().catch(() => {
      if (vivo) setEras([]);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const filtro = useCallback((): FiltroDoAtlas => {
    return {
      eraId: eraId === TODOS ? undefined : eraId,
      regiaoId: regiaoId === TODOS ? undefined : regiaoId,
      generoId: generoId === TODOS ? undefined : generoId,
      triboId: triboId === TODOS ? undefined : triboId,
    };
  }, [eraId, regiaoId, generoId, triboId]);

  useEffect(() => {
    atlasRepository
      .listarObras(filtro())
      .then(setObras)
      .catch(() => setObras([]));
  }, [filtro]);

  /**
   * As eras que a região selecionada alcança.
   *
   * É o cruzamento dos eixos acontecendo na interface: escolher "Brasil"
   * esconde a Antiguidade, porque não há repertório brasileiro nela — e
   * mostrar um recorte vazio seria oferecer um caminho que não leva a nada.
   */
  const regiaoAtiva = regioes.find((r) => r.id === regiaoId);
  const erasVisiveis = (eras ?? []).filter(
    (e) => !regiaoAtiva || regiaoAtiva.eraIds.includes(e.id)
  );

  return (
    <ScreenContainer
      id="worlds-atlas"
      title="Atlas"
      subtitle="O mapa: quando, onde e com quem a música foi feita."
      badgeLabel={`${(eras ?? []).length} eras · ${regioes.length} regiões · ${tribos.length} tribos`}
      badgeVariant="neutral"
      primaryAction={{
        label: 'Ver o grafo de influências',
        icon: Network,
        onClick: () => navigate('/worlds/graph'),
      }}
      state={eras === null ? 'loading' : 'populated'}
      loadingMessage="Abrindo o mapa…"
    >
      <div className="space-y-8">
        <section className="space-y-3" aria-labelledby="eixo-tempo">
          <h2
            id="eixo-tempo"
            className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"
          >
            <Calendar className="h-4 w-4 text-anil-800" aria-hidden="true" />
            Quando — eras
          </h2>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por era">
            <BotaoDeFiltro ativo={eraId === TODOS} onClick={() => setEraId(TODOS)}>
              Todas as eras
            </BotaoDeFiltro>
            {erasVisiveis.map((era) => (
              <BotaoDeFiltro key={era.id} ativo={eraId === era.id} onClick={() => setEraId(era.id)}>
                {era.name}
              </BotaoDeFiltro>
            ))}
          </div>

          {eraId !== TODOS && (
            <DetalheDaEra era={erasVisiveis.find((e) => e.id === eraId)!} />
          )}
        </section>

        <section className="space-y-3" aria-labelledby="eixo-lugar">
          <h2
            id="eixo-lugar"
            className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"
          >
            <Globe2 className="h-4 w-4 text-anil-800" aria-hidden="true" />
            Onde — regiões
          </h2>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por região">
            <BotaoDeFiltro
              ativo={regiaoId === TODOS}
              onClick={() => {
                setRegiaoId(TODOS);
                setEraId(TODOS);
              }}
            >
              Todas as regiões
            </BotaoDeFiltro>
            {regioes.map((r) => (
              <BotaoDeFiltro
                key={r.id}
                ativo={regiaoId === r.id}
                onClick={() => {
                  setRegiaoId(r.id);
                  // a era escolhida pode não existir nesta região
                  if (!r.eraIds.includes(eraId)) setEraId(TODOS);
                }}
              >
                {r.name}
              </BotaoDeFiltro>
            ))}
          </div>

          {regiaoAtiva && (
            <p className="text-xs leading-relaxed text-stone-600">{regiaoAtiva.description}</p>
          )}
        </section>

        <section className="space-y-3" aria-labelledby="eixo-gente">
          <h2
            id="eixo-gente"
            className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"
          >
            <Users className="h-4 w-4 text-anil-800" aria-hidden="true" />
            Com quem — tribos
          </h2>

          <p className="text-xs text-stone-600">
            A população nichada de cada lugar e de cada tempo. Tribe é gente, e
            não lugar — quem tem coordenada no mapa é o mundo.
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tribo">
            <BotaoDeFiltro ativo={triboId === TODOS} onClick={() => setTriboId(TODOS)}>
              Todas as tribos
            </BotaoDeFiltro>
            {tribos.map((t) => {
              const fechada = t.status === TribeStatus.ANNOUNCED;
              return (
                <BotaoDeFiltro
                  key={t.id}
                  ativo={triboId === t.id}
                  desabilitado={fechada}
                  titulo={fechada ? 'Aguardando corpus pedagógico' : t.description}
                  onClick={() => setTriboId(t.id)}
                >
                  {t.name}
                  {t.status !== TribeStatus.OPEN && (
                    <span className="ml-1.5 font-mono text-[10px] opacity-70">
                      {fechada ? 'anunciada' : 'em preparo'}
                    </span>
                  )}
                </BotaoDeFiltro>
              );
            })}
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="faceta-genero">
          <h2
            id="faceta-genero"
            className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"
          >
            <Music className="h-4 w-4 text-anil-800" aria-hidden="true" />
            Gênero
          </h2>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por gênero">
            <BotaoDeFiltro ativo={generoId === TODOS} onClick={() => setGeneroId(TODOS)}>
              Todos
            </BotaoDeFiltro>
            {generos.map((g) => (
              <BotaoDeFiltro
                key={g.id}
                ativo={generoId === g.id}
                onClick={() => setGeneroId(g.id)}
              >
                {g.name}
              </BotaoDeFiltro>
            ))}
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="obras">
          <div className="flex items-center justify-between">
            <h2 id="obras" className="font-serif text-base font-bold text-stone-900">
              Obras
            </h2>
            <span className="font-mono text-xs text-stone-500">
              {obras.length} de {totalNoAcervo} no acervo
            </span>
          </div>

          {obras.length === 0 ? (
            <EmptyState
              id="atlas-obras-vazio"
              icon={<Library className="h-8 w-8 stroke-1" aria-hidden="true" />}
              title={
                totalNoAcervo === 0
                  ? 'O acervo de obras ainda está vazio'
                  : 'Nenhuma obra responde a este recorte'
              }
              description={
                totalNoAcervo === 0
                  ? 'O mapa acima é a taxonomia que os cursos de História ensinam — eras, regiões e gêneros. Catalogar uma obra exige decidir edição, proveniência e domínio público, e isso ainda não foi feito.'
                  : 'Escolha outra era, região ou gênero para ver o que existe.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {obras.map((obra) => (
                <Card key={obra.workId} variant="default" padding="lg" className="space-y-2">
                  <Badge variant="neutral" size="sm">
                    {eras?.find((e) => e.id === obra.eraId)?.name ?? obra.eraId}
                  </Badge>
                  <p className="font-serif text-sm font-bold text-stone-900">{obra.workId}</p>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </ScreenContainer>
  );
};

const BotaoDeFiltro: React.FC<{
  ativo: boolean;
  onClick: () => void;
  desabilitado?: boolean;
  titulo?: string;
  children: React.ReactNode;
}> = ({ ativo, onClick, desabilitado, titulo, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={desabilitado}
    title={titulo}
    aria-pressed={ativo}
    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
      ativo
        ? 'border-anil-800 bg-anil-800 font-medium text-white'
        : desabilitado
          ? 'cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400'
          : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
    }`}
  >
    {children}
  </button>
);

const DetalheDaEra: React.FC<{ era: MusicalEra }> = ({ era }) => (
  <Card variant="muted" padding="lg" className="space-y-2">
    <div className="flex flex-wrap items-baseline gap-2">
      <h3 className="font-serif text-base font-bold text-stone-900">{era.name}</h3>
      <span className="font-mono text-xs text-stone-500">{era.periodYears}</span>
    </div>
    <p className="text-xs leading-relaxed text-stone-700">{era.description}</p>

    {era.keyCharacteristics.length > 0 && (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {era.keyCharacteristics.map((c) => (
          <span
            key={c}
            className="rounded border border-stone-200 bg-white px-2 py-0.5 font-mono text-[10px] text-stone-600"
          >
            {c}
          </span>
        ))}
      </div>
    )}

    {era.famousSchools.length > 0 && (
      <p className="border-t border-stone-200 pt-2 text-xs text-stone-600">
        <span className="font-semibold">Escolas:</span> {era.famousSchools.join(' · ')}
      </p>
    )}
  </Card>
);
