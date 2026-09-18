import React, { useCallback, useState } from 'react';
import { useRouter } from '../../navigation/router';
import { authService } from '../../../services/application/auth.service';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { ContaLocalDeDesenvolvimento } from '../../components/auth/ContaLocalDeDesenvolvimento';
import { ErrorState } from '../../components/feedback/ErrorState';
import { GraduationCap, ShieldCheck, Users, Loader2 } from 'lucide-react';

/**
 * Criação de conta.
 *
 * Com autenticação exclusivamente federada (ADR-001.A), "cadastrar" e
 * "entrar" são o mesmo ato: o primeiro login com Google provisiona a conta,
 * e o perfil é construído no Onboarding logo em seguida.
 *
 * O formulário anterior coletava senha e e-mail do responsável antes de
 * qualquer verificação de identidade. O vínculo com responsável legal passa
 * a ser coletado no Onboarding, depois que sabemos quem é a pessoa.
 */
export const RegisterScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredential = useCallback(
    async ({ idToken, nonce }: { idToken: string; nonce: string }) => {
      setIsAuthenticating(true);
      setError(null);
      try {
        const session = await authService.authenticateWithGoogle({ idToken, nonce });
        const result = await authService.executePostAuthPipeline(session.user);
        navigate(result.destination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Não foi possível criar sua conta.');
      } finally {
        setIsAuthenticating(false);
      }
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <main className="w-full max-w-md space-y-6" aria-labelledby="register-title">
        <header className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-anil-800 text-white">
            <GraduationCap className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 id="register-title" className="font-serif text-2xl font-bold text-stone-900">
            Matricule-se na Academia
          </h1>
          <p className="text-sm text-stone-600">
            Sua conta é criada a partir da sua Conta Google. Em seguida você escolhe instrumentos,
            nível e objetivos.
          </p>
        </header>

        <Card variant="default" padding="lg" className="space-y-5">
          {error && (
            <ErrorState
              id="register-error"
              title="Falha ao criar a conta"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          <GoogleSignInButton
            onCredential={handleCredential}
            onError={setError}
            text="signup_with"
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
              Criando sua matrícula institucional…
            </p>
          )}

          <div className="space-y-2.5 border-t border-stone-100 pt-4 text-xs text-stone-600">
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>Sem senha para criar, memorizar ou vazar.</span>
            </p>
            <p className="flex items-start gap-2">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-500" aria-hidden="true" />
              <span>
                Contas para menores de idade exigem vínculo com o e-mail de um responsável legal,
                solicitado na etapa seguinte.
              </span>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-stone-500">
          Já possui matrícula?{' '}
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>
            Entrar
          </Button>
        </p>
      </main>
    </div>
  );
};
