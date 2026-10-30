import React, { useEffect, useMemo, useState } from 'react';
import { Play, Square, PenLine, Dumbbell, User } from 'lucide-react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { acervoService } from '../../../services/application/acervo.service';
import {
  CanonicalComposer,
  CanonicalWork,
  DisponibilidadeNoConservatorio,
  textoDe,
} from '../../../domain/music-knowledge';
import { useTocarFaixa } from '../../hooks/useTocarFaixa';

/**
 * A FICHA DE UMA OBRA.
 *
 * O QUE ELA PRECISA RESPONDER
 * ---------------------------
 * O que é, de quem é, quando e onde — e, sobretudo, **o que se pode fazer com
 * ela aqui dentro**. Um catálogo que descreve e não deixa agir é bibliografia;
 * o que faz disto um conservatório é a obra virar estudo.
 *
 * AS AÇÕES SÓ APARECEM QUANDO SÃO REAIS
 * -------------------------------------
 * Tocar, levar ao editor e levar à prática dependem de haver **edição
 * renderizável**. Sem ela, os botões não aparecem — e a ficha diz por quê, com
 * o link oficial de onde a obra está.
 *
 * Um botão desabilitado com cara de disponível seria a mesma mentira das telas
 * que ofereciam ação e abriam um alerta do navegador.
 */

/**
 * O NOME DA FONTE COMO ELA SE CHAMA, e não a chave interna.
 *
 * `MUSICA_BRASILIS` na tela é nome técnico vazando — o pente fino tem um
 * verificador só para isso. Quem lê a ficha procura "Música Brasilis".
 */
const NOME_DA_FONTE: Partial<Record<string, string>> = {
  MUSICA_BRASILIS: 'Música Brasilis',
  IMSLP: 'IMSLP / Petrucci',
  MUTOPIA: 'Mutopia Project',
  WIKIDATA: 'Wikidata',
  COMMONS: 'Wikimedia Commons',
  INTERNET_ARCHIVE: 'Internet Archive',
  MUSICBRAINZ: 'MusicBrainz',
  OPEN_OPUS: 'Open Opus',
};

const formatarTempo = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * A licença obriga a creditar?
 *
 * Toda Creative Commons corrente traz `Attribution`. Domínio público e
 * transcrição própria não obrigam — e continuam creditados, porque saber quem
 * editorou é informação de catálogo antes de ser obrigação.
 */
function exigeAtribuicao(licenca?: string): boolean {
  return !!licenca && /attribution/i.test(licenca);
}

export const ObraScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const id = params.id;

  const [ficha, setFicha] = useState<{
    obra: CanonicalWork;
    compositor: CanonicalComposer | null;
    disponibilidade: DisponibilidadeNoConservatorio;
  } | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    if (!id) {
      setCarregando(false);
      return;
    }

    acervoService.fichaDaObra(id).then((f) => {
      if (vivo) {
        setFicha(f);
        setCarregando(false);
      }
    });

    return () => {
      vivo = false;
    };
  }, [id]);

  /**
   * A faixa que dá som a esta obra.
   *
   * A referência de partitura guarda o id da transcrição própria; é por ele
   * que a ficha encontra o que tocar. Sem faixa, não há como tocar — e o botão
   * não aparece, em vez de aparecer e não fazer nada.
   */
  const faixa = useMemo(() => (ficha ? acervoService.faixaDaObra(ficha.obra) : null), [ficha]);

  const { tocando, decorrido, alternar } = useTocarFaixa(faixa);

  const tocavel = ficha?.disponibilidade.modo === 'EXPERIENCIA_COMPLETA' && faixa !== null;

  return (
    <ScreenContainer
      id="acervo-obra"
      title={ficha ? (textoDe(ficha.obra.canonicalTitle) ?? 'Obra') : 'Obra'}
      subtitle={ficha?.compositor?.canonicalName}
      badgeLabel={tocavel ? 'Disponível para estudo' : 'Catalogada'}
      badgeVariant="neutral"
      secondaryActions={[{ label: 'Voltar ao acervo', onClick: () => navigate('/acervo') }]}
      state={carregando ? 'loading' : !ficha ? 'empty' : 'populated'}
      emptyProps={{
        title: 'Obra não encontrada',
        description: 'Não há no acervo nenhuma obra com esse identificador.',
        actionLabel: 'Ver o acervo',
        onAction: () => navigate('/acervo'),
      }}
    >
      {ficha && (
        <div className="space-y-6">
          {/*
            QUEM FEZ VEM PRIMEIRO.

            A ficha abria pelos campos da obra, e o compositor era uma linha
            dentro da tabela — a mesma altura de "compasso". Se a autoria é a
            matriz do catálogo, e é, o vínculo precisa ser a primeira coisa que
            se vê, e precisa ser caminho.
          */}
          {ficha.compositor && (
            <button
              type="button"
              onClick={() => navigate(`/acervo/compositor/${ficha.compositor!.id}`)}
              className="flex w-full items-center gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4 text-left transition-colors hover:border-anil-700"
            >
              {ficha.compositor.portraitUrl ? (
                <img
                  src={ficha.compositor.portraitUrl}
                  alt={`Retrato de ${ficha.compositor.canonicalName}`}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-stone-200 text-base font-semibold text-stone-600"
                >
                  {ficha.compositor.canonicalName
                    .split(' ')
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')}
                </span>
              )}

              <span className="min-w-0">
                <span className="block font-serif text-base font-bold text-stone-900">
                  {ficha.compositor.canonicalName}
                </span>
                <span className="block font-mono text-xs text-stone-500">
                  {[ficha.compositor.birthYear, ficha.compositor.deathYear]
                    .filter(Boolean)
                    .join(' – ')}
                  {ficha.compositor.birthPlace ? ` · ${ficha.compositor.birthPlace}` : ''}
                </span>
                {ficha.compositor.biography?.pt && (
                  <span className="mt-1 block text-xs leading-relaxed text-stone-700">
                    {ficha.compositor.biography.pt}
                  </span>
                )}
                <span className="mt-1 block text-xs font-medium text-anil-800 underline underline-offset-2">
                  Ver o compêndio completo
                </span>
              </span>
            </button>
          )}

          <section className="rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Ficha</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              {[
                /*
                  A ordem é a de um catálogo musical: quem escreveu, como se
                  identifica a peça, e só depois onde ela se situa. Tonalidade
                  entra no título por convenção e é o que distingue homônimos.
                */
                { t: 'Compositor', v: ficha.compositor?.canonicalName },
                { t: 'Número de catálogo', v: ficha.obra.catalogNumber },
                { t: 'Tonalidade', v: ficha.obra.key },
                { t: 'Compasso', v: ficha.obra.meter },
                { t: 'Andamento', v: ficha.obra.tempoBpm ? `${ficha.obra.tempoBpm} bpm` : undefined },
                { t: 'Instrumentação', v: ficha.obra.instrumentation.join(', ') },
                { t: 'Movimentos', v: ficha.obra.movements.join(', ') },
                { t: 'Gênero', v: ficha.obra.generoId },
                { t: 'Data', v: ficha.obra.date },
                { t: 'Era', v: ficha.obra.periodId },
                { t: 'Região', v: ficha.obra.regionId },
              ]
                /*
                  Campo sem valor não vira "—": some. Uma ficha cheia de
                  travessões sugere que faltou apurar; o que falta é a
                  informação, e ela aparece pela ausência da linha.
                */
                .filter((c) => c.v)
                .map((c) => (
                  <div key={c.t}>
                    <dt className="text-[11px] uppercase tracking-wide text-stone-500">{c.t}</dt>
                    <dd className="mt-0.5 text-stone-800">{c.v}</dd>
                  </div>
                ))}
            </dl>
            {/* AUD-19 — o id veio da mineração no MusicBrainz e não chegava à ficha. */}
            {ficha.obra.externalIds.musicbrainz && (
              <p className="mt-3 text-xs text-stone-600">
                Identificada no{' '}
                <a
                  href={`https://musicbrainz.org/work/${ficha.obra.externalIds.musicbrainz}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-anil-700 underline-offset-2 hover:underline"
                >
                  MusicBrainz
                </a>
                , com gravações e títulos alternativos.
              </p>
            )}
          </section>

          <section className="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              O que se pode fazer com ela
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              {ficha.disponibilidade.motivo}
            </p>

            {tocavel && faixa ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={alternar}
                  className="inline-flex items-center gap-1.5 rounded bg-anil-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-anil-700"
                >
                  {tocando ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {tocando ? 'Parar' : 'Tocar'}
                </button>

                <span className="font-mono text-[11px] text-stone-500">
                  {formatarTempo(decorrido)} / {formatarTempo(faixa.duracaoSegundos)}
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`/score?obra=${ficha.obra.id}`)}
                  className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700 hover:border-anil-700"
                >
                  <PenLine className="h-3.5 w-3.5" /> Abrir na partitura
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/practice?obra=${ficha.obra.id}`)}
                  className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700 hover:border-anil-700"
                >
                  <Dumbbell className="h-3.5 w-3.5" /> Levar à prática
                </button>
              </div>
            ) : (
              /*
                🔴 "CONSULTAR EM…" SAIU QUANDO A FICHA JÁ MOSTRA A EDIÇÃO.

                Ele aparecia sempre que havia link, e o bloco "Edição" logo
                abaixo mostrava o MESMO link com mais contexto — fonte, formato,
                licença, transcritor. Duas chamadas para o mesmo destino, e a de
                cima sem nada do que a de baixo diz.

                Agora ele só existe quando **não há bloco de edição**: é o
                único caminho, e aí precisa estar visível. Havendo edição
                catalogada, o caminho é o bloco — que é onde a informação
                também está.
              */
              ficha.disponibilidade.linkOficial &&
              ficha.obra.scoreRefs.length === 0 && (
                <a
                  href={ficha.disponibilidade.linkOficial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-anil-800 underline underline-offset-2"
                >
                  Consultar em {ficha.disponibilidade.linkOficial.rotulo}
                </a>
              )
            )}
          </section>

          {ficha.obra.scoreRefs.length > 0 && (
            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Edição
              </h2>
              {/*
                O CRÉDITO VEM PRIMEIRO, E POR EXTENSO.

                A obra estar em domínio público não torna livre o ARQUIVO: quem
                transcreveu fez trabalho, e seiscentas e vinte e uma destas
                edições estão sob licença com cláusula de atribuição.

                Cláusula de atribuição é condição, e não pedido: exibir o arquivo
                sem nomear quem o produziu é exibi-lo sem licença nenhuma. Por
                isso o nome não fica no fim de uma linha técnica — ele abre o
                bloco, e o formato fica para depois.
              */}
              <ul className="mt-2 space-y-2.5 text-xs text-stone-600">
                {ficha.obra.scoreRefs.map((r) =>
                  r.aponta === 'PAGINA' ? (
                    /*
                      PÁGINA DA OBRA NA FONTE — e não um arquivo.

                      Aqui o link reúne várias edições, cada uma com seu editor
                      e sua licença, declarados lá. Dizer "transcrição sem
                      autoria declarada" e "licença não declarada" sobre uma
                      página dessas seria acusar a fonte de omitir o que ela
                      publica, e mandar a pessoa embora do lugar onde a resposta
                      está.
                    */
                    <li key={r.sourceRef}>
                      <p className="font-medium text-stone-800">
                        Página da obra em {NOME_DA_FONTE[r.source] ?? r.source}
                      </p>
                      <p>
                        As edições disponíveis, com o editor e a licença de cada uma, estão
                        na fonte. O Conservatório registra onde a obra está; o download
                        acontece lá.
                      </p>
                      <a
                        href={r.sourceRef}
                        target="_blank"
                        rel="noreferrer"
                        className="text-anil-800 underline underline-offset-2"
                      >
                        Abrir a página da obra
                      </a>
                    </li>
                  ) : (
                  <li key={r.sourceRef}>
                    {r.editors && r.editors.length > 0 ? (
                      <p className="font-medium text-stone-800">
                        Transcrição de {r.editors.join(', ')}
                      </p>
                    ) : (
                      <p className="font-medium text-stone-800">
                        Transcrição sem autoria declarada na fonte
                      </p>
                    )}
                    <p>
                      {r.fileLicense ?? 'Licença do arquivo não declarada'} ·{' '}
                      {r.format.toUpperCase()}
                    </p>
                    {exigeAtribuicao(r.fileLicense) && (
                      <p className="text-stone-500">
                        Esta licença exige que o crédito acompanhe o arquivo onde quer
                        que ele vá.
                      </p>
                    )}
                    <a
                      href={r.sourceRef}
                      target="_blank"
                      rel="noreferrer"
                      className="text-anil-800 underline underline-offset-2"
                    >
                      Ver o arquivo na fonte
                    </a>
                  </li>
                  )
                )}
              </ul>
            </section>
          )}

          {ficha.compositor && (
            <button
              type="button"
              onClick={() => navigate(`/acervo/compositor/${ficha.compositor!.id}`)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-anil-800 underline underline-offset-2"
            >
              <User className="h-3.5 w-3.5" /> Ver a ficha de {ficha.compositor.canonicalName}
            </button>
          )}
        </div>
      )}
    </ScreenContainer>
  );
};
