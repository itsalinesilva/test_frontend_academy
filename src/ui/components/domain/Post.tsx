import React from 'react';
import { ThumbsUp, MessageSquare, CheckCircle2, Pin, Paperclip, Share2 } from 'lucide-react';
import { Avatar } from '../data-display/Avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PostProps {
  id?: string;
  authorName: string;
  authorTitle?: string;
  authorAvatarUrl?: string;
  category: string;
  title: string;
  content: string;
  createdAt: string;
  upvotesCount?: number;
  commentsCount?: number;
  isUpvoted?: boolean;
  isPinned?: boolean;
  hasAcceptedSolution?: boolean;
  attachmentName?: string;
  onUpvote?: () => void;
  onCommentClick?: () => void;
  onShare?: () => void;
  className?: string;
}

export const Post: React.FC<PostProps> = ({
  id = 'community-post',
  authorName,
  authorTitle,
  authorAvatarUrl,
  category,
  title,
  content,
  createdAt,
  upvotesCount = 0,
  commentsCount = 0,
  isUpvoted = false,
  isPinned = false,
  hasAcceptedSolution = false,
  attachmentName,
  onUpvote,
  onCommentClick,
  onShare,
  className,
}) => {
  return (
    <article
      id={id}
      className={twMerge(
        'p-5 bg-white border border-stone-200 rounded-lg shadow-xs space-y-3.5 select-none hover:border-stone-300 transition-colors',
        className
      )}
    >
      {/* Header with Author and Tags */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={authorName} src={authorAvatarUrl} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-stone-900">{authorName}</h4>
              {authorTitle && <span className="text-xs text-stone-500">• {authorTitle}</span>}
            </div>
            <div className="text-[11px] text-stone-400">{createdAt}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-semibold">
              <Pin className="w-3 h-3 text-red-800" />
              Fixado
            </span>
          )}
          <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
            {category}
          </span>
        </div>
      </div>

      {/* Title & Body */}
      <div>
        <h3 className="text-base font-bold text-stone-950 tracking-tight mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line line-clamp-4">
          {content}
        </p>
      </div>

      {/* Attachment */}
      {attachmentName && (
        <div className="flex items-center gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded text-xs font-medium text-stone-800">
          <Paperclip className="w-4 h-4 text-red-800 shrink-0" />
          <span className="truncate">{attachmentName}</span>
        </div>
      )}

      {/* Accepted Solution Banner */}
      {hasAcceptedSolution && (
        <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Solução musicológica aprovada pelo professor catedrático</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onUpvote}
            className={clsx(
              'flex items-center gap-1.5 py-1 px-2 rounded font-medium cursor-pointer transition-colors',
              isUpvoted
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'hover:bg-stone-100 text-stone-600'
            )}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{upvotesCount}</span>
          </button>

          <button
            type="button"
            onClick={onCommentClick}
            className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-stone-100 text-stone-600 font-medium cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentsCount} respostas</span>
          </button>
        </div>

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            aria-label="Compartilhar post"
            className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
};
