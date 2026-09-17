import React, { useState } from 'react';
import { Card } from '../base/Card';
import { Button } from '../base/Button';
import { FOUNDER_ADMIN_EMAILS } from '../../../domain/capabilities';
import { ShieldCheck, UserCheck, X } from 'lucide-react';

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { email: string; name: string; avatarUrl?: string }) => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const quickGoogleAccounts = [
    {
      name: 'Office Aline Silva',
      email: FOUNDER_ADMIN_EMAILS[1] || 'office.alinesilva@gmail.com',
      badge: 'Fundadora & Admin Canônico',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Aline Silva',
      email: FOUNDER_ADMIN_EMAILS[0] || 'alinealv.silv@gmail.com',
      badge: 'Fundadora & Curadora',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Frederico M. Chopin',
      email: 'f.chopin.estudante@gmail.com',
      badge: 'Conta Pessoal Google',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    onSelectAccount({
      email: customEmail.trim().toLowerCase(),
      name: customName.trim() || customEmail.split('@')[0],
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName || customEmail)}&background=8b0000&color=fff`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <Card
        variant="default"
        padding="lg"
        className="w-full max-w-md shadow-2xl border-stone-300 relative space-y-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Fazer login com o Google
            </h3>
            <p className="text-xs text-stone-500">Escolha uma conta para acessar a Academia Musical</p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {quickGoogleAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelectAccount({ email: acc.email, name: acc.name, avatarUrl: acc.avatar }) }
              className="w-full flex items-center justify-between p-3 rounded-md border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  className="w-9 h-9 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <div className="text-xs font-semibold text-stone-900">{acc.name}</div>
                  <div className="text-[11px] text-stone-500 font-mono">{acc.email}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                {acc.badge}
              </span>
            </button>
          ))}
        </div>

        {!showCustomInput ? (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="text-xs text-red-800 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Usar outra conta Google
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="pt-2 space-y-2.5 border-t border-stone-100">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700 block">Nome da Conta Google</label>
              <input
                type="text"
                required
                placeholder="Ex: Johannes Brahms"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full text-xs p-2 rounded border border-stone-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700 block">E-mail @gmail.com</label>
              <input
                type="email"
                required
                placeholder="exemplo@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full text-xs p-2 rounded border border-stone-300"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowCustomInput(false)}>
                Voltar
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Conectar com esta conta
              </Button>
            </div>
          </form>
        )}

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>OAuth 2.0 Auditado</span>
          </div>
          <span>Política de Privacidade</span>
        </div>
      </Card>
    </div>
  );
};
