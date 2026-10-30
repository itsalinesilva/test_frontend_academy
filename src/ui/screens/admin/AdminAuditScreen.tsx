import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Badge } from '../../components/base/Badge';
import { auditRepository } from '../../../repositories/audit.repository';
import { AuditEvent, AuditSeverity } from '../../../domain/audit';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { adminService } from '../../../services/application/admin.service';
import { authService } from '../../../services/application/auth.service';
import { AuditRecord } from '../../../contracts/admin-contracts';

/**
 * AUD-15 — o registro do SERVIDOR. Existia (`GET /api/v1/admin/audit-logs`,
 * encadeado por HMAC) e nenhuma tela o lia: o painel prometia "logs
 * criptográficos" e mostrava só o do navegador. Enquanto não houver
 * armazenamento durável (I-CF-3), ele vive na memória da instância do
 * servidor, e a tela diz isso.
 */
type DoServidor =
  | { estado: 'carregando' }
  | { estado: 'erro'; motivo: string }
  | { estado: 'ok'; logs: AuditRecord[]; integra: boolean; quebraEm?: number };

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

  const [servidor, setServidor] = useState<DoServidor>({ estado: 'carregando' });
  const carregarServidor = useCallback(() => {
    setServidor({ estado: 'carregando' });
    authService
      .getActiveSession()
      .then((s) => adminService.fetchAuditLogs(s?.accessToken ?? null, 200))
      .then((r) =>
        setServidor({ estado: 'ok', logs: r.logs, integra: r.integrity.valid, quebraEm: r.integrity.brokenAtSeq })
      )
      .catch((e: Error) => setServidor({ estado: 'erro', motivo: e.message }));
  }, []);

  useEffect(carregar, [carregar]);
  useEffect(carregarServidor, [carregarServidor]);

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
        onClick: () => {
          carregar();
          carregarServidor();
        },
      }}
      secondaryActions={[
        {
          label: 'Voltar ao console',
          icon: ArrowLeft,
          onClick: () => navigate('/founder'),
        },
      ]}
      /* Sem estado "vazio" da tela inteira: ele escondia o registro do servidor quando o do navegador estava vazio. */
      state={eventos === null ? 'loading' : 'populated'}
    >
      <div className="space-y-4">
        <section aria-labelledby="auditoria-servidor" className="space-y-2 rounded-lg border border-stone-200 bg-white p-4">
          <h2 id="auditoria-servidor" className="font-serif text-base font-bold text-stone-900">
            Registro do servidor
          </h2>
          <p className="text-xs text-stone-600">
            Assinado elo a elo (HMAC-SHA256): alterar ou apagar um registro quebra a verificação dali em diante. Por
            enquanto fica na memória do servidor e recomeça quando a instância reinicia — o armazenamento durável é a
            pendência I-CF-3.
          </p>
          {servidor.estado === 'carregando' && <p className="text-xs text-stone-500">Consultando o servidor…</p>}
          {servidor.estado === 'erro' && (
            <p role="alert" className="text-xs text-amber-800">
              O servidor não entregou o registro: {servidor.motivo}
            </p>
          )}
          {servidor.estado === 'ok' && (
            <>
              <p className={`text-xs font-semibold ${servidor.integra ? 'text-emerald-800' : 'text-red-800'}`}>
                {servidor.integra
                  ? `Cadeia íntegra — ${servidor.logs.length} registro${servidor.logs.length === 1 ? '' : 's'}.`
                  : `Cadeia QUEBRADA no registro ${servidor.quebraEm ?? '?'}: alguém alterou ou removeu um elo.`}
              </p>
              {servidor.logs.length > 0 && (
                <ul className="divide-y divide-stone-100 font-mono text-xs">
                  {servidor.logs.map((r) => (
                    <li key={r.id} className="flex flex-wrap gap-x-3 py-1.5">
                      <time dateTime={r.timestamp} className="text-stone-500">
                        {new Date(r.timestamp).toLocaleString('pt-BR')}
                      </time>
                      <span className="font-semibold text-stone-900">{r.action}</span>
                      <span className="text-stone-700">{r.actorEmail}</span>
                      <span className="font-sans text-stone-600">{r.details}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <h2 className="font-serif text-base font-bold text-stone-900">Registro deste navegador</h2>
        <p className="text-xs text-stone-600">
          A trilha é gravada no armazenamento deste navegador. Ela registra o que aconteceu neste
          dispositivo, e não substitui o registro do servidor de identidade.
        </p>

        {(eventos ?? []).length === 0 ? (
          <p className="text-xs text-stone-500">
            Nenhum evento neste navegador ainda: nenhuma entrada, saída ou negativa de acesso ocorreu aqui.
          </p>
        ) : (
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
        )}
      </div>
    </ScreenContainer>
  );
};
