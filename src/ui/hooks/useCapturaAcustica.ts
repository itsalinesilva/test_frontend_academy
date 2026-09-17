import { useCallback, useEffect, useRef, useState } from 'react';
import { engineGateway } from '../../adapters/engines/gateway/engine-gateway';
import { SinalDaTentativa } from '../../domain/practice-measurement';

/**
 * Captura acústica para a prática.
 *
 * ESTE É O ELO QUE FALTAVA
 * ------------------------
 * O motor de detecção de altura já existia e funcionava — autocorrelação com
 * interpolação parabólica, em `WebAudioEngineAdapter`. Mas a tela de sessão
 * nunca abria o microfone, então nada chegava até ele, e a avaliação
 * preenchia o vazio com `Math.random()`.
 *
 * Não faltava algoritmo: faltava alguém ligar o microfone no motor.
 *
 * O QUE ELE DEVOLVE
 * -----------------
 * Um `SinalDaTentativa` com as frequências detectadas e os instantes dos
 * ataques. Se não houver som audível, devolve o sinal VAZIO — nunca um valor
 * de conveniência. É a medição que decide o que fazer com a ausência.
 */

export type EstadoCaptura =
  | 'ocioso'
  | 'solicitando_permissao'
  | 'capturando'
  | 'negado'
  | 'indisponivel';

export interface LeituraAoVivo {
  /** Última frequência detectada, em Hz. `null` quando não há som. */
  frequenciaHz: number | null;
  /** Amplitude eficaz do sinal, 0..1 — para desenhar o nível de entrada. */
  nivel: number;
}

const TAMANHO_BUFFER = 2048;
/**
 * Um ataque só conta como novo depois deste intervalo.
 *
 * Sem isso, o mesmo ataque seria contado várias vezes enquanto a amplitude
 * oscila logo após o transiente, e o andamento medido sairia absurdamente
 * alto.
 */
const INTERVALO_MINIMO_ENTRE_ATAQUES_MS = 90;
/** Acima deste salto de amplitude em relação à média recente, é um ataque. */
const FATOR_DE_ATAQUE = 2.4;
const NIVEL_MINIMO = 0.012;

export function useCapturaAcustica() {
  const [estado, setEstado] = useState<EstadoCaptura>('ocioso');
  const [leitura, setLeitura] = useState<LeituraAoVivo>({ frequenciaHz: null, nivel: 0 });

  const contextoRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analisadorRef = useRef<AnalyserNode | null>(null);
  const quadroRef = useRef<number | null>(null);

  const frequenciasRef = useRef<number[]>([]);
  const ataquesRef = useRef<number[]>([]);
  const inicioRef = useRef<number>(0);
  const niveisRecentesRef = useRef<number[]>([]);
  const ultimoAtaqueRef = useRef<number>(-Infinity);
  const primeiroSomRef = useRef<number | null>(null);
  const ultimoSomRef = useRef<number | null>(null);

  const encerrar = useCallback(() => {
    if (quadroRef.current !== null) cancelAnimationFrame(quadroRef.current);
    quadroRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    // O contexto é fechado, e não só pausado: um AudioContext vivo mantém o
    // indicador de microfone aceso no navegador depois do exercício acabar.
    contextoRef.current?.close().catch(() => undefined);
    contextoRef.current = null;
    analisadorRef.current = null;
  }, []);

  useEffect(() => encerrar, [encerrar]);

  const iniciar = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setEstado('indisponivel');
      return false;
    }

    setEstado('solicitando_permissao');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Estes três processamentos existem para voz falada e atrapalham
          // aqui: o cancelamento de eco come sustentações, e o controle
          // automático de ganho achata a dinâmica que se quer medir.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const contexto = new Contexto();
      const fonte = contexto.createMediaStreamSource(stream);
      const analisador = contexto.createAnalyser();
      analisador.fftSize = TAMANHO_BUFFER;
      fonte.connect(analisador);

      streamRef.current = stream;
      contextoRef.current = contexto;
      analisadorRef.current = analisador;

      frequenciasRef.current = [];
      ataquesRef.current = [];
      niveisRecentesRef.current = [];
      ultimoAtaqueRef.current = -Infinity;
      primeiroSomRef.current = null;
      ultimoSomRef.current = null;
      inicioRef.current = performance.now();

      setEstado('capturando');
      const motor = engineGateway.getAudioEngine();
      const buffer = new Float32Array(analisador.fftSize);

      const analisar = async () => {
        if (!analisadorRef.current) return;
        analisadorRef.current.getFloatTimeDomainData(buffer);

        let soma = 0;
        for (let i = 0; i < buffer.length; i++) soma += buffer[i] * buffer[i];
        const nivel = Math.sqrt(soma / buffer.length);
        const agora = performance.now() - inicioRef.current;

        // Detecção de ataque: salto de amplitude sobre a média recente.
        const media =
          niveisRecentesRef.current.length > 0
            ? niveisRecentesRef.current.reduce((a, b) => a + b, 0) / niveisRecentesRef.current.length
            : 0;
        if (
          nivel > NIVEL_MINIMO &&
          nivel > media * FATOR_DE_ATAQUE &&
          agora - ultimoAtaqueRef.current > INTERVALO_MINIMO_ENTRE_ATAQUES_MS
        ) {
          ataquesRef.current.push(Math.round(agora));
          ultimoAtaqueRef.current = agora;
        }
        niveisRecentesRef.current.push(nivel);
        if (niveisRecentesRef.current.length > 12) niveisRecentesRef.current.shift();

        let frequencia: number | null = null;
        if (nivel > NIVEL_MINIMO) {
          const resultado = await motor.detectPitch(buffer, contexto.sampleRate);
          // `clarity` abaixo de 0,5 quer dizer que a autocorrelacao nao
          // encontrou periodicidade convincente — ruido de fundo, sopro,
          // dois sons ao mesmo tempo. Registrar isso como altura poluiria a
          // mediana com valores que ninguem tocou.
          if (resultado && resultado.pitchHz > 0 && resultado.clarity >= 0.5) {
            frequencia = resultado.pitchHz;
            frequenciasRef.current.push(resultado.pitchHz);
            if (primeiroSomRef.current === null) primeiroSomRef.current = agora;
            ultimoSomRef.current = agora;
          }
        }

        setLeitura({ frequenciaHz: frequencia, nivel });
        quadroRef.current = requestAnimationFrame(() => void analisar());
      };

      quadroRef.current = requestAnimationFrame(() => void analisar());
      return true;
    } catch {
      setEstado('negado');
      return false;
    }
  }, []);

  /**
   * Encerra a captura e devolve o sinal.
   *
   * Vazio é vazio: se não houve som, os vetores voltam vazios e a medição
   * registra a ausência em vez de receber um valor de conveniência.
   */
  const finalizar = useCallback((): SinalDaTentativa => {
    const duracaoRealSegundos =
      primeiroSomRef.current !== null && ultimoSomRef.current !== null
        ? (ultimoSomRef.current - primeiroSomRef.current) / 1000
        : undefined;

    const sinal: SinalDaTentativa = {
      frequenciasHz: [...frequenciasRef.current],
      ataquesMs: [...ataquesRef.current],
      duracaoRealSegundos,
    };

    encerrar();
    setEstado('ocioso');
    setLeitura({ frequenciaHz: null, nivel: 0 });
    return sinal;
  }, [encerrar]);

  const cancelar = useCallback(() => {
    encerrar();
    setEstado('ocioso');
    setLeitura({ frequenciaHz: null, nivel: 0 });
  }, [encerrar]);

  return { estado, leitura, iniciar, finalizar, cancelar };
}
