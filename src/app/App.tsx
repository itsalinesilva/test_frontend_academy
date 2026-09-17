import React, { useState, useEffect } from 'react';
import { RouterProvider, useRouter } from '../ui/navigation/router';
import { AppShell } from '../ui/components/layout/AppShell';
import { AppRouterOutlet } from '../ui/screens/AppRouterOutlet';
import { authService } from '../services/application/auth.service';
import { entitlementService } from '../infrastructure/entitlements/entitlement-service';
import { User, UserRole } from '../domain/types';
import { FOUNDER_ADMIN_EMAILS } from '../domain/capabilities';
import { LoadingState } from '../ui/components/feedback/LoadingState';

interface AppContentProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  onSwitchUserRole: (role: UserRole) => Promise<void>;
}

const AppContent: React.FC<AppContentProps> = ({
  currentUser,
  setCurrentUser,
  onSwitchUserRole,
}) => {
  const { navigate } = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    navigate('/auth/login');
  };

  const showAdminTab = entitlementService.isAdministrator(currentUser);

  return (
    <AppShell
      currentUser={currentUser}
      onLoginClick={() => navigate('/auth/login')}
      onLogoutClick={handleLogout}
      showAdminTab={showAdminTab}
    >
      {/* Simulation / Persona Quick Bar for Evaluation */}
      <aside
        id="dev-role-simulator"
        aria-label="Barra de simulação de perfis acadêmicos"
        className="mb-6 p-3 bg-stone-900 text-stone-100 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <p className="font-mono text-stone-300">
            <strong>Application Shell:</strong> 6 Eixos Canônicos + Rotas de Governança & Utilitários
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="simulate-role-selector" className="text-stone-400">
            Papel Ativo:
          </label>
          <select
            id="simulate-role-selector"
            aria-label="Simular perfil de usuário"
            value={currentUser?.primaryRole || UserRole.ALUNO}
            onChange={(e) => onSwitchUserRole(e.target.value as UserRole)}
            className="text-xs bg-stone-800 text-stone-100 border border-stone-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600"
          >
            <option value={UserRole.ADMIN}>ADMIN (Fundador - Acesso Irrestrito)</option>
            <option value={UserRole.PROFESSOR}>PROFESSOR (Criar Salas, Avaliações)</option>
            <option value={UserRole.MUSICO}>MÚSICO (Estúdio, Gravações)</option>
            <option value={UserRole.ALUNO}>ALUNO (Currículo, Exercícios)</option>
            <option value={UserRole.CRIANCA}>CRIANÇA (Modo Kids Protegido)</option>
          </select>
        </div>
      </aside>

      {/* Dynamic Screen Outlet Managed by Canonical Router */}
      <AppRouterOutlet />
    </AppShell>
  );
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize active session on mount
  useEffect(() => {
    async function initSession() {
      try {
        setIsLoading(true);
        const session = await authService.getActiveSession();
        if (session) {
          setCurrentUser(session.user);
        } else {
          // Default to founder admin for initial exploration
          const founderSession = await authService.login({ email: FOUNDER_ADMIN_EMAILS[0] });
          setCurrentUser(founderSession.user);
        }
      } catch {
        // Handled silently
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const handleSwitchUserRole = async (targetRole: UserRole) => {
    try {
      setIsLoading(true);
      if (targetRole === UserRole.ADMIN) {
        const session = await authService.login({ email: FOUNDER_ADMIN_EMAILS[0] });
        setCurrentUser(session.user);
      } else {
        const email = `usuario.${targetRole.toLowerCase()}@academia.internal`;
        try {
          const session = await authService.login({ email });
          setCurrentUser(session.user);
        } catch {
          const newSession = await authService.register({
            email,
            name: `Estudante (${targetRole})`,
            selectedRole: targetRole,
            guardianEmail: targetRole === UserRole.CRIANCA ? 'responsavel@familia.internal' : undefined,
          });
          setCurrentUser(newSession.user);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div id="root-loading" className="min-h-screen flex items-center justify-center bg-stone-50">
        <LoadingState id="app-init-loader" message="Inicializando Application Shell & Roteamento da Academia..." />
      </div>
    );
  }

  return (
    <RouterProvider currentUser={currentUser}>
      <AppContent
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onSwitchUserRole={handleSwitchUserRole}
      />
    </RouterProvider>
  );
};
