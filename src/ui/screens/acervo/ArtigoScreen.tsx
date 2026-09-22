import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { editorialService } from '../../../services/application/editorial.service';
import { acervoService } from '../../../services/application/acervo.service';
import { COLETANEAS_BRASILEIRAS } from '../../../data/seed-collections';
import { estadoDaColetanea, pecasCasadas } from '../../../domain/collection';
import { ArtigoDoConservatorio } from '../../../domain/article';
import { CanonicalComposer, CanonicalWork } from '../../../domain/music-knowledge';
import { textoDe } from '../../../domain/music-knowledge';

/**
 * A LEITURA DE UM ARTIGO.
 *
 * 🔴 O QUE FALTAVA
 * ----------------
 * A vitrine listava os artigos com resumo, assinatura e "quatro obras
 * citadas" — e **abrir não levava a lugar nenhum**. O texto existia no
 * domínio, testado, seção por seção, e ninguém conseguia ler.
 *
 * Pior no que importa: o artigo diz que percorre obras do acervo, e essa era
 * a única coisa que a tela não deixava conferir.
 *
 * O QUE DISTINGUE ESTE ARTIGO DE UM TEXTO QUALQUER
 * ------------------------------------------------
 * Cada obra citada traz o **motivo** de estar ali. É a regra do domínio —
 * `citacoesSemMotivo()` existe para recusar quem não traz —, e é o que separa
 * curadoria de lista. Aqui o motivo aparece junto da obra, e a obra leva à
 * ficha dela.
 */
/**
 * Uma linha em branco separa parágrafos.
 *
 * Construída em vez de escrita: uma barra-ene num literal de regex escrito por
 * script vira quebra de linha real e parte o arquivo — aconteceu duas vezes
 * neste repositório, e nas duas o código compilou sem fazer nada.
 */
const SEPARADOR_DE_PARAGRAFO = new RegExp(String.fromCharCode(10) + '\\s*' + String.fromCharCode(10));

export const ArtigoScreen: React.FC = () => {
  const { navigate, params } = useRouter();
  const id = params.id;

  const [artigo, setArtigo] = useState<ArtigoDoConservatorio | null>(null);
  const [obras, setObras] = useState<Map<string, CanonicalWork>>(new Map());
  /**
   * As PESSOAS citadas, pelo mesmo motivo das obras.
   *
   * Um artigo que nomeia Chiquinha Gonzaga no texto e não a liga obriga quem
   * lê a sair dali e procurar de novo, com o nome na memória. Referência que
   * não leva a lugar nenhum é citação de papel.
   */
  const [pessoas, setPessoas] = useState<Map<string, CanonicalComposer>>(new Map());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;

    /**
     * 🔴 A CAMADA EDITORIAL ENTRA NA LEITURA — e aqui ela é obrigatória.
     *
     * Esta é a tela que mostra o artigo inteiro. Ler o seed cru faria a
     * correção do admin existir no armazenamento e não no texto, que é o pior
     * dos dois mundos: gravada, contada como pendente, e sem efeito.
     *
     * É também por aqui que o artigo ESCRITO pela curadoria abre — ele não
     * está no seed, e sem a camada a rota levaria a "não encontrado".
     */
    editorialService.artigosComEdicoes(acervoService.artigos()).then((todos) => {
      if (!vivo) return;

      const achado = todos.find((a) => a.id === id) ?? null;
      setArtigo(achado);

      if (!achado) {
        setCarregando(false);
        return;
      }

      carregarCitacoes(achado);
    });

    return () => {
      vivo = false;
    };

    /**
     * As citações, buscadas depois que o artigo é conhecido.
     *
     * Separado numa função em vez de aninhado: o efeito já tinha dois níveis de
     * `then`, e um terceiro tornaria ilegível qual limpeza pertence a qual
     * carga.
     */
    function carregarCitacoes(achado: ArtigoDoConservatorio) {

    /**
     * As obras citadas, buscadas uma a uma.
     *
     * Uma citação pode apontar para obra que saiu do acervo — e quando isso
     * acontece a tela **diz**, em vez de esconder a linha. Citação que some
     * sem aviso faz o artigo mentir sobre o próprio percurso.
     */
    Promise.all([
      /**
       * Uma chamada para as vinte e duas obras, e não vinte e duas chamadas.
       *
       * Cada `fichaDaObra` percorre o catálogo inteiro atrás de um
       * identificador; em laço, isso dava setecentas mil comparações para
       * montar uma lista de vinte e duas linhas.
       */
      acervoService.obrasPorIds(achado.obras.map((o) => o.obraId)),
      acervoService.compositores(),
    ]).then(([mapa, todosOsCompositores]) => {
      if (!vivo) return;

      setObras(mapa);

      const citadas = new Set(achado.pessoas.map((x) => x.pessoaId));
      setPessoas(new Map(todosOsCompositores.filter((c) => citadas.has(c.id)).map((c) => [c.id, c])));

      setCarregando(false);
    });
    }
  }, [id]);

  return (
    <ScreenContainer
      id="artigo"
      title={artigo?.titulo ?? 'Artigo'}
      subtitle={artigo?.subtitulo}
      badgeLabel={
        artigo?.tipo === 'AUDITORIA'
          ? 'Auditoria'
          : artigo?.tipo === 'PERCURSO'
            ? 'Percurso de estudo'
            : 'Ensaio'
      }
      badgeVariant="neutral"
      secondaryActions={[{ label: 'Voltar à biblioteca', onClick: () => navigate('/acervo') }]}
      state={carregando ? 'loading' : artigo ? 'populated' : 'empty'}
      loadingMessage="Abrindo o artigo…"
      emptyProps={{
        title: 'Artigo não encontrado',
        description: 'Não há na biblioteca nenhum artigo com esse identificador.',
        actionLabel: 'Ver a biblioteca',
        onAction: () => navigate('/acervo'),
      }}
    >
      {artigo && (
        <article className="mx-auto max-w-3xl space-y-8">
          {/* --------------------------------------------------- a assinatura */}
          <header className="border-b border-stone-200 pb-4">
            <p className="font-mono text-xs text-stone-500">
              {artigo.autoria} · {artigo.instituicao} ·{' '}
              {new Date(artigo.publicadoEm).toLocaleDateString('pt-BR')}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-700">{artigo.resumo}</p>

            {artigo.etiquetas.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {artigo.etiquetas.map((e) => (
                  <li
                    key={e}
                    className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-600"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {/* ------------------------------------------------------- o texto */}
          {[...artigo.secoes]
            .sort((a, b) => a.ordem - b.ordem)
            .map((secao) => (
              <section key={secao.id} className="space-y-3">
                <h2 className="font-serif text-lg font-bold text-stone-900">{secao.titulo}</h2>
                {/*
                  O texto vem em parágrafos separados por linha em branco.
                  Quebrar assim preserva o ritmo de leitura sem interpretar
                  marcação — e não injeta HTML de lugar nenhum.
                */}
                {secao.markdown
                  .split(SEPARADOR_DE_PARAGRAFO)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, j) => (
                    <p key={j} className="text-sm leading-relaxed text-stone-700">
                      {p}
                    </p>
                  ))}
              </section>
            ))}

          {/* ------------------------------------------- as obras percorridas */}
          <section className="space-y-3 border-t border-stone-200 pt-6">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              As obras que este artigo percorre
            </h2>
            <p className="text-xs leading-relaxed text-stone-600">
              Cada uma traz o motivo de estar aqui. É o que separa curadoria de lista — e o domínio
              recusa citação sem motivo.
            </p>

            <ol className="space-y-3">
              {artigo.obras.map((citada, i) => {
                const obra = obras.get(citada.obraId);

                return (
                  <li
                    key={citada.obraId}
                    className="rounded-lg border border-stone-200 bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-anil-800 font-mono text-[11px] font-bold text-white">
                        {i + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        {obra ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/acervo/obra/${obra.id}`)}
                            className="text-left text-sm font-semibold text-anil-800 underline underline-offset-2 hover:text-anil-700"
                          >
                            {textoDe(obra.canonicalTitle) ?? obra.id}
                          </button>
                        ) : (
                          /*
                            A OBRA CITADA SUMIU DO ACERVO, E A TELA DIZ.

                            Esconder a linha faria o artigo afirmar um percurso
                            de quatro obras e mostrar três, sem que ninguém
                            notasse a diferença.
                          */
                          <p className="text-sm font-semibold text-stone-700">
                            {citada.obraId}
                            <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-normal text-stone-600">
                              fora do acervo
                            </span>
                          </p>
                        )}

                        {obra?.catalogNumber && (
                          <p className="mt-0.5 font-mono text-[11px] text-stone-500">
                            {obra.catalogNumber}
                          </p>
                        )}

                        <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                          {citada.motivo}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* ---------------------------------------- as pessoas percorridas */}
          {artigo.pessoas.length > 0 && (
            <section className="space-y-3 border-t border-stone-200 pt-6">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                As pessoas que este artigo percorre
              </h2>
              <p className="text-xs leading-relaxed text-stone-600">
                Cada uma com o motivo de estar aqui, e com o caminho para a ficha. Nem toda pessoa
                citada compôs: quem editou, compilou ou coletou entra com o papel dito.
              </p>

              <ul className="grid gap-2 sm:grid-cols-2">
                {artigo.pessoas.map((citada) => {
                  const pessoa = pessoas.get(citada.pessoaId);

                  return (
                    <li
                      key={citada.pessoaId}
                      className="rounded-lg border border-stone-200 bg-white p-3"
                    >
                      {pessoa ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/acervo/compositor/${pessoa.id}`)}
                          className="text-left text-sm font-semibold text-anil-800 underline underline-offset-2 hover:text-anil-700"
                        >
                          {pessoa.canonicalName}
                        </button>
                      ) : (
                        <p className="text-sm font-semibold text-stone-700">
                          {citada.pessoaId}
                          <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-normal text-stone-600">
                            fora do acervo
                          </span>
                        </p>
                      )}

                      <p className="mt-0.5 font-mono text-[11px] text-stone-500">
                        {[
                          citada.papel === 'EDITOR'
                            ? 'editor'
                            : citada.papel === 'COMPILADOR'
                              ? 'compilador'
                              : citada.papel === 'INTERPRETE'
                                ? 'intérprete'
                                : 'compositor',
                          pessoa?.birthYear || pessoa?.deathYear
                            ? `${pessoa?.birthYear ?? '?'} – ${pessoa?.deathYear ?? '?'}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>

                      <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                        {citada.motivo}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ------------------------------------- as coletâneas percorridas */}
          {artigo.coletaneas.length > 0 && (
            <section className="space-y-3 border-t border-stone-200 pt-6">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                As coletâneas que este artigo percorre
              </h2>
              <p className="text-xs leading-relaxed text-stone-600">
                Volumes publicados, com organizador e formação — e não listas de recomendação. As
                que estão abertas mostram o índice na ordem do livro.
              </p>

              <ul className="space-y-2">
                {artigo.coletaneas.map((citada) => {
                  const col = COLETANEAS_BRASILEIRAS.find((c) => c.id === citada.coletaneaId);
                  if (!col) {
                    return (
                      <li
                        key={citada.coletaneaId}
                        className="rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-700"
                      >
                        {citada.coletaneaId}
                        <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
                          fora do acervo
                        </span>
                      </li>
                    );
                  }

                  const estado = estadoDaColetanea(col);

                  return (
                    <li
                      key={col.id}
                      className="rounded-lg border border-stone-200 bg-white p-3"
                    >
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h3 className="text-sm font-semibold text-stone-900">{col.titulo}</h3>
                        {/*
                          🔴 O ESTADO É DITO, e não deduzido do vazio.

                          Uma coletânea sem peças listadas não é uma coletânea
                          vazia: é uma que ninguém abriu ainda. As duas desenham
                          igual, e confundi-las declara ausência onde há
                          trabalho por fazer.
                        */}
                        <span className="rounded border border-stone-300 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
                          {estado === 'INTEIRA'
                            ? `${col.pecas.length} peças, todas catalogadas`
                            : estado === 'PARCIAL'
                              ? `${pecasCasadas(col)} de ${col.pecas.length} catalogadas`
                              : 'índice ainda não aberto'}
                        </span>
                      </div>

                      <p className="mt-0.5 font-mono text-[11px] text-stone-500">
                        {[col.organizador && `org. ${col.organizador}`, col.ano, col.formacao]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>

                      <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
                        {citada.motivo}
                      </p>

                      {col.pecas.length > 0 && (
                        <ol className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-600">
                          {col.pecas.map((peca) => (
                            <li key={peca.numero}>
                              <span className="font-mono text-stone-400">{peca.numero}.</span>{' '}
                              {peca.obraId ? (
                                <button
                                  type="button"
                                  onClick={() => navigate(`/acervo/obra/${peca.obraId}`)}
                                  className="underline underline-offset-2 hover:text-anil-800"
                                >
                                  {peca.titulo}
                                </button>
                              ) : (
                                peca.titulo
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/*
            A RESSALVA DE AUTORIA.

            O artigo usa o que as fontes trazem como insumo e conclui por conta
            própria. Dizer isso no fim evita que a leitura o tome por
            catalogação de terceiro — e evita o inverso, que seria pior.
          */}
          <footer className="border-t border-stone-200 pt-4">
            <p className="text-xs leading-relaxed text-stone-500">
              Texto autoral do {artigo.instituicao}. Usa o que as fontes de catalogação trazem como
              insumo e conclui por conta própria — o que está escrito aqui é responsabilidade de
              quem assina, e não das fontes.
            </p>
          </footer>
        </article>
      )}
    </ScreenContainer>
  );
};
