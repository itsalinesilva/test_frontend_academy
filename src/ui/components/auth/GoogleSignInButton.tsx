import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  requestGoogleIdToken,
  createNonce,
  isGoogleSignInConfigured,
  GoogleIdentityError,
} from '../../../infrastructure/auth/google-identity-client';

interface GoogleSignInButtonProps {
  /** Recebe o ID token REAL do Google e o nonce usado para obtê-lo. */
  onCredential: (credential: { idToken: string; nonce: string }) => void | Promise<void>;
  onError?: (message: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

/**
 * Botão oficial do Google Identity Services.
 *
 * Substitui o `GoogleOAuthModal`, que simulava a janela federada e emitia
 * `mock_google_id_token_...`, permitindo entrar com qualquer e-mail digitado
 * — inclusive os da fundadora (CLAUDE_AUDIT.md S-03/S-04).
 *
 * Este componente não sabe quem é admin, não sabe quem é fundador e não
 * valida nada: apenas entrega a credencial assinada para o servidor decidir.
 */
export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onCredential,
  onError,
  text = 'signin_with',
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGoogleSignInConfigured()) {
      setConfigError(
        'Google Sign-In não está configurado neste ambiente. Defina VITE_GOOGLE_OAUTH_CLIENT_ID.'
      );
      return;
    }

    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    const nonce = createNonce();

    requestGoogleIdToken({ container, nonce, text })
      .then((idToken) => {
        if (cancelled) return;
        return onCredential({ idToken, nonce });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof GoogleIdentityError
            ? error.message
            : 'Falha ao iniciar a autenticação com o Google.';
        setConfigError(message);
        onError?.(message);
      });

    return () => {
      cancelled = true;
    };
  }, [onCredential, onError, text]);

  if (configError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold">Autenticação indisponível</p>
          <p className="leading-relaxed text-amber-800">{configError}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-busy={disabled}
      className={disabled ? 'pointer-events-none opacity-50' : undefined}
      // O Google injeta aqui o botão oficial, já acessível por teclado.
    />
  );
};
