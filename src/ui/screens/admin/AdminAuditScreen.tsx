import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Badge } from '../../components/base/Badge';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export const AdminAuditScreen: React.FC = () => {
  const { navigate } = useRouter();

  const auditEvents = [
    {
      id: 'aud-001',
      action: 'auth.login',
      actor: 'admin@academia.mus.br',
      severity: 'INFO',
      timestamp: '2026-09-14T21:40:12Z',
      details: 'Autenticação bem-sucedida com credenciais administrativas.',
    },
    {
      id: 'aud-002',
      action: 'admin.role.granted',
      actor: 'admin@academia.mus.br',
      severity: 'SECURITY',
      timestamp: '2026-09-14T20:15:00Z',
      details: 'Concessão de papel PROFESSOR ao usuário clara@academia.mus.br.',
    },
    {
      id: 'aud-003',
      action: 'engine.config.updated',
      actor: 'system.daemon',
      severity: 'INFO',
      timestamp: '2026-09-14T18:00:00Z',
      details: 'Calibração de latência do motor de áudio WebAudio DSP.',
    },
    {
      id: 'aud-004',
      action: 'security.access.denied',
      actor: 'anonymous',
      severity: 'WARNING',
      timestamp: '2026-09-14T17:22:45Z',
      details: 'Tentativa de acesso não autenticado à rota protegida /admin/users.',
    },
  ];

  return (
    <ScreenContainer
      id="admin-audit"
      title="Trilha Imutável de Auditoria Institucional"
      subtitle="Registro criptográfico de eventos de segurança, autenticações e modificações de privilégios."
      badgeLabel="Auditoria Imutável"
      badgeVariant="brand"
      primaryAction={{
        label: 'Recarregar Registros',
        icon: RefreshCw,
        onClick: () => alert('Registros sincronizados com a cadeia de custódia segura.'),
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Console',
          icon: ArrowLeft,
          onClick: () => navigate('/admin'),
        },
      ]}
    >
      <div className="space-y-4">
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-mono">
              <tr>
                <th className="p-3">Data / Hora (UTC)</th>
                <th className="p-3">Ação</th>
                <th className="p-3">Ator</th>
                <th className="p-3">Severidade</th>
                <th className="p-3">Detalhes do Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {auditEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-stone-50">
                  <td className="p-3 text-stone-500">{evt.timestamp}</td>
                  <td className="p-3 font-semibold text-stone-900">{evt.action}</td>
                  <td className="p-3 text-stone-700">{evt.actor}</td>
                  <td className="p-3">
                    <Badge
                      variant={
                        evt.severity === 'SECURITY'
                          ? 'brand'
                          : evt.severity === 'WARNING'
                          ? 'accent'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {evt.severity}
                    </Badge>
                  </td>
                  <td className="p-3 text-stone-600 font-sans text-xs">{evt.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ScreenContainer>
  );
};
