import React from 'react';
import { Avatar } from './Avatar';
import { Button } from '../base/Button';
import { ShieldCheck, MapPin, Building, GraduationCap, Clock, Award, UserPlus, MessageSquare } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface ProfileHeaderProps {
  id?: string;
  name: string;
  title?: string;
  headline?: string;
  location?: string;
  affiliation?: string;
  avatarUrl?: string;
  coverUrl?: string;
  isVerified?: boolean;
  totalStudyHours?: number;
  coursesCompleted?: number;
  credentialsCount?: number;
  isOwnProfile?: boolean;
  isConnected?: boolean;
  onConnect?: () => void;
  onMessage?: () => void;
  onEditProfile?: () => void;
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  id = 'profile-header',
  name,
  title,
  headline,
  location,
  affiliation,
  avatarUrl,
  coverUrl,
  isVerified = true,
  totalStudyHours = 0,
  coursesCompleted = 0,
  credentialsCount = 0,
  isOwnProfile = false,
  isConnected = false,
  onConnect,
  onMessage,
  onEditProfile,
  className,
}) => {
  return (
    <div
      id={id}
      className={twMerge(
        'bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs select-none',
        className
      )}
    >
      {/* Cover Banner */}
      <div
        id={`${id}-cover`}
        className="h-32 sm:h-44 bg-gradient-to-r from-stone-800 via-stone-900 to-anil-950 relative"
      >
        {coverUrl && (
          <img src={coverUrl} alt="Capa de perfil" className="w-full h-full object-cover opacity-60" />
        )}
      </div>

      {/* Main Profile Content */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
          {/* Avatar with White Border */}
          <div className="relative inline-block">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full ring-4 ring-white bg-white shadow-sm overflow-hidden flex items-center justify-center">
              <Avatar name={name} src={avatarUrl} size="lg" className="w-full h-full text-2xl" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" onClick={onEditProfile}>
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button
                  variant={isConnected ? 'outline' : 'primary'}
                  size="sm"
                  onClick={onConnect}
                  leadingIcon={<UserPlus className="w-4 h-4" />}
                >
                  {isConnected ? 'Conectado' : 'Conectar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMessage}
                  leadingIcon={<MessageSquare className="w-4 h-4" />}
                >
                  Mensagem
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Name & Titles */}
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {name}
            </h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Músico Verificado
              </span>
            )}
          </div>

          {title && <p className="text-sm font-semibold text-stone-700">{title}</p>}
          {headline && <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{headline}</p>}

          <div className="flex items-center gap-4 text-xs text-stone-500 pt-2 flex-wrap">
            {affiliation && (
              <span className="inline-flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-stone-400" />
                {affiliation}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {location}
              </span>
            )}
          </div>
        </div>

        {/* Academic Stats Strip */}
        <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-center sm:text-left sm:flex sm:gap-8">
          <div>
            <span className="text-base sm:text-lg font-bold font-mono text-stone-900 block">
              {totalStudyHours}h
            </span>
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400 hidden sm:inline" />
              Horas Auditadas
            </span>
          </div>

          <div>
            <span className="text-base sm:text-lg font-bold font-mono text-stone-900 block">
              {coursesCompleted}
            </span>
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-stone-400 hidden sm:inline" />
              Cursos Concluídos
            </span>
          </div>

          <div>
            <span className="text-base sm:text-lg font-bold font-mono text-stone-900 block">
              {credentialsCount}
            </span>
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <Award className="w-3 h-3 text-stone-400 hidden sm:inline" />
              Credenciais
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
