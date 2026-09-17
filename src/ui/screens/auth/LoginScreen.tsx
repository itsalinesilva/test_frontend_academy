import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { authService } from '../../../services/application/auth.service';
import { GoogleOAuthModal } from '../../components/auth/GoogleOAuthModal';
import { LogIn, UserPlus, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const session = await authService.login({ email, password });
      const postAuth = await authService.executePostAuthPipeline(session.user);
      navigate(postAuth.destination);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao autenticar. Verifique o e-mail inserido.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (account: { email: string; name: string; avatarUrl?: string }) => {
    setIsGoogleModalOpen(false);
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const session = await authService.loginWithGoogle({
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
      });
      const postAuth = await authService.executePostAuthPipeline(session.user);
      navigate(postAuth.destination);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação via Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginAs = async (userEmail: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const session = await authService.login({ email: userEmail });
      const postAuth = await authService.executePostAuthPipeline(session.user);
      navigate(postAuth.destination);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação rápida.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer
      id="auth-login"
      title="Autenticação na Academia"
      subtitle="Acesso institucional unificado com controle estrito de credenciais e autorização de prerrogativas musicais."
      badgeLabel="Segurança Institucional"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Criar Nova Matrícula',
        icon: UserPlus,
        onClick: () => navigate('/auth/register'),
      }}
    >
      <div className="max-w-md mx-auto space-y-6">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-xs text-red-900">
            <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Card variant="default" padding="lg" className="space-y-4 shadow-sm border-stone-200">
          {/* Google Single Sign-On Button */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 p-2.5 rounded-md border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 transition-colors text-xs font-semibold text-stone-800 shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continuar com o Google</span>
          </button>

          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <div className="h-px bg-stone-200 flex-1" />
            <span>ou entrar com e-mail</span>
            <div className="h-px bg-stone-200 flex-1" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                E-mail Institucional ou Pessoal *
              </label>
              <input
                type="email"
                required
                placeholder="seu.nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 block">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/auth/recovery')}
                  className="text-[11px] text-red-800 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading || !email}
              className="w-full justify-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? 'Autenticando sessão...' : 'Entrar na Plataforma'}
            </Button>
          </form>

          <div className="pt-3 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Ainda não possui matrícula?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="text-red-800 font-semibold hover:underline"
              >
                Cadastre-se na Academia
              </button>
            </p>
          </div>
        </Card>

        {/* Fast Persona Switcher for Evaluation */}
        <Card variant="muted" padding="md" className="space-y-2 border-stone-200 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900">
            <Sparkles className="w-4 h-4 text-red-800" />
            <span>Acesso Rápido de Demonstração & Papéis</span>
          </div>
          <p className="text-stone-500 text-[11px]">
            Selecione uma persona para avaliar permissões, lentes de identidade e rotas de governança:
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLoginAs('office.alinesilva@gmail.com')}
              className="text-left font-serif"
            >
              👑 Admin (Fundadora)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLoginAs('professor@academia.mus.br')}
              className="text-left font-serif"
            >
              🎓 Professor Titular
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLoginAs('musico@academia.mus.br')}
              className="text-left font-serif"
            >
              🎻 Músico / Intérprete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLoginAs('aluno@academia.mus.br')}
              className="text-left font-serif"
            >
              🎼 Aluno / Estudante
            </Button>
          </div>
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLoginAs('crianca@academia.mus.br')}
              className="w-full text-left font-serif"
            >
              👶 Criança (Iniciação Kids Supervisionada)
            </Button>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Autorização backend auditada • Sem telemetria invasiva</span>
        </div>
      </div>

      <GoogleOAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelect}
      />
    </ScreenContainer>
  );
};
