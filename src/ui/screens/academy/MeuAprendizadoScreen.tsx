import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Award, Lock } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { ProgressBar } from '../../components/data-display/Progress';
import {
  AcademyCourse,
  UserAcademyProgress,
  AcademicCertificateRecord,
} from '../../../domain/academy';
import { User } from '../../../domain/types';

type Aba = 'andamento' | 'concluido' | 'competencias' | 'certificados';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'andamento', label: 'Em andamento' },
  { id: 'concluido', label: 'Concluído' },
  { id: 'competencias', label: 'Competências' },
  { id: 'certificados', label: 'Certificados' },
];

function saudacao(hora: number): string {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Meu aprendizado.
 *
 * O que o aluno já fez na plataforma, em quatro abas: o que está em curso, o
 * que terminou, em que competências progrediu e quais certificados tem.
 *
 * Nenhuma delas inventa conteúdo quando está vazia. "Nenhum certificado ainda"
 * é uma informação; um cartão cinza de certificado fictício não é.
 */
export const MeuAprendizadoScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [usuario, setUsuario] = useState<User | null>(null);
  const [cursos, setCursos] = useState<AcademyCourse[]>([]);
  const [matriculas, setMatriculas] = useState<UserAcademyProgress[]>([]);
  const [certificados, setCertificados] = useState<AcademicCertificateRecord[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<Aba>('andamento');

  useEffect(() => {
    let vivo = true;
    const carregar = async () => {
      const sessao = await authService.getActiveSession();
      if (!vivo) return;

      if (!sessao) {
        setCarregando(false);
        return;
      }
      setUsuario(sessao.user);

      const [crs, mats, certs] = await Promise.all([
        academyService.getCourses(),
        academyService.listUserEnrollments(sessao.user.id),
        academyService.listUserCertificates(sessao.user.id),
      ]);

      if (!vivo) return;
      setCursos(crs);
      setMatriculas(mats);
      setCertificados(certs);
      setCarregando(false);
    };
    carregar();
    return () => {
      vivo = false;
    };
  }, []);

  const porId = useMemo(() => new Map(cursos.map((c) => [c.id, c])), [cursos]);

  const emAndamento = matriculas.filter((m) => m.progressPercentage < 100);
  const concluidos = matriculas.filter((m) => m.progressPercentage >= 100);

  /**
   * Progresso por competência: quantas lições que ensinam aquela competência
   * já foram concluídas. Não é XP arbitrário — é contagem do que foi feito.
   */
  const competencias = useMemo(() => {
    const mapa = new Map<string, { feitas: number; total: number }>();
    for (const m of matriculas) {
      const c = porId.get(m.courseId);
      if (!c) continue;
      const feitas = m.completedLessonIds.length;
      const total = c.moduleIds.length;
      for (const comp of c.competencies) {
        const atual = mapa.get(comp) ?? { feitas: 0, total: 0 };
        mapa.set(comp, { feitas: atual.feitas + feitas, total: atual.total + total });
      }
    }
    return [...mapa.entries()].sort((a, b) => b[1].feitas - a[1].feitas);
  }, [matriculas, porId]);

  if (carregando || !usuario) {
    return (
      <PageLayout
        id="meu-aprendizado"
        form="catalog"
        density="catalog"
        state={carregando ? 'loading' : 'empty'}
        loadingMessage="Carregando seu aprendizado…"
        emptyProps={{
          title: 'Entre na sua conta',
          description:
            'Seus cursos, competências e certificados aparecem aqui depois que você entra.',
          actionLabel: 'Entrar',
          onAction: () => navigate('/auth/login'),
        }}
      >
        <PageLayout.Main>{null}</PageLayout.Main>
      </PageLayout>
    );
  }

  const vazio = (texto: string, acao?: { label: string; path: string }) => (
    <div className="py-16 text-center">
      <p className="mx-auto max-w-md text-sm leading-relaxed text-stone-600">{texto}</p>
      {acao && (
        <button
          type="button"
          onClick={() => navigate(acao.path)}
          className="mt-4 rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700"
        >
          {acao.label}
        </button>
      )}
    </div>
  );

  return (
    <PageLayout id="meu-aprendizado" form="catalog" density="catalog" state="content">
      <PageLayout.Hero>
        <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-anil-800 text-base font-semibold text-white">
          {usuario.avatarUrl ? (
            <img src={usuario.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            usuario.name.charAt(0).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <h1 className="font-serif text-xl font-bold text-stone-900">
            {saudacao(new Date().getHours())}, {usuario.name.split(' ')[0]}
          </h1>
          <p className="mt-0.5 text-sm text-stone-600">
            {matriculas.length === 0
              ? 'Você ainda não tem matrículas.'
              : `${emAndamento.length} em andamento · ${concluidos.length} concluído${concluidos.length === 1 ? '' : 's'}`}
          </p>
        </div>
        </div>
      </PageLayout.Hero>

      <PageLayout.Tabs
        id="meu-aprendizado-abas"
        activeTab={aba}
        onChange={(t) => setAba(t as Aba)}
        tabs={ABAS.map((a) => ({
          id: a.id,
          label: a.label,
          badge:
            a.id === 'andamento'
              ? emAndamento.length || undefined
              : a.id === 'concluido'
                ? concluidos.length || undefined
                : a.id === 'certificados'
                  ? certificados.length || undefined
                  : undefined,
        }))}
      />

      <PageLayout.Main>
        {aba === 'andamento' &&
          (emAndamento.length === 0
            ? vazio(
                'Nada em andamento. Escolha um curso no catálogo — o progresso passa a ser registrado a partir da primeira lição.',
                { label: 'Ver cursos', path: '/academy' }
              )
            : (
              <ul className="space-y-3">
                {emAndamento.map((m) => {
                  const c = porId.get(m.courseId);
                  if (!c) return null;
                  return (
                    <li key={m.courseId}>
                      <button
                        type="button"
                        onClick={() => navigate(`/academy/course/${c.id}/aprender`)}
                        className="flex w-full items-center gap-4 rounded-xl p-4 text-left ring-1 ring-stone-200 transition-colors hover:bg-stone-50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-base font-semibold text-stone-900">
                            {c.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-stone-500">
                            {m.completedLessonIds.length} de {c.moduleIds.length} disciplinas ·{' '}
                            {c.workloadHours} h
                          </span>
                          <span className="mt-2 block">
                            <ProgressBar
                              id={`prog-${c.id}`}
                              value={m.progressPercentage}
                              sizeVariant="sm"
                              showValueLabel
                              label="Progresso"
                            />
                          </span>
                        </span>
                        <ChevronRight className="h-5 w-5 shrink-0 text-stone-400" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}

        {aba === 'concluido' &&
          (concluidos.length === 0
            ? vazio('Nenhum curso concluído ainda.')
            : (
              <ul className="space-y-3">
                {concluidos.map((m) => {
                  const c = porId.get(m.courseId);
                  if (!c) return null;
                  return (
                    <li
                      key={m.courseId}
                      className="flex items-center gap-4 rounded-xl p-4 ring-1 ring-stone-200"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-base font-semibold text-stone-900">
                          {c.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-stone-500">
                          Concluído
                          {m.completedAt &&
                            ` em ${new Date(m.completedAt).toLocaleDateString('pt-BR')}`}
                          {' · '}
                          {c.moduleIds.length} disciplinas
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/academy/completion/${c.id}`)}
                        className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-anil-700 transition-colors hover:bg-anil-50"
                      >
                        Certificado
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}

        {aba === 'competencias' &&
          (competencias.length === 0
            ? vazio(
                'As competências aparecem conforme você conclui lições. Cada curso declara o que ensina, e o progresso é a contagem do que você fez.'
              )
            : (
              <>
                <h2 className="font-serif text-base font-semibold text-stone-900">
                  Competências em que você progrediu
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {competencias.map(([nome, n]) => (
                    <li key={nome} className="rounded-xl p-4 ring-1 ring-stone-200">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 flex-1 truncate text-sm text-stone-900">
                          {nome}
                        </span>
                        <span className="shrink-0 font-mono text-xs tabular-nums text-stone-500">
                          {n.feitas}/{n.total}
                        </span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar
                          id={`comp-${nome}`}
                          value={n.total > 0 ? Math.round((n.feitas / n.total) * 100) : 0}
                          sizeVariant="sm"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ))}

        {aba === 'certificados' &&
          (certificados.length === 0
            ? vazio(
                'Nenhum certificado ainda. Ele é emitido ao concluir um curso, com código de verificação público e hash criptográfico.'
              )
            : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {certificados.map((cert) => (
                  <li key={cert.id} className="overflow-hidden rounded-xl ring-1 ring-stone-200">
                    <div className="flex h-28 items-center justify-center bg-anil-50">
                      {cert.status === 'REVOKED' ? (
                        <Lock className="h-6 w-6 text-stone-400" aria-hidden="true" />
                      ) : (
                        <Award className="h-6 w-6 text-ouro-600" aria-hidden="true" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-serif text-sm font-semibold leading-snug text-stone-900">
                        {cert.courseTitle}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {cert.institution} ·{' '}
                        {new Date(cert.issuedAt).toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      {cert.status === 'REVOKED' ? (
                        <p className="mt-2 text-xs text-red-700">
                          Revogado{cert.revocationReason ? `: ${cert.revocationReason}` : ''}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate(`/credential/${cert.verificationCode}`)}
                          className="mt-2 text-xs font-medium text-anil-700 underline-offset-2 hover:underline"
                        >
                          Ver e verificar
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ))}
      </PageLayout.Main>
    </PageLayout>
  );
};
