import React, { useRef, useEffect } from 'react';
import { useRouter } from '../../navigation/router';
import { Clock, ArrowRight, Bell } from 'lucide-react';
import { clsx } from 'clsx';

export interface QuickNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  link: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NotificationsPopoverProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  notifications: QuickNotification[];
  onMarkAllAsRead: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  id = 'header-notifications-popover',
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  const { navigate } = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationClick = (link: string) => {
    onClose();
    navigate(link);
  };

  return (
    <div
      id={id}
      ref={popoverRef}
      role="dialog"
      aria-label="Notificações Recentes"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-stone-100 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="p-3 bg-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-anil-800" />
          <span className="font-serif font-bold text-xs text-stone-900">Notificações</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-anil-800 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-[11px] text-stone-600 hover:text-stone-900 font-medium hover:underline cursor-pointer"
          >
            Marcar lidas
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-stone-50">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-500">
            Nenhuma notificação nova no momento.
          </div>
        ) : (
          notifications.slice(0, 4).map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item.link)}
                className={clsx(
                  'p-3 hover:bg-stone-50 cursor-pointer transition-colors flex items-start gap-3',
                  item.unread && 'bg-red-50/20'
                )}
              >
                <div
                  className={clsx(
                    'p-1.5 rounded-full shrink-0 mt-0.5',
                    item.unread ? 'bg-red-100 text-anil-800' : 'bg-stone-100 text-stone-500'
                  )}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-stone-900 truncate">{item.title}</p>
                    {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-anil-800 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                    {item.message}
                  </p>
                  <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" /> {item.time}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 bg-stone-50 text-center">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/notifications');
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-anil-800 hover:text-anil-900 hover:underline cursor-pointer"
        >
          <span>Abrir Central de Notificações Completa</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
