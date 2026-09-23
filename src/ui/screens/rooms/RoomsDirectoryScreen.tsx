import React, { useEffect, useMemo, useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { SalaNoDiretorio, motivo, salasService } from '../../../services/application/salas.service';
import { Users, Plus, Lock, Globe2 } from 'lucide-react';

/**
 * Diretório de salas (AUD-9).
 *
 * As salas são comunidades no molde do Skool: qualquer pessoa com conta abre
 * a sua, e qualquer pessoa encontra as outras aqui. Antes, a sala vivia no
 * navegador de quem a criou — o diretório de outra pessoa nunca a mostraria.
 * Agora vem do servidor, e é o mesmo para todo mundo.
 */
export const RoomsDirectoryScreen: React.FC = () => {
  const { navigate } = useRouter();
  const { userId } = useCurrentUser();
  const [filtro, setFiltro] = useState<'todas' | 'minhas'>('todas');
  const [salas, setSalas] = useState<SalaNoDiretorio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    salasService
      .diretorio()
      .then((lista) => ativo && setSalas(lista))
      .catch((e) => {
        if (!ativo) return;
        setErro(motivo(e));
        setSalas([]);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const visiveis = useMemo(
    () => (salas ?? []).filter((s) => filtro === 'todas' || s.souMembro),
    [salas, filtro]
  );

  return (
    <ScreenContainer
      id="rooms-directory"
      title="Salas"
      subtitle="Comunidades de estudo: conversa, sala de aula, agenda de encontros e ranking de quem contribui."
      badgeLabel="Comunidades"
      badgeVariant="brand"
      primaryAction={{
        label: 'Criar sala',
        icon: Plus,
        onClick: () => navigate(userId ? '/rooms/create' : '/auth/login?voltar=%2Frooms%2Fcreate'),
      }}
      emptyProps={{
        title: erro ? 'Não deu para abrir as salas' : filtro === 'minhas' ? 'Você ainda não está em nenhuma sala' : 'Nenhuma sala aberta ainda',
        description:
          erro ??
          (filtro === 'minhas'
            ? 'Entre numa sala do diretório, ou crie a sua.'
            : 'Seja a primeira pessoa a abrir uma sala — para uma turma, um grupo de estudo ou um coro.'),
        actionLabel: filtro === 'minhas' ? 'Ver todas as salas' : 'Criar sala',
        onAction: () => (filtro === 'minhas' ? setFiltro('todas') : navigate('/rooms/create')),
      }}
      state={salas === null ? 'loading' : visiveis.length === 0 ? 'empty' : 'populated'}
    >
      <div className="space-y-6">
        {userId && (
          <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white p-2 text-xs" role="tablist" aria-label="Filtrar salas">
            {(['todas', 'minhas'] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filtro === f}
                onClick={() => setFiltro(f)}
                className={`rounded px-3 py-1 ${filtro === f ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                {f === 'todas' ? 'Todas as salas' : 'Minhas salas'}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {visiveis.map((sala) => (
            <Card
              key={sala.id}
              id={`room-card-${sala.slug}`}
              variant="default"
              padding="lg"
              interactive
              className="flex flex-col justify-between space-y-3"
              onClick={() => navigate(`/rooms/${sala.slug}`)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">
                    {sala.privacidade === 'publica' ? (
                      <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" aria-hidden="true" /> Pública</span>
                    ) : (
                      <span className="flex items-center gap-1"><Lock className="h-3 w-3" aria-hidden="true" /> Privada</span>
                    )}
                  </Badge>
                  <span className="flex items-center gap-1 font-mono text-xs text-stone-500">
                    <Users className="h-3 w-3 text-stone-400" aria-hidden="true" />
                    {sala.membros} {sala.membros === 1 ? 'membro' : 'membros'}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold leading-snug text-stone-900">{sala.nome}</h3>
                <p className="text-xs text-stone-600">por {sala.dono.nome}</p>
                {sala.descricao && <p className="line-clamp-2 text-xs text-stone-600">{sala.descricao}</p>}
              </div>
              <div className="border-t border-stone-100 pt-3 text-xs font-medium text-anil-700">
                {sala.souMembro ? 'Você está nesta sala →' : 'Ver a sala →'}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScreenContainer>
  );
};
