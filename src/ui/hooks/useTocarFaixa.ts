import { useCallback, useEffect, useRef, useState } from 'react';
import { FaixaDoPlayer } from '../../data/seed-player-repertoire';

/**
 * TOCAR UMA FAIXA DO REPERTÓRIO.
 *
 * POR QUE ISTO VIROU UM HOOK
 * --------------------------
 * A síntese vivia dentro do `GlobalPlayer`, e o Acervo precisa da mesma coisa:
 * a ficha de uma obra tem de poder tocá-la. Copiar o oscilador para lá daria
 * duas implementações do mesmo som, e elas divergiriam na primeira correção —
 * uma tocaria com envelope e a outra com estalo, e ninguém saberia qual está
 * certa.
 *
 * O QUE ELE FAZ
 * -------------
 * Agenda um oscilador por nota, com envelope curto para não estalar no ataque
 * nem cortar seco no fim. Altura zero é pausa: nada é agendado, e o tempo
 * corre. A duração de cada nota vem em **tempos**, relativa ao andamento
 * declarado da faixa.
 *
 * O CONTEXTO DE ÁUDIO É CRIADO SOB DEMANDA
 * ----------------------------------------
 * Navegador nenhum deixa tocar som antes de a pessoa interagir com a página.
 * Criar o contexto no primeiro clique — e não na montagem — é o que faz o som
 * sair na primeira tentativa em vez de na segunda.
 */
export interface ControleDeReproducao {
  tocando: boolean;
  /** Segundos decorridos. Serve para barra de progresso e para o tempo escrito. */
  decorrido: number;
  alternar: () => void;
  parar: () => void;
}

export function useTocarFaixa(
  faixa: FaixaDoPlayer | null,
  volume = 0.7
): ControleDeReproducao {
  const [tocando, setTocando] = useState(false);
  const [decorrido, setDecorrido] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const agendados = useRef<number[]>([]);
  const osciladores = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const relogio = useRef<number | null>(null);

  const contexto = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const parar = useCallback(() => {
    agendados.current.forEach((t) => window.clearTimeout(t));
    agendados.current = [];

    osciladores.current.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch {
        // o nó já terminou sozinho
      }
    });
    osciladores.current = [];

    if (relogio.current) {
      window.clearInterval(relogio.current);
      relogio.current = null;
    }
    setTocando(false);
  }, []);

  useEffect(() => {
    if (!tocando || !faixa) return;

    const ctx = contexto();
    const mestre = ctx.createGain();
    mestre.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    mestre.connect(ctx.destination);

    let acumulado = 0;
    for (const [freq, tempos] of faixa.notas) {
      const dur = tempos * (60 / faixa.bpm);

      if (freq > 0) {
        const t = window.setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            /*
              Envelope curto: sem ele o ataque estala e o fim corta seco. Três
              centésimos de subida bastam para o ouvido não ouvir o clique.
            */
            g.gain.setValueAtTime(0.001, ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.03);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur * 0.95);
            osc.connect(g);
            g.connect(mestre);
            osc.start();
            osc.stop(ctx.currentTime + dur);
            osciladores.current.push({ osc, gain: g });
          } catch {
            // contexto suspenso pelo navegador; o clique seguinte o retoma
          }
        }, acumulado * 1000);
        agendados.current.push(t);
      }

      acumulado += dur;
    }

    const total = faixa.duracaoSegundos;
    const inicio = Date.now();
    relogio.current = window.setInterval(() => {
      const t = (Date.now() - inicio) / 1000;
      if (t >= total) {
        setDecorrido(total);
        parar();
      } else {
        setDecorrido(t);
      }
    }, 120);

    return parar;
  }, [tocando, faixa, volume, contexto, parar]);

  const alternar = useCallback(() => {
    if (!faixa) return;
    setDecorrido(0);
    setTocando((t) => !t);
  }, [faixa]);

  return { tocando, decorrido, alternar, parar };
}
