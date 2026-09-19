import React, { useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  id: string; // Mandatory ID
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'underline' | 'pills';
  sizeVariant?: 'sm' | 'md' | 'kids';
  className?: string;
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  id,
  tabs,
  activeTab,
  onChange,
  orientation = 'horizontal',
  variant = 'underline',
  sizeVariant = 'md',
  className,
  children,
}) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    if (enabledTabs.length === 0) return;

    let nextIndex = currentIndex;

    if (
      (orientation === 'horizontal' && e.key === 'ArrowRight') ||
      (orientation === 'vertical' && e.key === 'ArrowDown')
    ) {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
      while (tabs[nextIndex].disabled) {
        nextIndex = (nextIndex + 1) % tabs.length;
      }
    } else if (
      (orientation === 'horizontal' && e.key === 'ArrowLeft') ||
      (orientation === 'vertical' && e.key === 'ArrowUp')
    ) {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      while (tabs[nextIndex].disabled) {
        nextIndex = (nextIndex - 1 + tabs.length) % tabs.length;
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
      while (tabs[nextIndex].disabled && nextIndex < tabs.length - 1) {
        nextIndex++;
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
      while (tabs[nextIndex].disabled && nextIndex > 0) {
        nextIndex--;
      }
    }

    if (nextIndex !== currentIndex) {
      onChange(tabs[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    kids: 'px-6 py-3.5 text-base font-semibold min-h-[48px]',
  };

  return (
    <div
      id={`${id}-container`}
      className={clsx(
        orientation === 'vertical' ? 'flex flex-col md:flex-row gap-6' : 'flex flex-col gap-4',
        className
      )}
    >
      <div
        id={id}
        role="tablist"
        aria-orientation={orientation}
        className={clsx(
          'flex',
          orientation === 'horizontal'
            ? 'flex-row overflow-x-auto scrollbar-none border-b border-stone-200'
            : 'flex-col border-r border-stone-200 min-w-[200px] pr-2'
        )}
      >
        {tabs.map((tab, idx) => {
          const isSelected = activeTab === tab.id;
          const tabId = `${id}-tab-${tab.id}`;
          const panelId = `${id}-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={twMerge(
                clsx(
                  'inline-flex items-center gap-2 font-medium whitespace-nowrap transition-colors select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-anil-800 disabled:opacity-40 disabled:cursor-not-allowed',
                  sizeClasses[sizeVariant],
                  variant === 'underline' && [
                    orientation === 'horizontal' ? '-mb-px border-b-2' : '-mr-px border-r-2',
                    isSelected
                      ? 'border-anil-800 text-stone-900 font-semibold'
                      : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300',
                  ],
                  variant === 'pills' && [
                    'rounded-md',
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                  ]
                )
              )}
            >
              {tab.icon && (
                <span id={`${tabId}-icon`} className="w-4 h-4 shrink-0" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span id={`${tabId}-label`}>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  id={`${tabId}-badge`}
                  className={clsx(
                    'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium',
                    isSelected ? 'bg-red-100 text-red-900' : 'bg-stone-200 text-stone-700'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {children && (
        <div
          id={`${id}-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${activeTab}`}
          tabIndex={0}
          className="focus:outline-none flex-1"
        >
          {children}
        </div>
      )}
    </div>
  );
};
