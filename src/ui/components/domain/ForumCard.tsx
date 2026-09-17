import React from 'react';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface ForumCardProps {
  id?: string;
  title: string;
  description: string;
  topicsCount: number;
  postsCount: number;
  icon?: React.ReactNode;
  lastActivityText?: string;
  onClick?: () => void;
  className?: string;
}

export const ForumCard: React.FC<ForumCardProps> = ({
  id = 'forum-card',
  title,
  description,
  topicsCount,
  postsCount,
  icon,
  lastActivityText,
  onClick,
  className,
}) => {
  return (
    <article
      id={id}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={twMerge(
        'p-5 bg-white border border-stone-200 rounded-lg shadow-xs hover:border-stone-300 hover:shadow-sm transition-all select-none flex flex-col justify-between gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-800',
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200/80 flex items-center justify-center text-red-800 shrink-0">
          {icon || <MessageSquare className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-stone-900 tracking-tight mb-1">
            {title}
          </h4>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-stone-300 self-center shrink-0" />
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-4 font-mono">
          <span>{topicsCount} tópicos</span>
          <span>{postsCount} mensagens</span>
        </div>

        {lastActivityText && (
          <span className="text-[11px] text-stone-400 truncate max-w-[160px]">
            {lastActivityText}
          </span>
        )}
      </div>
    </article>
  );
};
