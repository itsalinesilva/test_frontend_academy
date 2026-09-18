import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useRouter } from './router';
import { audienciaDaRota } from './audiencia';
import { useCurrentUser } from '../hooks/useCurrentUser';

export interface GuardaDeAudienciaProps {
  children: React.ReactNode;
}

/**
 * Faz o roteador respeitar a audiência declarada em `audiencia.ts`.
 *
 * Três comportamentos, e cada um foi escolhido contra um jeito pior de errar:
 *
 * **Enquanto carrega a sessão, não decide nada.** Renderizar a tela de
 * "entre na sua conta" por um instante e depois trocar pelo conteúdo é pior
 * que esperar: o aluno logado vê um flash dizendo que não está logado.
 *
 * **Rota que exige login mostra um convite, não um redirecionamento.** Mandar
 * para `/auth/login` apaga o endereço que a pessoa queria. O convite preserva
 * a rota, e quem entra volta para onde estava.
 *
 * **Rota de visitante com sessão ativa devolve à home** — quem já entrou não
 * tem o que fazer na tela de entrar.
 */
export const GuardaDeAudiencia: React.FC<GuardaDeAudienciaProps> = ({ children }) => {
  const { currentPath, navigate } = useRouter();
  const { userId, carregando } = useCurrentUser();

  const audiencia = audienciaDaRota(currentPath);

  // Rota pública nunca espera pela sessão: o catálogo abre na hora.
  if (audiencia === 'publica') return <>{children}</>;

  if (carregando) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center p-8 text-sm text-stone-500"
        role="status"
        aria-live="polite"
      >
        Verificando sua sessão…
      </div>
    );
  }

  if (audiencia === 'somenteVisitante' && userId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-xl font-bold text-stone-900">Você já está na sua conta</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Não há o que fazer nesta página enquanto sua sessão estiver ativa.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-5 rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700"
        >
          Ir para a página inicial
        </button>
      </div>
    );
  }

  if (audiencia === 'exigeLogin' && !userId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-xl font-bold text-stone-900">Esta página é da sua conta</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Ela mostra progresso, avaliações e certificados — coisas que existem em nome de alguém.
          Entre para vê-la, ou crie sua conta: você volta para cá depois.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/auth/login?voltar=${encodeURIComponent(currentPath)}`)}
            className="inline-flex items-center gap-2 rounded-md bg-anil-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-anil-700"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </button>
          <button
            type="button"
            onClick={() => navigate(`/auth/register?voltar=${encodeURIComponent(currentPath)}`)}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-anil-800 ring-1 ring-anil-300 transition-colors hover:bg-anil-50"
          >
            <UserPlus className="h-4 w-4" />
            Criar conta
          </button>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-stone-500">
          O catálogo de cursos continua aberto sem conta — você pode ver tudo o que a plataforma
          ensina antes de decidir.
        </p>
        <button
          type="button"
          onClick={() => navigate('/academy')}
          className="mt-2 text-xs font-medium text-anil-700 underline-offset-2 hover:underline"
        >
          Ver os cursos
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
