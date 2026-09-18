import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Star,
  Award,
  Clock,
  BarChart3,
  Layers,
  ShieldCheck,
  Languages,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter, useRouteParams } from '../../navigation/router';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  UserAcademyProgress,
} from '../../../domain/academy';
import {
  AvaliacaoDeCurso,
  resumirAvaliacoes,
  percentuais,
  nomeExibido,
  Estrelas as NotaEstrelas,
} from '../../../domain/reviews';
import { reviewsRepository, montarAvaliacao } from '../../../repositories/reviews.repository';
import { Estrelas } from '../../components/academy/Estrelas';
import { FormularioDeAvaliacao } from '../../components/academy/FormularioDeAvaliacao';
import { CarrosselDeDepoimentos } from '../../components/academy/CarrosselDeDepoimentos';
import { User } from '../../../domain/types';

type Secao = 'sobre' | 'resultados' | 'disciplinas' | 'depoimentos' | 'avaliacoes';

const SECOES: { id: Secao; label: string }[] = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'resultados', label: 'Resultados' },
  { id: 'disciplinas', label: 'Disciplinas' },
  { id: 'depoimentos', label: 'Depoimentos' },
  { id: 'avaliacoes', label: 'Avaliações' },
];

/** Filtro da lista de avaliações. */
type FiltroDeNota = 'todas' | '5' | '4' | '3' | '2' | '1';

/**
 * A página de apresentação do curso.
 *
 * É a vitrine: quem chega aqui ainda não se matriculou e precisa decidir. A
 * ordem responde às perguntas na ordem em que elas aparecem — o que é isto,
 * quanto custa de tempo, o que vou aprender, quais disciplinas, e o que dizem
 * quem fez.
 *
 * As avaliações são reais ou não existem. Um catálogo novo não tem nota, e
 * dizer isso é mais útil que inventar 4,8 estrelas.
 */
export const CoursePresentationScreen: React.FC = () => {
  const { navigate } = useRouter();
  const params = useRouteParams();
  const courseId = params.courseId ?? params.id ?? '';

  const [curso, setCurso] = useState<AcademyCourse | null>(null);
  const [modulos, setModulos] = useState<AcademyModule[]>([]);
  const [licoesPorModulo, setLicoes] = useState<Record<string, AcademyLesson[]>>({});
  const [progresso, setProgresso] = useState<UserAcademyProgress | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDeCurso[]>([]);
  const [minhaAvaliacao, setMinhaAvaliacao] = useState<AvaliacaoDeCurso | null>(null);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [filtroDeNota, setFiltroDeNota] = useState<FiltroDeNota>('todas');
  const [carregando, setCarregando] = useState(true);
  const [secao, setSecao] = useState<Secao>('sobre');
  const [expandida, setExpandida] = useState<string | null>(null);
  const [fixo, setFixo] = useState(false);

  const alvoDoHero = useRef<HTMLDivElement>(null);

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

      const mapa: Record<string, AcademyLesson[]> = {};
      await Promise.all(
        mods.map(async (m) => {
          mapa[m.id] = await academyService.getLessons(m.id);
        })
      );
      if (!vivo) return;
      setLicoes(mapa);

      const avals = await reviewsRepository.listarPorCurso(c.id);
      if (!vivo) return;
      setAvaliacoes(avals);

      const sessao = await authService.getActiveSession();
      if (sessao && vivo) {
        setUsuario(sessao.user);
        setProgresso(await academyService.getUserProgress(sessao.user.id, c.id));
        setMinhaAvaliacao(await reviewsRepository.doUsuario(sessao.user.id, c.id));
      }
      if (vivo) setCarregando(false);
    };
    carregar();
    return () => {
      vivo = false;
    };
  }, [courseId]);

  // A barra de seções gruda no topo quando o hero sai da tela.
  useEffect(() => {
    const alvo = alvoDoHero.current;
    if (!alvo || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(([e]) => setFixo(!e.isIntersecting), { threshold: 0 });
    obs.observe(alvo);
    return () => obs.disconnect();
  }, [carregando]);

  const resumo = useMemo(() => resumirAvaliacoes(avaliacoes), [avaliacoes]);
  const pct = useMemo(() => percentuais(resumo), [resumo]);

  // Esqueleto e erro vêm do PageLayout, não de um parágrafo solto.
  if (carregando || !curso) {
    return (
      <PageLayout
        id="course-presentation"
        form="presentation"
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

  const matriculado = Boolean(progresso);
  const totalLicoes = Object.values(licoesPorModulo).flat().length;
  const semanas = Math.max(1, Math.round(curso.workloadHours / 5));

  const entrar = async () => {
    if (matriculado) {
      navigate(`/academy/course/${curso.id}/aprender`);
      return;
    }
    const sessao = await authService.getActiveSession();
    if (!sessao) {
      navigate('/auth/login');
      return;
    }
    await academyService.enrollCourse(sessao.user.id, curso.id);
    navigate(`/academy/course/${curso.id}/aprender`);
  };

  const rotuloDoBotao = matriculado ? 'Continuar o curso' : 'Ir para o curso';

  const concluiu = (progresso?.progressPercentage ?? 0) >= 100;

  /** Depoimentos em destaque: as avaliações com texto mais substancial. */
  const depoimentos = [...avaliacoes]
    .filter((a) => a.comentario.length >= 80)
    .sort((a, b) => b.estrelas - a.estrelas || b.comentario.length - a.comentario.length)
    .slice(0, 6);

  const listaFiltrada =
    filtroDeNota === 'todas'
      ? avaliacoes
      : avaliacoes.filter((a) => String(a.estrelas) === filtroDeNota);

  const enviarAvaliacao = async (dados: {
    estrelas: NotaEstrelas;
    comentario: string;
    anonima: boolean;
  }) => {
    if (!usuario) {
      navigate('/auth/login');
      return;
    }
    const nova = montarAvaliacao({
      userId: usuario.id,
      courseId: curso.id,
      autor: usuario.name,
      anonima: dados.anonima,
      estrelas: dados.estrelas,
      comentario: dados.comentario,
      concluiuOCurso: concluiu,
    });
    await reviewsRepository.salvar(nova);
    setAvaliacoes(await reviewsRepository.listarPorCurso(curso.id));
    setMinhaAvaliacao(nova);
  };

  return (
    <PageLayout id="course-presentation" form="presentation" density="editorial" state="content">
      <PageLayout.Hero>
        <div className="bg-anil-50">
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-wider text-anil-700">
            {curso.categoryName}
          </p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl font-bold leading-tight text-anil-950 sm:text-4xl">
            {curso.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-700">
            {curso.subtitle}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600">
            {curso.description}
          </p>

          <p className="mt-5 text-sm text-stone-600">
            <span className="text-stone-500">Cátedra:</span>{' '}
            <span className="font-medium text-stone-900">{curso.authorTitle}</span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={entrar}
              className="rounded-md bg-anil-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-anil-700"
            >
              {rotuloDoBotao}
            </button>
            {matriculado && (
              <span className="text-sm text-stone-600">
                Matriculada · {progresso?.progressPercentage ?? 0}% concluído
              </span>
            )}
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-stone-600">
            <ShieldCheck className="h-3.5 w-3.5 text-ouro-600" aria-hidden="true" />
            Curso livre com certificação própria do Conservatório. Sem reconhecimento do MEC.
          </p>
        </div>
      </div>

      {/* Cartão de métricas, montado sobre o hero */}
      <div className="mx-auto -mt-16 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-stone-200 shadow-sm lg:grid-cols-4">
          <div className="bg-white p-5">
            <Layers className="h-4 w-4 text-anil-700" aria-hidden="true" />
            <p className="mt-2 text-lg font-semibold text-stone-900">
              {modulos.length} disciplinas
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
              {totalLicoes} lições ao todo
            </p>
          </div>

          <div className="bg-white p-5">
            <Star className="h-4 w-4 text-ouro-600" aria-hidden="true" />
            <p className="mt-2 text-lg font-semibold text-stone-900">
              {resumo.media !== null ? resumo.media.toFixed(1) : 'Sem notas'}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
              {resumo.total > 0
                ? `${resumo.total} avaliaç${resumo.total > 1 ? 'ões' : 'ão'} de alunos`
                : 'Nenhum aluno avaliou ainda'}
            </p>
          </div>

          <div className="bg-white p-5">
            <BarChart3 className="h-4 w-4 text-anil-700" aria-hidden="true" />
            <p className="mt-2 text-lg font-semibold capitalize text-stone-900">
              Nível {curso.level.toLowerCase()}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
              {curso.prerequisites.length > 0
                ? `${curso.prerequisites.length} pré-requisito(s)`
                : 'Sem pré-requisitos'}
            </p>
          </div>

          <div className="bg-white p-5">
            <Clock className="h-4 w-4 text-anil-700" aria-hidden="true" />
            <p className="mt-2 text-lg font-semibold text-stone-900">Ritmo livre</p>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
              {curso.workloadHours} h · cerca de {semanas} semanas a 5 h por semana
            </p>
          </div>
        </div>
      </div>

        <div ref={alvoDoHero} aria-hidden="true" className="h-px" />
      </PageLayout.Hero>

      {/* Barra de seções: o PageLayout a gruda no topo; o conteúdo dela muda
          conforme o cabeçalho sai da tela. */}
      <PageLayout.Toolbar>
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {fixo && (
            <span className="hidden min-w-0 flex-1 truncate py-3 font-serif text-sm font-semibold text-stone-900 lg:block">
              {curso.title}
            </span>
          )}

          <nav aria-label="Seções desta página" className="flex flex-1 gap-1 overflow-x-auto lg:flex-none">
            {SECOES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSecao(s.id)}
                aria-current={secao === s.id ? 'true' : undefined}
                className={clsx(
                  'shrink-0 border-b-2 px-3 py-3.5 text-sm transition-colors',
                  secao === s.id
                    ? 'border-anil-800 font-semibold text-anil-900'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {fixo && (
            <button
              type="button"
              onClick={entrar}
              className="hidden shrink-0 rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700 lg:block"
            >
              {rotuloDoBotao}
            </button>
          )}
        </div>
      </PageLayout.Toolbar>

      <PageLayout.Main>
        {secao === 'sobre' && (
          <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
            <div className="space-y-10">
              <section aria-labelledby="h-aprender">
                <h2 id="h-aprender" className="font-serif text-xl font-semibold text-stone-900">
                  O que você vai aprender
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {curso.objectives.map((o, i) => (
                    <li key={i} className="flex gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-relaxed text-stone-700">{o}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="h-competencias">
                <h2 id="h-competencias" className="font-serif text-xl font-semibold text-stone-900">
                  Competências que você terá
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {curso.competencies.map((c) => (
                    <li
                      key={c}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="h-saber">
                <h2 id="h-saber" className="font-serif text-xl font-semibold text-stone-900">
                  Informações a saber
                </h2>
                <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div className="flex gap-3">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-anil-700" aria-hidden="true" />
                    <div>
                      <dt className="text-sm font-medium text-stone-900">
                        Certificado verificável
                      </dt>
                      <dd className="mt-0.5 text-xs leading-relaxed text-stone-600">
                        Com código público e hash criptográfico. Curso livre, certificação própria.
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Languages
                      className="mt-0.5 h-4 w-4 shrink-0 text-anil-700"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="text-sm font-medium text-stone-900">Em português</dt>
                      <dd className="mt-0.5 text-xs leading-relaxed text-stone-600">
                        Conteúdo escrito e revisado internamente, sem tradução automática.
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-anil-700" aria-hidden="true" />
                    <div>
                      <dt className="text-sm font-medium text-stone-900">Ritmo livre</dt>
                      <dd className="mt-0.5 text-xs leading-relaxed text-stone-600">
                        Sem prazo de conclusão. O progresso fica salvo.
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Layers className="mt-0.5 h-4 w-4 shrink-0 text-anil-700" aria-hidden="true" />
                    <div>
                      <dt className="text-sm font-medium text-stone-900">Avaliação</dt>
                      <dd className="mt-0.5 text-xs leading-relaxed text-stone-600">
                        {curso.assessmentPolicy}
                      </dd>
                    </div>
                  </div>
                </dl>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-xl bg-stone-50 p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Oferecido por
                </p>
                <p className="mt-2 font-serif text-sm font-semibold text-stone-900">
                  {curso.authorName}
                </p>
                <p className="mt-0.5 text-xs text-stone-600">{curso.authorTitle}</p>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">{curso.authorBio}</p>
              </div>

              {curso.prerequisites.length > 0 && (
                <div className="rounded-xl bg-stone-50 p-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                    Pré-requisitos
                  </p>
                  <ul className="mt-2 space-y-1">
                    {curso.prerequisites.map((p, i) => (
                      <li key={i} className="text-xs text-stone-700">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        )}

        {secao === 'resultados' && (
          <div className="max-w-3xl space-y-8">
            <section aria-labelledby="h-certificado">
              <h2 id="h-certificado" className="font-serif text-xl font-semibold text-stone-900">
                O certificado
              </h2>
              <div className="mt-4 rounded-xl bg-stone-50 p-5">
                <p className="font-serif text-base font-semibold text-stone-900">
                  {curso.certificateInfo?.title ?? 'Certificado de conclusão'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  {curso.certificateInfo?.criteria ?? curso.certificatePolicy}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-stone-600">
                  {curso.certificateInfo?.accreditation}
                </p>
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-600">
                  <ShieldCheck
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ouro-600"
                    aria-hidden="true"
                  />
                  Cada certificado recebe um código de verificação público e um hash SHA-256 sobre
                  o conteúdo. Qualquer pessoa pode conferir a autenticidade sem precisar de conta.
                </p>
              </div>
            </section>

            <section aria-labelledby="h-competencia-detalhe">
              <h2
                id="h-competencia-detalhe"
                className="font-serif text-xl font-semibold text-stone-900"
              >
                Competências certificadas
              </h2>
              <ul className="mt-4 space-y-2">
                {curso.competencies.map((c) => (
                  <li key={c} className="flex gap-2.5 text-sm text-stone-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {secao === 'disciplinas' && (
          <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                {modulos.length} disciplinas · {curso.workloadHours} h
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
                {curso.curriculumSummary}
              </p>

              <ul className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
                {modulos.map((m, i) => {
                  const licoes = licoesPorModulo[m.id] ?? [];
                  const minutos = licoes.reduce((a, l) => a + l.durationMinutes, 0);
                  const aberta = expandida === m.id;

                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setExpandida(aberta ? null : m.id)}
                        aria-expanded={aberta}
                        className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-stone-50"
                      >
                        <span className="w-8 shrink-0 text-center font-mono text-xs text-stone-400">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-stone-900">
                            {m.title}
                          </span>
                          <span className="block text-xs text-stone-500">
                            {licoes.length} {licoes.length === 1 ? 'lição' : 'lições'} · {minutos}{' '}
                            min
                          </span>
                        </span>
                        <ChevronDown
                          className={clsx(
                            'h-4 w-4 shrink-0 text-stone-400 transition-transform',
                            aberta && 'rotate-180'
                          )}
                        />
                      </button>

                      {aberta && (
                        <div className="pb-5 pl-12 pr-4">
                          <p className="text-sm leading-relaxed text-stone-600">{m.description}</p>

                          {m.objectives.length > 0 && (
                            <>
                              <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                                Você vai conseguir
                              </p>
                              <ul className="mt-1.5 space-y-1">
                                {m.objectives.map((o, j) => (
                                  <li key={j} className="flex gap-2 text-sm text-stone-700">
                                    <Check
                                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                                      aria-hidden="true"
                                    />
                                    {o}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside>
              <div className="sticky top-32 rounded-xl bg-stone-50 p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                  Resumo
                </p>
                <dl className="mt-2 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-stone-600">Disciplinas</dt>
                    <dd className="font-medium tabular-nums text-stone-900">{modulos.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-600">Lições</dt>
                    <dd className="font-medium tabular-nums text-stone-900">{totalLicoes}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone-600">Carga</dt>
                    <dd className="font-medium tabular-nums text-stone-900">
                      {curso.workloadHours} h
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={entrar}
                  className="mt-4 w-full rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700"
                >
                  {rotuloDoBotao}
                </button>
              </div>
            </aside>
          </div>
        )}

        {secao === 'depoimentos' && (
          <div className="max-w-3xl">
            <CarrosselDeDepoimentos
              depoimentos={depoimentos}
              titulo={`Quem fez ${curso.title}`}
            />
          </div>
        )}

        {secao === 'avaliacoes' && (
          <div className="max-w-3xl space-y-8" id="avaliacoes">
            <section aria-labelledby="h-resumo-notas">
              <h2 id="h-resumo-notas" className="font-serif text-xl font-semibold text-stone-900">
                Avaliações de quem fez o curso
              </h2>

              {resumo.total === 0 ? (
                <div className="mt-4 rounded-xl bg-stone-50 p-6">
                  <Estrelas valor={null} tamanho="lg" />
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">
                    Nenhuma avaliação ainda. A nota aparece quando os primeiros alunos concluírem
                    o curso e avaliarem.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-stone-500">
                    O Conservatório não publica nota de curso sem aluno. Uma média inventada seria
                    propaganda, e você não teria como saber a diferença.
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-start gap-8">
                  <div>
                    <p className="font-serif text-4xl font-bold tabular-nums text-stone-900">
                      {resumo.media?.toFixed(1)}
                    </p>
                    <Estrelas valor={resumo.media} />
                    <p className="mt-1 text-xs text-stone-500">
                      {resumo.total} avaliaç{resumo.total > 1 ? 'ões' : 'ão'}
                    </p>
                  </div>

                  <dl className="min-w-[14rem] flex-1 space-y-1">
                    {([5, 4, 3, 2, 1] as NotaEstrelas[]).map((n) => (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <dt className="w-8 shrink-0 text-stone-500">{n}★</dt>
                        <dd className="flex flex-1 items-center gap-2">
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                            <span
                              className="block h-full bg-ouro-500"
                              style={{ width: `${pct[n]}%` }}
                            />
                          </span>
                          <span className="w-9 shrink-0 tabular-nums text-stone-500">
                            {pct[n]}%
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>

            <section aria-labelledby="h-avaliar">
              <h2 id="h-avaliar" className="font-serif text-base font-semibold text-stone-900">
                {minhaAvaliacao ? 'Sua avaliação' : 'Avaliar este curso'}
              </h2>
              <div className="mt-3">
                {usuario ? (
                  <FormularioDeAvaliacao
                    concluiuOCurso={concluiu}
                    jaAvaliou={Boolean(minhaAvaliacao)}
                    valorInicial={
                      minhaAvaliacao
                        ? {
                            estrelas: minhaAvaliacao.estrelas,
                            comentario: minhaAvaliacao.comentario,
                            anonima: minhaAvaliacao.anonima,
                          }
                        : undefined
                    }
                    onEnviar={enviarAvaliacao}
                  />
                ) : (
                  <p className="text-sm text-stone-600">
                    <button
                      type="button"
                      onClick={() => navigate('/auth/login')}
                      className="font-medium text-anil-700 underline-offset-2 hover:underline"
                    >
                      Entre na sua conta
                    </button>{' '}
                    para avaliar cursos que você concluiu.
                  </p>
                )}
              </div>
            </section>

            {resumo.total > 0 && (
              <section aria-labelledby="h-lista-avaliacoes">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2
                    id="h-lista-avaliacoes"
                    className="font-serif text-base font-semibold text-stone-900"
                  >
                    O que os alunos escreveram
                  </h2>

                  <label className="flex items-center gap-2 text-xs text-stone-600">
                    Filtrar
                    <select
                      value={filtroDeNota}
                      onChange={(e) => setFiltroDeNota(e.target.value as FiltroDeNota)}
                      className="rounded-md border border-stone-300 bg-white px-2 py-1 text-xs text-stone-900 outline-none focus:border-anil-700 focus:ring-1 focus:ring-anil-700"
                    >
                      <option value="todas">Todas as notas</option>
                      {([5, 4, 3, 2, 1] as NotaEstrelas[]).map((n) => (
                        <option key={n} value={String(n)}>
                          {n} estrela{n > 1 ? 's' : ''} ({resumo.distribuicao[n]})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {listaFiltrada.length === 0 ? (
                  <p className="mt-4 text-sm text-stone-600">
                    Nenhuma avaliação com essa nota.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-stone-200 border-t border-stone-200">
                    {listaFiltrada.map((a) => (
                      <li key={a.id} className="py-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Estrelas valor={a.estrelas} tamanho="sm" />
                          <span className="text-xs text-stone-500">
                            {new Date(a.criadaEm).toLocaleDateString('pt-BR')}
                          </span>
                          {a.concluiuOCurso && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              concluiu o curso
                            </span>
                          )}
                          {usuario && a.userId === usuario.id && (
                            <span className="rounded-full bg-anil-50 px-2 py-0.5 text-[10px] font-medium text-anil-800">
                              sua avaliação
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-stone-700">
                          {a.comentario}
                        </p>
                        <p className="mt-1.5 text-xs text-stone-500">{nomeExibido(a)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        )}
      </PageLayout.Main>
    </PageLayout>
  );
};
