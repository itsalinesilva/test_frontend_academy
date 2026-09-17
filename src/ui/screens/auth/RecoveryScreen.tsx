import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { authService } from '../../../services/application/auth.service';
import { ArrowLeft, KeyRound, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

export const RecoveryScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reset password form state
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await authService.recoverPassword(email);
      setFeedback(res.message);
      if (res.resetToken) {
        setTokenInput(res.resetToken);
      }
    } catch {
      setFeedback('Instruções despachadas para o e-mail informado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setResetError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    setResetError(null);
    try {
      await authService.resetPassword({
        email,
        token: tokenInput,
        newPassword,
      });
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.message || 'Falha ao redefinir a credencial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      id="auth-recovery"
      title="Recuperação de Credencial"
      subtitle="Restabelecimento seguro de acesso à Academia Musical Digital."
      badgeLabel="Segurança"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Voltar ao Login',
        icon: ArrowLeft,
        onClick: () => navigate('/auth/login'),
      }}
    >
      <div className="max-w-md mx-auto space-y-6">
        {resetSuccess ? (
          <Card variant="default" padding="lg" className="space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Senha Redefinida com Sucesso!
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Sua nova credencial foi atualizada e auditada no registro seguro da Academia. Você já pode acessar sua conta.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/auth/login')}
              className="w-full justify-center"
            >
              Fazer Login com a Nova Senha
            </Button>
          </Card>
        ) : feedback ? (
          <div className="space-y-4">
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-900">
                    Código de Redefinição Gerado
                  </h3>
                  <p className="text-xs text-stone-500">{feedback}</p>
                </div>
              </div>

              {resetError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md">
                  {resetError}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Token de Segurança
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-stone-300 font-mono bg-stone-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Nova Senha de Acesso
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-stone-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-stone-300"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full justify-center bg-red-800 hover:bg-red-700 text-white"
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  {isSubmitting ? 'Atualizando credencial...' : 'Redefinir Senha Institucional'}
                </Button>
              </form>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleRecover}>
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">
                  E-mail Cadastrado na Academia *
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-red-800"
                />
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full justify-center bg-red-800 hover:bg-red-700 text-white"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Enviando...' : 'Enviar Instruções de Recuperação'}
              </Button>
            </Card>
          </form>
        )}

        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Proteção contra enumeração de contas e auditoria de token</span>
        </div>
      </div>
    </ScreenContainer>
  );
};
