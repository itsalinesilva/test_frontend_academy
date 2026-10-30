import React from 'react';
import { MembershipCard } from '../../../domain/membership';
import { BookOpen, FlaskConical, Home, Landmark, Users } from 'lucide-react';

interface MembershipCardPanelProps {
  card: MembershipCard;
  /** Para onde levar quem ainda não pertence a nada. */
  onEnroll: () => void;
  onPractice: () => void;
  onExploreClubs: () => void;
}

/**
 * A carteira de pertencimento, dentro do Passaporte.
 *
 * Responde às seis perguntas de `80_INSTITUTIONAL_ARCHITECTURE.md` §10:
 * está cursando, em que Grêmio, praticando onde, em que Casa, conectada à
 * Comunidade, em que Clube.
 *
 * VAZIO É VAZIO
 * -------------
 * Nenhum Grêmio sugerido, nenhuma Casa "recomendada", nenhum Clube de exemplo
 * preenchendo a lacuna. Em toda a plataforma dado inventado é proibido; aqui
 * seria pior, porque pertencimento falso é afirmação sobre a vida da pessoa —
 * dizer que ela é de uma Casa que ela nunca escolheu.
 *
 * O que a linha vazia faz, em vez disso, é dizer **como se entra**. Ausência
 * explicada é orientação; ausência escondida é só buraco.
 */
export const MembershipCardPanel: React.FC<MembershipCardPanelProps> = ({
  card,
  onEnroll,
  onPractice,
  onExploreClubs,
}) => (
  <section aria-labelledby="titulo-carteira" className="space-y-3">
    <header>
      <h2 id="titulo-carteira" className="font-serif text-lg font-bold text-stone-900">
        Onde você pertence
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">
        O Grêmio vem da área que você estuda, a Casa vem da prática, o Clube vem de você.
      </p>
    </header>

    <dl className="space-y-2">
      <Row
        icon={BookOpen}
        term="Academia"
        items={card.enrolledCourses.map((c) => c.title)}
        emptyText="Você não está cursando nada agora."
        actionLabel="Ver cursos"
        onAction={onEnroll}
      />
      <Row
        icon={Landmark}
        term="Grêmio"
        items={card.guilds.map((g) => g.name)}
        emptyText="O Grêmio vem junto com a matrícula, e reúne quem estuda a mesma área."
      />
      <Row
        icon={FlaskConical}
        term="Laboratório"
        items={card.labs.map((l) => l.name)}
        emptyText="Você ainda não praticou em nenhum."
        actionLabel="Praticar"
        onAction={onPractice}
      />
      <Row
        icon={Home}
        term="Casa"
        items={card.houses.map((h) => h.name)}
        emptyText="A Casa abre com prática recorrente — não é preciso pedir."
      />
      <Row
        icon={Users}
        term="Clube"
        items={card.clubs.map((c) => c.name)}
        emptyText="Os Clubes são criados pela Comunidade, dentro de um Grêmio."
        actionLabel="Conhecer os Clubes"
        onAction={onExploreClubs}
      />
    </dl>
  </section>
);

const Row: React.FC<{
  icon: React.ElementType;
  term: string;
  items: string[];
  emptyText: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon: Icon, term, items, emptyText, actionLabel, onAction }) => {
  const empty = items.length === 0;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        empty ? 'border-stone-200 bg-stone-50' : 'border-stone-200 bg-white'
      }`}
    >
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${empty ? 'text-stone-300' : 'text-anil-700'}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <dt className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
          {term}
        </dt>
        <dd className="mt-0.5">
          {empty ? (
            <p className="text-sm leading-relaxed text-stone-500">{emptyText}</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {items.map((nome) => (
                <li
                  key={nome}
                  className="rounded-full border border-anil-700/30 bg-anil-50 px-3 py-0.5 text-sm font-medium text-anil-950"
                >
                  {nome}
                </li>
              ))}
            </ul>
          )}
        </dd>
      </div>

      {empty && actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-anil-700 hover:text-anil-800"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
