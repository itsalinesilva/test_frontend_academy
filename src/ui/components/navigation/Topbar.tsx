import React from 'react';
import { Menu, Bell, Flame, Zap } from 'lucide-react';
import { AudienceToggle } from '../domain/AudienceToggle';
import { AudienceVariant } from '../../../domain/academy';
import { Avatar } from '../data-display/Avatar';

export interface TopbarProps {
  id?: string;
  onMenuToggle?: () => void;
  breadcrumbs?: React.ReactNode;
  activeAudience?: AudienceVariant;
  onAudienceToggle?: (variant: AudienceVariant) => void;
  streakDays?: number;
  totalXp?: number;
  userName?: string;
  userAvatarUrl?: string;
  onAvatarClick?: () => void;
  onNotificationsClick?: () => void;
  notificationCount?: number;
  className?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  id = 'app-topbar',
  onMenuToggle,
  breadcrumbs,
  activeAudience = 'TRADITIONAL',
  onAudienceToggle,
  streakDays = 0,
  totalXp = 0,
  userName = 'Aluno',
  userAvatarUrl,
  onAvatarClick,
  onNotificationsClick,
  notificationCount = 0,
  className = '',
}) => {
  return (
    <header
      id={id}
      className={`h-14 bg-white border-b border-stone-200 px-4 flex items-center justify-between gap-3 select-none shrink-0 z-10 ${className}`}
    >
      {/* Left side: Mobile Toggle & Breadcrumbs */}
      <div id={`${id}-left`} className="flex items-center gap-3 overflow-hidden">
        {onMenuToggle && (
          <button
            id={`${id}-mobile-toggle`}
            type="button"
            onClick={onMenuToggle}
            aria-label="Abrir menu lateral"
            className="md:hidden p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div id={`${id}-breadcrumbs-container`} className="truncate text-sm text-stone-600">
          {breadcrumbs}
        </div>
      </div>

      {/* Right side: Practice Metrics, Audience Switcher, Notifications & Profile */}
      <div id={`${id}-right`} className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Streak counter */}
        {streakDays > 0 && (
          <div
            id={`${id}-streak-badge`}
            title={`${streakDays} dias consecutivos de prática musical`}
            className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-semibold text-amber-800"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>{streakDays}</span>
          </div>
        )}

        {/* XP Counter */}
        {totalXp > 0 && (
          <div
            id={`${id}-xp-badge`}
            title={`${totalXp} Pontos de Experiência acumulados`}
            className="hidden sm:flex items-center gap-1 px-2 py-1 bg-stone-100 border border-stone-200 rounded text-xs font-semibold text-stone-800"
          >
            <Zap className="w-3.5 h-3.5 text-red-800 fill-red-800" />
            <span>{totalXp} XP</span>
          </div>
        )}

        {/* Audience Toggle (Traditional vs Kids) */}
        {onAudienceToggle && (
          <div id={`${id}-audience-toggle-wrapper`} className="scale-90 origin-right">
            <AudienceToggle
              variant={activeAudience}
              onChange={onAudienceToggle}
            />
          </div>
        )}

        {/* Notifications */}
        {onNotificationsClick && (
          <button
            id={`${id}-notifications-btn`}
            type="button"
            onClick={onNotificationsClick}
            aria-label={`Notificações (${notificationCount} não lidas)`}
            className="relative p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-800"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-800 ring-2 ring-white" />
            )}
          </button>
        )}

        {/* User Avatar */}
        <div
          id={`${id}-avatar-btn`}
          onClick={onAvatarClick}
          role={onAvatarClick ? 'button' : undefined}
          tabIndex={onAvatarClick ? 0 : undefined}
          className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-800 rounded-full"
        >
          <Avatar
            id={`${id}-user-avatar`}
            name={userName}
            src={userAvatarUrl}
            size="sm"
          />
        </div>
      </div>
    </header>
  );
};
