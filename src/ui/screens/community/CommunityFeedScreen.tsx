import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Avatar } from '../../components/data-display/Avatar';
import { MessageSquare, Calendar, Filter, Plus, ArrowRight, Heart } from 'lucide-react';

export const CommunityFeedScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [filter, setFilter] = useState<'todos' | 'analises' | 'duvidas'>('todos');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');

  const topics = [
    {
      id: 'analise-bach-bwv-1001',
      author: 'Aline Silva',
      role: 'Aluna Pesquisadora',
      category: 'Análise Musicológica',
      title: 'Discussão: Condução harmônica subentendida na Fuga da Sonata BWV 1001',
      excerpt:
        'Ao analisar o compasso 15 da fuga, a voz de soprano sustenta uma resolução enquanto o baixo faz um salto de 7ª diminuta...',
      repliesCount: 8,
      likesCount: 14,
      createdAt: 'Há 3 horas',
    },
    {
      id: 'duvida-encadeamento-satb',
      author: 'Lucas Mendes',
      role: 'Estudante de Harmonia',
      category: 'Dúvidas Teóricas',
      title: 'Dúvida prática: Como evitar quintas paralelas na transição IV - V?',
      excerpt:
        'No exercício da Lição 03, ao mover o soprano para a sensível, acabei duplicando o movimento paralelo entre contralto e baixo...',
      repliesCount: 12,
      likesCount: 9,
      createdAt: 'Há 6 horas',
    },
  ];

  return (
    <ScreenContainer
      id="community-feed"
      title="Comunidade Acadêmica"
      subtitle="Ambiente colaborativo para debates teóricos, análises de repertório e trocas de estudos supervisionadas."
      badgeLabel="Fórum e Colaboração"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Criar Publicação',
        icon: Plus,
        onClick: () => setIsCreatingPost(!isCreatingPost),
      }}
      secondaryActions={[
        {
          label: 'Calendário de Eventos',
          icon: Calendar,
          onClick: () => navigate('/community/events'),
        },
      ]}
      emptyProps={{
        title: 'Nenhum tópico na comunidade',
        description: 'Seja o primeiro a iniciar um debate musicológico ou compartilhar uma dúvida sobre suas lições.',
        actionLabel: 'Abrir Novo Tópico',
        onAction: () => setIsCreatingPost(true),
      }}
    >
      <div className="space-y-6">
        {/* Create Post Dialog / Box if active */}
        {isCreatingPost && (
          <Card variant="default" padding="lg" className="border-red-200 bg-red-50/20 space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Nova Publicação Acadêmica
            </h3>
            <input
              type="text"
              placeholder="Título da discussão ou dúvida teórica..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800 bg-white"
            />
            <textarea
              placeholder="Descreva o contexto, compassos da partitura ou fundamentos da sua questão..."
              rows={3}
              className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-anil-800 bg-white"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsCreatingPost(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsCreatingPost(false);
                  setNewPostTitle('');
                }}
              >
                Publicar no Fórum
              </Button>
            </div>
          </Card>
        )}

        {/* Filter Bar */}
        <div className="flex items-center justify-between p-2 bg-white border border-stone-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-stone-400 ml-2" />
            <button
              type="button"
              onClick={() => setFilter('todos')}
              className={`px-2.5 py-1 text-xs rounded ${filter === 'todos' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Todos os Debates
            </button>
            <button
              type="button"
              onClick={() => setFilter('analises')}
              className={`px-2.5 py-1 text-xs rounded ${filter === 'analises' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Análises de Obras
            </button>
            <button
              type="button"
              onClick={() => setFilter('duvidas')}
              className={`px-2.5 py-1 text-xs rounded ${filter === 'duvidas' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              Dúvidas Teóricas
            </button>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              id={`topic-card-${topic.id}`}
              variant="default"
              padding="lg"
              interactive
              onClick={() => navigate(`/community/topic/${topic.id}`)}
              className="space-y-3 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={topic.author} size="sm" />
                  <div>
                    <span className="text-xs font-semibold text-stone-900">{topic.author}</span>
                    <span className="text-[11px] text-stone-500 ml-2 font-mono">({topic.role})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm">{topic.category}</Badge>
                  <span className="text-xs font-mono text-stone-400">{topic.createdAt}</span>
                </div>
              </div>

              <h3 className="font-serif font-bold text-base text-stone-900">
                {topic.title}
              </h3>

              <p className="text-xs text-stone-600 line-clamp-2">
                {topic.excerpt}
              </p>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                    {topic.repliesCount} respostas
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-stone-400" />
                    {topic.likesCount} apoios
                  </span>
                </div>

                <span className="text-anil-800 font-medium inline-flex items-center gap-1 hover:underline">
                  Ver Discussão <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScreenContainer>
  );
};
