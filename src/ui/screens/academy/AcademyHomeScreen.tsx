import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { CourseCard } from '../../components/domain/CourseCard';
import { ProgramCard } from '../../components/domain/ProgramCard';
import { LessonCard } from '../../components/domain/LessonCard';
import { Carrossel } from '../../components/layout/Carrossel';
import { ProgressRing } from '../../components/data-display/ProgressRing';
import { useRouter } from '../../navigation/router';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { VisitorInvitation } from '../../components/visitor/VisitorInvitation';
import {
  Program,
  LearningPath,
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  UserAcademyProgress,
} from '../../../domain/academy';
import { Search, X, ChevronRight, CalendarDays, Award, Clock } from 'lucide-react';

type Aba = 'geral' | 'cursos' | 'programas';

interface Achado {
  tipo: 'curso' | 'programa' | 'disciplina';
  curso?: AcademyCourse;
  programa?: Program;
  disciplina?: AcademyModule;
}

/**
 * Academy.
 *
 * Abre na visão geral — não há item de menu para ela, porque é o que já está
 * na tela. Dali se vai a Cursos ou a Programas.
 *
 * Disciplina não é uma seção: disciplina só existe dentro de um curso. Ela
 * aparece como resultado de busca, sempre acompanhada do curso a que pertence,
 * e o clique leva à disciplina passando pelo curso — nunca solta.
 */
export const AcademyHomeScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [programas, setProgramas] = useState<Program[]>([]);
  const [trilhas, setTrilhas] = useState<LearningPath[]>([]);
  const [cursos, setCursos] = useState<AcademyCourse[]>([]);
  const [disciplinasPorCurso, setDisciplinasPorCurso] = useState<Record<string, AcademyModule[]>>({});
  const [matriculas, setMatriculas] = useState<UserAcademyProgress[]>([]);
  /**
   * `null` enquanto a sessão não foi consultada. Distinguir "ainda não sei" de
   * "não há sessão" evita o convite piscar na tela de quem está logado.
   */
  const [ehVisitante, setEhVisitante] = useState<boolean | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const [proximas, setProximas] = useState<AcademyLesson[]>([]);
  const [aba, setAba] = useState<Aba>('geral');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const carregar = async () => {
      try {
        const sessao = await authService.getActiveSession();
        const userId = sessao?.user.id;
        setEhVisitante(!sessao);

        const [progs, trls, crss, mats] = await Promise.all([
          academyService.getPrograms(),
          academyService.getPaths(),
          academyService.getCourses(),
          userId ? academyService.listUserEnrollments(userId) : Promise.resolve([]),
        ]);

        setProgramas(progs);
        setTrilhas(trls);
        setCursos(crss);
        setMatriculas(mats);

        // As disciplinas de cada curso: é o que o cartão abre, e é o que a
        // busca precisa para encontrar um tópico dentro do curso certo.
        const mapa: Record<string, AcademyModule[]> = {};
        await Promise.all(
          crss.map(async (c) => {
            mapa[c.id] = await academyService.getModules(c.id);
          })
        );
        setDisciplinasPorCurso(mapa);

        // Proximo passo: as licoes ainda nao concluidas do curso em andamento.
        // Sem matricula, nao ha sugestao — e nao se fabrica uma.
        const emCurso = mats.find((m) => m.progressPercentage < 100);
        if (emCurso) {
          const mods = mapa[emCurso.courseId] ?? [];
          const porModulo = await Promise.all(mods.map((m) => academyService.getLessons(m.id)));
          setProximas(
            porModulo
              .flat()
              .filter((l) => !emCurso.completedLessonIds.includes(l.id))
              .slice(0, 3)
          );
        }
      } catch {
        setFalhou(true);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, []);

  const matriculaPorCurso = useMemo(
    () => new Map(matriculas.map((m) => [m.courseId, m])),
    [matriculas]
  );

  const horasEstudadas = Math.round(
    matriculas.reduce((a, m) => a + m.studyTimeMinutes, 0) / 60
  );

  const horasRestantes = Math.round(
    matriculas.reduce((a, m) => {
      const c = cursos.find((x) => x.id === m.courseId);
      if (!c) return a;
      return a + (c.workloadHours * (100 - m.progressPercentage)) / 100;
    }, 0)
  );

  const termo = filtro.trim().toLowerCase();

  const achados = useMemo<Achado[]>(() => {
    if (termo.length < 2) return [];
    const bate = (s: string) => s.toLowerCase().includes(termo);
    const r: Achado[] = [];

    for (const c of cursos) {
      if (bate(c.title) || bate(c.subtitle ?? '') || c.competencies.some(bate)) {
        r.push({ tipo: 'curso', curso: c });
      }
    }
    for (const p of programas) {
      if (bate(p.title) || bate(p.subtitle ?? '')) r.push({ tipo: 'programa', programa: p });
    }
    for (const c of cursos) {
      for (const d of disciplinasPorCurso[c.id] ?? []) {
        if (bate(d.title) || bate(d.description ?? '')) {
          r.push({ tipo: 'disciplina', disciplina: d, curso: c });
        }
      }
    }
    return r;
  }, [termo, cursos, programas, disciplinasPorCurso]);

  /**
   * Os cursos de um programa, na ordem das trilhas.
   *
   * Um programa não lista cursos diretamente: lista trilhas, e cada trilha
   * aponta para o curso. Resolver aqui mantém o cartão burro e a estrutura
   * intacta.
   */
  const cursosDoPrograma = (p: Program) =>
    p.pathIds
      .map((id) => trilhas.find((t) => t.id === id))
      .filter((t): t is LearningPath => Boolean(t))
      .sort((a, b) => a.order - b.order)
      .flatMap((t) => t.courseIds)
      .map((cid) => cursos.find((c) => c.id === cid))
      .filter((c): c is AcademyCourse => Boolean(c))
      .map((c) => ({
        id: c.id,
        titulo: c.title,
        disciplinas: c.moduleIds.length,
        horas: c.workloadHours,
      }));

  const cartaoDoCurso = (c: AcademyCourse) => {
    const m = matriculaPorCurso.get(c.id);
    return (
      <CourseCard
        key={c.id}
        id={`course-card-${c.id}`}
        title={c.title}
        description={c.subtitle || c.description}
        instructorName={c.authorName}
        level={c.level}
        durationHours={c.workloadHours}
        modulesCount={c.moduleIds.length}
        moduleTitles={(disciplinasPorCurso[c.id] ?? []).map((d) => d.title)}
        progressPercent={m?.progressPercentage}
        isEnrolled={Boolean(m)}
        onActionClick={() => navigate(`/academia/course/${c.id}`)}
      />
    );
  };

  const secaoCursos = (
    <PageLayout.Section
      title="Cursos"
      description="Cada curso traz suas disciplinas, seus exercícios e sua certificação."
    >
      {cursos.length > 0 ? (
        <Carrossel id="carrossel-cursos" label="Cursos publicados" porPagina={3}>
          {cursos.map(cartaoDoCurso)}
        </Carrossel>
      ) : (
        <p className="py-6 text-sm text-stone-500">Nenhum curso publicado ainda.</p>
      )}
    </PageLayout.Section>
  );

  const secaoProgramas = (
    <PageLayout.Section
      title="Programas"
      description="Combinações de cursos que fazem sentido cursar juntos, na ordem."
    >
      {programas.length > 0 ? (
        <Carrossel id="carrossel-programas" label="Programas" porPagina={3}>
          {programas.map((p) => (
            <ProgramCard
              key={p.id}
              id={`program-card-${p.id}`}
              title={p.title}
              description={p.subtitle || p.description}
              durationHours={p.workloadHours}
              cursos={cursosDoPrograma(p)}
              onActionClick={() => navigate(`/academia/program/${p.id}`)}
              onCourseClick={(cid) => navigate(`/academia/course/${cid}`)}
            />
          ))}
        </Carrossel>
      ) : (
        <p className="max-w-xl py-6 text-sm leading-relaxed text-stone-500">
          Um programa reúne dois ou mais cursos numa sequência — Teoria e Violino, por exemplo,
          ou as duas histórias juntas. Com um curso publicado não há combinação a fazer; os
          programas aparecem sozinhos quando o segundo curso entrar no catálogo.
        </p>
      )}
    </PageLayout.Section>
  );

  return (
    <PageLayout
      id="academy-home"
      form="detail"
      density="catalog"
      state={carregando ? 'loading' : falhou ? 'error' : 'content'}
      loadingMessage="Carregando o catálogo…"
      errorProps={{
        title: 'Não foi possível carregar a Academia',
        message: 'Houve uma falha ao buscar o catálogo.',
        onRetry: () => window.location.reload(),
      }}
    >
      <PageLayout.Tabs
        id="academy-tabs"
        activeTab={aba}
        onChange={(t) => setAba(t as Aba)}
        tabs={[
          { id: 'geral', label: 'Visão geral' },
          { id: 'cursos', label: 'Cursos', badge: cursos.length || undefined },
          { id: 'programas', label: 'Programas', badge: programas.length || undefined },
        ]}
      />

      {/* Trilho fixo: onde você está, o que vem a seguir, e o que isso rende.
          Fica sempre visível, como a coluna da direita de um curso online. */}
      <PageLayout.Aside>
        {/**
         * Para quem chega de fora, "Seu progresso" não é uma seção vazia: é uma
         * seção SEM SUJEITO. O trilho é o espaço mais valioso da tela, e gastá-lo
         * dizendo à pessoa que ela não tem nada é desperdiçá-lo duas vezes — não
         * informa e não convida.
         */}
        {ehVisitante ? (
          <VisitorInvitation
            space="Academia"
            summary="A estrutura curricular do Conservatório: cursos, disciplinas, avaliações e certificado."
            highlights={[
              { value: String(cursos.length), label: 'cursos' },
              {
                value: String(
                  Object.values(disciplinasPorCurso).reduce((a, d) => a + d.length, 0)
                ),
                label: 'disciplinas',
              },
              {
                value: `${cursos.reduce((a, c) => a + c.workloadHours, 0)}h`,
                label: 'carga horária',
              },
              { value: String(programas.length), label: 'programas' },
            ]}
            steps={[
              {
                title: 'Escolha um curso',
                description: 'O catálogo inteiro é aberto — dá para ler a ementa antes de decidir.',
              },
              {
                title: 'Matricule-se com a conta Google',
                description: 'Sem senha para criar nem para lembrar.',
              },
              {
                title: 'Estude e seja avaliado',
                description: 'Lições, atividades, simulados e prova final.',
              },
              {
                title: 'Receba o certificado',
                description: 'Emitido pelo Conservatório, com registro verificável.',
              },
            ]}
            primaryLabel="Entrar e me matricular"
            onPrimary={() => navigate('/auth/login')}
            secondaryLabel="Ver o catálogo antes"
            onSecondary={() => navigate('/academia/catalog')}
            disclaimer="Os cursos são livres, com certificação própria do Conservatório. Não constituem graduação nem têm reconhecimento do MEC."
          />
        ) : (
        <div className="space-y-4">
          <section aria-labelledby="rail-progresso" className="space-y-3">
            <h2
              id="rail-progresso"
              className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500"
            >
              Seu progresso
            </h2>

            {matriculas.length === 0 ? (
              <p className="text-xs leading-relaxed text-stone-600">
                Você ainda não se matriculou. Abra um curso e comece pelo primeiro capítulo —
                o progresso passa a ser registrado a partir daí.
              </p>
            ) : (
              <div className="space-y-3">
                {matriculas.map((m) => {
                  const c = cursos.find((x) => x.id === m.courseId);
                  if (!c) return null;
                  return (
                    <button
                      key={m.courseId}
                      type="button"
                      onClick={() => navigate(`/academia/course/${c.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-stone-100"
                    >
                      <ProgressRing
                        id={`rail-ring-${c.id}`}
                        value={m.progressPercentage}
                        size={40}
                        strokeWidth={3}
                        showLabel
                        colorVariant="brand"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-stone-900">
                          {c.title}
                        </span>
                        <span className="block text-[11px] text-stone-500">
                          {m.completedLessonIds.length} de {c.moduleIds.length} disciplinas
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {proximas.length > 0 && (
            <section aria-labelledby="rail-proximas" className="space-y-2 border-t border-stone-200 pt-4">
              <h2
                id="rail-proximas"
                className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500"
              >
                Próximo passo
              </h2>
              <div className="space-y-1.5">
                {proximas.map((l, i) => (
                  <LessonCard
                    key={l.id}
                    id={`rail-licao-${l.id}`}
                    orderIndex={i + 1}
                    title={l.variants.TRADITIONAL.title}
                    durationMinutes={l.durationMinutes}
                    type="INTERACTIVE"
                    status={i === 0 ? 'IN_PROGRESS' : 'NOT_STARTED'}
                    onSelect={() => navigate(`/academia/lesson/${l.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="rail-ritmo" className="space-y-2 border-t border-stone-200 pt-4">
            <h2
              id="rail-ritmo"
              className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500"
            >
              Ritmo de estudo
            </h2>

            {matriculas.length === 0 ? (
              <p className="text-xs leading-relaxed text-stone-600">
                A contagem de horas começa na primeira disciplina concluída.
              </p>
            ) : (
              <ul className="space-y-2 text-xs text-stone-700">
                <li className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
                  <span>
                    {horasEstudadas} h de estudo registradas
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
                  <span>
                    {horasRestantes > 0
                      ? `${horasRestantes} h restantes para concluir o que você começou`
                      : 'Você concluiu a carga horária das suas matrículas'}
                  </span>
                </li>
              </ul>
            )}
          </section>

          <section aria-labelledby="rail-certificacao" className="space-y-2 border-t border-stone-200 pt-4">
            <h2
              id="rail-certificacao"
              className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500"
            >
              Certificação
            </h2>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-stone-600">
              <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ouro-600" aria-hidden="true" />
              <span>
                Curso livre com certificação própria do Conservatório, com código de verificação
                público. Ainda sem reconhecimento do MEC.
              </span>
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile/portfolio')}
              className="text-xs font-medium text-anil-700 underline-offset-2 hover:underline"
            >
              Ver meus certificados
            </button>
          </section>
        </div>
        )}
      </PageLayout.Aside>

      <PageLayout.Main>
        <div className="space-y-8">
          {/* Navegação da seção + filtro. Sem rótulo: a lupa e as abas se explicam. */}
          <div className="flex items-center justify-end">
            <div className="flex w-full items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 sm:max-w-xs">
              <Search className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                aria-label="Filtrar cursos, programas e disciplinas"
                placeholder="filtrar"
                className="min-w-0 flex-1 bg-transparent text-xs text-stone-900 outline-none placeholder:text-stone-400 [&::-webkit-search-cancel-button]:appearance-none"
              />
              {filtro && (
                <button
                  type="button"
                  onClick={() => setFiltro('')}
                  aria-label="Limpar filtro"
                  className="shrink-0 text-stone-400 hover:text-stone-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Resultado do filtro substitui o conteúdo enquanto houver termo */}
          {termo.length >= 2 ? (
            <div id="academy-filtro-resultados" className="space-y-1">
              <p className="text-xs text-stone-500">
                {achados.length === 0
                  ? `Nada encontrado para “${filtro}”.`
                  : `${achados.length} resultado${achados.length > 1 ? 's' : ''} para “${filtro}”.`}
              </p>

              <ul className="divide-y divide-stone-200">
                {achados.map((a, i) => {
                  if (a.tipo === 'disciplina' && a.disciplina && a.curso) {
                    // Disciplina nunca aparece solta: vem com o curso que a contém.
                    return (
                      <li key={`d-${a.disciplina.id}-${i}`}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/academia/course/${a.curso!.id}?modulo=${a.disciplina!.id}`)
                          }
                          className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-stone-50"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-stone-900">
                              {a.disciplina.title}
                            </span>
                            <span className="block truncate text-[11px] text-stone-500">
                              disciplina de {a.curso.title}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                        </button>
                      </li>
                    );
                  }

                  const alvo =
                    a.tipo === 'curso'
                      ? `/academia/course/${a.curso!.id}`
                      : `/academia/program/${a.programa!.id}`;
                  const titulo = a.tipo === 'curso' ? a.curso!.title : a.programa!.title;

                  return (
                    <li key={`${a.tipo}-${i}`}>
                      <button
                        type="button"
                        onClick={() => navigate(alvo)}
                        className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-stone-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-stone-900">{titulo}</span>
                          <span className="block text-[11px] text-stone-500">{a.tipo}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <>
              {aba === 'geral' && (
                <>
                  {matriculas.length > 0 && (
                    <PageLayout.Section title="Continuar">
                      <Carrossel id="carrossel-continuar" label="Cursos em andamento" porPagina={2}>
                        {matriculas
                          .map((m) => cursos.find((c) => c.id === m.courseId))
                          .filter((c): c is AcademyCourse => Boolean(c))
                          .map(cartaoDoCurso)}
                      </Carrossel>
                    </PageLayout.Section>
                  )}
                  {secaoCursos}
                  {secaoProgramas}
                </>
              )}

              {aba === 'cursos' && secaoCursos}
              {aba === 'programas' && secaoProgramas}
            </>
          )}
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
