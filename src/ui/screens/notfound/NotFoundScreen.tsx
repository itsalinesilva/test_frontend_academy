import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Button } from '../../components/base/Button';
import { Home, Search, Compass, ArrowLeft } from 'lucide-react';

export interface NotFoundScreenProps {
  attemptedPath?: string;
}

export const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ attemptedPath }) => {
  const { navigate, currentPath } = useRouter();
  const path = attemptedPath || currentPath;

  return (
    <ScreenContainer
      id="not-found-screen"
      title="Página Não Encontrada (404)"
      subtitle="A partitura, lição ou rota requisitada não consta nos anais da Academia Musical."
      badgeLabel="Erro 404 • Rota Não Mapeada"
      badgeVariant="brand"
      primaryAction={{
        label: 'Retornar ao Início',
        icon: Home,
        onClick: () => navigate('/'),
      }}
      secondaryActions={[
        {
          label: 'Ir para Academia Formal',
          onClick: () => navigate('/academy'),
        },
        {
          label: 'Busca Global',
          icon: Search,
          onClick: () => navigate('/search'),
        },
      ]}
    >
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mx-auto border border-stone-200 shadow-xs">
          <Compass className="w-8 h-8 text-anil-800" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Coordenada Desconhecida no Atlas Musical
          </h2>
          <p className="text-sm text-stone-600 font-mono bg-stone-50 py-1.5 px-3 rounded-lg inline-block border border-stone-200">
            {path}
          </p>
          <p className="text-xs text-stone-500 max-w-md mx-auto pt-2">
            O endereço informado não corresponde a nenhum recurso acadêmico, partitura ou sala de aula ativa. Utilize o menu superior ou o atalho de comando (Ctrl+K) para navegar.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.history.back()} leadingIcon={<ArrowLeft className="w-4 h-4" />}>
            Voltar à Página Anterior
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/')} leadingIcon={<Home className="w-4 h-4" />}>
            Ir para Visão Geral
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};
