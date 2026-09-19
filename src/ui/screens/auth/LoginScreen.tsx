import React, { useCallback, useState } from 'react';
import { useRouter } from '../../navigation/router';
import { authService } from '../../../services/application/auth.service';
import { Card } from '../../components/base/Card';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { ContaLocalDeDesenvolvimento } from '../../components/auth/ContaLocalDeDesenvolvimento';
import { ErrorState } from '../../components/feedback/ErrorState';
import { GraduationCap, ShieldCheck, HardDrive, Loader2 } from 'lucide-react';

/**
 * Entrada da plataforma.
 *
 * Autenticação exclusivamente federada com Google (ADR-001.A). Isso é o que
 * torna automático o backup em JSON no Drive do próprio usuário e o que
 * elimina, por construção, toda a superfície de senha.
 *
 * Removidos desta tela:
 *  - formulário de e-mail/senha (S-03: `login({email})` autenticava sem senha);
 *  - os botões de "acesso rápido" que logavam como a fundadora com um clique
 *    (S-04), incluindo os e-mails administrativos em texto no código.
 */
export const LoginScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async ({ idToken, nonce }: { idToken: string; nonce: string }) => {
      setIsAuthenticating(true);
      setError(null);
      try {
        await authService.authenticateWithGoogle({ idToken, nonce });
        const result = await authService.executePostAuthPipeline(
          (await authService.getActiveSession())!.user
        );
        navigate(result.destination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível concluir a autenticação. Tente novamente.'
        );
      } finally {
        setIsAuthenticating(false);
      }
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <main className="w-full max-w-md space-y-6" aria-labelledby="login-title">
        <header className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-anil-800 text-white">
            <GraduationCap className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 id="login-title" className="font-serif text-2xl font-bold text-stone-900">
            Conservatório Muscicapa
          </h1>
          <p className="text-sm text-stone-600">
            Entre com sua Conta Google para acessar seus estudos, práticas e portfólio.
          </p>
        </header>

        <Card variant="default" padding="lg" className="space-y-5">
          {error && (
            <ErrorState
              id="login-error"
              title="Falha na autenticação"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          <div className="space-y-3">
            <GoogleSignInButton
              onCredential={handleCredential}
              onError={setError}
              text="signin_with"
              disabled={isAuthenticating}
            />

            <ContaLocalDeDesenvolvimento
              onEntrou={(destino) => navigate(destino)}
              onErro={(m) => setError(m || null)}
            />

            {isAuthenticating && (
              <p
                role="status"
                aria-live="polite"
                className="flex items-center justify-center gap-2 text-xs text-stone-600"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Verificando sua identidade no servidor…
              </p>
            )}
          </div>

          <div className="space-y-2.5 border-t border-stone-100 pt-4 text-xs text-stone-600">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>
                Sua identidade é verificada no servidor contra as chaves públicas do Google. A
                plataforma não armazena senhas.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <HardDrive className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-500" aria-hidden="true" />
              <span>
                Seus dados de estudo ficam no seu navegador, com cópia de segurança em uma pasta
                privada do seu próprio Google Drive.
              </span>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-stone-500">
          Ao entrar, você concorda com as diretrizes acadêmicas da instituição.{' '}
          <button
            type="button"
            onClick={() => navigate('/help')}
            className="underline underline-offset-2 hover:text-stone-800"
          >
            Precisa de ajuda?
          </button>
        </p>
      </main>
    </div>
  );
};
