import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { CourseCard } from '../../components/domain/CourseCard';
import { Carrossel } from '../../components/layout/Carrossel';
import { useRouter } from '../../navigation/router';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  Program,
  AcademyCourse,
  AcademyModule,
  UserAcademyProgress,
} from '../../../domain/academy';
import { Search, X, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

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
  const [cursos, setCursos] = useState<AcademyCourse[]>([]);
  const [disciplinasPorCurso, setDisciplinasPorCurso] = useState<Record<string, AcademyModule[]>>({});
  const [matriculas, setMatriculas] = useState<UserAcademyProgress[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const [aba, setAba] = useState<Aba>('geral');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const carregar = async () => {
      try {
        const sessao = await authService.getActiveSession();
        const userId = sessao?.user.id;

        const [progs, crss, mats] = await Promise.all([
          academyService.getPrograms(),
          academyService.getCourses(),
          userId ? academyService.listUserEnrollments(userId) : Promise.resolve([]),
        ]);

        setProgramas(progs);
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
        onActionClick={() => navigate(`/academy/course/${c.id}`)}
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
            <article
              key={p.id}
              id={`program-card-${p.id}`}
              className="group flex w-full flex-col rounded-xl bg-white/60 p-4 transition-colors hover:bg-white"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/academy/program/${p.id}`)}
                  className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                    Programa
                  </p>
                  <h3 className="mt-0.5 font-serif text-base font-semibold leading-snug text-stone-900">
                    {p.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600">
                    {p.subtitle}
                  </p>
                  <p className="mt-2 text-[11px] text-stone-500">
                    {p.workloadHours} h · {p.pathIds.length} cursos
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/academy/program/${p.id}`)}
                  aria-label={`Abrir ${p.title}`}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors hover:bg-anil-800 hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
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
        title: 'Não foi possível carregar o Academy',
        message: 'Houve uma falha ao buscar o catálogo.',
        onRetry: () => window.location.reload(),
      }}
    >
      <PageLayout.Main>
        <div className="space-y-8">
          {/* Navegação da seção + filtro. Sem rótulo: a lupa e as abas se explicam. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Seções do Academy" className="flex items-center gap-1">
              {([
                ['geral', 'Visão geral'],
                ['cursos', 'Cursos'],
                ['programas', 'Programas'],
              ] as const).map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAba(id)}
                  aria-current={aba === id ? 'page' : undefined}
                  className={clsx(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    aba === id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  {rotulo}
                </button>
              ))}
            </nav>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:max-w-xs">
              <div className="flex w-full items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5">
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
                            navigate(`/academy/course/${a.curso!.id}?modulo=${a.disciplina!.id}`)
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
                      ? `/academy/course/${a.curso!.id}`
                      : `/academy/program/${a.programa!.id}`;
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
