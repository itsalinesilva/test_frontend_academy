import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const AdminModerationScreen: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <ScreenContainer
      id="admin-moderation"
      title="Fila de Moderação Institucional"
      subtitle="Supervisão de interações da comunidade, proteção ao público infantil e conformidade ética."
      badgeLabel="Fila Vazia"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Voltar ao Console',
        icon: ArrowLeft,
        onClick: () => navigate('/founder'),
      }}
      emptyProps={{
        title: 'Nenhum item pendente de moderação',
        description: 'Todas as discussões no fórum e comentários em salas estão em conformidade com as diretrizes.',
        actionLabel: 'Ver Discussões da Comunidade',
        onAction: () => navigate('/community'),
      }}
    >
      <Card variant="default" padding="lg" className="text-center py-12 space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-800">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-stone-900">
          Comunidade em Plena Conformidade
        </h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto">
          Não constam denúncias pendentes ou violações de conduta registradas no sistema nas últimas 48 horas.
        </p>
      </Card>
    </ScreenContainer>
  );
};
