import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Target, ShieldCheck, Music2 } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { academyService } from '../../../services/application/academy.service';
import { AcademyCourse, UserAcademyProgress } from '../../../domain/academy';
import { CourseCard } from '../../components/domain/CourseCard';
import { Carrossel } from '../../components/layout/Carrossel';

/**
 * A home do Conservatório, nas duas versões.
 *
 * **Visitante** — precisa saber o que é isto e decidir se cria conta. Recebe o
 * que a plataforma ensina, o que ela entrega, e o catálogo aberto.
 *
 * **Logado** — já decidiu. Recebe o próprio feed: onde parou, o que vem a
 * seguir, e o que aconteceu na plataforma desde a última visita.
 *
 * O FEED AINDA NÃO TEM CONTEÚDO, E ISSO ESTÁ DITO NA TELA
 * -------------------------------------------------------
 * A mistura entre feed do aluno e feed da plataforma depende de coisas que
 * ainda não existem: publicações da comunidade, eventos, marcos de outros
 * alunos. A estrutura está aqui e as seções vazias dizem o que vão receber —
 * em vez de encher a tela com cartão decorativo para parecer pronta.
 */
export const HomeScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId, carregando: carregandoSessao } = useCurrentUser();

  const [cursos, setCursos] = useState<AcademyCourse[]>([]);
  const [matriculas, setMatriculas] = useState<UserAcademyProgress[]>([]);
  const [disciplinas, setDisciplinas] = useState<Record<string, string[]>>({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    const carregar = async () => {
      const crss = await academyService.getCourses();
      if (!vivo) return;
      setCursos(crss);

      const mapa: Record<string, string[]> = {};
      await Promise.all(
        crss.map(async (c) => {
          mapa[c.id] = (await academyService.getModules(c.id)).map((m) => m.title);
        })
      );
      if (!vivo) return;
      setDisciplinas(mapa);

      if (userId) {
        const mats = await academyService.listUserEnrollments(userId);
        if (vivo) setMatriculas(mats);
      }
      if (vivo) setCarregando(false);
    };
    carregar();
    return () => {
      vivo = false;
    };
  }, [userId]);

  const cartao = (c: AcademyCourse) => {
    const m = matriculas.find((x) => x.courseId === c.id);
    return (
      <CourseCard
        key={c.id}
        id={`home-course-${c.id}`}
        title={c.title}
        description={c.subtitle || c.description}
        instructorName={c.authorName}
        level={c.level}
        durationHours={c.workloadHours}
        modulesCount={c.moduleIds.length}
        moduleTitles={disciplinas[c.id] ?? []}
        progressPercent={m?.progressPercentage}
        isEnrolled={Boolean(m)}
        onActionClick={() => navigate(`/academia/course/${c.id}`)}
      />
    );
  };

  if (carregandoSessao || carregando) {
    return (
      <PageLayout id="home" form="catalog" density="catalog" state="loading" loadingMessage="Carregando…">
        <PageLayout.Main>{null}</PageLayout.Main>
      </PageLayout>
    );
  }

  // ------------------------------------------------------------- VISITANTE --
  if (!userId) {
    return (
      <PageLayout id="home" form="presentation" density="editorial" state="content">
        <PageLayout.Hero>
          <div className="bg-anil-50">
            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
              <p className="font-mono text-[11px] uppercase tracking-wider text-anil-700">
                Conservatório Muscicapa
              </p>
              <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight text-anil-950 sm:text-4xl">
                Música estudada a sério, de graça, em português.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-700">
                Cinco cursos escritos e revisados internamente — teoria, três histórias e
                instrumento. Cada capítulo alterna leitura curta com laboratório sonoro, e termina
                com exercícios. A prática de instrumento é medida de verdade: afinação em cents,
                tempo em milissegundos.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/auth/register')}
                  className="rounded-md bg-anil-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-anil-700"
                >
                  Criar minha conta
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/academia')}
                  className="inline-flex items-center gap-1.5 rounded-md px-4 py-3 text-sm font-medium text-anil-800 ring-1 ring-anil-300 transition-colors hover:bg-white"
                >
                  Ver os cursos primeiro
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-5 flex items-center gap-1.5 text-xs text-stone-600">
                <ShieldCheck className="h-3.5 w-3.5 text-ouro-600" aria-hidden="true" />
                Cursos livres com certificação própria e código de verificação público. Sem
                reconhecimento do MEC.
              </p>
            </div>
          </div>
        </PageLayout.Hero>

        <PageLayout.Main>
          <div className="space-y-12">
            <section aria-labelledby="h-como">
              <h2 id="h-como" className="font-serif text-xl font-semibold text-stone-900">
                Como funciona
              </h2>
              <dl className="mt-5 grid gap-6 sm:grid-cols-3">
                <div>
                  <BookOpen className="h-5 w-5 text-anil-700" aria-hidden="true" />
                  <dt className="mt-2 text-sm font-medium text-stone-900">Você lê e ouve</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-stone-600">
                    Cada capítulo traz texto curto e laboratório: você ouve o intervalo, monta o
                    acorde, vê a escala na pauta. Ler sobre uma terça maior e ouvir uma terça maior
                    são coisas diferentes.
                  </dd>
                </div>
                <div>
                  <Target className="h-5 w-5 text-anil-700" aria-hidden="true" />
                  <dt className="mt-2 text-sm font-medium text-stone-900">Você pratica e é medido</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-stone-600">
                    O simulador escuta o que você toca e registra desvio de afinação e de tempo. É
                    diagnóstico, não nota: serve para descobrir onde você erra sempre.
                  </dd>
                </div>
                <div>
                  <ShieldCheck className="h-5 w-5 text-anil-700" aria-hidden="true" />
                  <dt className="mt-2 text-sm font-medium text-stone-900">Você recebe certificado</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-stone-600">
                    Com código público e hash criptográfico. Qualquer pessoa confere a autenticidade
                    sem precisar de conta.
                  </dd>
                </div>
              </dl>
            </section>

            <PageLayout.Section
              title="O que você pode estudar"
              description="Todos os cursos são abertos para ver antes de criar conta."
            >
              <Carrossel id="home-cursos" label="Cursos do Conservatório" porPagina={3}>
                {cursos.map(cartao)}
              </Carrossel>
            </PageLayout.Section>

            <section
              aria-labelledby="h-convite"
              className="rounded-xl bg-stone-50 p-6 text-center"
            >
              <Music2 className="mx-auto h-5 w-5 text-ouro-600" aria-hidden="true" />
              <h2 id="h-convite" className="mt-2 font-serif text-lg font-semibold text-stone-900">
                Criar conta é o que salva o seu progresso
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
                Sem conta você lê tudo. Com conta, a plataforma guarda onde você parou, o que você
                isCorrect e o que você precisa refazer.
              </p>
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="mt-4 rounded-md bg-anil-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-anil-700"
              >
                Criar minha conta
              </button>
            </section>
          </div>
        </PageLayout.Main>
      </PageLayout>
    );
  }

  // ----------------------------------------------------------------- FEED --
  const emCurso = matriculas.filter((m) => m.progressPercentage < 100);

  return (
    <PageLayout id="home" form="catalog" density="catalog" state="content">
      <PageLayout.Main>
        <div className="space-y-10">
          <PageLayout.Section
            title="Continuar"
            description="Onde você parou."
          >
            {emCurso.length === 0 ? (
              <p className="max-w-xl py-4 text-sm leading-relaxed text-stone-600">
                Você ainda não começou nenhum curso. Escolha um no catálogo — o progresso passa a
                ser registrado a partir da primeira lição.
              </p>
            ) : (
              <Carrossel id="home-continuar" label="Cursos em andamento" porPagina={2}>
                {emCurso
                  .map((m) => cursos.find((c) => c.id === m.courseId))
                  .filter((c): c is AcademyCourse => Boolean(c))
                  .map(cartao)}
              </Carrossel>
            )}
          </PageLayout.Section>

          <PageLayout.Section
            title="Do Conservatório"
            description="Cursos novos, obras acrescentadas ao acervo e avisos da instituição."
          >
            <p className="max-w-xl py-4 text-sm leading-relaxed text-stone-500">
              Nada publicado ainda. Esta seção recebe o que a instituição publica — curso novo,
              obra acrescentada ao acervo, aviso. Enquanto não houver publicação, ela fica vazia
              em vez de mostrar cartão decorativo.
            </p>
          </PageLayout.Section>

          <PageLayout.Section
            title="Da comunidade"
            description="O que outros alunos publicaram e discutiram."
          >
            <p className="max-w-xl py-4 text-sm leading-relaxed text-stone-500">
              Nada ainda. Esta seção mistura o que você segue com o que se discute na plataforma —
              e depende do fórum ter movimento.
            </p>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="text-sm font-medium text-anil-700 underline-offset-2 hover:underline"
            >
              Ir para a comunidade
            </button>
          </PageLayout.Section>

          <PageLayout.Section title="Explorar o catálogo">
            <Carrossel id="home-todos" label="Todos os cursos" porPagina={3}>
              {cursos.map(cartao)}
            </Carrossel>
          </PageLayout.Section>
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
