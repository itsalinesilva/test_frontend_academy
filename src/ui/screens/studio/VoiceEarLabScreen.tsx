import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Mic, ArrowLeft, Play } from 'lucide-react';

export const VoiceEarLabScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [detectedPitch, setDetectedPitch] = useState('A4 (440.0 Hz)');
  const [centsDeviation, setCentsDeviation] = useState(+2);

  const handleToggleListening = () => {
    const nextState = !isListening;
    setIsListening(nextState);
    if (nextState) {
      setDetectedPitch('C4 (261.63 Hz)');
      setCentsDeviation(0);
    } else {
      setDetectedPitch('A4 (440.0 Hz)');
      setCentsDeviation(+2);
    }
  };

  return (
    <ScreenContainer
      id="voice-ear-lab"
      title="Laboratório de Voz, Pitch & Percepção"
      subtitle="Treinamento de afinação, detecção de notas em tempo real e percepção de intervalos acústicos."
      badgeLabel="Motor de Áudio"
      badgeVariant="neutral"
      primaryAction={{
        label: isListening ? 'Interromper Captação' : 'Iniciar Microfone & Afinador',
        icon: Mic,
        onClick: handleToggleListening,
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Estúdio',
          icon: ArrowLeft,
          onClick: () => navigate('/studio'),
        },
      ]}
      emptyProps={{
        title: 'Dispositivo de microfone desconectado',
        description: 'Verifique as permissões do navegador ou conecte uma interface de áudio nas Configurações.',
        actionLabel: 'Ver Configurações de Áudio',
        onAction: () => navigate('/settings'),
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Tuner / Pitch Visualizer Card */}
        <Card variant="default" padding="lg" className="space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-900">
                Afinador Cromático de Alta Precisão
              </span>
              <Badge variant={isListening ? 'brand' : 'neutral'}>
                {isListening ? 'Captação Ativa' : 'Em Espera'}
              </Badge>
            </div>

            <div className="my-8 text-center space-y-2">
              <span className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
                {isListening ? 'Lá 4' : '--'}
              </span>
              <p className="text-xs font-mono text-stone-500">
                {isListening ? detectedPitch : 'Aguardando sinal de entrada (Microfone)'}
              </p>
            </div>

            {/* Cents meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-stone-400">
                <span>-50 cents</span>
                <span className="text-emerald-700 font-bold">Perfeito (0)</span>
                <span>+50 cents</span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-200"
                  style={{ width: isListening ? '52%' : '50%' }}
                />
              </div>
              {isListening && (
                <p className="text-center text-xs font-mono text-emerald-800">
                  Desvio: {centsDeviation > 0 ? `+${centsDeviation}` : centsDeviation} cents
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono">
            <span>Padrão de Calibração: A4 = 440 Hz</span>
            <span>Temperamento Igual</span>
          </div>
        </Card>

        {/* Ear Training Interval Card */}
        <Card variant="default" padding="lg" className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-stone-900">
                Treinamento de Intervalos Auditivos
              </span>
              <Badge variant="neutral">Percepção I</Badge>
            </div>

            <p className="text-xs text-stone-600">
              Ouça o intervalo sonoro executado por sintetizador analítico e identifique sua classificação intervalar:
            </p>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-md flex items-center justify-center">
              <Button variant="outline" size="sm" onClick={() => alert('Reproduzindo intervalo acústico...')}>
                <Play className="w-3.5 h-3.5 mr-1.5 text-red-800" />
                Tocar Intervalo Misterioso
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {['3ª Menor', '3ª Maior', '4ª Justa', '5ª Justa'].map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => alert(`Você selecionou: ${interval}`)}
                  className="p-2 text-xs font-mono rounded border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-center transition-colors"
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Sequência de Treino: 4/10</span>
            <span className="text-emerald-700 font-mono font-semibold">85% de Precisão</span>
          </div>
        </Card>
      </div>
    </ScreenContainer>
  );
};
