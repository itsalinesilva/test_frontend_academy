import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { acervoService } from '../../../services/application/acervo.service';
import {
  CanonicalComposer,
  CanonicalWork,
  DisponibilidadeNoConservatorio,
  avaliarDisponibilidade,
  textoDe,
} from '../../../domain/music-knowledge';
import { MusicalMovement } from '../../../domain/atlas-map';

/**
 * A FICHA DE UM COMPOSITOR.
 *
 * O QUE ELA REÚNE
 * ---------------
 * Quem foi — biografia escrita aqui, datas, origem —, em que movimentos
 * esteve, e o **compêndio completo** das obras dele no acervo.
 *
 * O COMPÊNDIO VEM INTEIRO
 * -----------------------
 * Sem recorte de disponibilidade. Um catálogo que listasse só o que toca
 * esconderia metade da obra de quem veio consultar, e saber que a peça existe
 * já é parte do que se foi buscar. Cada linha diz o que se pode fazer com ela.
 *
 * O RETRATO PODE FALTAR, E ISSO SE DIZ
 * ------------------------------------
 * As imagens vêm do acervo de imagens livres, e dependem de ingestão. Enquanto
 * não houver, a ficha mostra as iniciais e **não** um retrato genérico de
 * banco de imagens — que seria fabricar a aparência de uma pessoa real.
 */

const iniciais = (nome: string) =>
  nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

export const CompositorScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const id = params.id;

  const [ficha, setFicha] = useState<{
    compositor: CanonicalComposer;
    obras: CanonicalWork[];
    movimentos: MusicalMovement[];
    disponibilidade: DisponibilidadeNoConservatorio;
  } | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    if (!id) {
      setCarregando(false);
      return;
    }

    acervoService.fichaDoCompositor(id).then((f) => {
      if (vivo) {
        setFicha(f);
        setCarregando(false);
      }
    });

    return () => {
      vivo = false;
    };
  }, [id]);

  const c = ficha?.compositor;

  return (
    <ScreenContainer
      id="acervo-compositor"
      title={c?.canonicalName ?? 'Compositor'}
      subtitle={c && (c.birthYear || c.deathYear) ? `${c.birthYear ?? '?'} – ${c.deathYear ?? '?'}` : undefined}
      badgeLabel={ficha ? `${ficha.obras.length} obras no acervo` : undefined}
      badgeVariant="neutral"
      secondaryActions={[{ label: 'Voltar ao acervo', onClick: () => navigate('/acervo') }]}
      state={carregando ? 'loading' : !ficha ? 'empty' : 'populated'}
      emptyProps={{
        title: 'Compositor não encontrado',
        description: 'Não há no acervo nenhum compositor com esse identificador.',
        actionLabel: 'Ver o acervo',
        onAction: () => navigate('/acervo'),
      }}
    >
      {ficha && c && (
        <div className="space-y-6">
          <section className="flex flex-wrap items-start gap-4 rounded-lg border border-stone-200 bg-white p-4">
            {c.portraitUrl ? (
              <img
                src={c.portraitUrl}
                alt={`Retrato de ${c.canonicalName}`}
                className="h-20 w-20 shrink-0 rounded object-cover"
              />
            ) : (
              /*
                Sem retrato, as iniciais — e nunca uma foto de banco de imagens.
                Já houve aqui um avatar de docente tirado de banco genérico, e
                inventar a aparência de uma pessoa real é pior que não ter foto.
              */
              <div
                aria-hidden="true"
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-anil-50 text-xl font-semibold text-anil-800"
              >
                {iniciais(c.canonicalName)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              {textoDe(c.biography) ? (
                <p className="text-sm leading-relaxed text-stone-700">{textoDe(c.biography)}</p>
              ) : (
                <p className="text-xs text-stone-500">
                  A biografia deste compositor ainda não foi escrita.
                </p>
              )}

              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                {[
                  { t: 'Eras', v: c.periodIds.join(', ') },
                  { t: 'Regiões', v: c.regionIds.join(', ') },
                  { t: 'Nascimento', v: c.birthPlace },
                ]
                  .filter((x) => x.v)
                  .map((x) => (
                    <div key={x.t}>
                      <dt className="text-[11px] uppercase tracking-wide text-stone-500">{x.t}</dt>
                      <dd className="text-stone-800">{x.v}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </section>

          {ficha.movimentos.length > 0 && (
            <section className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Movimentos que ajudou a definir
              </h2>
              <ul className="mt-2 space-y-2">
                {ficha.movimentos.map((m) => (
                  <li key={m.id}>
                    <p className="text-sm font-medium text-stone-900">
                      {m.name}
                      {m.years && <span className="ml-2 text-xs text-stone-500">{m.years}</span>}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{m.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Compêndio de obras
            </h2>

            {ficha.obras.length === 0 ? (
              <p className="mt-2 text-xs text-stone-500">
                Nenhuma obra deste compositor foi catalogada ainda.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {ficha.obras.map((o) => {
                  const d = avaliarDisponibilidade(o);
                  const tocavel = d.modo === 'EXPERIENCIA_COMPLETA';

                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/acervo/obra/${o.id}`)}
                        className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-3 text-left hover:border-anil-700"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-stone-900">
                            {textoDe(o.canonicalTitle) ?? o.id}
                          </span>
                          <span className="block text-xs text-stone-500">
                            {[o.date, o.generoId, o.periodId].filter(Boolean).join(' · ')}
                          </span>
                        </span>

                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            tocavel ? 'bg-anil-50 text-anil-800' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {tocavel ? 'Disponível para estudo' : 'Catalogada'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </ScreenContainer>
  );
};
