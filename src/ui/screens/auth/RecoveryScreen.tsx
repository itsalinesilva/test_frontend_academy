import React from 'react';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { KeyRound, ExternalLink, ArrowLeft } from 'lucide-react';

/**
 * Recuperação de acesso.
 *
 * A plataforma não possui senhas (ADR-001.A), portanto não há o que
 * redefinir aqui. O acesso é recuperado no próprio Google.
 *
 * A tela anterior chamava `recoverPassword()`, que devolvia o token de
 * redefinição no corpo da resposta, e `resetPassword()`, que nunca validava
 * esse token — qualquer pessoa redefinia a senha de qualquer e-mail
 * (CLAUDE_AUDIT.md S-05). Em vez de corrigir esse fluxo, ele foi eliminado
 * junto com a superfície de senha.
 */
export const RecoveryScreen: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <main className="w-full max-w-md space-y-6" aria-labelledby="recovery-title">
        <Card variant="default" padding="lg" className="space-y-5">
          <header className="space-y-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-700">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 id="recovery-title" className="font-serif text-lg font-bold text-stone-900">
              Recuperação de acesso
            </h1>
          </header>

          <div className="space-y-3 text-sm leading-relaxed text-stone-700">
            <p>
              A Academia não utiliza senhas próprias. Seu acesso é feito inteiramente pela sua
              Conta Google, e é lá que ele deve ser recuperado.
            </p>
            <p className="text-xs text-stone-600">
              Depois de restabelecer o acesso à sua Conta Google, volte e entre normalmente — seu
              histórico acadêmico, prática e portfólio continuam vinculados à mesma identidade.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                window.open('https://accounts.google.com/signin/recovery', '_blank', 'noopener,noreferrer')
              }
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Recuperar Conta Google
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/auth/login')}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Voltar para a entrada
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};
