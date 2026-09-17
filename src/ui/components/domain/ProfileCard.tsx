import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Edit3, BookOpen, Clock, Music } from 'lucide-react';
import { Avatar } from '../data-display/Avatar';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';
import { CredentialChip } from '../data-display/CredentialChip';
import { UserRole } from '../../../domain/types';

export interface ProfileCardProps {
  id: string; // Mandatory ID
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  avatarSrc?: string;
  isOwner?: boolean;
  credentials?: {
    id: string;
    title: string;
    institution: string;
    level?: string;
  }[];
  stats?: {
    coursesCompleted: number;
    practiceHours: number;
    portfolioItems: number;
  };
  onEditProfile?: () => void;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  name,
  email,
  role,
  bio = 'Estudante dedicado de teoria musical e performance acústica.',
  avatarSrc,
  isOwner = false,
  credentials = [
    { id: 'c1', title: 'Fundamentos de Teoria', institution: 'University of Edinburgh', level: 'L1-5' },
    { id: 'c2', title: 'Harmonia Funcional I', institution: 'Academia Musical Digital', level: 'Intermediário' },
  ],
  stats = {
    coursesCompleted: 3,
    practiceHours: 42,
    portfolioItems: 7,
  },
  onEditProfile,
  className,
}) => {
  return (
    <div
      id={id}
      className={twMerge(
        clsx(
          'w-full bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs flex flex-col',
          className
        )
      )}
    >
      {/* Decorative institutional banner header */}
      <div id={`${id}-banner`} className="h-24 bg-stone-900 border-b border-stone-800 p-4 flex items-end justify-end">
        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
          Registro Acadêmico Oficial
        </span>
      </div>

      <div className="px-6 pb-6 pt-0 relative">
        {/* Avatar positioned over the banner */}
        <div className="flex flex-wrap items-end justify-between -mt-10 mb-4 gap-4">
          <div className="relative">
            <Avatar
              id={`${id}-avatar`}
              name={name}
              src={avatarSrc}
              role={role}
              size="xl"
              className="ring-4 ring-white shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {isOwner && onEditProfile && (
              <Button
                id={`${id}-edit-btn`}
                size="sm"
                variant="outline"
                onClick={onEditProfile}
                leadingIcon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Editar Perfil
              </Button>
            )}
          </div>
        </div>

        {/* Identity Details */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 id={`${id}-name`} className="text-xl font-bold font-serif text-stone-900">
                {name}
              </h2>
              <Badge id={`${id}-role-badge`} variant="brand" size="sm">
                {role}
              </Badge>
            </div>
            <p id={`${id}-email`} className="text-xs text-stone-500 font-mono mt-0.5">
              {email}
            </p>
          </div>

          {bio && (
            <p id={`${id}-bio`} className="text-xs text-stone-700 leading-relaxed max-w-2xl">
              {bio}
            </p>
          )}

          {/* Academic Credentials Row */}
          {credentials.length > 0 && (
            <div id={`${id}-credentials-section`} className="pt-3 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-700 block mb-2">
                Credenciais & Certificações Acadêmicas:
              </span>
              <div className="flex flex-wrap gap-2">
                {credentials.map((c) => (
                  <CredentialChip
                    key={c.id}
                    id={`${id}-cred-${c.id}`}
                    title={c.title}
                    institution={c.institution}
                    level={c.level}
                    sizeVariant="sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Academic Stats Summary */}
          <div
            id={`${id}-stats-grid`}
            className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-center"
          >
            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <span className="block text-lg font-bold font-mono text-stone-900">
                {stats.coursesCompleted}
              </span>
              <span className="text-[11px] text-stone-500 flex items-center justify-center gap-1 mt-0.5">
                <BookOpen className="w-3 h-3" /> Cursos
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <span className="block text-lg font-bold font-mono text-stone-900">
                {stats.practiceHours}h
              </span>
              <span className="text-[11px] text-stone-500 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> Prática
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <span className="block text-lg font-bold font-mono text-stone-900">
                {stats.portfolioItems}
              </span>
              <span className="text-[11px] text-stone-500 flex items-center justify-center gap-1 mt-0.5">
                <Music className="w-3 h-3" /> Portfólio
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
