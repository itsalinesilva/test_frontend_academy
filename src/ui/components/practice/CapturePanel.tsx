import React from 'react';
import { Tuner } from '../domain/Tuner';
import { Button } from '../base/Button';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';
import { EstadoCaptura, LeituraAoVivo } from '../../hooks/useAudioCapture';
import { notaMaisProxima, frequenciaDaNota } from '../../../domain/practice-measurement';

/**
 * Painel de captura acústica da sessão de prática.
 *
 * Mostra ao vivo o que o motor está ouvindo — nota, desvio em cents e nível
 * de entrada. Serve a dois propósitos ao mesmo tempo:
 *
 *  1. É o afinador que o aluno usa enquanto toca.
 *  2. É a prova de que a medição existe. Um número de afinação que aparece
 *     só no fim, sem nada se mexendo durante a execução, é indistinguível de
 *     um número inventado — e era exatamente isso que acontecia antes.
 */

export interface PainelDeCapturaProps {
  estado: EstadoCaptura;
  leitura: LeituraAoVivo;
  notaAlvo?: string;
  onIniciar: () => void;
  onCancelar: () => void;
  id?: string;
}

export const CapturePanel: React.FC<PainelDeCapturaProps> = ({
  estado,
  leitura,
  notaAlvo,
  onIniciar,
  onCancelar,
  id = 'painel-captura',
}) => {
  const frequenciaAlvo = notaAlvo ? frequenciaDaNota(notaAlvo) : null;
  const detected = leitura.frequenciaHz !== null ? notaMaisProxima(leitura.frequenciaHz) : null;

  const desvioAoAlvo =
    leitura.frequenciaHz !== null && frequenciaAlvo
      ? Math.round(1200 * Math.log2(leitura.frequenciaHz / frequenciaAlvo))
      : undefined;

  if (estado === 'indisponivel') {
    return (
      <div
        id={id}
        className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-xs leading-relaxed text-amber-900">
          Este navegador não dá acesso ao microfone. Os exercícios de execução podem ser feitos
          pelo teclado da tela, mas a afinação não será medida.
        </p>
      </div>
    );
  }

  if (estado === 'negado') {
    return (
      <div
        id={id}
        className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3"
      >
        <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-900">
          <MicOff className="mt-0.5 h-4 w-4 shrink-0" />
          O acesso ao microfone foi recusado. Sem ele não há sinal para medir — a tentativa fica
          registrada como não medida, e não como errada.
        </p>
        <Button variant="outline" size="sm" onClick={onIniciar}>
          Tentar liberar de novo
        </Button>
      </div>
    );
  }

  if (estado === 'ocioso' || estado === 'solicitando_permissao') {
    return (
      <div
        id={id}
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white p-3"
      >
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-stone-900">Medição de afinação e tempo</p>
          <p className="text-[11px] leading-relaxed text-stone-500">
            O áudio é analisado no seu aparelho e não é enviado nem gravado.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onIniciar}
          disabled={estado === 'solicitando_permissao'}
        >
          <Mic className="mr-1.5 h-3.5 w-3.5" />
          {estado === 'solicitando_permissao' ? 'Pedindo acesso…' : 'Ligar microfone'}
        </Button>
      </div>
    );
  }

  return (
    <div id={id} className="space-y-3 rounded-lg border border-anil-200 bg-anil-50/40 p-3">
      <Tuner
        id={`${id}-afinador`}
        detectedNote={detected?.nota}
        detectedFreq={leitura.frequenciaHz ?? undefined}
        targetFreq={frequenciaAlvo ?? undefined}
        centsOffset={desvioAoAlvo ?? detected?.deviationCents}
        isListening
      />

      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
          Entrada
        </span>
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"
          role="meter"
          aria-label="Nível de entrada do microfone"
          aria-valuenow={Math.round(leitura.nivel * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full transition-[width] duration-75 ${
              leitura.nivel > 0.012 ? 'bg-emerald-600' : 'bg-stone-400'
            }`}
            // Escala com raiz: a amplitude útil da voz e dos instrumentos vive
            // na parte baixa do intervalo, e uma barra linear ficaria quase
            // sempre encostada na esquerda.
            style={{ width: `${Math.min(100, Math.sqrt(leitura.nivel) * 160)}%` }}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onCancelar}>
          <MicOff className="mr-1 h-3.5 w-3.5" /> Desligar
        </Button>
      </div>

      {leitura.nivel <= 0.012 && (
        <p className="text-[11px] leading-relaxed text-stone-500">
          Silêncio. Toque ou cante — nada é medido enquanto não houver som audível.
        </p>
      )}
    </div>
  );
};
