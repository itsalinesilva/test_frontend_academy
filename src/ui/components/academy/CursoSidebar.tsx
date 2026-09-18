import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, X, FileText, MessageSquare, HelpCircle, BookMarked, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '../../navigation/router';
import { AcademyCourse, AcademyModule, AcademyLesson } from '../../../domain/academy';

export interface CursoSidebarProps {
  id?: string;
  curso: AcademyCourse;
  modulos: AcademyModule[];
  /** Lições por id de módulo. Vazio enquanto carrega. */
  licoesPorModulo: Record<string, AcademyLesson[]>;
  concluidas: string[];
  /** Lição aberta agora, se houver. */
  licaoAtual?: string;
  /** Módulo a manter aberto ao montar. */
  moduloAberto?: string;
  /** Quando presente, mostra o X de fechar (modo teatro). */
  onFechar?: () => void;
}

/**
 * O menu lateral fixo da área de curso.
 *
 * É o mesmo componente nas duas telas: na visão geral do curso ele lista os
 * módulos; dentro de uma lição, ele mantém o módulo corrente aberto e marca a
 * lição em que se está, de modo que o aluno sempre sabe onde está no percurso.
 *
 * O estado de cada item é visível: círculo vazio para não visto, marca verde
 * para concluído. Duração fica ao lado do título, não escondida.
 */
export const CursoSidebar: React.FC<CursoSidebarProps> = ({
  id = 'curso-sidebar',
  curso,
  modulos,
  licoesPorModulo,
  concluidas,
  licaoAtual,
  moduloAberto,
  onFechar,
}) => {
  const { navigate } = useRouter();
  const feitas = new Set(concluidas);

  const inicial = moduloAberto ?? modulos.find((m) => !feitas.has(m.lessonIds[0]))?.id ?? modulos[0]?.id;
  const [abertos, setAbertos] = useState<Set<string>>(new Set(inicial ? [inicial] : []));
  const [recursosAbertos, setRecursosAbertos] = useState(false);

  const alternar = (moduloId: string) =>
    setAbertos((prev) => {
      const n = new Set(prev);
      if (n.has(moduloId)) n.delete(moduloId);
      else n.add(moduloId);
      return n;
    });

  const moduloConcluido = (m: AcademyModule) =>
    m.lessonIds.length > 0 && m.lessonIds.every((l) => feitas.has(l));

  const recursos = [
    { label: 'Notas', icon: FileText, path: `/academy/course/${curso.id}/notas` },
    { label: 'Anotações', icon: BookMarked, path: `/academy/course/${curso.id}/anotacoes` },
    { label: 'Fórum do curso', icon: MessageSquare, path: '/community' },
    { label: 'Perguntas frequentes', icon: HelpCircle, path: '/help' },
    { label: 'Sobre o curso', icon: Info, path: `/academy/course/${curso.id}` },
  ];

  return (
    <nav
      id={id}
      aria-label={`Conteúdo de ${curso.title}`}
      className="flex h-full flex-col overflow-y-auto border-r border-stone-200 bg-white"
    >
      <div className="flex items-start gap-2 border-b border-stone-200 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
            {curso.categoryName}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/academy/course/${curso.id}/aprender`)}
            className="mt-0.5 block text-left font-serif text-sm font-semibold leading-snug text-stone-900 hover:text-anil-800"
          >
            {curso.title}
          </button>
        </div>
        {onFechar && (
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar o painel de conteúdo"
            className="shrink-0 rounded p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 p-2">
        <p className="px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          Material do curso
        </p>

        <ul className="space-y-0.5">
          {modulos.map((m) => {
            const aberto = abertos.has(m.id);
            const licoes = licoesPorModulo[m.id] ?? [];
            const completo = moduloConcluido(m);

            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => alternar(m.id)}
                  aria-expanded={aberto}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-stone-50"
                >
                  {completo ? (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                      aria-label="concluído"
                    />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 text-xs leading-snug text-stone-800">
                    {m.title}
                  </span>
                  <ChevronDown
                    className={clsx(
                      'mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400 transition-transform',
                      aberto && 'rotate-180'
                    )}
                  />
                </button>

                {aberto && (
                  <ul className="ml-4 space-y-0.5 border-l border-stone-200 pl-2">
                    {licoes.length === 0 && (
                      <li className="px-2 py-1.5 text-[11px] text-stone-400">Carregando…</li>
                    )}
                    {licoes.map((l) => {
                      const feita = feitas.has(l.id);
                      const atual = l.id === licaoAtual;
                      return (
                        <li key={l.id}>
                          <button
                            type="button"
                            onClick={() => navigate(`/academy/lesson/${l.id}`)}
                            aria-current={atual ? 'page' : undefined}
                            className={clsx(
                              'flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                              atual ? 'bg-anil-50' : 'hover:bg-stone-50'
                            )}
                          >
                            {feita ? (
                              <CheckCircle2
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                                aria-label="concluída"
                              />
                            ) : (
                              <Circle
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-300"
                                aria-hidden="true"
                              />
                            )}
                            <span className="min-w-0 flex-1">
                              <span
                                className={clsx(
                                  'block text-[11px] leading-snug',
                                  atual ? 'font-semibold text-anil-900' : 'text-stone-700'
                                )}
                              >
                                {l.variants.TRADITIONAL.title}
                              </span>
                              <span className="block text-[10px] text-stone-400">
                                Lição · {l.durationMinutes} min
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-3 border-t border-stone-200 pt-2">
          <button
            type="button"
            onClick={() => setRecursosAbertos((v) => !v)}
            aria-expanded={recursosAbertos}
            className="flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-stone-50"
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Recursos
            </span>
            <ChevronDown
              className={clsx(
                'h-3.5 w-3.5 text-stone-400 transition-transform',
                recursosAbertos && 'rotate-180'
              )}
            />
          </button>

          {recursosAbertos && (
            <ul className="space-y-0.5">
              {recursos.map((r) => {
                const Icone = r.icon;
                return (
                  <li key={r.label}>
                    <button
                      type="button"
                      onClick={() => navigate(r.path)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] text-stone-700 transition-colors hover:bg-stone-50"
                    >
                      <Icone className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
                      {r.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};
