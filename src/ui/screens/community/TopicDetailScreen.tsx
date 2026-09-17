import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Avatar } from '../../components/data-display/Avatar';
import { ArrowLeft, Flag, MessageSquare, ThumbsUp, Send } from 'lucide-react';

export const TopicDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const topicId = params.id || 'analise-bach-bwv-1001';
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([
    {
      id: 'rep-1',
      author: 'Prof. Carlos Eduardo',
      role: 'Docente Convidado',
      text: 'Exato, Aline. O salto de sétima diminuta na voz inferior funciona como um atraso expressivo característico do stile fantastico, gerando tensão antes da cadência frígia no compasso 16.',
      createdAt: 'Há 2 horas',
      likes: 5,
    },
  ]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setReplies((prev) => [
      ...prev,
      {
        id: `rep-${Date.now()}`,
        author: 'Você',
        role: 'Estudante',
        text: replyText.trim(),
        createdAt: 'Agora',
        likes: 0,
      },
    ]);
    setReplyText('');
  };

  return (
    <ScreenContainer
      id="topic-detail"
      title="Discussão: Condução harmônica na Fuga BWV 1001"
      subtitle="Fórum de Análise Musicológica • Tópico supervisionado pela equipe acadêmica"
      badgeLabel="Análise Técnica"
      badgeVariant="brand"
      primaryAction={{
        label: 'Voltar ao Fórum',
        icon: ArrowLeft,
        onClick: () => navigate('/community'),
      }}
      secondaryActions={[
        {
          label: 'Reportar à Moderação',
          icon: Flag,
          onClick: () => alert('Sinalização enviada para a fila de moderação institucional.'),
        },
      ]}
      emptyProps={{
        title: 'Tópico não encontrado',
        description: `O debate [${topicId}] foi arquivado ou removido pela moderação.`,
        actionLabel: 'Ver Todos os Tópicos',
        onAction: () => navigate('/community'),
      }}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Original Post */}
        <Card variant="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <Avatar name="Aline Silva" size="md" />
              <div>
                <p className="text-sm font-bold text-stone-900">Aline Silva</p>
                <p className="text-xs text-stone-500 font-mono">Aluna Pesquisadora • Publicado há 3 horas</p>
              </div>
            </div>
            <Badge variant="neutral">Partitura & Teoria</Badge>
          </div>

          <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
            <p>
              Prezados colegas e professores, ao praticar e analisar a Fuga da Sonata nº 1 (BWV 1001), notei que a escrita polifônica monofônica de Bach cria a ilusão contínua de quatro vozes completas.
            </p>
            <p>
              No compasso 15, especificamente, a resolução da sensível Fá sustenido parece deliberadamente suspensa para coincidir com a entrada da resposta tonal na terceira oitava. Como vocês recomendam balancear a dinâmica no arco para não sufocar a voz intermediária?
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <button type="button" className="inline-flex items-center gap-1 text-stone-600 hover:text-red-800">
              <ThumbsUp className="w-3.5 h-3.5" /> Apoiar reflexão (14)
            </button>
            <span>2 respostas registradas</span>
          </div>
        </Card>

        {/* Replies List */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-red-800" />
            Contribuições da Comunidade
          </h3>

          {replies.map((rep) => (
            <Card key={rep.id} variant="muted" padding="md" className="space-y-2 border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={rep.author} size="sm" />
                  <span className="text-xs font-bold text-stone-900">{rep.author}</span>
                  <span className="text-[11px] font-mono text-stone-500">({rep.role})</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">{rep.createdAt}</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed pl-8">
                {rep.text}
              </p>
            </Card>
          ))}
        </div>

        {/* Reply Input Box */}
        <Card variant="default" padding="md" className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            Adicionar Resposta Supervisionada
          </h4>
          <textarea
            placeholder="Escreva sua análise ou consideração técnica..."
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-red-800 bg-white"
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendReply}
              disabled={!replyText.trim()}
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Enviar Resposta
            </Button>
          </div>
        </Card>
      </div>
    </ScreenContainer>
  );
};
