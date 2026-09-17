import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Avatar } from '../../components/data-display/Avatar';
import { ArrowLeft, UserPlus, Search } from 'lucide-react';

export const AdminUsersScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: 'usr-1',
      name: 'Clara Wieck Schumann',
      email: 'clara@academia.mus.br',
      role: 'PROFESSOR',
      status: 'Ativo',
      joinedDate: '01/08/2026',
    },
    {
      id: 'usr-2',
      name: 'Aline Silva',
      email: 'aline@aluno.academia.mus.br',
      role: 'ALUNO',
      status: 'Ativo',
      joinedDate: '15/08/2026',
    },
    {
      id: 'usr-3',
      name: 'Gabriel Carvalho',
      email: 'gabriel@academia.mus.br',
      role: 'PROFESSOR',
      status: 'Ativo',
      joinedDate: '01/08/2026',
    },
    {
      id: 'usr-4',
      name: 'Admin Institucional',
      email: 'admin@academia.mus.br',
      role: 'ADMIN',
      status: 'Ativo (Fundador)',
      joinedDate: '01/01/2026',
    },
  ];

  return (
    <ScreenContainer
      id="admin-users"
      title="Gestão de Usuários & Prerrogativas"
      subtitle="Administração de papéis, permissões de acesso e homologação de vínculos docentes."
      badgeLabel="Admin Console"
      badgeVariant="brand"
      primaryAction={{
        label: 'Adicionar Usuário',
        icon: UserPlus,
        onClick: () => alert('Diálogo de provisionamento de novo usuário institucional.'),
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
        {/* Search Bar */}
        <div className="flex items-center gap-3 p-2 bg-white border border-stone-200 rounded-lg">
          <Search className="w-4 h-4 text-stone-400 ml-2" />
          <input
            type="text"
            placeholder="Filtrar por nome, e-mail ou papel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-mono">
              <tr>
                <th className="p-3">Usuário</th>
                <th className="p-3">Papel Primário</th>
                <th className="p-3">Status</th>
                <th className="p-3">Data de Matrícula</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50">
                  <td className="p-3 flex items-center gap-2.5">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="font-bold text-stone-900">{u.name}</p>
                      <p className="text-stone-500 font-mono text-[11px]">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={u.role === 'ADMIN' ? 'brand' : 'neutral'} size="sm">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-stone-600">{u.status}</td>
                  <td className="p-3 font-mono text-stone-500">{u.joinedDate}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => alert(`Gerenciar permissões de ${u.name}`)}>
                      Permissões
                    </Button>
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
