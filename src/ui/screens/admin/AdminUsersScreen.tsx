import React, { useCallback, useEffect, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Badge } from '../../components/base/Badge';
import { Avatar } from '../../components/data-display/Avatar';
import { apiClient } from '../../../infrastructure/api/api-client';
import { ArrowLeft, Search, ShieldCheck } from 'lucide-react';

/**
 * Contas da plataforma (P-5 · AUD-12).
 *
 * Esta tela listava quatro pessoas escritas à mão; depois, com honestidade,
 * só "as contas deste navegador", sem ação nenhuma — a administração não
 * sabia quem usava a plataforma nem conseguia agir.
 *
 * Agora lê o registro que o SERVIDOR faz a cada login, e suspende ou
 * restaura: suspender faz o servidor recusar a sessão da pessoa em toda
 * rota, com motivo obrigatório e trilha de auditoria. Papel administrativo
 * continua fora daqui, por construção: vem da allowlist do ambiente.
 */
interface Conta {
  sub: string;
  email: string;
  nome: string;
  primeiroAcesso: string;
  ultimoAcesso: string;
  acessos: number;
  suspensa?: { em: string; por: string; motivo: string };
}

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

export const AdminUsersScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [busca, setBusca] = useState('');
  const [contas, setContas] = useState<Conta[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [suspendendo, setSuspendendo] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');

  const carregar = useCallback(() => {
    apiClient
      .get<Conta[]>(`/founder/contas${busca.trim() ? `?q=${encodeURIComponent(busca.trim())}` : ''}`)
      .then((c) => {
        setContas(c);
        setErro(null);
      })
      .catch((e) => {
        setErro(e instanceof Error ? e.message : 'O servidor não entregou as contas.');
        setContas([]);
      });
  }, [busca]);
  useEffect(() => {
    const t = setTimeout(carregar, busca ? 300 : 0);
    return () => clearTimeout(t);
  }, [carregar, busca]);

  const agir = async (sub: string, acao: 'suspender' | 'restaurar') => {
    try {
      await apiClient.post(`/founder/contas/${encodeURIComponent(sub)}/${acao}`, { motivo });
      setSuspendendo(null);
      setMotivo('');
      carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível.');
    }
  };

  return (
    <ScreenContainer
      id="admin-users"
      title="Contas"
      subtitle="Quem entrou na plataforma, registrado pelo servidor a cada login."
      badgeLabel="Console"
      badgeVariant="brand"
      primaryAction={{ label: 'Voltar ao console', icon: ArrowLeft, onClick: () => navigate('/founder') }}
      emptyProps={{
        title: erro ? 'Não deu para abrir as contas' : busca ? 'Nenhuma conta corresponde à busca' : 'Nenhuma conta registrada',
        description: erro ?? 'As contas aparecem aqui a partir do primeiro login de cada pessoa.',
      }}
      state={contas === null ? 'loading' : contas.length === 0 ? 'empty' : 'populated'}
    >
      <div className="space-y-4">
        <p className="flex items-start gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <span>
            Suspender recusa a sessão da pessoa em toda a plataforma, na hora. Os dados de estudo dela continuam no Drive
            dela — suspender não apaga nada. O papel administrativo vem da allowlist do servidor e não se edita aqui.
          </span>
        </p>

        {erro && contas && contas.length > 0 && <p role="alert" className="text-xs text-red-800">{erro}</p>}

        <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2">
          <Search className="ml-2 h-4 w-4 text-stone-400" aria-hidden="true" />
          <label htmlFor="admin-users-busca" className="sr-only">
            Filtrar contas por nome ou e-mail
          </label>
          <input
            id="admin-users-busca"
            type="search"
            placeholder="Filtrar por nome ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Contas registradas pelo servidor</caption>
            <thead className="border-b border-stone-200 bg-stone-50 font-mono text-stone-600">
              <tr>
                <th scope="col" className="p-3">Pessoa</th>
                <th scope="col" className="p-3">Primeiro acesso</th>
                <th scope="col" className="p-3">Último acesso</th>
                <th scope="col" className="p-3">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(contas ?? []).map((c) => (
                <tr key={c.sub} className="align-top hover:bg-stone-50">
                  <td className="flex items-center gap-2.5 p-3">
                    <Avatar name={c.nome || c.email} size="sm" />
                    <div>
                      <p className="font-bold text-stone-900">{c.nome || '—'}</p>
                      <p className="font-mono text-[11px] text-stone-500">{c.email}</p>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-stone-500">{data(c.primeiroAcesso)}</td>
                  <td className="p-3 font-mono text-stone-500">
                    {data(c.ultimoAcesso)} · {c.acessos} {c.acessos === 1 ? 'acesso' : 'acessos'}
                  </td>
                  <td className="space-y-1 p-3">
                    {c.suspensa ? (
                      <>
                        <Badge variant="brand" size="sm">Suspensa</Badge>
                        <p className="text-[11px] text-stone-600">{c.suspensa.motivo} — por {c.suspensa.por}, {data(c.suspensa.em)}</p>
                        <button type="button" onClick={() => void agir(c.sub, 'restaurar')} className="text-[11px] font-semibold text-anil-700">
                          Restaurar
                        </button>
                      </>
                    ) : suspendendo === c.sub ? (
                      <div className="space-y-1">
                        <label htmlFor={`motivo-${c.sub}`} className="text-[11px] text-stone-600">Motivo (fica na auditoria)</label>
                        <input id={`motivo-${c.sub}`} value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full rounded border border-stone-300 p-1" />
                        <div className="flex gap-2">
                          <button type="button" disabled={!motivo.trim()} onClick={() => void agir(c.sub, 'suspender')} className="text-[11px] font-semibold text-red-700 disabled:opacity-40">
                            Suspender
                          </button>
                          <button type="button" onClick={() => setSuspendendo(null)} className="text-[11px] text-stone-600">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Badge variant="neutral" size="sm">Ativa</Badge>
                        <button type="button" onClick={() => { setSuspendendo(c.sub); setMotivo(''); }} className="ml-2 text-[11px] text-red-700">
                          Suspender…
                        </button>
                      </>
                    )}
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
