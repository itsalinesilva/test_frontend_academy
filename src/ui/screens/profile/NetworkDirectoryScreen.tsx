import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Avatar } from '../../components/data-display/Avatar';
import { useRouter } from '../../navigation/router';
import { profileService } from '../../../services/application/profile.service';
import { UnifiedProfileRecord } from '../../../domain/profile';
import { MapPin, Music, Search } from 'lucide-react';

/**
 * Diretorio de musicos.
 *
 * Esta tela existe porque sem ela /profile/:userId era inalcancavel: havia
 * perfil, e nenhum caminho para chegar ao perfil de outra pessoa.
 *
 * O que ela lista vem de `listDirectory()`, que devolve PROJECOES PUBLICAS.
 * Nenhum campo privado chega ao cliente — o filtro roda no repositorio, nao
 * aqui. E-mail nao e exibido nem recebido.
 */
export const NetworkDirectoryScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [pessoas, setPessoas] = useState<UnifiedProfileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const carregar = async () => {
      try {
        setPessoas(await profileService.listDirectory());
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao carregar o diretório.');
      } finally {
        setIsLoading(false);
      }
    };
    carregar();
  }, []);

  const termo = busca.trim().toLowerCase();
  const filtradas = termo
    ? pessoas.filter(
        (p) =>
          p.displayName.toLowerCase().includes(termo) ||
          p.headline.toLowerCase().includes(termo) ||
          p.instruments.some((i) => i.toLowerCase().includes(termo))
      )
    : pessoas;

  return (
    <PageLayout
      id="profile-network"
      form="catalog"
      density="catalog"
      asideLabel="Refinar"
      state={isLoading ? 'loading' : erro ? 'error' : filtradas.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando o diretório de músicos…"
      errorProps={{ message: erro ?? '', onRetry: () => window.location.reload() }}
      emptyProps={{
        title: termo ? 'Nenhum músico encontrado' : 'A rede ainda está se formando',
        description: termo
          ? `Nada corresponde a "${busca}". Tente outro instrumento, nome ou área.`
          : 'Perfis aparecem aqui conforme os músicos entram na plataforma e tornam seu perfil público.',
        actionLabel: termo ? 'Limpar busca' : undefined,
        onAction: termo ? () => setBusca('') : undefined,
      }}
    >
      <PageLayout.Hero>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-stone-900">Rede de Músicos</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-600">
            Intérpretes, docentes, pesquisadores e estudantes da Academia. Cada perfil
            mostra apenas o que a pessoa tornou público.
          </p>
        </div>
      </PageLayout.Hero>

      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Buscar
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              id="network-search"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome, instrumento, área"
              aria-label="Buscar músicos no diretório"
              className="w-full rounded-md border border-stone-300 bg-white py-1.5 pl-8 pr-2 text-xs text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
            />
          </div>
          <dl className="space-y-1.5 border-t border-stone-100 pt-2.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <dt>Perfis públicos</dt>
              <dd className="font-mono font-bold">{pessoas.length}</dd>
            </div>
          </dl>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/profile')}>
            Meu perfil
          </Button>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtradas.map((p) => (
            <Card
              key={p.userId}
              id={`network-card-${p.userId}`}
              variant="default"
              padding="md"
              className="cursor-pointer space-y-3 transition-colors hover:border-stone-400"
              onClick={() => navigate(`/profile/${p.userId}`)}
            >
              <div className="flex items-start gap-3">
                <Avatar name={p.displayName} src={p.avatarUrl} size="md" />
                <div className="min-w-0 space-y-0.5">
                  <h2 className="truncate font-serif text-sm font-bold text-stone-900">
                    {p.displayName}
                  </h2>
                  <p className="truncate text-xs text-stone-700">{p.title}</p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-stone-500">{p.headline}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-2 text-[11px] text-stone-600">
                {p.instruments[0] && (
                  <span className="flex items-center gap-1">
                    <Music className="h-3 w-3 text-stone-400" />
                    {p.instruments[0]}
                  </span>
                )}
                {p.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-stone-400" />
                    {p.location}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
