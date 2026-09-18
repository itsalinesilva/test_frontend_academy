import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, Award, PlayCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter, useRouteParams } from '../../navigation/router';
import { CursoSidebar } from '../../components/academy/CursoSidebar';
import { StudyCalendar } from '../../components/academy/StudyCalendar';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  UserAcademyProgress,
} from '../../../domain/academy';
import { StudyRecord, dayOf } from '../../../domain/study-attendance';
import { Estrelas, SeletorDeEstrelas } from '../../components/academy/Estrelas';
import { reviewsRepository, montarAvaliacao } from '../../../repositories/reviews.repository';
import { AvaliacaoDeCurso, Estrelas as NotaEstrelas } from '../../../domain/reviews';

/**
 * A tela de dentro do curso.
 *
 * Três colunas: o menu do curso fixo à esquerda, o conteúdo ao centro, e à
 * direita o calendário de frequência e a avaliação do curso.
 *
 * O centro lista os módulos com seus itens — cada um mostrando tipo, duração e
 * se já foi visto. É daqui que se escolhe a aula, e é por isso que o estado de
 * cada item precisa ser visível sem clicar em nada.
 */
export const CourseLearnScreen: React.FC = () => {
  const { navigate } = useRouter();
  const params = useRouteParams();
  const courseId = params.courseId ?? params.id ?? '';

  const [curso, setCurso] = useState<AcademyCourse | null>(null);
  const [modulos, setModulos] = useState<AcademyModule[]>([]);
  const [licoesPorModulo, setLicoes] = useState<Record<string, AcademyLesson[]>>({});
  const [progresso, setProgresso] = useState<UserAcademyProgress | null>(null);
  const [frequencia, setFrequencia] = useState<StudyRecord[]>([]);
  const [outrosCursos, setOutros] = useState<AcademyCourse[]>([]);
  const [minhaAvaliacao, setMinhaAvaliacao] = useState<AvaliacaoDeCurso | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userNome, setUserNome] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState<Set<string>>(new Set());

  useEffect(() => {
    let vivo = true;

    const carregar = async () => {
      const c = await academyService.getCourse(courseId);
      if (!vivo || !c) {
        setCarregando(false);
        return;
      }
      setCurso(c);

      const mods = await academyService.getModules(c.id);
      if (!vivo) return;
      setModulos(mods);
      setExpandido(new Set(mods.slice(0, 1).map((m) => m.id)));

      const mapa: Record<string, AcademyLesson[]> = {};
      await Promise.all(
        mods.map(async (m) => {
          mapa[m.id] = await academyService.getLessons(m.id);
        })
      );
      if (!vivo) return;
      setLicoes(mapa);

      // Recomendações: os outros cursos publicados. Sem modelo de afinidade
      // ainda, e por isso a seção não finge personalização que não existe.
      const todos = await academyService.getCourses();
      if (!vivo) return;
      setOutros(todos.filter((x) => x.id !== c.id).slice(0, 3));

      const sessao = await authService.getActiveSession();
      if (sessao && vivo) {
        setUserId(sessao.user.id);
        setUserNome(sessao.user.name);
        setProgresso(await academyService.getUserProgress(sessao.user.id, c.id));
        setMinhaAvaliacao(await reviewsRepository.forUser(sessao.user.id, c.id));

        // Abrir a tela do curso é atividade de estudo: marca o dia.
        setFrequencia(
          await reviewsRepository.recordStudy(sessao.user.id, dayOf(new Date()), 0)
        );
      }
      if (vivo) setCarregando(false);
    };

    carregar();
    return () => {
      vivo = false;
    };
  }, [courseId]);

  // Enquanto nao ha dado, quem desenha o esqueleto e o estado de erro e o
  // proprio PageLayout — nao um paragrafo solto de "carregando".
  if (carregando || !curso) {
    return (
      <PageLayout
        id="course-learn"
        form="course"
        density="editorial"
        state={carregando ? 'loading' : 'error'}
        loadingMessage="Carregando o curso…"
        errorProps={{
          title: 'Curso não encontrado',
          message: 'Verifique o endereço ou volte ao catálogo.',
          onRetry: () => navigate('/academy'),
        }}
      >
        <PageLayout.Main>{null}</PageLayout.Main>
      </PageLayout>
    );
  }

  const feitas = new Set(progresso?.completedLessonIds ?? []);
  const totalLicoes = Object.values(licoesPorModulo).flat().length;
  const concluido = totalLicoes > 0 && feitas.size >= totalLicoes;

  /** Nota rápida a partir do trilho. O texto fica na página do curso. */
  const avaliarRapido = async (n: NotaEstrelas) => {
    if (!userId) {
      navigate('/auth/login');
      return;
    }
    const nova = montarAvaliacao({
      userId,
      courseId: curso.id,
      autor: userNome,
      anonima: minhaAvaliacao?.anonima ?? false,
      estrelas: n,
      comentario: minhaAvaliacao?.comentario ?? '',
      concluiuOCurso: concluido,
    });
    await reviewsRepository.salvar(nova);
    setMinhaAvaliacao(nova);
  };

  const alternar = (id: string) =>
    setExpandido((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <PageLayout
      id="course-learn"
      form="course"
      density="editorial"
      state="content"
      asideLabel="Frequência e avaliação"
    >
      <PageLayout.Panel>
        <CursoSidebar
          curso={curso}
          modulos={modulos}
          licoesPorModulo={licoesPorModulo}
          concluidas={progresso?.completedLessonIds ?? []}
        />
      </PageLayout.Panel>

      <PageLayout.Aside>
        <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
          <StudyCalendar registros={frequencia} />
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
          <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Avaliar este curso
          </h2>

          {concluido ? (
            <>
              <div className="mt-2">
                <SeletorDeEstrelas
                  id="trilho-avaliar"
                  valor={minhaAvaliacao?.estrelas ?? null}
                  onChange={avaliarRapido}
                />
              </div>
              <button
                type="button"
                onClick={() => navigate(`/academy/course/${curso.id}#avaliacoes`)}
                className="mt-2 text-xs font-medium text-anil-700 underline-offset-2 hover:underline"
              >
                {minhaAvaliacao?.comentario
                  ? 'Editar meu comentário'
                  : 'Escrever um comentário'}
              </button>
            </>
          ) : (
            <>
              <div className="mt-2 opacity-50">
                <Estrelas valor={null} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                A avaliação abre ao concluir o curso — a nota descreve a experiência inteira.
              </p>
            </>
          )}
        </div>

        {outrosCursos.length > 0 && (
          <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Outros cursos
            </h2>
            <ul className="mt-2 space-y-1">
              {outrosCursos.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/academy/course/${o.id}`)}
                    className="w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-stone-50"
                  >
                    <span className="block text-xs font-medium leading-snug text-stone-900">
                      {o.title}
                    </span>
                    <span className="block text-[11px] text-stone-500">
                      {o.moduleIds.length} disciplinas · {o.workloadHours} h
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

      </PageLayout.Aside>

      <PageLayout.Main>
        <div className="space-y-4">
          {concluido && (
            <section className="rounded-xl bg-anil-50 p-5">
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 shrink-0 text-ouro-600" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-base font-semibold text-anil-900">
                    Você concluiu {curso.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">
                    {curso.certificateInfo?.criteria ?? curso.certificatePolicy}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/academy/completion/${curso.id}`)}
                    className="mt-3 rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700"
                  >
                    Emitir certificado
                  </button>
                </div>
              </div>
            </section>
          )}

            {modulos.map((m) => {
              const licoes = licoesPorModulo[m.id] ?? [];
              const aberto = expandido.has(m.id);
              const completo = licoes.length > 0 && licoes.every((l) => feitas.has(l.id));
              const minutos = licoes.reduce((a, l) => a + l.durationMinutes, 0);

              return (
                <section
                  key={m.id}
                  id={`modulo-${m.id}`}
                  aria-labelledby={`modulo-${m.id}-titulo`}
                  className="rounded-xl bg-white p-5 ring-1 ring-stone-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2
                        id={`modulo-${m.id}-titulo`}
                        className="font-serif text-base font-semibold leading-snug text-stone-900"
                      >
                        {m.title}
                      </h2>
                      <p className="mt-1 text-xs text-stone-500">
                        {licoes.length} {licoes.length === 1 ? 'lição' : 'lições'} · {minutos} min
                      </p>
                    </div>
                    {completo && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        Concluído
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{m.description}</p>

                  <button
                    type="button"
                    onClick={() => alternar(m.id)}
                    aria-expanded={aberto}
                    aria-controls={`modulo-${m.id}-itens`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-anil-700 hover:text-anil-900"
                  >
                    {aberto ? 'Ocultar objetivos e aulas' : 'Mostrar objetivos e aulas'}
                    <ChevronDown
                      className={clsx('h-3.5 w-3.5 transition-transform', aberto && 'rotate-180')}
                    />
                  </button>

                  {aberto && (
                    <div id={`modulo-${m.id}-itens`} className="mt-4 space-y-4">
                      {m.objectives.length > 0 && (
                        <div>
                          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            Objetivos
                          </p>
                          <ul className="space-y-1">
                            {m.objectives.map((o, i) => (
                              <li key={i} className="flex gap-2 text-sm text-stone-700">
                                <CheckCircle2
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-300"
                                  aria-hidden="true"
                                />
                                <span>{o}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <ul className="divide-y divide-stone-100 border-t border-stone-100">
                        {licoes.map((l) => {
                          const feita = feitas.has(l.id);
                          const blocos = l.variants.TRADITIONAL.sections.flatMap(
                            (s) => s.blocks ?? []
                          );
                          const temLab = blocos.some((b) =>
                            ['INTERVAL_LAB', 'CHORD_LAB', 'SCALE_LAB', 'AUDIO_EXAMPLE'].includes(
                              b.kind
                            )
                          );

                          return (
                            <li key={l.id}>
                              <button
                                type="button"
                                onClick={() => navigate(`/academy/lesson/${l.id}`)}
                                className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-stone-50"
                              >
                                {feita ? (
                                  <CheckCircle2
                                    className="h-4 w-4 shrink-0 text-emerald-600"
                                    aria-label="concluída"
                                  />
                                ) : (
                                  <Circle
                                    className="h-4 w-4 shrink-0 text-stone-300"
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm text-stone-900">
                                    {l.variants.TRADITIONAL.title}
                                  </span>
                                  <span className="block text-xs text-stone-500">
                                    {temLab ? 'Lição com laboratório' : 'Lição'} ·{' '}
                                    {l.durationMinutes} min
                                    {feita && ' · concluída'}
                                  </span>
                                </span>
                                <PlayCircle
                                  className="h-5 w-5 shrink-0 text-stone-300"
                                  aria-hidden="true"
                                />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
