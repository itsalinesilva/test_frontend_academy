import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { VisitorInvitation } from '../../components/visitor/VisitorInvitation';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { EmptyState } from '../../components/feedback/EmptyState';
import { atlasRepository } from '../../../repositories/atlas.repository';
import {
  atlasService,
  CasaNoMapa,
  VistaDoMapa,
} from '../../../services/application/atlas.service';
import { AtlasMarker } from '../../../domain/atlas-map';
import { MusicalEra } from '../../../domain/gamification';
import {
  Network,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Users,
  Library,
  MapPin,
} from 'lucide-react';

/**
 * O ATLAS É UM MAPA.
 *
 * 🔴 AS DUAS TELAS LIAM ACERVOS DIFERENTES
 * ----------------------------------------
 * O Atlas contava **dezessete obras**; o Acervo contava **vinte e quatro mil
 * novecentas e cinquenta e sete**. Não era defasagem: eram duas fontes. Esta
 * tela lia `atlasRepository`, projeção do repertório próprio, e a biblioteca
 * lia o catálogo canônico.
 *
 * Duas verdades sobre o mesmo acervo é pior que uma verdade incompleta: as duas
 * telas estariam "certas", e quem visse o mapa concluiria que o Conservatório
 * tem dezessete obras.
 *
 * Agora as duas leem o mesmo catálogo. `atlasService` é a **vista de mapa**
 * dele, e clicar num marcador abre a ficha na biblioteca **pelo mesmo
 * identificador canônico**.
 *
 * O QUE É MAPA, E O QUE É BIBLIOTECA
 * ----------------------------------
 * Aqui: marcadores, indicadores, métricas. Informação simplificada e útil,
 * navegável no tempo e no espaço — você vê *onde* e *quando* as coisas estão,
 * e **quanto** há em cada ponto.
 *
 * Lá: ficha completa, busca, filtro fino, leitura.
 *
 * Não são a mesma experiência, e são a mesma verdade.
 *
 * O MAPA AGREGA E DEPOIS DETALHA
 * ------------------------------
 * Sem foco, mostra movimentos e compositores, cada um com a contagem do que
 * reúne — de quatro a noventa e cinco marcadores por era. Escolher **o que**
 * olhar abre as obras. Emitir toda obra como marcador dava nove mil duzentos e
 * quarenta e cinco pontos no Romantismo, e um mapa com nove mil pontos é uma
 * lista desenhada sobre uma imagem.
 */

const TODOS = 'todos';

/**
 * Quantos marcadores a lista mostra por vez.
 *
 * A versão anterior cortava em cento e vinte **em silêncio**. Hoje a maior era
 * tem noventa e cinco, então o corte nunca dispara — e quando o catálogo
 * crescer, marcadores sumiriam sem que a tela dissesse.
 *
 * Corte que não se anuncia é dado perdido com aparência de lista completa.
 */
const PASSO_DA_LISTA = 60;

/** O selo de cada tipo de marcador, para o mapa se ler de relance. */
const SELO: Record<AtlasMarker['kind'], { rotulo: string; classe: string }> = {
  MOVIMENTO: { rotulo: 'Movimento', classe: 'border-ouro-300 bg-ouro-50 text-ouro-900' },
  COMPOSITOR: { rotulo: 'Pessoa', classe: 'border-anil-200 bg-anil-50 text-anil-900' },
  OBRA: { rotulo: 'Obra', classe: 'border-stone-300 bg-white text-stone-700' },
};

/**
 * Um marcador do mapa.
 *
 * Ele é um BOTÃO, e não um cartão decorativo: todo marcador leva à ficha na
 * biblioteca. Um ponto no mapa que não vai a lugar nenhum ensina que o mapa é
 * ilustração.
 */
const Marcador: React.FC<{ marcador: AtlasMarker; onAbrir: () => void }> = ({
  marcador,
  onAbrir,
}) => {
  const selo = SELO[marcador.kind];
  const pontuado = marcador.disponibilidade.modo === 'SOMENTE_CATALOGO';

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="flex w-full flex-col gap-1 rounded-lg border border-stone-200 bg-white p-3 text-left transition-colors hover:border-anil-700"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-serif text-sm font-bold leading-tight text-stone-900">
          {marcador.titulo}
        </span>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${selo.classe}`}
        >
          {selo.rotulo}
        </span>
      </div>

      {marcador.subtitulo && (
        <span className="font-mono text-[11px] text-stone-500">{marcador.subtitulo}</span>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {/*
          A CONTAGEM É O QUE FAZ O MAPA INFORMAR SEM OBRIGAR A LER.
          "Bach" e "Bach · 838 obras" pedem decisões diferentes de quem explora.
        */}
        {marcador.contagem !== null && (
          <span className="font-mono text-[11px] text-stone-600">
            {marcador.contagem.toLocaleString('pt-BR')}{' '}
            {marcador.kind === 'MOVIMENTO' ? 'fundadores' : 'obras'}
          </span>
        )}
        {pontuado && (
          <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
            pontuado
          </span>
        )}
      </div>
    </button>
  );
};

/** Um indicador da vista — número grande, rótulo curto. */
const Indicador: React.FC<{ valor: number; rotulo: string }> = ({ valor, rotulo }) => (
  <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
    <p className="font-mono text-lg font-bold leading-none text-stone-900">
      {valor.toLocaleString('pt-BR')}
    </p>
    <p className="pt-1 text-[11px] leading-tight text-stone-600">{rotulo}</p>
  </div>
);

export const WorldsAtlasScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId, carregando: sessaoCarregando } = useCurrentUser();

  const [vista, setVista] = useState<VistaDoMapa | null>(null);
  const [eraId, setEraId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string>(TODOS);
  const [foco, setFoco] = useState<AtlasMarker | null>(null);

  const [detalhesDaEra, setDetalhesDaEra] = useState<MusicalEra[]>([]);
  const [casas, setCasas] = useState<CasaNoMapa[]>([]);
  const [houseId, setCasaId] = useState<string | null>(null);
  /** Quantos marcadores a lista mostra por vez, e o teto fica visível. */
  const [mostrando, setMostrando] = useState(PASSO_DA_LISTA);

  /** O mapa abre na primeira era que tem algo — e não numa era vazia. */
  useEffect(() => {
    let vivo = true;
    atlasService.eraInicial().then((id) => vivo && setEraId(id));
    atlasRepository.listarEras().then((e) => vivo && setDetalhesDaEra(e));
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!eraId) return;
    let vivo = true;

    atlasService
      .vista(
        {
          eraId,
          regionId: regionId === TODOS ? undefined : regionId,
          composerId: foco?.kind === 'COMPOSITOR' ? foco.id : undefined,
          movimentoId: foco?.kind === 'MOVIMENTO' ? foco.id : undefined,
        },
        houseId ?? undefined
      )
      .then((v) => {
        if (!vivo) return;
        setVista(v);
        /** Trocar de recorte volta a lista ao início: rolar o antigo confunde. */
        setMostrando(PASSO_DA_LISTA);
      });

    return () => {
      vivo = false;
    };
  }, [eraId, regionId, foco, houseId]);

  /** As Casas da era, com a contagem do que cada uma recorta AQUI. */
  useEffect(() => {
    if (!eraId) return;
    let vivo = true;
    atlasService.casasDaEra(eraId).then((c) => vivo && setCasas(c));
    return () => {
      vivo = false;
    };
  }, [eraId]);

  /**
   * Andar no tempo LIMPA o foco e a região.
   *
   * O compositor focado pode não existir na era nova, e a região pode não ter
   * presença nela. Um recorte que aponta para nada devolveria mapa vazio sem
   * dizer por quê — e o mapa pareceria quebrado.
   */
  const andarNoTempo = (id: string) => {
    setEraId(id);
    setRegionId(TODOS);
    setFoco(null);
    setCasaId(null);
  };

  const era = detalhesDaEra.find((e) => e.id === eraId);
  const regiaoAtiva = vista?.regioes.find((r) => r.id === regionId);

  return (
    <ScreenContainer
      id="worlds-atlas"
      title="Atlas"
      subtitle="O mapa: quando, onde e com quem a música foi feita."
      badgeLabel={
        vista ? `${vista.indicadores.total.toLocaleString('pt-BR')} marcadores nesta vista` : 'Mapa'
      }
      badgeVariant="neutral"
      primaryAction={{
        label: 'Ver o grafo de influências',
        icon: Network,
        onClick: () => navigate('/worlds/graph'),
      }}
      secondaryActions={[
        { label: 'Abrir a biblioteca', onClick: () => navigate('/acervo') },
      ]}
      state={vista === null ? 'loading' : 'populated'}
      loadingMessage="Abrindo o mapa…"
    >
      {vista && (
        <div className="space-y-7">
          {!sessaoCarregando && !userId && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <VisitorInvitation
                space="Atlas"
                summary="O mapa de quando, onde e com quem a música foi feita — aberto a qualquer um."
                highlights={[
                  { value: String(vista.eras.length), label: 'eras' },
                  { value: String(vista.regioes.length), label: 'regiões nesta era' },
                  { value: String(casas.length), label: 'Casas' },
                ]}
                primaryLabel="Entrar no Conservatório"
                onPrimary={() => navigate('/auth/login')}
              />
            </div>
          )}

          {/* ------------------------------------------------ o eixo do tempo */}
          <section className="space-y-3" aria-labelledby="eixo-tempo">
            <h2 id="eixo-tempo" className="sr-only">
              Linha do tempo
            </h2>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!vista.eraAnterior}
                onClick={() => vista.eraAnterior && andarNoTempo(vista.eraAnterior.id)}
                aria-label={
                  vista.eraAnterior ? `Voltar para ${vista.eraAnterior.name}` : 'Não há era anterior'
                }
                className="shrink-0 rounded-full border border-stone-300 bg-white p-2 text-stone-700 transition-colors hover:border-anil-700 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <ol className="flex flex-1 flex-wrap justify-center gap-1.5" aria-label="Eras">
                {vista.eras.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => andarNoTempo(e.id)}
                      aria-current={e.id === eraId ? 'true' : undefined}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        e.id === eraId
                          ? 'border-anil-800 bg-anil-800 text-white'
                          : 'border-stone-300 bg-white text-stone-600 hover:border-anil-700'
                      }`}
                    >
                      {e.name}
                    </button>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                disabled={!vista.eraSeguinte}
                onClick={() => vista.eraSeguinte && andarNoTempo(vista.eraSeguinte.id)}
                aria-label={
                  vista.eraSeguinte ? `Avançar para ${vista.eraSeguinte.name}` : 'Não há era seguinte'
                }
                className="shrink-0 rounded-full border border-stone-300 bg-white p-2 text-stone-700 transition-colors hover:border-anil-700 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {era && (
              <Card variant="muted" padding="lg" className="space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-serif text-base font-bold text-stone-900">{era.name}</h3>
                  <span className="font-mono text-xs text-stone-500">{era.periodYears}</span>
                </div>
                <p className="text-xs leading-relaxed text-stone-700">{era.description}</p>
              </Card>
            )}
          </section>

          {/* ------------------------------------------------- os indicadores */}
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Indicadores da vista">
            <Indicador valor={vista.indicadores.total} rotulo="marcadores aqui" />
            <Indicador valor={vista.regioes.length} rotulo="regiões nesta era" />
            <Indicador valor={vista.indicadores.comExperiencia} rotulo="com experiência aqui" />
            {/*
              "Só pontuados" não é defeito a esconder: são os marcadores que o
              acervo registra e não pode oferecer, quase sempre por prazo de
              direito autoral. O mapa mostra que eles existem.
            */}
            <Indicador valor={vista.indicadores.apenasPontuados} rotulo="pontuados, sem experiência" />
          </section>

          {/* ----------------------------------------------------- as regiões */}
          <section className="space-y-2" aria-labelledby="eixo-lugar">
            <h2
              id="eixo-lugar"
              className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"
            >
              <Globe2 className="h-4 w-4 text-anil-800" aria-hidden="true" />
              Onde
            </h2>

            {/*
              AS REGIÕES REPOVOAM AO ANDAR NO TEMPO.
              A Escandinávia não existe no mapa do Renascimento e aparece no do
              Romantismo — é isso que faz o Atlas ser mapa, e não lista.
            */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por região">
              <button
                type="button"
                onClick={() => {
                  setRegionId(TODOS);
                  setFoco(null);
                }}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  regionId === TODOS
                    ? 'border-anil-800 bg-anil-800 text-white'
                    : 'border-stone-300 bg-white text-stone-600 hover:border-anil-700'
                }`}
              >
                Toda a era
              </button>
              {vista.regioes.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRegionId(r.id);
                    setFoco(null);
                  }}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    regionId === r.id
                      ? 'border-anil-800 bg-anil-800 text-white'
                      : 'border-stone-300 bg-white text-stone-600 hover:border-anil-700'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </section>

          {/* --------------------------------------------------- os marcadores */}
          <section className="space-y-3" aria-labelledby="marcadores">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="marcadores"
                className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"
              >
                <MapPin className="h-4 w-4 text-anil-800" aria-hidden="true" />
                {foco ? foco.titulo : regiaoAtiva ? regiaoAtiva.name : 'Nesta era'}
              </h2>

              {foco && (
                <button
                  type="button"
                  onClick={() => setFoco(null)}
                  className="text-xs font-medium text-anil-800 underline underline-offset-2"
                >
                  Voltar à vista da era
                </button>
              )}
            </div>

            {!foco && vista.marcadores.length > 0 && (
              <p className="text-xs leading-relaxed text-stone-600">
                O mapa agrega: cada pessoa traz a contagem do compêndio dela. Escolha um marcador
                para ver as obras.
              </p>
            )}

            {/*
              O TETO DE PLOTAGEM, DITO EM VOZ ALTA.

              A era Moderna alcança quase trezentas pessoas desde que o corpus
              brasileiro entrou, e um mapa com trezentos pontos é uma lista
              desenhada sobre uma imagem. O teto existe por isso.

              O que ele NÃO pode ser é corte em silêncio: sem este aviso, quem
              olhasse a era concluiria que ali existem cento e cinquenta
              pessoas, e o mapa estaria mentindo sobre o tamanho do acervo —
              que é o defeito original deste projeto, em escala menor.
            */}
            {vista.naoPlotados > 0 && (
              <p className="rounded-lg border border-ouro-200 bg-ouro-50 px-3 py-2 text-xs leading-relaxed text-stone-700">
                Esta vista alcança <strong>{vista.naoPlotados.toLocaleString('pt-BR')}</strong>{' '}
                pessoas além das plotadas, e o mapa mostra primeiro quem tem o compêndio maior.
                Escolha uma região, um movimento ou um gênero para chegar às demais — elas estão
                todas no acervo.
              </p>
            )}

            {vista.marcadores.length === 0 ? (
              <EmptyState
                icon={<Library className="h-8 w-8 stroke-1" aria-hidden="true" />}
                title="Nenhum marcador nesta posição"
                description="O acervo não registra nada aqui. Ande no tempo ou volte para a era inteira."
                actionLabel="Ver toda a era"
                onAction={() => setRegionId(TODOS)}
              />
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {vista.marcadores.slice(0, mostrando).map((m) => (
                  <li key={`${m.kind}-${m.id}`}>
                    <Marcador
                      marcador={m}
                      onAbrir={() => {
                        /*
                          Pessoa e movimento FOCAM o mapa — é o zoom. Obra sai
                          do mapa e vai para a ficha, porque ali a pergunta
                          deixa de ser "onde isto está" e passa a ser "o que é
                          isto", que é trabalho da biblioteca.
                        */
                        if (m.kind === 'OBRA') navigate(atlasService.rotaDoMarcador(m));
                        else setFoco(m);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}

            {/*
              O CORTE DA LISTA SE ANUNCIA.

              A versão anterior cortava em cento e vinte em silêncio. Hoje a
              maior era tem noventa e cinco, então nunca disparava — e quando o
              catálogo crescesse, marcadores sumiriam sem que a tela dissesse.
            */}
            {vista.marcadores.length > mostrando && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="font-mono text-xs text-stone-500">
                  mostrando {mostrando} de {vista.marcadores.length.toLocaleString('pt-BR')}
                </span>
                <button
                  type="button"
                  onClick={() => setMostrando((n) => n + PASSO_DA_LISTA)}
                  className="text-xs font-medium text-anil-800 underline underline-offset-2"
                >
                  Mostrar mais
                </button>
              </div>
            )}

            {foco && (
              <button
                type="button"
                onClick={() => navigate(atlasService.rotaDoMarcador(foco))}
                className="text-xs font-medium text-anil-800 underline underline-offset-2"
              >
                Abrir a ficha completa de {foco.titulo} na biblioteca
              </button>
            )}
          </section>

          {/* -------------------------------------------------------- as Casas */}
          <section className="space-y-2" aria-labelledby="eixo-gente">
            <h2
              id="eixo-gente"
              className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"
            >
              <Users className="h-4 w-4 text-anil-800" aria-hidden="true" />
              Com quem — Casas
            </h2>

            <p className="text-xs text-stone-600">
              A população nichada de cada lugar e de cada tempo. Casa é gente, e não lugar — quem tem
              coordenada no mapa é o mundo.
            </p>

            {/*
              A CASA RECORTA O MAPA — e antes não recortava nada.

              Era um grupo de botões que mudava um estado que ninguém lia:
              controle que não faz nada, defeito que este projeto já removeu em
              outros lugares. Agora escolher "Violinistas" mostra quem tocava
              violino naquela era.

              A Casa que NÃO recorta continua visível e desabilitada, com o
              motivo no título — somé-la esconderia que o espaço existe.
            */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por Casa">
              <button
                type="button"
                onClick={() => setCasaId(null)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  houseId === null
                    ? 'border-anil-800 bg-anil-800 text-white'
                    : 'border-stone-300 bg-white text-stone-600 hover:border-anil-700'
                }`}
              >
                Todas
              </button>

              {casas.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={!c.recorta}
                  title={c.motivo}
                  onClick={() => setCasaId(c.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40 ${
                    houseId === c.id
                      ? 'border-anil-800 bg-anil-800 text-white'
                      : 'border-stone-300 bg-white text-stone-600 hover:border-anil-700'
                  }`}
                >
                  {c.nome}
                  {c.recorta && (
                    <span className="ml-1.5 font-mono text-[10px] opacity-70">{c.quantos}</span>
                  )}
                </button>
              ))}
            </div>

            {houseId && (
              <p className="text-xs text-stone-600">
                Mostrando só quem esta Casa reúne. O recorte é de instrumento praticado, e não
                do meio para que a pessoa escreveu — são eixos diferentes.
              </p>
            )}
          </section>
        </div>
      )}
    </ScreenContainer>
  );
};
