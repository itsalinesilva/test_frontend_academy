import React, { useState, useEffect, useCallback } from 'react';
import { RouterProvider, useRouter } from '../ui/navigation/router';
import { AppShell } from '../ui/components/layout/AppShell';
import { AppRouterOutlet } from '../ui/screens/AppRouterOutlet';
import { authService } from '../services/application/auth.service';
import { User, UserRole } from '../domain/types';
import { LoadingState } from '../ui/components/feedback/LoadingState';

interface AppContentProps {
  currentUser: User | null;
  isAdmin: boolean;
  assignedRoles: readonly UserRole[];
  onLogout: () => Promise<void>;
  onSwitchRole: (role: UserRole) => Promise<void>;
}

/**
 * Simulador de papéis — DESENVOLVIMENTO APENAS.
 *
 * CLAUDE_AUDIT.md S-06: esta barra era renderizada no shell de produção para
 * todos os usuários, permitindo escalonar privilégio por menu suspenso.
 *
 * Agora: (1) só existe sob `import.meta.env.DEV`, sendo eliminada do bundle
 * de produção pelo tree-shaking; (2) lista somente papéis JÁ atribuídos à
 * conta; (3) ADMIN é recusado pelo serviço quando o servidor não o concede.
 */
const DevRoleSwitcher: React.FC<{
  currentRole?: UserRole;
  assignedRoles: readonly UserRole[];
  onSwitchRole: (role: UserRole) => Promise<void>;
}> = ({ currentRole, assignedRoles, onSwitchRole }) => {
  if (!import.meta.env.DEV || assignedRoles.length <= 1) return null;

  return (
    <aside
      aria-label="Alternador de papéis (somente desenvolvimento)"
      className="mb-6 flex flex-col items-start justify-between gap-3 rounded-lg bg-stone-900 p-3 text-xs text-stone-100 sm:flex-row sm:items-center"
    >
      <p className="font-mono text-stone-300">
        <strong className="text-amber-400">DEV</strong> · alternador de papéis · ausente em produção
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <label htmlFor="dev-role-selector" className="text-stone-400">
          Papel ativo:
        </label>
        <select
          id="dev-role-selector"
          value={currentRole}
          onChange={(e) => void onSwitchRole(e.target.value as UserRole)}
          className="rounded border border-stone-700 bg-stone-800 px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:ring-1 focus:ring-red-600"
        >
          {assignedRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
};

const AppContent: React.FC<AppContentProps> = ({
  currentUser,
  isAdmin,
  assignedRoles,
  onLogout,
  onSwitchRole,
}) => {
  const { navigate } = useRouter();

  return (
    <AppShell
      currentUser={currentUser}
      onLoginClick={() => navigate('/auth/login')}
      onLogoutClick={async () => {
        await onLogout();
        navigate('/auth/login');
      }}
      // Visibilidade da aba Admin segue a outorga assinada pelo servidor,
      // nunca o papel local (CLAUDE_AUDIT.md S-02).
      showAdminTab={isAdmin}
    >
      <DevRoleSwitcher
        currentRole={currentUser?.primaryRole}
        assignedRoles={assignedRoles}
        onSwitchRole={onSwitchRole}
      />
      <AppRouterOutlet />
    </AppShell>
  );
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [assignedRoles, setAssignedRoles] = useState<readonly UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restaura a sessão existente — e apenas isso.
   *
   * CLAUDE_AUDIT.md S-04: a versão anterior fazia
   * `authService.login({ email: FOUNDER_ADMIN_EMAILS[0] })` quando não havia
   * sessão, com o comentário "default to founder admin for initial
   * exploration". Todo visitante entrava como administradora fundadora.
   *
   * Agora, ausência de sessão significa exatamente isso: visitante anônimo.
   */
  const loadSession = useCallback(async () => {
    try {
      const session = await authService.getActiveSession();
      if (session) {
        setCurrentUser(session.user);
        setIsAdmin(session.isAdmin);
        setAssignedRoles(session.user.assignedRoles);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setAssignedRoles([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsAdmin(false);
    setAssignedRoles([]);
  }, []);

  const handleSwitchRole = useCallback(async (targetRole: UserRole) => {
    // `switchRole` recusa papéis não atribuídos e recusa ADMIN sem outorga
    // do servidor. Aqui apenas refletimos o resultado.
    const session = await authService.switchRole(targetRole);
    setCurrentUser(session.user);
    setIsAdmin(session.isAdmin);
    setAssignedRoles(session.user.assignedRoles);
  }, []);

  if (isLoading) {
    return (
      <div id="root-loading" className="flex min-h-screen items-center justify-center bg-stone-50">
        <LoadingState id="app-init-loader" message="Verificando sua sessão…" />
      </div>
    );
  }

  return (
    <RouterProvider currentUser={currentUser}>
      <AppContent
        currentUser={currentUser}
        isAdmin={isAdmin}
        assignedRoles={assignedRoles}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />
    </RouterProvider>
  );
};
