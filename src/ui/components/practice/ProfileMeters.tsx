import React, { useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

/**
 * Uma régua — um eixo pelo qual o progresso é medido.
 *
 * `maximo` ausente quer dizer que a régua **não termina**: experiência
 * acumulada não tem teto, e desenhar uma barra para ela seria inventar um
 * fim que não existe.
 */
export interface Meter {
  id: string;
  nome: string;
  /** O que esta régua mede, em uma linha. */
  descricao: string;
  valor: number;
  max?: number;
  unit?: string;
  /** Detalhe que só aparece com a régua aberta. */
  detail?: React.ReactNode;
}

export interface Badge {
  id: string;
  nome: string;
  earned: boolean;
  /** O que é preciso fazer. Obrigatório mesmo nos conquistados. */
  requirement: string;
}

interface ProfileMetersProps {
  meters: Meter[];
  /** A régua em destaque. As demais ficam esmaecidas e expansíveis. */
  activeMeterId: string;
  onChangeMeter: (id: string) => void;
  badges: Badge[];
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
export const ProfileMeters: React.FC<ProfileMetersProps> = ({
  meters,
  activeMeterId,
  onChangeMeter,
  badges,
}) => {
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-8">
      <section aria-labelledby="titulo-reguas">
        <h2 id="titulo-reguas" className="sr-only">
          Como seu progresso é medido
        </h2>

        <ul className="space-y-2">
          {meters.map((meter) => {
            const isActive = meter.id === activeMeterId;
            return (
              <li key={meter.id}>
                <MeterRow
                  meter={meter}
                  isActive={isActive}
                  onOpen={() => onChangeMeter(meter.id)}
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
          {earnedCount} de {badges.length} emblemas
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Os que faltam ficam à vista, com o que é preciso fazer.
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {badges.map((e) => (
            <li
              key={e.id}
              className={`rounded-xl border p-3 ${
                e.earned
                  ? 'border-ouro-500/40 bg-white'
                  : 'border-stone-200 bg-stone-50'
              }`}
            >
              <p className="flex items-center gap-1.5">
                {!e.earned && (
                  <Lock className="h-3 w-3 shrink-0 text-stone-400" aria-hidden="true" />
                )}
                <span
                  className={`font-serif text-sm font-bold ${
                    e.earned ? 'text-stone-900' : 'text-stone-400'
                  }`}
                >
                  {e.nome}
                </span>
                <span className="sr-only">
                  {e.earned ? ' — conquistado' : ' — ainda não conquistado'}
                </span>
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-stone-500">{e.requirement}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const MeterRow: React.FC<{
  meter: Meter;
  isActive: boolean;
  onOpen: () => void;
}> = ({ meter, isActive, onOpen }) => {
  const [expanded, setExpanded] = useState(false);
  const isOpen = isActive || expanded;

  return (
    <div
      className={`rounded-xl border-2 transition-colors ${
        isActive ? 'border-anil-700 bg-white' : 'border-stone-200 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={() => {
          if (!isActive) onOpen();
          setExpanded((v) => !v);
        }}
        aria-expanded={isOpen}
        className={`flex w-full items-center gap-3 p-4 text-left ${
          isActive ? '' : 'opacity-60 transition-opacity hover:opacity-100'
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-stone-500">
            {meter.nome}
          </span>
          <span className="block font-serif text-2xl font-bold text-stone-900">
            {meter.valor.toLocaleString('pt-BR')}
            {meter.max !== undefined && (
              <span className="text-base font-normal text-stone-400">
                {' '}
                de {meter.max.toLocaleString('pt-BR')}
              </span>
            )}
            {meter.unit && (
              <span className="ml-1 text-sm font-normal text-stone-500">{meter.unit}</span>
            )}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="border-t border-stone-100 px-4 py-3">
          <p className="text-xs leading-relaxed text-stone-600">{meter.descricao}</p>

          {/* Barra só quando a régua termina: XP acumulado não tem teto. */}
          {meter.max !== undefined && (
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200"
              role="progressbar"
              aria-valuenow={meter.valor}
              aria-valuemin={0}
              aria-valuemax={meter.max}
              aria-label={`Progresso de ${meter.nome}`}
            >
              <div
                className="h-full rounded-full bg-anil-700 transition-all"
                style={{ width: `${Math.min(100, (meter.valor / meter.max) * 100)}%` }}
              />
            </div>
          )}

          {meter.detail && <div className="mt-3">{meter.detail}</div>}
        </div>
      )}
    </div>
  );
};
