import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, PanelLeftOpen } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter, useRouteParams } from '../../navigation/router';
import { CursoSidebar } from '../../components/academy/CursoSidebar';
import { LessonBlockRenderer } from '../../components/academy/LessonBlocks';
import { BlockEditor } from '../../components/academy/BlockEditor';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { editorialRepository } from '../../../repositories/editorial.repository';
import { EditorialEdit, editId } from '../../../domain/editorial-edit';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  UserAcademyProgress,
} from '../../../domain/academy';

/**
 * A lição, em tela-teatro.
 *
 * Menu lateral fixo à esquerda, rolando pelas lições da disciplina, e o
 * conteúdo ocupando o centro numa coluna larga de leitura. Sem trilho direito,
 * sem cartões laterais: durante a aula, o que importa é a aula.
 *
 * O menu pode ser fechado, e então o texto ocupa a tela inteira.
 */
export const LessonTheaterScreen: React.FC = () => {
  const { navigate } = useRouter();
  const params = useRouteParams();
  const lessonId = params.lessonId ?? params.id ?? '';

  const [licao, setLicao] = useState<AcademyLesson | null>(null);
  const [curso, setCurso] = useState<AcademyCourse | null>(null);
  const [modulos, setModulos] = useState<AcademyModule[]>([]);
  const [licoesPorModulo, setLicoes] = useState<Record<string, AcademyLesson[]>>({});
  const [progresso, setProgresso] = useState<UserAcademyProgress | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(true);
  const [salvando, setSalvando] = useState(false);

  /**
   * Correção de conteúdo, feita na própria leitura.
   *
   * Quem revisa encontra o erro LENDO. Obrigá-lo a sair da lição, achar o
   * capítulo numa lista e achar o bloco dentro dele é fricção que faz a
   * correção não acontecer — e é chance de corrigir o parágrafo errado.
   *
   * `ehAdmin` vem da sessão assinada pelo servidor. Não há decisão de
   * privilégio nesta tela.
   */
  const { ehAdmin, nome: nomeDoEditor } = useCurrentUser();
  const [edicoes, setEdicoes] = useState<EditorialEdit[]>([]);

  const recarregarEdicoes = React.useCallback(async () => {
    if (!lessonId) return;
    setEdicoes(await editorialRepository.daLicao(lessonId));
  }, [lessonId]);

  useEffect(() => {
    recarregarEdicoes().catch(() => setEdicoes([]));
  }, [recarregarEdicoes]);

  /**
   * Depois de salvar, a lição é relida do repositório.
   *
   * É o que garante que o que aparece na tela seja o resultado da camada
   * aplicada — e não o rascunho que o editor tinha em mãos. Se os dois
   * divergissem, o editor veria a correção e o aluno não.
   */
  const salvarCorrecao = async (edicao: EditorialEdit) => {
    await editorialRepository.salvar(edicao);
    await recarregarEdicoes();
    const atualizada = await academyService.getLesson(lessonId);
    if (atualizada) setLicao(atualizada);
  };

  const reverterCorrecao = async (id: string) => {
    await editorialRepository.reverter(id);
    await recarregarEdicoes();
    const atualizada = await academyService.getLesson(lessonId);
    if (atualizada) setLicao(atualizada);
  };

  useEffect(() => {
    let vivo = true;

    const carregar = async () => {
      setCarregando(true);
      const l = await academyService.getLesson(lessonId);
      if (!vivo || !l) {
        setCarregando(false);
        return;
      }
      setLicao(l);

      const c = await academyService.getCourse(l.courseId);
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

      const sessao = await authService.getActiveSession();
      if (sessao && vivo) {
        setProgresso(await academyService.getUserProgress(sessao.user.id, c.id));
      }
      if (vivo) setCarregando(false);
    };

    carregar();
    return () => {
      vivo = false;
    };
  }, [lessonId]);

  // Enquanto nao ha dado, quem desenha o esqueleto e o estado de erro e o
  // proprio PageLayout — nao um paragrafo solto de "carregando".
  if (carregando || !licao || !curso) {
    return (
      <PageLayout
        id="lesson-theater"
        form="course"
        density="editorial"
        state={carregando ? 'loading' : 'error'}
        loadingMessage="Carregando a lição…"
        errorProps={{
          title: 'Lição não encontrada',
          message: 'Verifique o endereço ou volte ao catálogo.',
          onRetry: () => navigate('/academia'),
        }}
      >
        <PageLayout.Main>{null}</PageLayout.Main>
      </PageLayout>
    );
  }

  // A ordem plana das lições do curso é o que define anterior e próxima.
  const sequencia = modulos.flatMap((m) => licoesPorModulo[m.id] ?? []);
  const indice = sequencia.findIndex((l) => l.id === licao.id);
  const anterior = indice > 0 ? sequencia[indice - 1] : null;
  const proxima = indice >= 0 && indice < sequencia.length - 1 ? sequencia[indice + 1] : null;

  const feitas = new Set(progresso?.completedLessonIds ?? []);
  const jaConcluida = feitas.has(licao.id);
  const conteudo = licao.variants.TRADITIONAL;
  const moduloAtual = modulos.find((m) => m.id === licao.moduleId);

  const concluir = async () => {
    const sessao = await authService.getActiveSession();
    if (!sessao) {
      navigate('/auth/login');
      return;
    }
    setSalvando(true);
    try {
      setProgresso(await academyService.completeLesson(sessao.user.id, licao.id));
      if (proxima) navigate(`/academia/lesson/${proxima.id}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <PageLayout id="lesson-theater" form="course" density="editorial" state="content">
      {menuAberto && (
        <PageLayout.Panel>
          <CursoSidebar
            id="lesson-sidebar"
            curso={curso}
            modulos={modulos}
            licoesPorModulo={licoesPorModulo}
            concluidas={progresso?.completedLessonIds ?? []}
            licaoAtual={licao.id}
            moduloAberto={licao.moduleId}
            onFechar={() => setMenuAberto(false)}
          />
        </PageLayout.Panel>
      )}

      <PageLayout.Main>
        {/* Sem trilho à direita: durante a aula, o que importa é a aula. */}
        <div className="mx-auto max-w-3xl py-2 sm:py-4">
          {!menuAberto && (
            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              className="mb-6 hidden items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 lg:inline-flex"
            >
              <PanelLeftOpen className="h-4 w-4" />
              Mostrar o conteúdo do curso
            </button>
          )}

          <header className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
              {moduloAtual?.title ?? curso.title}
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-900 sm:text-3xl">
              {conteudo.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{conteudo.summary}</p>
            <p className="mt-2 text-xs text-stone-500">
              Lição · {licao.durationMinutes} min
              {jaConcluida && ' · concluída'}
            </p>
          </header>

          {licao.objectives.length > 0 && (
            <section
              aria-labelledby="objetivos"
              className="mb-8 rounded-xl bg-stone-50 p-5"
            >
              <h2
                id="objetivos"
                className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500"
              >
                Ao fim desta lição você será capaz de
              </h2>
              <ul className="mt-2 space-y-1.5">
                {licao.objectives.map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-stone-700">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="space-y-6">
            {conteudo.sections.map((s) => (
              <section key={s.id} className="space-y-6">
                {(s.blocks ?? []).map((b) => {
                  const renderizado = <LessonBlockRenderer key={b.id} block={b} />;
                  if (!ehAdmin) return renderizado;

                  const alvo = {
                    tipo: 'BLOCO' as const,
                    variante: 'TRADITIONAL' as const,
                    secaoId: s.id,
                    blocoId: b.id,
                  };
                  const id = editId(licao.id, alvo);
                  const edicao = edicoes.find((e) => e.id === id);

                  return (
                    <BlockEditor
                      key={b.id}
                      lessonId={licao.id}
                      alvo={alvo}
                      bloco={b}
                      publicado={
                        edicao && typeof edicao.anterior !== 'string' ? edicao.anterior : b
                      }
                      editado={Boolean(edicao)}
                      editadaPor={nomeDoEditor ?? 'Edição do Conservatório'}
                      onSalvar={salvarCorrecao}
                      onReverter={reverterCorrecao}
                    >
                      {renderizado}
                    </BlockEditor>
                  );
                })}
              </section>
            ))}
          </div>

          <nav
            aria-label="Navegação entre lições"
            className="mt-12 flex items-center justify-between gap-3 border-t border-stone-200 pt-6"
          >
            {anterior ? (
              <button
                type="button"
                onClick={() => navigate(`/academia/lesson/${anterior.id}`)}
                className="inline-flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">{anterior.variants.TRADITIONAL.title}</span>
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={concluir}
              disabled={salvando}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700 disabled:opacity-60"
            >
              {jaConcluida ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {proxima ? 'Ir para a próxima' : 'Concluída'}
                </>
              ) : (
                <>
                  {salvando ? 'Salvando…' : 'Concluir lição'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </nav>
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
