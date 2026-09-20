import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { acervoService } from '../../../services/application/acervo.service';
import { ArtigoDoConservatorio } from '../../../domain/article';
import { CanonicalWork } from '../../../domain/music-knowledge';
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
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;

    const achado = acervoService.artigos().find((a) => a.id === id) ?? null;
    if (!vivo) return;
    setArtigo(achado);

    if (!achado) {
      setCarregando(false);
      return;
    }

    /**
     * As obras citadas, buscadas uma a uma.
     *
     * Uma citação pode apontar para obra que saiu do acervo — e quando isso
     * acontece a tela **diz**, em vez de esconder a linha. Citação que some
     * sem aviso faz o artigo mentir sobre o próprio percurso.
     */
    Promise.all(achado.obras.map((o) => acervoService.fichaDaObra(o.obraId))).then((fichas) => {
      if (!vivo) return;
      const mapa = new Map<string, CanonicalWork>();
      for (const f of fichas) {
        if (f) mapa.set(f.obra.id, f.obra);
      }
      setObras(mapa);
      setCarregando(false);
    });

    return () => {
      vivo = false;
    };
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
