import React, { useCallback, useMemo, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { useCapturaAcustica } from '../../hooks/useCapturaAcustica';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { notaMaisProxima, frequenciaDaNota } from '../../../domain/practice-measurement';
import { Mic, ArrowLeft, Play, MicOff } from 'lucide-react';

/**
 * Laboratório de voz, afinação e percepção.
 *
 * O QUE HAVIA AQUI
 * ----------------
 * Nada disto funcionava, e tudo parecia funcionar:
 *
 *   - o "afinador" exibia `'A4 (440.0 Hz)'` e desvio de +2 cents escritos no
 *     código; ligar o microfone apenas trocava os dois valores por outros
 *     dois igualmente fixos — sem pedir permissão, sem ouvir nada;
 *   - "Tocar intervalo misterioso" chamava `alert('Reproduzindo intervalo
 *     acústico…')`, sem emitir som;
 *   - escolher a resposta chamava `alert('Você selecionou: 3ª menor')`, sem
 *     dizer se estava certa;
 *   - o rodapé afirmava "Sequência de treino: 4/10" e "85% de precisão" de
 *     uma pessoa que nunca respondeu nada.
 *
 * Uma tela de treino auditivo que não toca som e não corrige a resposta não é
 * uma versão inicial do recurso: é o contrário dele.
 *
 * O QUE HÁ AGORA
 * --------------
 * O afinador usa `useCapturaAcustica` — microfone de verdade, com permissão
 * pedida à pessoa e detecção de frequência por autocorrelação — e converte a
 * leitura em nota e cents com `notaMaisProxima`, a mesma função que mede a
 * Prática. O treino de intervalos sintetiza as duas alturas com
 * `webAudioSynth` a partir de uma raiz sorteada, confere a resposta e conta
 * acertos sobre tentativas. Zero de dez é o que aparece antes da primeira
 * resposta, porque é o que a pessoa tem.
 */

/** Intervalos do treino, em semitons — do uníssono à oitava. */
const INTERVALOS = [
  { semitons: 3, nome: '3ª menor' },
  { semitons: 4, nome: '3ª maior' },
  { semitons: 5, nome: '4ª justa' },
  { semitons: 7, nome: '5ª justa' },
] as const;

type Intervalo = (typeof INTERVALOS)[number];

/** Raízes confortáveis para ouvir, todas na região central do teclado. */
const RAIZES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'];

interface Rodada {
  raizHz: number;
  intervalo: Intervalo;
}

function sortearRodada(): Rodada {
  const raiz = RAIZES[Math.floor(Math.random() * RAIZES.length)];
  const intervalo = INTERVALOS[Math.floor(Math.random() * INTERVALOS.length)];
  return { raizHz: frequenciaDaNota(raiz) ?? 261.63, intervalo };
}

export const VoiceEarLabScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { estado, leitura, iniciar, finalizar } = useCapturaAcustica();

  const [rodada, setRodada] = useState<Rodada>(() => sortearRodada());
  const [tocou, setTocou] = useState(false);
  const [resposta, setResposta] = useState<Intervalo | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [tentativas, setTentativas] = useState(0);

  const capturando = estado === 'capturando';

  /** Leitura do afinador: nota e cents, ou silêncio. */
  const afinacao = useMemo(() => {
    if (!capturando || leitura.frequenciaHz === null) return null;
    return notaMaisProxima(leitura.frequenciaHz);
  }, [capturando, leitura.frequenciaHz]);

  const tocarIntervalo = useCallback(() => {
    const { raizHz, intervalo } = rodada;
    const segunda = raizHz * Math.pow(2, intervalo.semitons / 12);
    webAudioSynth.playSequence([raizHz, segunda], 0.7);
    setTocou(true);
  }, [rodada]);

  const responder = (escolha: Intervalo) => {
    if (resposta) return; // já respondeu esta rodada
    setResposta(escolha);
    setTentativas((n) => n + 1);
    if (escolha.semitons === rodada.intervalo.semitons) setAcertos((n) => n + 1);
  };

  const proximaRodada = () => {
    setRodada(sortearRodada());
    setResposta(null);
    setTocou(false);
  };

  const precisao = tentativas === 0 ? null : Math.round((acertos / tentativas) * 100);
  const acertou = resposta !== null && resposta.semitons === rodada.intervalo.semitons;

  return (
    <ScreenContainer
      id="voice-ear-lab"
      title="Laboratório de voz, afinação e percepção"
      subtitle="Afinador por microfone e treino de reconhecimento de intervalos."
      badgeLabel="Áudio"
      badgeVariant="neutral"
      primaryAction={{
        label: capturando ? 'Parar o afinador' : 'Ligar o afinador',
        icon: capturando ? MicOff : Mic,
        onClick: () => (capturando ? finalizar() : iniciar()),
      }}
      secondaryActions={[
        {
          label: 'Voltar ao estúdio',
          icon: ArrowLeft,
          onClick: () => navigate('/studio'),
        },
      ]}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-stone-900">Afinador</h2>
            <Badge variant={capturando ? 'brand' : 'neutral'} size="sm">
              {capturando ? 'Ouvindo' : 'Parado'}
            </Badge>
          </div>

          {estado === 'negado' && (
            <p className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              O navegador não liberou o microfone. Autorize o acesso nas permissões do site para
              usar o afinador.
            </p>
          )}

          {estado === 'indisponivel' && (
            <p className="rounded border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
              Este navegador não expõe captura de áudio. O treino de intervalos abaixo continua
              funcionando, porque só depende de reprodução.
            </p>
          )}

          <div className="rounded-md border border-stone-200 bg-stone-50 p-6 text-center">
            {!capturando ? (
              <p className="text-sm text-stone-600">
                Ligue o afinador e cante ou toque uma nota sustentada.
              </p>
            ) : afinacao ? (
              <>
                <p className="font-serif text-4xl font-bold text-stone-900">{afinacao.nota}</p>
                <p className="mt-1 font-mono text-sm text-stone-600">
                  {leitura.frequenciaHz?.toFixed(1)} Hz
                </p>
                <p
                  className={`mt-2 font-mono text-sm font-semibold ${
                    Math.abs(afinacao.desvioCents) <= 5
                      ? 'text-emerald-700'
                      : Math.abs(afinacao.desvioCents) <= 20
                        ? 'text-amber-700'
                        : 'text-red-700'
                  }`}
                >
                  {afinacao.desvioCents > 0 ? '+' : ''}
                  {afinacao.desvioCents} cents
                </p>
              </>
            ) : (
              <p className="text-sm text-stone-500">Silêncio — nenhuma altura detectada.</p>
            )}
          </div>
        </Card>

        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-stone-900">
              Reconhecimento de intervalos
            </h2>
            <Badge variant="neutral" size="sm">
              Percepção
            </Badge>
          </div>

          <p className="text-xs text-stone-600">
            Ouça as duas notas e identifique a distância entre elas. A raiz muda a cada rodada,
            para que o reconhecimento não se apoie na altura absoluta.
          </p>

          <div className="flex items-center justify-center rounded-md border border-stone-200 bg-stone-50 p-4">
            <Button variant="outline" size="sm" onClick={tocarIntervalo}>
              <Play className="mr-1.5 h-3.5 w-3.5 text-anil-800" aria-hidden="true" />
              {tocou ? 'Ouvir de novo' : 'Tocar o intervalo'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {INTERVALOS.map((opcao) => {
              const escolhida = resposta?.semitons === opcao.semitons;
              const eraACerta = resposta !== null && opcao.semitons === rodada.intervalo.semitons;
              return (
                <button
                  key={opcao.semitons}
                  type="button"
                  disabled={!tocou || resposta !== null}
                  onClick={() => responder(opcao)}
                  className={`rounded border p-2 text-center font-mono text-xs transition-colors ${
                    eraACerta
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : escolhida
                        ? 'border-red-300 bg-red-50 text-red-900'
                        : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50 disabled:opacity-50'
                  }`}
                >
                  {opcao.nome}
                </button>
              );
            })}
          </div>

          {resposta && (
            <div className="space-y-2">
              <p
                className={`text-xs font-semibold ${acertou ? 'text-emerald-700' : 'text-red-700'}`}
                role="status"
              >
                {acertou
                  ? 'Correto.'
                  : `Era ${rodada.intervalo.nome}. Ouça de novo antes de seguir.`}
              </p>
              <Button variant="primary" size="sm" onClick={proximaRodada}>
                Próximo intervalo
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
            <span>
              {tentativas === 0
                ? 'Nenhuma resposta ainda'
                : `${acertos} de ${tentativas} corretas`}
            </span>
            {precisao !== null && (
              <span
                className={`font-mono font-semibold ${
                  precisao >= 70 ? 'text-emerald-700' : 'text-stone-600'
                }`}
              >
                {precisao}% de acerto
              </span>
            )}
          </div>
        </Card>
      </div>
    </ScreenContainer>
  );
};
