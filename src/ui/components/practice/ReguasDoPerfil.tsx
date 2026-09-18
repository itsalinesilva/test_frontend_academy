import React, { useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

/**
 * Uma régua — um eixo pelo qual o progresso é medido.
 *
 * `maximo` ausente quer dizer que a régua **não termina**: experiência
 * acumulada não tem teto, e desenhar uma barra para ela seria inventar um
 * fim que não existe.
 */
export interface Regua {
  id: string;
  nome: string;
  /** O que esta régua mede, em uma linha. */
  descricao: string;
  valor: number;
  maximo?: number;
  unidade?: string;
  /** Detalhe que só aparece com a régua aberta. */
  detalhe?: React.ReactNode;
}

export interface Emblema {
  id: string;
  nome: string;
  conquistado: boolean;
  /** O que é preciso fazer. Obrigatório mesmo nos conquistados. */
  requisito: string;
}

interface ReguasDoPerfilProps {
  reguas: Regua[];
  /** A régua em destaque. As demais ficam esmaecidas e expansíveis. */
  reguaAtivaId: string;
  aoTrocarRegua: (id: string) => void;
  emblemas: Emblema[];
}

/**
 * As réguas do perfil.
 *
 * UMA EM DESTAQUE, AS OUTRAS AO ALCANCE
 * -------------------------------------
 * Seis números do mesmo tamanho não se leem: viram um painel de instrumentos
 * em que nada é mais importante que nada. A régua ativa fica aberta e as
 * demais esmaecidas — mas **expansíveis**, porque esmaecer não pode virar
 * esconder: quem quer o número secundário tem de alcançá-lo sem sair da tela.
 *
 * EMBLEMA BLOQUEADO APARECE
 * -------------------------
 * `N de M`, com os bloqueados visíveis e o requisito escrito. Ver o que falta
 * é o que motiva; esconder o bloqueado deixa a coleção sem forma, e a pessoa
 * não sabe se conquistou três de quatro ou três de quarenta.
 */
export const ReguasDoPerfil: React.FC<ReguasDoPerfilProps> = ({
  reguas,
  reguaAtivaId,
  aoTrocarRegua,
  emblemas,
}) => {
  const conquistados = emblemas.filter((e) => e.conquistado).length;

  return (
    <div className="space-y-8">
      <section aria-labelledby="titulo-reguas">
        <h2 id="titulo-reguas" className="sr-only">
          Como seu progresso é medido
        </h2>

        <ul className="space-y-2">
          {reguas.map((regua) => {
            const ativa = regua.id === reguaAtivaId;
            return (
              <li key={regua.id}>
                <ReguaAberta
                  regua={regua}
                  ativa={ativa}
                  aoAbrir={() => aoTrocarRegua(regua.id)}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="titulo-emblemas">
        <h2
          id="titulo-emblemas"
          className="font-serif text-lg font-bold text-stone-900"
        >
          {conquistados} de {emblemas.length} emblemas
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Os que faltam ficam à vista, com o que é preciso fazer.
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {emblemas.map((e) => (
            <li
              key={e.id}
              className={`rounded-xl border p-3 ${
                e.conquistado
                  ? 'border-ouro-500/40 bg-white'
                  : 'border-stone-200 bg-stone-50'
              }`}
            >
              <p className="flex items-center gap-1.5">
                {!e.conquistado && (
                  <Lock className="h-3 w-3 shrink-0 text-stone-400" aria-hidden="true" />
                )}
                <span
                  className={`font-serif text-sm font-bold ${
                    e.conquistado ? 'text-stone-900' : 'text-stone-400'
                  }`}
                >
                  {e.nome}
                </span>
                <span className="sr-only">
                  {e.conquistado ? ' — conquistado' : ' — ainda não conquistado'}
                </span>
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{e.requisito}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const ReguaAberta: React.FC<{
  regua: Regua;
  ativa: boolean;
  aoAbrir: () => void;
}> = ({ regua, ativa, aoAbrir }) => {
  const [expandida, setExpandida] = useState(false);
  const aberta = ativa || expandida;

  return (
    <div
      className={`rounded-xl border-2 transition-colors ${
        ativa ? 'border-anil-700 bg-white' : 'border-stone-200 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={() => {
          if (!ativa) aoAbrir();
          setExpandida((e) => !e);
        }}
        aria-expanded={aberta}
        className={`flex w-full items-center gap-3 p-4 text-left ${
          ativa ? '' : 'opacity-60 transition-opacity hover:opacity-100'
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-stone-500">
            {regua.nome}
          </span>
          <span className="block font-serif text-2xl font-bold text-stone-900">
            {regua.valor.toLocaleString('pt-BR')}
            {regua.maximo !== undefined && (
              <span className="text-base font-normal text-stone-400">
                {' '}
                de {regua.maximo.toLocaleString('pt-BR')}
              </span>
            )}
            {regua.unidade && (
              <span className="ml-1 text-sm font-normal text-stone-500">{regua.unidade}</span>
            )}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${
            aberta ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {aberta && (
        <div className="border-t border-stone-100 px-4 py-3">
          <p className="text-xs leading-relaxed text-stone-600">{regua.descricao}</p>

          {/* Barra só quando a régua termina: XP acumulado não tem teto. */}
          {regua.maximo !== undefined && (
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200"
              role="progressbar"
              aria-valuenow={regua.valor}
              aria-valuemin={0}
              aria-valuemax={regua.maximo}
              aria-label={`Progresso de ${regua.nome}`}
            >
              <div
                className="h-full rounded-full bg-anil-700 transition-all"
                style={{ width: `${Math.min(100, (regua.valor / regua.maximo) * 100)}%` }}
              />
            </div>
          )}

          {regua.detalhe && <div className="mt-3">{regua.detalhe}</div>}
        </div>
      )}
    </div>
  );
};
