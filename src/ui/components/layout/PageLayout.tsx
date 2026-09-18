import React, { useMemo, useState, useId } from 'react';
import { clsx } from 'clsx';
import { SlidersHorizontal, X } from 'lucide-react';
import { Tabs, TabItem } from '../navigation/Tabs';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { LoadingState } from '../feedback/LoadingState';
import { EmptyState } from '../feedback/EmptyState';
import { ErrorState } from '../feedback/ErrorState';
import { LockedState } from '../feedback/LockedState';
import { Skeleton } from '../base/Skeleton';
import type { BreadcrumbEntry } from '../../navigation/router';

/**
 * PageLayout — primitiva de composição de página.
 *
 * MOTIVO DE EXISTIR (docs/claude/02_REFERENCE_PARITY_AUDIT.md §1):
 * a auditoria de paridade mediu que telas de uma coluna somam 81/100,
 * enquanto telas que exigem grade, trilho fixo e abas somam 26 a 35 — com
 * ZERO aprovações nas Formas B e D. A causa não é qualidade de execução:
 * não existia primitiva de layout com colunas. `ScreenContainer` entrega
 * título, subtítulo, badge e ações, e nada mais. Sem coluna, sem região
 * fixa e sem abas, toda tela que precisava de estrutura improvisou um
 * empilhamento vertical — daí `sticky: 0/72` e `grid-cols-12: 0/72`.
 *
 * Esta primitiva implementa as 4 formas canônicas de
 * docs/claude/wireframes/00_FOUNDATIONS.md §2 e destrava 53 das 72 telas.
 *
 * Responsabilidades, todas centralizadas aqui para não se repetirem em 72 telas:
 *   1. grade de 12 colunas e larguras máximas;
 *   2. regiões fixas (`sticky`) com z-index e fundo opaco;
 *   3. colapso responsivo por forma;
 *   4. marcos ARIA (`<header>`, `<main id="main">`, `<aside>`);
 *   5. orquestração dos 5 estados — hoje 0/72 telas cumprem o DoD.
 */

/**
 * As formas canônicas de página.
 *
 * `course` (E) foi acrescentada quando a área de curso precisou de um sumário
 * lateral fixo que acompanha a leitura — coisa que nenhuma das outras quatro
 * oferece. `catalog` põe filtros à esquerda mas rola junto com a página;
 * `workspace` tem painel fixo mas é escuro e de altura travada, para
 * instrumento. A área de curso é clara, rola no conteúdo e mantém o sumário.
 */
export type PageForm = 'focus' | 'catalog' | 'detail' | 'workspace' | 'course';
export type PageDensity = 'editorial' | 'catalog' | 'operational' | 'instrument';
export type PageState = 'loading' | 'content' | 'empty' | 'error' | 'locked';

// --------------------------------------------------------------- SLOTS ---
// Componentes-marcador. Não renderizam sozinhos: o PageLayout os extrai e
// posiciona. Isso permite declarar os blocos em qualquer ordem no JSX.

interface SlotProps {
  children: React.ReactNode;
  className?: string;
}
const makeSlot = (displayName: string) => {
  const Slot: React.FC<SlotProps> = ({ children }) => <>{children}</>;
  Slot.displayName = displayName;
  return Slot;
};

const Hero = makeSlot('PageLayout.Hero');
const Main = makeSlot('PageLayout.Main');
const Aside = makeSlot('PageLayout.Aside');
const Toolbar = makeSlot('PageLayout.Toolbar');
const Panel = makeSlot('PageLayout.Panel');
const Inspector = makeSlot('PageLayout.Inspector');
const Transport = makeSlot('PageLayout.Transport');

interface TabsSlotProps {
  id: string;
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}
const TabsSlot: React.FC<TabsSlotProps> = () => null;
TabsSlot.displayName = 'PageLayout.Tabs';

/** Bloco de seção padrão dentro de `Main`, com título acessível. */
const Section: React.FC<{
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, actions, children, className }) => {
  const headingId = useId();
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={clsx('space-y-3', className)}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            {title && (
              <h2 id={headingId} className="font-serif text-base font-bold text-stone-900">
                {title}
              </h2>
            )}
            {description && <p className="text-xs text-stone-600">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
};
Section.displayName = 'PageLayout.Section';

// ---------------------------------------------------------------- PROPS ---

export interface PageLayoutProps {
  id: string;
  form: PageForm;
  density?: PageDensity;
  state?: PageState;
  breadcrumbs?: BreadcrumbEntry[];
  /** Rótulo do painel lateral em telas estreitas (Forma `catalog`). */
  asideLabel?: string;
  emptyProps?: { title: string; description: string; actionLabel?: string; onAction?: () => void };
  errorProps?: { title?: string; message: string; onRetry?: () => void };
  lockedProps?: { title?: string; description?: string; requirementText?: string; unlockActionLabel?: string; onUnlockAction?: () => void };
  loadingMessage?: string;
  className?: string;
  children: React.ReactNode;
}

const DENSITY_CLASS: Record<PageDensity, string> = {
  editorial: 'text-base leading-relaxed [--section-gap:2rem]',
  catalog: 'text-sm [--section-gap:1.5rem]',
  operational: 'text-[13px] [--section-gap:1rem]',
  instrument: 'text-xs [--section-gap:0.5rem]',
};

function findSlot(children: React.ReactNode, displayName: string): React.ReactElement | null {
  let found: React.ReactElement | null = null;
  React.Children.forEach(children, (child) => {
    if (found) return;
    if (React.isValidElement(child)) {
      const type = child.type as { displayName?: string };
      if (type?.displayName === displayName) found = child;
    }
  });
  return found;
}

// ----------------------------------------------------------- ESQUELETOS ---

/** Esqueleto com a GEOMETRIA da forma — não um spinner centralizado. */
const FormSkeleton: React.FC<{ form: PageForm }> = ({ form }) => {
  if (form === 'workspace') {
    return (
      <div className="flex h-full gap-2 p-2" aria-hidden="true">
        <Skeleton variant="rectangular" width="240px" height="100%" />
        <Skeleton variant="rectangular" width="100%" height="100%" />
        <Skeleton variant="rectangular" width="280px" height="100%" />
      </div>
    );
  }
  const rows = form === 'focus' ? 3 : 5;
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton variant="text" width="40%" height="28px" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="card" height="96px" />
      ))}
    </div>
  );
};

// -------------------------------------------------------------- LAYOUT ---

const PageLayoutRoot: React.FC<PageLayoutProps> = ({
  id,
  form,
  density = 'catalog',
  state = 'content',
  breadcrumbs,
  asideLabel = 'Filtros',
  emptyProps,
  errorProps,
  lockedProps,
  loadingMessage,
  className,
  children,
}) => {
  const [isAsideOpen, setIsAsideOpen] = useState(false);

  const slots = useMemo(
    () => ({
      hero: findSlot(children, 'PageLayout.Hero'),
      tabs: findSlot(children, 'PageLayout.Tabs'),
      main: findSlot(children, 'PageLayout.Main'),
      aside: findSlot(children, 'PageLayout.Aside'),
      toolbar: findSlot(children, 'PageLayout.Toolbar'),
      panel: findSlot(children, 'PageLayout.Panel'),
      inspector: findSlot(children, 'PageLayout.Inspector'),
      transport: findSlot(children, 'PageLayout.Transport'),
    }),
    [children]
  );

  // Trilho e filtros descem abaixo das abas quando elas existem.
  const stickyTop = slots.tabs ? 'lg:top-32' : 'lg:top-20';

  /** Conteúdo principal, já resolvido pelo estado da tela. */
  const mainContent = (() => {
    switch (state) {
      case 'loading':
        return (
          <div role="status" aria-busy="true" aria-live="polite">
            <span className="sr-only">{loadingMessage || 'Carregando conteúdo…'}</span>
            <FormSkeleton form={form} />
          </div>
        );
      case 'empty':
        return (
          <EmptyState
            id={`${id}-empty`}
            title={emptyProps?.title || 'Nada por aqui ainda'}
            description={emptyProps?.description || 'Quando houver conteúdo, ele aparecerá nesta área.'}
            actionLabel={emptyProps?.actionLabel}
            onAction={emptyProps?.onAction}
          />
        );
      case 'error':
        return (
          <ErrorState
            id={`${id}-error`}
            title={errorProps?.title}
            message={errorProps?.message || 'Não foi possível carregar esta página.'}
            onRetry={errorProps?.onRetry}
          />
        );
      case 'locked':
        return (
          <LockedState
            id={`${id}-locked`}
            title={lockedProps?.title}
            description={lockedProps?.description}
            requirementText={lockedProps?.requirementText}
            unlockActionLabel={lockedProps?.unlockActionLabel}
            onUnlockAction={lockedProps?.onUnlockAction}
          />
        );
      default:
        return slots.main;
    }
  })();

  // ------------------------------------------------------- WORKSPACE (D) ---
  if (form === 'workspace') {
    return (
      <div
        id={id}
        data-page-form="workspace"
        className={clsx('flex h-[100dvh] flex-col bg-zinc-900 text-stone-100', DENSITY_CLASS.instrument, className)}
      >
        {slots.toolbar && (
          <header className="sticky top-0 z-30 shrink-0 border-b border-zinc-800 bg-zinc-900">
            {slots.toolbar}
          </header>
        )}

        <div className="flex min-h-0 flex-1">
          {slots.panel && (
            <aside
              aria-label="Painel de ferramentas"
              className="hidden w-60 shrink-0 overflow-y-auto border-r border-zinc-800 lg:block"
            >
              {slots.panel}
            </aside>
          )}

          <main id="main" className="min-w-0 flex-1 overflow-auto">
            {mainContent}
          </main>

          {slots.inspector && (
            <aside
              aria-label="Inspetor"
              className="hidden w-70 shrink-0 overflow-y-auto border-l border-zinc-800 xl:block"
            >
              {slots.inspector}
            </aside>
          )}
        </div>

        {slots.transport && (
          <footer className="sticky bottom-0 z-30 shrink-0 border-t border-zinc-800 bg-zinc-900">
            {slots.transport}
          </footer>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------- COURSE (E) ---
  if (form === 'course') {
    return (
      <div id={id} data-page-form="course" className={clsx('flex min-h-[calc(100vh-3.5rem)]', className)}>
        {slots.panel && (
          <aside
            aria-label="Conteúdo do curso"
            className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 lg:block"
          >
            {slots.panel}
          </aside>
        )}

        <main
          id="main"
          tabIndex={-1}
          className={clsx('min-w-0 flex-1 focus:outline-none', DENSITY_CLASS[density])}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 xl:flex-row">
            <div className="min-w-0 flex-1">{mainContent}</div>

            {slots.aside && (
              <aside aria-label={asideLabel} className="w-full shrink-0 space-y-5 xl:w-64">
                {slots.aside}
              </aside>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------- FOCUS · CATALOG · DETAIL ---
  const isCatalog = form === 'catalog';
  const isDetail = form === 'detail';

  return (
    <div
      id={id}
      data-page-form={form}
      className={clsx('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6', DENSITY_CLASS[density], className)}
    >
      {breadcrumbs && breadcrumbs.length > 1 && (
        <nav aria-label="Trilha de navegação" className="mb-4">
          <Breadcrumbs id={`${id}-breadcrumbs`} items={breadcrumbs} />
        </nav>
      )}

      {slots.hero && <header className="mb-6">{slots.hero}</header>}

      {slots.tabs && (
        <div className="sticky top-16 z-20 -mx-4 mb-6 overflow-x-auto border-b border-stone-200 bg-stone-50/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
          <Tabs
            id={(slots.tabs.props as TabsSlotProps).id}
            tabs={(slots.tabs.props as TabsSlotProps).tabs}
            activeTab={(slots.tabs.props as TabsSlotProps).activeTab}
            onChange={(slots.tabs.props as TabsSlotProps).onChange}
            variant="underline"
          />
        </div>
      )}

      {form === 'focus' ? (
        <main id="main" className="mx-auto w-full max-w-2xl">
          {mainContent}
        </main>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          {/* Painel lateral: filtros à esquerda no catálogo, trilho à direita no detalhe */}
          {slots.aside && (
            <>
              {/* Acionador em telas estreitas */}
              <div className="mb-4 lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsAsideOpen((v) => !v)}
                  aria-expanded={isAsideOpen}
                  aria-controls={`${id}-aside`}
                  className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800"
                >
                  {isAsideOpen ? <X className="h-3.5 w-3.5" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
                  {isAsideOpen ? 'Fechar' : asideLabel}
                </button>
              </div>

              <aside
                id={`${id}-aside`}
                aria-label={asideLabel}
                className={clsx(
                  isAsideOpen ? 'block' : 'hidden',
                  'mb-6 lg:mb-0 lg:block',
                  'lg:self-start lg:sticky',
                  stickyTop,
                  isCatalog && 'lg:col-span-3 lg:order-1',
                  isDetail && 'lg:col-span-4 lg:order-2'
                )}
              >
                {slots.aside}
              </aside>
            </>
          )}

          <main
            id="main"
            className={clsx(
              'min-w-0',
              slots.aside
                ? isCatalog
                  ? 'lg:col-span-9 lg:order-2'
                  : 'lg:col-span-8 lg:order-1'
                : 'lg:col-span-12'
            )}
          >
            {mainContent}
          </main>
        </div>
      )}
    </div>
  );
};

type PageLayoutComponent = React.FC<PageLayoutProps> & {
  Hero: typeof Hero;
  Tabs: typeof TabsSlot;
  Main: typeof Main;
  Aside: typeof Aside;
  Section: typeof Section;
  Toolbar: typeof Toolbar;
  Panel: typeof Panel;
  Inspector: typeof Inspector;
  Transport: typeof Transport;
};

export const PageLayout = PageLayoutRoot as PageLayoutComponent;
PageLayout.Hero = Hero;
PageLayout.Tabs = TabsSlot;
PageLayout.Main = Main;
PageLayout.Aside = Aside;
PageLayout.Section = Section;
PageLayout.Toolbar = Toolbar;
PageLayout.Panel = Panel;
PageLayout.Inspector = Inspector;
PageLayout.Transport = Transport;

export { LoadingState };
