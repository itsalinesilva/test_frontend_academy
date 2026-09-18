import React, { useEffect, useMemo, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Badge } from '../../components/base/Badge';
import { Avatar } from '../../components/data-display/Avatar';
import { userRepository } from '../../../repositories/user.repository';
import { User } from '../../../domain/types';
import { ArrowLeft, Search, ShieldCheck } from 'lucide-react';

/**
 * Pessoas com conta neste dispositivo.
 *
 * A tela listava quatro usuários escritos no código — "Clara Wieck Schumann"
 * com papel de professora, um "Admin Institucional" fundador, e a própria
 * fundadora com um e-mail que não é o dela. Nenhum existe. E o botão
 * "Permissões" chamava `alert('Gerenciar permissões de …')`, enquanto
 * "Adicionar usuário" prometia um "diálogo de provisionamento".
 *
 * Duas correções, e a segunda é de segurança:
 *
 *   1. a lista vem de `userRepository`, que só conhece identidades de fato
 *      autenticadas no Google;
 *
 *   2. os dois botões saíram. Conta nasce do login federado — não há
 *      provisionamento manual a oferecer. E papel administrativo é outorgado
 *      pelo servidor, que assina a sessão; um controle aqui sugeriria que a
 *      autoridade mora no cliente, que é exatamente a vulnerabilidade que o
 *      projeto passou a auditoria corrigindo.
 */
const PAPEL: Record<string, 'brand' | 'neutral'> = {
  ADMIN: 'brand',
};

export const AdminUsersScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [busca, setBusca] = useState('');
  const [usuarios, setUsuarios] = useState<User[] | null>(null);

  useEffect(() => {
    let ativo = true;
    userRepository
      .listAll()
      .then((lista) => {
        if (ativo) setUsuarios(lista);
      })
      .catch(() => {
        if (ativo) setUsuarios([]);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!usuarios) return [];
    if (!termo) return usuarios;
    return usuarios.filter(
      (u) =>
        u.name.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.primaryRole.toLowerCase().includes(termo)
    );
  }, [usuarios, busca]);

  return (
    <ScreenContainer
      id="admin-users"
      title="Contas neste dispositivo"
      subtitle="Identidades autenticadas com Conta Google que já usaram esta instalação."
      badgeLabel="Console"
      badgeVariant="brand"
      primaryAction={{
        label: 'Voltar ao console',
        icon: ArrowLeft,
        onClick: () => navigate('/admin'),
      }}
      emptyProps={{
        title: usuarios && usuarios.length > 0 ? 'Nenhuma conta corresponde à busca' : 'Nenhuma conta registrada',
        description:
          usuarios && usuarios.length > 0
            ? 'Ajuste o termo para encontrar a pessoa.'
            : 'As contas aparecem aqui depois do primeiro login com Google neste navegador.',
      }}
      state={usuarios === null ? 'loading' : visiveis.length === 0 ? 'empty' : 'populated'}
    >
      <div className="space-y-4">
        <p className="flex items-start gap-2 rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <span>
            Esta lista é de leitura. Contas são criadas pelo login com Google, e o papel
            administrativo é outorgado pelo servidor de identidade ao assinar a sessão — não é
            editável aqui, por construção.
          </span>
        </p>

        <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2">
          <Search className="ml-2 h-4 w-4 text-stone-400" aria-hidden="true" />
          <label htmlFor="admin-users-busca" className="sr-only">
            Filtrar contas por nome, e-mail ou papel
          </label>
          <input
            id="admin-users-busca"
            type="search"
            placeholder="Filtrar por nome, e-mail ou papel"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Contas autenticadas neste dispositivo</caption>
            <thead className="border-b border-stone-200 bg-stone-50 font-mono text-stone-600">
              <tr>
                <th scope="col" className="p-3">
                  Pessoa
                </th>
                <th scope="col" className="p-3">
                  Papel principal
                </th>
                <th scope="col" className="p-3">
                  E-mail verificado
                </th>
                <th scope="col" className="p-3">
                  Conta criada em
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visiveis.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50">
                  <td className="flex items-center gap-2.5 p-3">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="font-bold text-stone-900">{u.name}</p>
                      <p className="font-mono text-[11px] text-stone-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={PAPEL[u.primaryRole] ?? 'neutral'} size="sm">
                      {u.primaryRole}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-stone-600">
                    {u.isEmailVerified ? 'sim' : 'não'}
                  </td>
                  <td className="p-3 font-mono text-stone-500">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
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
