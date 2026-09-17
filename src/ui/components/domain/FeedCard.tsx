import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MessageSquare, ThumbsUp, Share2, Play, Music } from 'lucide-react';
import { Avatar } from '../data-display/Avatar';
import { Badge } from '../base/Badge';
import { UserRole } from '../../../domain/types';

export interface FeedCardProps {
  id: string; // Mandatory ID
  authorName: string;
  authorRole: UserRole;
  authorAvatarSrc?: string;
  createdAtText: string;
  topicCategory?: string; // e.g. 'Análise Harmônica', 'Composição', 'Dúvida Pedagógica'
  title?: string;
  content: string;
  attachment?: {
    type: 'audio' | 'score';
    title: string;
    durationOrMeasures?: string;
  };
  likesCount?: number;
  repliesCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onReply?: () => void;
  onShare?: () => void;
  className?: string;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  id,
  authorName,
  authorRole,
  authorAvatarSrc,
  createdAtText,
  topicCategory,
  title,
  content,
  attachment,
  likesCount = 0,
  repliesCount = 0,
  isLiked = false,
  onLike,
  onReply,
  onShare,
  className,
}) => {
  return (
    <article
      id={id}
      className={twMerge(
        clsx(
          'w-full bg-white border border-stone-200 rounded-lg p-5 shadow-xs flex flex-col gap-3 text-stone-900',
          className
        )
      )}
    >
      {/* Author Header */}
      <div id={`${id}-header`} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            id={`${id}-avatar`}
            name={authorName}
            src={authorAvatarSrc}
            role={authorRole}
            size="md"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span id={`${id}-author-name`} className="font-semibold text-sm text-stone-900 truncate">
                {authorName}
              </span>
              <Badge id={`${id}-role-badge`} variant="neutral" size="sm">
                {authorRole}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <span id={`${id}-created-at`}>{createdAtText}</span>
              {topicCategory && (
                <>
                  <span aria-hidden="true">•</span>
                  <span id={`${id}-category`} className="font-medium text-stone-600">
                    {topicCategory}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div id={`${id}-content`} className="text-sm text-stone-800 leading-relaxed max-w-[72ch]">
        {title && (
          <h4 id={`${id}-title`} className="font-semibold text-stone-900 text-base mb-1">
            {title}
          </h4>
        )}
        <p className="whitespace-pre-line">{content}</p>
      </div>

      {/* Media Attachment Preview (if any) */}
      {attachment && (
        <div
          id={`${id}-attachment`}
          className="p-3 bg-stone-50 border border-stone-200 rounded-md flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-stone-200 text-stone-700 rounded shrink-0">
              {attachment.type === 'audio' ? <Play className="w-3.5 h-3.5 fill-current" /> : <Music className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-stone-900 truncate">{attachment.title}</span>
              {attachment.durationOrMeasures && (
                <span className="text-[11px] font-mono text-stone-500">{attachment.durationOrMeasures}</span>
              )}
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase bg-stone-200/80 px-2 py-0.5 rounded text-stone-700">
            {attachment.type === 'audio' ? 'Gravação' : 'Partitura'}
          </span>
        </div>
      )}

      {/* Footer Actions */}
      <div id={`${id}-footer`} className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-4">
          <button
            id={`${id}-like-btn`}
            type="button"
            onClick={onLike}
            className={clsx(
              'inline-flex items-center gap-1.5 hover:text-stone-900 transition-colors focus:outline-none focus:ring-1 focus:ring-red-800 rounded px-1.5 py-1',
              isLiked && 'text-red-800 font-semibold'
            )}
          >
            <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{likesCount}</span>
            <span className="sr-only">avaliações positivas</span>
          </button>

          <button
            id={`${id}-reply-btn`}
            type="button"
            onClick={onReply}
            className="inline-flex items-center gap-1.5 hover:text-stone-900 transition-colors focus:outline-none focus:ring-1 focus:ring-red-800 rounded px-1.5 py-1"
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{repliesCount}</span>
            <span className="sr-only">respostas acadêmicas</span>
          </button>
        </div>

        {onShare && (
          <button
            id={`${id}-share-btn`}
            type="button"
            onClick={onShare}
            aria-label="Compartilhar publicação"
            className="text-stone-400 hover:text-stone-700 p-1 rounded hover:bg-stone-100 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};
