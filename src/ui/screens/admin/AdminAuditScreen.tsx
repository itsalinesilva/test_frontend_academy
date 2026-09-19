import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Badge } from '../../components/base/Badge';
import { auditRepository } from '../../../repositories/audit.repository';
import { AuditEvent, AuditSeverity } from '../../../domain/audit';
import { ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * Trilha de auditoria.
 *
 * Esta tela mostrava quatro eventos escritos no código: uma autenticação
 * administrativa, uma concessão de papel de professor, uma calibragem de
 * motor de áudio e — a mais grave — uma "tentativa de acesso não autenticado
 * à rota protegida /admin/users".
 *
 * Nada disso aconteceu. Numa tela de auditoria de segurança, evento inventado
 * não é enfeite: é a informação em que alguém vai se apoiar para decidir se
 * houve incidente. Mostrar um ataque que não houve é tão nocivo quanto
 * esconder um que houve.
 *
 * Agora lê `auditRepository`, onde o serviço de autenticação efetivamente
 * grava entrada, saída e negativa de acesso. Quando não há registro, a tela
 * diz que não há.
 */
const CORES: Record<AuditSeverity, 'brand' | 'accent' | 'neutral'> = {
  [AuditSeverity.CRITICAL]: 'brand',
  [AuditSeverity.SECURITY]: 'brand',
  [AuditSeverity.WARNING]: 'accent',
  [AuditSeverity.INFO]: 'neutral',
};

export const AdminAuditScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [eventos, setEventos] = useState<AuditEvent[] | null>(null);

  const carregar = useCallback(() => {
    setEventos(null);
    auditRepository
      .listRecent(200)
      .then(setEventos)
      .catch(() => setEventos([]));
  }, []);

  useEffect(carregar, [carregar]);

  return (
    <ScreenContainer
      id="admin-audit"
      title="Trilha de auditoria"
      subtitle="Autenticações, negativas de acesso e alterações de privilégio registradas neste dispositivo."
      badgeLabel="Auditoria"
      badgeVariant="brand"
      primaryAction={{
        label: 'Recarregar',
        icon: RefreshCw,
        onClick: carregar,
      }}
      secondaryActions={[
        {
          label: 'Voltar ao console',
          icon: ArrowLeft,
          onClick: () => navigate('/founder'),
        },
      ]}
      emptyProps={{
        title: 'Nenhum evento registrado',
        description:
          'A trilha grava autenticações, saídas e tentativas de acesso negadas. Ela está vazia porque nada disso ocorreu neste navegador ainda.',
      }}
      state={eventos === null ? 'loading' : eventos.length === 0 ? 'empty' : 'populated'}
    >
      <div className="space-y-4">
        <p className="text-xs text-stone-600">
          A trilha é gravada no armazenamento deste navegador. Ela registra o que aconteceu neste
          dispositivo, e não substitui o registro do servidor de identidade.
        </p>

        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Eventos de auditoria, do mais recente ao mais antigo</caption>
            <thead className="border-b border-stone-200 bg-stone-50 font-mono text-stone-600">
              <tr>
                <th scope="col" className="p-3">
                  Data e hora
                </th>
                <th scope="col" className="p-3">
                  Ação
                </th>
                <th scope="col" className="p-3">
                  Ator
                </th>
                <th scope="col" className="p-3">
                  Severidade
                </th>
                <th scope="col" className="p-3">
                  Alvo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {(eventos ?? []).map((evt) => (
                <tr key={evt.id} className="hover:bg-stone-50">
                  <td className="p-3 text-stone-500">
                    <time dateTime={evt.timestamp}>
                      {new Date(evt.timestamp).toLocaleString('pt-BR')}
                    </time>
                  </td>
                  <td className="p-3 font-semibold text-stone-900">{evt.action}</td>
                  <td className="p-3 text-stone-700">{evt.actorEmail || evt.actorId}</td>
                  <td className="p-3">
                    <Badge variant={CORES[evt.severity] ?? 'neutral'} size="sm">
                      {evt.severity}
                    </Badge>
                  </td>
                  <td className="p-3 font-sans text-xs text-stone-600">
                    {evt.targetType ? `${evt.targetType} ${evt.targetId ?? ''}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ScreenContainer>
  );
};
