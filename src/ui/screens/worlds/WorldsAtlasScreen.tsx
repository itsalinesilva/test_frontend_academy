import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { VisitorInvitation } from '../../components/visitor/VisitorInvitation';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { atlasRepository, AtlasFilter } from '../../../repositories/atlas.repository';
import { MusicalEra, AtlasWorkPlacement } from '../../../domain/gamification';
import { Region, Genre } from '../../../data/seed-atlas';
import { House, HouseStatus } from '../../../domain/house';
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
 * `docs/harness/75_ATLAS_TAXONOMY.md`.
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
  const { userId, carregando: sessaoCarregando } = useCurrentUser();

  const [eras, setEras] = useState<MusicalEra[] | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [works, setWorks] = useState<AtlasWorkPlacement[]>([]);
  const [totalInCollection, setTotalInCollection] = useState(0);

  const [eraId, setEraId] = useState<string>(TODOS);
  const [regionId, setRegionId] = useState<string>(TODOS);
  const [genreId, setGeneroId] = useState<string>(TODOS);
  const [houseId, setTriboId] = useState<string>(TODOS);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [e, r, g, t, total] = await Promise.all([
        atlasRepository.listarEras(),
        atlasRepository.listarRegioes(),
        atlasRepository.listarGeneros(),
        atlasRepository.listarTribos(),
        atlasRepository.countWorks(),
      ]);
      if (!vivo) return;
      setEras(e);
      setRegions(r);
      setGenres(g);
      setHouses(t);
      setTotalInCollection(total);
    })().catch(() => {
      if (vivo) setEras([]);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const filtro = useCallback((): AtlasFilter => {
    return {
      eraId: eraId === TODOS ? undefined : eraId,
      regionId: regionId === TODOS ? undefined : regionId,
      genreId: genreId === TODOS ? undefined : genreId,
      houseId: houseId === TODOS ? undefined : houseId,
    };
  }, [eraId, regionId, genreId, houseId]);

  useEffect(() => {
    atlasRepository
      .listarObras(filtro())
      .then(setWorks)
      .catch(() => setWorks([]));
  }, [filtro]);

  /**
   * As eras que a região selecionada alcança.
   *
   * É o cruzamento dos eixos acontecendo na interface: escolher "Brasil"
   * esconde a Antiguidade, porque não há repertório brasileiro nela — e
   * mostrar um recorte vazio seria oferecer um caminho que não leva a nada.
   */
  const activeRegion = regions.find((r) => r.id === regionId);
  const erasVisiveis = (eras ?? []).filter(
    (e) => !activeRegion || activeRegion.eraIds.includes(e.id)
  );

  return (
    <ScreenContainer
      id="worlds-atlas"
      title="Atlas"
      subtitle="O mapa: quando, onde e com quem a música foi feita."
      badgeLabel={`${(eras ?? []).length} eras · ${regions.length} regiões · ${houses.length} Casas`}
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
        {/* O Atlas e acervo, e por isso e publico. O convite explica o que ele
            vira depois de entrar — carimbos, passaporte, simulador. */}
        {!sessaoCarregando && !userId && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <VisitorInvitation
              space="Atlas"
              summary="O mapa de quando, onde e com quem a música foi feita — aberto a qualquer um."
              highlights={[
                { value: String((eras ?? []).length), label: 'eras' },
                { value: String(regions.length), label: 'regiões' },
                { value: String(houses.length), label: 'Casas' },
                { value: String(genres.length), label: 'gêneros' },
              ]}
              steps={[
                {
                  title: 'Percorra o mapa livremente',
                  description: 'Eras, regiões e gêneros não exigem conta.',
                },
                {
                  title: 'Entre para carimbar o passaporte',
                  description: 'Cada era, região e obra visitada vira um carimbo seu.',
                },
                {
                  title: 'Toque as obras no simulador',
                  description: 'A execução é medida, e a melhor marca fica registrada.',
                },
              ]}
              primaryLabel="Entrar e começar o passaporte"
              onPrimary={() => navigate('/auth/login')}
            />
          </div>
        )}

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
              ativo={regionId === TODOS}
              onClick={() => {
                setRegionId(TODOS);
                setEraId(TODOS);
              }}
            >
              Todas as regiões
            </BotaoDeFiltro>
            {regions.map((r) => (
              <BotaoDeFiltro
                key={r.id}
                ativo={regionId === r.id}
                onClick={() => {
                  setRegionId(r.id);
                  // a era escolhida pode não existir nesta região
                  if (!r.eraIds.includes(eraId)) setEraId(TODOS);
                }}
              >
                {r.name}
              </BotaoDeFiltro>
            ))}
          </div>

          {activeRegion && (
            <p className="text-xs leading-relaxed text-stone-600">{activeRegion.description}</p>
          )}
        </section>

        <section className="space-y-3" aria-labelledby="eixo-gente">
          <h2
            id="eixo-gente"
            className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"
          >
            <Users className="h-4 w-4 text-anil-800" aria-hidden="true" />
            Com quem — houses
          </h2>

          <p className="text-xs text-stone-600">
            A população nichada de cada lugar e de cada tempo. House é gente, e
            não lugar — quem tem coordenada no mapa é o mundo.
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tribo">
            <BotaoDeFiltro ativo={houseId === TODOS} onClick={() => setTriboId(TODOS)}>
              Todas as houses
            </BotaoDeFiltro>
            {houses.map((t) => {
              const fechada = t.status === HouseStatus.ANNOUNCED;
              return (
                <BotaoDeFiltro
                  key={t.id}
                  ativo={houseId === t.id}
                  desabilitado={fechada}
                  titulo={fechada ? 'Aguardando corpus pedagógico' : t.description}
                  onClick={() => setTriboId(t.id)}
                >
                  {t.name}
                  {t.status !== HouseStatus.OPEN && (
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
            <BotaoDeFiltro ativo={genreId === TODOS} onClick={() => setGeneroId(TODOS)}>
              Todos
            </BotaoDeFiltro>
            {genres.map((g) => (
              <BotaoDeFiltro
                key={g.id}
                ativo={genreId === g.id}
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
              {works.length} de {totalInCollection} no acervo
            </span>
          </div>

          {works.length === 0 ? (
            <EmptyState
              id="atlas-obras-vazio"
              icon={<Library className="h-8 w-8 stroke-1" aria-hidden="true" />}
              title={
                totalInCollection === 0
                  ? 'O acervo de obras ainda está vazio'
                  : 'Nenhuma obra responde a este recorte'
              }
              description={
                totalInCollection === 0
                  ? 'O mapa acima é a taxonomia que os cursos de História ensinam — eras, regiões e gêneros. Catalogar uma obra exige decidir edição, proveniência e domínio público, e isso ainda não foi feito.'
                  : 'Escolha outra era, região ou gênero para ver o que existe.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {works.map((obra) => (
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
