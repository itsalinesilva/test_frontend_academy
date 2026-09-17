import React, { useRef, useEffect } from 'react';
import { useRouter } from '../../navigation/router';
import { User, UserRole } from '../../../domain/types';
import {
  User as UserIcon,
  Award,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
  Flame,
  Shield,
  GraduationCap,
} from 'lucide-react';

export interface ProfileMenuProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  id = 'header-profile-menu',
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onSwitchRole,
}) => {
  const { navigate } = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const isProfessor = currentUser?.primaryRole === UserRole.PROFESSOR || currentUser?.primaryRole === UserRole.ADMIN;
  const isAdmin = currentUser?.primaryRole === UserRole.ADMIN;

  return (
    <div
      id={id}
      ref={menuRef}
      role="menu"
      aria-label="Menu do Usuário e Perfil"
      className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-stone-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-stone-100 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {/* Profile Header Summary */}
      <div className="p-4 bg-stone-50/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-900 text-white font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-stone-700 shadow-xs">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-stone-900 truncate">
              {currentUser?.name || 'Estudante da Academia'}
            </h4>
            <p className="text-[11px] text-stone-500 font-mono truncate">
              {currentUser?.email || 'aluno@academia.internal'}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-900 border border-red-200">
                {currentUser?.primaryRole || 'ALUNO'}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Nível Conservatório II</span>
            </div>
          </div>
        </div>

        {/* Gamification micro-bar */}
        <div className="mt-3 p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-around text-xs font-mono">
          <div className="flex items-center gap-1 text-red-800">
            <Flame className="w-3.5 h-3.5 fill-red-800" />
            <span className="font-bold">7 dias</span>
            <span className="text-[10px] text-stone-400 font-sans">streak</span>
          </div>
          <span className="text-stone-300">|</span>
          <div className="flex items-center gap-1 text-amber-700">
            <Zap className="w-3.5 h-3.5 fill-amber-500" />
            <span className="font-bold">1.420 XP</span>
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <div className="py-1">
        <button
          type="button"
          role="menuitem"
          onClick={() => handleNavigate('/profile')}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
        >
          <UserIcon className="w-4 h-4 text-stone-400" />
          <span className="font-medium">Meu Perfil Geral</span>
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => handleNavigate('/academy/my-learning')}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
        >
          <GraduationCap className="w-4 h-4 text-stone-400" />
          <span className="font-medium">Meu Aprendizado & Matrículas</span>
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => handleNavigate('/profile/portfolio')}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
        >
          <Award className="w-4 h-4 text-stone-400" />
          <span className="font-medium">Portfólio de Evidências & Certificados</span>
        </button>

        {isProfessor && (
          <button
            type="button"
            role="menuitem"
            onClick={() => handleNavigate('/rooms')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-red-800" />
            <span className="font-medium text-red-900">Salas de Aula & Cátedras</span>
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            role="menuitem"
            onClick={() => handleNavigate('/admin')}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-800 bg-red-50/50 hover:bg-red-100 transition-colors font-semibold"
          >
            <Shield className="w-4 h-4 text-red-800" />
            <span>Governança & Administração</span>
          </button>
        )}
      </div>

      {/* Role Simulator inside Profile Menu */}
      {onSwitchRole && (
        <div className="p-3 bg-stone-50">
          <label htmlFor="profile-menu-role-select" className="block text-[10px] font-mono text-stone-500 uppercase tracking-wider mb-1">
            Simulador Rápido de Papel:
          </label>
          <select
            id="profile-menu-role-select"
            value={currentUser?.primaryRole || UserRole.ALUNO}
            onChange={(e) => {
              onSwitchRole(e.target.value as UserRole);
              onClose();
            }}
            className="w-full text-xs bg-white border border-stone-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-800"
          >
            <option value={UserRole.ADMIN}>ADMIN (Fundador)</option>
            <option value={UserRole.PROFESSOR}>PROFESSOR (Cátedra & Salas)</option>
            <option value={UserRole.MUSICO}>MÚSICO (Estúdio & Performance)</option>
            <option value={UserRole.ALUNO}>ALUNO (Currículo & Prática)</option>
            <option value={UserRole.CRIANCA}>CRIANÇA (Modo Protegido)</option>
          </select>
        </div>
      )}

      {/* System Settings & Sign Out */}
      <div className="py-1">
        <button
          type="button"
          role="menuitem"
          onClick={() => handleNavigate('/settings')}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <Settings className="w-4 h-4 text-stone-400" />
          <span>Configurações da Conta</span>
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => handleNavigate('/help')}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-stone-400" />
          <span>Ajuda & Documentação</span>
        </button>

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors font-medium border-t border-stone-100"
        >
          <LogOut className="w-4 h-4 text-red-700" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </div>
  );
};
