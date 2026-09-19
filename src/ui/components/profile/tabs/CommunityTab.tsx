import React, { useState } from 'react';
import { UnifiedProfileRecord, ProfileConnectionItem } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { MessageSquare, UserCheck, ShieldCheck, Heart } from 'lucide-react';

interface CommunityTabProps {
  profile: UnifiedProfileRecord;
  onToggleConnection?: (targetUserId: string) => void;
  connections?: ProfileConnectionItem[];
}

export const CommunityTab: React.FC<CommunityTabProps> = ({
  profile,
  onToggleConnection,
  connections = profile.connectionsList || [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'forums' | 'connections'>('posts');
  const community = profile.community;

  return (
    <div id="profile-community-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200">
        <div>
          <h2 className="font-serif text-base font-bold text-stone-900">
            Comunidade, Fóruns & Rede de Conexões
          </h2>
          <p className="text-xs text-stone-600">
            Debates abertos, ensaios teóricos e conexões profissionais (sem sistema de mensagens privadas)
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              activeSubTab === 'posts'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Ensaios & Artigos
          </button>
          <button
            onClick={() => setActiveSubTab('forums')}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              activeSubTab === 'forums'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Tópicos de Fórum
          </button>
          <button
            onClick={() => setActiveSubTab('connections')}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              activeSubTab === 'connections'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Conexões ({connections.length})
          </button>
        </div>
      </div>

      {/* Subtab: Posts / Essays */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          {(community?.posts || []).map((post) => (
            <Card key={post.id} variant="default" padding="lg">
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-stone-100">
                <h3 className="font-serif font-bold text-sm text-stone-900">{post.title}</h3>
                <span className="text-xs font-mono text-stone-500 whitespace-nowrap">
                  {new Date(post.publishedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-stone-700 mt-3 leading-relaxed whitespace-pre-line">
                {post.summary}
              </p>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-stone-400" /> {post.upvotes} aprovações
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-400" /> {post.commentsCount} comentários
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Subtab: Forum Participations */}
      {activeSubTab === 'forums' && (
        <div className="space-y-4">
          {(community?.forumParticipations || []).map((forum) => (
            <Card key={forum.topicId} variant="default" padding="md">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">{forum.category}</span>
                  <h3 className="font-serif font-bold text-sm text-stone-900 mt-0.5">{forum.topicTitle}</h3>
                </div>
                {forum.isAcceptedAnswer && (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> ResponseMode Canônica Aceita
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
                <span>{forum.repliesCount} respostas na discussão</span>
                <span className="font-mono text-stone-600">Contribuição Registrada</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Subtab: Connections Network */}
      {activeSubTab === 'connections' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {connections.map((conn) => (
            <Card key={conn.id} variant="default" padding="md" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-800 font-serif font-bold flex items-center justify-center shrink-0">
                  {conn.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-stone-900">{conn.name}</h4>
                  <p className="text-[11px] text-stone-600">{conn.headline}</p>
                  <span className="text-[10px] text-stone-500 font-mono block mt-0.5">
                    {conn.primaryInstrument} • {conn.role}
                  </span>
                </div>
              </div>

              {onToggleConnection && (
                <button
                  onClick={() => onToggleConnection(conn.targetUserId)}
                  className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors shrink-0 flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Conectado
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
