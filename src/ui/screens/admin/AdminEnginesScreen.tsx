import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Diagnóstico de capacidades.
 *
 * Esta tela listava quatro "motores" com número de versão, latência em
 * milissegundos e saúde em porcentagem — "Motor de Áudio v1.8.2, 4,8 ms,
 * 99,8%". Nada disso era medido, nenhum desses componentes reporta versão, e
 * um deles citava uma biblioteca que o projeto nem usa. O botão "Executar
 * diagnóstico geral" respondia `alert('Todos os 4 motores responderam em
 * menos de 10ms')` sem consultar coisa alguma.
 *
 * Painel de infraestrutura inventado é pior que painel ausente: ele existe
 * justamente para alguém decidir se há problema, e responde "está tudo bem"
 * sem ter olhado.
 *
 * O que dá para verificar de verdade, aqui, é OUTRA COISA — e é a que
 * importa para um produto que roda inteiro no navegador: quais recursos este
 * navegador concede. Sem WebAudio não há laboratório de som; sem Web Crypto
 * não há assinatura de certificado; sem localStorage não há persistência
 * nenhuma. Isso é medido, agora, neste dispositivo.
 */
interface Capacidade {
  id: string;
  nome: string;
  porQueImporta: string;
  disponivel: boolean;
  detalhe: string;
}

function medirCapacidades(): Capacidade[] {
  const checar = (fn: () => string): { ok: boolean; detalhe: string } => {
    try {
      return { ok: true, detalhe: fn() };
    } catch (e) {
      return { ok: false, detalhe: e instanceof Error ? e.message : 'indisponível' };
    }
  };

  const audio = checar(() => {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error('AudioContext não existe neste navegador');
    const ctx = new Ctor();
    const taxa = ctx.sampleRate;
    void ctx.close();
    return `taxa de amostragem ${taxa} Hz`;
  });

  const microfone = checar(() => {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('captura de áudio não exposta');
    return 'disponível mediante permissão da pessoa';
  });

  const cripto = checar(() => {
    if (!window.crypto?.subtle) throw new Error('Web Crypto exige contexto seguro (HTTPS)');
    return 'SHA-256 disponível para assinar credenciais';
  });

  const armazenamento = checar(() => {
    const chave = '__amd_diagnostico__';
    window.localStorage.setItem(chave, '1');
    window.localStorage.removeItem(chave);
    return 'leitura e escrita confirmadas';
  });

  return [
    {
      id: 'webaudio',
      nome: 'Síntese e análise de áudio (WebAudio)',
      porQueImporta: 'Sustenta o laboratório de som das lições e a reprodução do repertório.',
      disponivel: audio.ok,
      detalhe: audio.detalhe,
    },
    {
      id: 'microfone',
      nome: 'Captura pelo microfone',
      porQueImporta: 'Necessária para a medição de afinação e de tempo na Prática.',
      disponivel: microfone.ok,
      detalhe: microfone.detalhe,
    },
    {
      id: 'webcrypto',
      nome: 'Criptografia (Web Crypto)',
      porQueImporta: 'Assina a impressão dos certificados e deriva a senha das contas infantis.',
      disponivel: cripto.ok,
      detalhe: cripto.detalhe,
    },
    {
      id: 'localstorage',
      nome: 'Armazenamento local',
      porQueImporta: 'É onde todo o progresso do aluno vive. Sem ele, nada persiste.',
      disponivel: armazenamento.ok,
      detalhe: armazenamento.detalhe,
    },
  ];
}

export const AdminEnginesScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [capacidades, setCapacidades] = useState<Capacidade[] | null>(null);

  const medir = useCallback(() => {
    setCapacidades(null);
    // um quadro depois, para o estado de carregamento chegar a aparecer
    window.setTimeout(() => setCapacidades(medirCapacidades()), 0);
  }, []);

  useEffect(medir, [medir]);

  const faltando = (capacidades ?? []).filter((c) => !c.disponivel).length;

  return (
    <ScreenContainer
      id="admin-engines"
      title="Diagnóstico de capacidades"
      subtitle="Recursos que este navegador concede à plataforma, verificados agora neste dispositivo."
      badgeLabel={
        capacidades === null
          ? undefined
          : faltando === 0
            ? 'Tudo disponível'
            : `${faltando} indisponível${faltando > 1 ? 'eis' : ''}`
      }
      badgeVariant={faltando === 0 ? 'neutral' : 'accent'}
      primaryAction={{
        label: 'Verificar de novo',
        icon: RefreshCw,
        onClick: medir,
      }}
      secondaryActions={[
        {
          label: 'Voltar ao console',
          icon: ArrowLeft,
          onClick: () => navigate('/admin'),
        },
      ]}
      state={capacidades === null ? 'loading' : 'populated'}
      loadingMessage="Verificando o que este navegador concede…"
    >
      <div className="space-y-4">
        <p className="text-xs text-stone-600">
          Cada linha é uma verificação executada neste navegador ao abrir a tela. O resultado vale
          para este dispositivo — outro aparelho pode responder diferente.
        </p>

        {(capacidades ?? []).map((c) => (
          <Card key={c.id} variant="default" padding="lg" className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {c.disponivel ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                )}
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">{c.nome}</h3>
                  <p className="mt-0.5 text-xs text-stone-600">{c.porQueImporta}</p>
                </div>
              </div>
              <Badge variant={c.disponivel ? 'neutral' : 'accent'} size="sm">
                {c.disponivel ? 'Disponível' : 'Indisponível'}
              </Badge>
            </div>
            <p className="border-t border-stone-100 pt-2 font-mono text-xs text-stone-500">
              {c.detalhe}
            </p>
          </Card>
        ))}
      </div>
    </ScreenContainer>
  );
};
