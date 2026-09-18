import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { useRouter, BreadcrumbEntry } from '../../navigation/router';
import { LoadingState } from '../feedback/LoadingState';
import { ErrorState } from '../feedback/ErrorState';
import { EmptyState } from '../feedback/EmptyState';
import { SuccessState } from '../feedback/SuccessState';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';
import { SlidersHorizontal, ShieldAlert } from 'lucide-react';

export type ScreenState = 'populated' | 'loading' | 'empty' | 'error' | 'success';

export interface ScreenContainerProps {
  id: string;
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeVariant?: 'brand' | 'neutral' | 'accent';
  breadcrumbs?: BreadcrumbEntry[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    id?: string;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    id?: string;
  }>;
  // State overrides for testing/verification (48_ERROR_EMPTY_LOADING_STATES.md)
  initialState?: ScreenState;
  /**
   * Estado governado pelos DADOS, e não pelo seletor de inspeção.
   *
   * `initialState` só semeia o estado inicial: depois que a tela monta, nada
   * do que o repositório devolve consegue mudá-lo. O resultado era uma tela
   * que declarava ter estado vazio e nunca o alcançava, porque a lista chegar
   * vazia não a levava até lá.
   *
   * Quando `state` é passado, ele manda. É por onde a tela diz "a consulta
   * voltou sem nada" e o vazio aparece de verdade.
   */
  state?: ScreenState;
  emptyProps?: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  errorProps?: {
    title?: string;
    message?: string;
    onRetry?: () => void;
  };
  successProps?: {
    title?: string;
    message?: string;
    onAction?: () => void;
    actionLabel?: string;
  };
  loadingMessage?: string;
  children: React.ReactNode;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  id,
  title,
  subtitle,
  badgeLabel,
  badgeVariant = 'neutral',
  breadcrumbs: customBreadcrumbs,
  primaryAction,
  secondaryActions = [],
  initialState = 'populated',
  state,
  emptyProps,
  errorProps,
  successProps,
  loadingMessage = 'Carregando recursos acadêmicos...',
  children,
}) => {
  const { breadcrumbs: autoBreadcrumbs, navigate, authorization } = useRouter();
  const [estadoLocal, setCurrentState] = useState<ScreenState>(initialState);
  const currentState = state ?? estadoLocal;
  const [showStateTester, setShowStateTester] = useState(false);

  const activeBreadcrumbs = customBreadcrumbs || autoBreadcrumbs;

  // Real server-side route authorization barrier check
  if (!authorization.authorized) {
    return (
      <div id={`${id}-forbidden-container`} className="py-8 space-y-6">
        <Breadcrumbs
          id={`${id}-forbidden-breadcrumbs`}
          items={activeBreadcrumbs.map((b) => ({
            label: b.label,
            onClick: b.path ? () => navigate(b.path!) : undefined,
          }))}
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-md text-anil-800">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-serif font-semibold text-red-900">
                Acesso Restrito • Governança da Academia
              </h2>
              <p className="text-sm text-red-700 mt-1">
                {authorization.reason || 'Esta rota exige credenciais com privilégios administrativos auditados.'}
              </p>
              {authorization.requiredCapability && (
                <div className="mt-3 p-2 bg-white/80 rounded border border-red-200 font-mono text-xs text-red-900">
                  Prerrogativa requerida: <code>{authorization.requiredCapability}</code>
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  id={`${id}-go-home-btn`}
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/')}
                >
                  Retornar ao Início
                </Button>
                <Button
                  id={`${id}-go-login-btn`}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth/login')}
                >
                  Entrar com outra conta
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={`${id}-screen`} className="space-y-6">
      {/* Breadcrumb row & State Inspector Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {activeBreadcrumbs && activeBreadcrumbs.length > 0 && (
          <Breadcrumbs
            id={`${id}-breadcrumbs`}
            items={activeBreadcrumbs.map((b) => ({
              label: b.label,
              onClick: b.path ? () => navigate(b.path!) : undefined,
            }))}
          />
        )}

        {/*
          Inspetor de estados: ferramenta de DESENVOLVIMENTO.

          Ele aparecia em toda tela publicada, com o rótulo "Estados UI
          (populated)" e uma barra para forçar erro, vazio e sucesso. O aluno
          via — e podia acionar — um painel de depuração do time.
        */}
        {import.meta.env.DEV && (
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            id={`${id}-state-tester-toggle`}
            type="button"
            onClick={() => setShowStateTester((prev) => !prev)}
            title="Alternar inspetor de estados UI (Doc 48)"
            className={clsx(
              'inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono rounded border transition-colors',
              showStateTester
                ? 'bg-stone-800 text-stone-200 border-stone-700'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            )}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Estados UI ({currentState})</span>
          </button>
        </div>
        )}
      </div>

      {/* State Inspector Toolbar when opened */}
      {import.meta.env.DEV && showStateTester && (
        <div
          id={`${id}-state-inspector-bar`}
          className="p-3 bg-stone-100 border border-stone-200 rounded-md flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <span className="font-mono text-stone-700 font-semibold">
            Testar Estados Canônicos (Doc 48):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(['populated', 'loading', 'empty', 'error', 'success'] as ScreenState[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setCurrentState(st)}
                className={clsx(
                  'px-2.5 py-1 rounded text-xs font-mono transition-colors',
                  currentState === st
                    ? 'bg-anil-800 text-white font-medium'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                )}
              >
                {st === 'populated' && '✓ Populado'}
                {st === 'loading' && '⏳ Carregando'}
                {st === 'empty' && '∅ Vazio'}
                {st === 'error' && '⚠ Erro'}
                {st === 'success' && '★ Sucesso'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screen Header */}
      <header id={`${id}-header`} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 id={`${id}-title`} className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {title}
            </h1>
            {badgeLabel && (
              <Badge id={`${id}-header-badge`} variant={badgeVariant}>
                {badgeLabel}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p id={`${id}-subtitle`} className="text-sm text-stone-600 max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions Bar */}
        {(primaryAction || secondaryActions.length > 0) && (
          <div id={`${id}-actions-bar`} className="flex flex-wrap items-center gap-2 shrink-0">
            {secondaryActions.map((sec, idx) => {
              const SecIcon = sec.icon;
              return (
                <Button
                  key={sec.id || idx}
                  id={sec.id || `${id}-sec-action-${idx}`}
                  variant="outline"
                  size="sm"
                  onClick={sec.onClick}
                  disabled={sec.disabled}
                >
                  {SecIcon && <SecIcon className="w-3.5 h-3.5 mr-1.5" />}
                  {sec.label}
                </Button>
              );
            })}

            {primaryAction && (
              <Button
                id={primaryAction.id || `${id}-primary-action`}
                variant="primary"
                size="sm"
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled}
              >
                {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5 mr-1.5" />}
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Universal State Rendering */}
      <div id={`${id}-state-outlet`}>
        {currentState === 'loading' && (
          <div id={`${id}-loading-state`} className="py-12 flex justify-center">
            <LoadingState id={`${id}-loader`} message={loadingMessage} />
          </div>
        )}

        {currentState === 'empty' && (
          <div id={`${id}-empty-state`} className="py-12">
            <EmptyState
              id={`${id}-empty`}
              title={emptyProps?.title || 'Nenhum registro encontrado'}
              description={emptyProps?.description || 'Nenhum dado cadastrado para este módulo no momento.'}
              actionLabel={emptyProps?.actionLabel || 'Adicionar Primeiro Registro'}
              onAction={emptyProps?.onAction || (() => setCurrentState('populated'))}
            />
          </div>
        )}

        {currentState === 'error' && (
          <div id={`${id}-error-state`} className="py-12 max-w-xl mx-auto">
            <ErrorState
              id={`${id}-error`}
              title={errorProps?.title || 'Falha ao sincronizar dados da tela'}
              message={
                errorProps?.message ||
                'Ocorreu uma falha transitória de comunicação com os serviços da Academia. Você pode tentar novamente com segurança.'
              }
              onRetry={errorProps?.onRetry || (() => setCurrentState('populated'))}
            />
          </div>
        )}

        {currentState === 'success' && (
          <div id={`${id}-success-state`} className="py-8 max-w-xl mx-auto">
            <SuccessState
              id={`${id}-success`}
              title={successProps?.title || 'Operação realizada com sucesso'}
              message={
                successProps?.message ||
                'As alterações foram auditadas e salvas com sucesso na base de conhecimento da Academia.'
              }
              actionLabel={successProps?.actionLabel || 'Continuar'}
              onAction={successProps?.onAction || (() => setCurrentState('populated'))}
            />
          </div>
        )}

        {currentState === 'populated' && children}
      </div>
    </div>
  );
};
