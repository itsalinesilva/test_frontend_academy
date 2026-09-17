import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { AppMode, UserRole } from '../../../domain/types';
import { authService } from '../../../services/application/auth.service';
import { GoogleOAuthModal } from '../../components/auth/GoogleOAuthModal';
import { UserPlus, ArrowLeft, ShieldCheck, GraduationCap, Baby, Info } from 'lucide-react';

export const RegisterScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AppMode>(AppMode.TRADITIONAL);
  const [guardianEmail, setGuardianEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authService.register({
        name,
        email,
        password,
        initialMode: mode,
        selectedRole: mode === AppMode.KIDS ? UserRole.CRIANCA : UserRole.ALUNO,
        guardianEmail: mode === AppMode.KIDS ? guardianEmail : undefined,
      });
      // Redirect to onboarding to complete profile setup per contracts
      navigate('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAccountSelect = async (account: { email: string; name: string; avatarUrl?: string }) => {
    setIsGoogleModalOpen(false);
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authService.loginWithGoogle({
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
      });
      navigate('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha no cadastro via Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer
      id="auth-register"
      title="Cadastro na Academia Musical"
      subtitle="Inicie sua jornada no ensino superior livre de música de concerto, teoria rigorosa e prática artística."
      badgeLabel="Nova Matrícula"
      badgeVariant="brand"
      primaryAction={{
        label: 'Já possuo matrícula',
        icon: ArrowLeft,
        onClick: () => navigate('/auth/login'),
      }}
    >
      <div className="max-w-xl mx-auto space-y-6">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-900">
            {errorMsg}
          </div>
        )}

        <Card variant="default" padding="lg" className="space-y-5 border-stone-200 shadow-sm">
          {/* Google Sign-up Button */}
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
            <span>Cadastrar com o Google</span>
          </button>

          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <div className="h-px bg-stone-200 flex-1" />
            <span>ou preencher ficha institucional</span>
            <div className="h-px bg-stone-200 flex-1" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Nome Completo do Estudante ou Artista *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Clara Wieck Schumann"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                E-mail Principal de Acesso *
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Senha de Acesso (opcional para criação inicial)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>

            {/* Mode Selection (Traditional vs. Kids) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">
                Tipo Inicial de Experiência (Modo) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode(AppMode.TRADITIONAL)}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    mode === AppMode.TRADITIONAL
                      ? 'border-red-800 bg-red-50/50 ring-1 ring-red-800 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className={`w-4 h-4 ${mode === AppMode.TRADITIONAL ? 'text-red-800' : 'text-stone-600'}`} />
                    <span className="font-serif font-bold text-xs text-stone-900">Modo Tradicional</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Trajetória acadêmica canônica completa (teoria, harmonia, repertório, estúdio DAW e comunidade).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode(AppMode.KIDS)}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    mode === AppMode.KIDS
                      ? 'border-red-800 bg-red-50/50 ring-1 ring-red-800 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Baby className={`w-4 h-4 ${mode === AppMode.KIDS ? 'text-amber-700' : 'text-stone-600'}`} />
                    <span className="font-serif font-bold text-xs text-stone-900">Modo Kids</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Camada formativa infantil lúdica, com tutela parental obrigatória e limites de tempo de tela.
                  </p>
                </button>
              </div>
            </div>

            {/* Professor capability explanation */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-md flex items-start gap-2.5 text-xs text-stone-700">
              <Info className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block mb-0.5">
                  Cátedra Docente: Professor é Capability Adquirida
                </span>
                <span className="text-[11px] text-stone-600 leading-relaxed block">
                  Professor não é escolhido como um mundo separado. É uma <strong>capability adquirida</strong> que pode ser ativada na sua conta para abrir salas de aula acadêmicas (Rooms) e orientar alunos.
                </span>
              </div>
            </div>

            {mode === AppMode.KIDS && (
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-md space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-800" />
                  <span>Protocolo de Tutela e Proteção Infantil</span>
                </div>
                <label className="text-[11px] font-semibold text-stone-700 block">
                  E-mail do Pai, Mãe ou Responsável Legal *
                </label>
                <input
                  type="email"
                  required
                  placeholder="responsavel@familia.mus.br"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                />
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading || !name || !email}
              className="w-full justify-center bg-red-800 hover:bg-red-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isLoading ? 'Registrando...' : 'Prosseguir para o Onboarding'}
            </Button>
          </form>
        </Card>

        <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Matrícula canônica vinculada à soberania dos seus dados</span>
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
