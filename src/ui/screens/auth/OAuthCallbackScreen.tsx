import React, { useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { LoadingState } from '../../components/feedback/LoadingState';

export const OAuthCallbackScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [status, setStatus] = useState('Processando autenticação federada…');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('Sessão validada. Redirecionando para a Academia…');
      setTimeout(() => {
        navigate('/');
      }, 500);
    }, 800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <ScreenContainer
      id="auth-callback"
      title="Autenticação Federada"
      subtitle="Validação segura de token OAuth com a autoridade de identidade."
      badgeLabel="OAuth 2.0"
      badgeVariant="neutral"
    >
      <div className="py-16 flex flex-col items-center justify-center space-y-4">
        <LoadingState id="oauth-loading" message={status} />
      </div>
    </ScreenContainer>
  );
};
