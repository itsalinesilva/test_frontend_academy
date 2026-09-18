import React, { useState } from 'react';
import { calculateInnerRadius } from '../../design-system/tokens';
import { Button } from '../base/Button';
import { Input } from '../base/Input';
import { Badge } from '../base/Badge';
import { Card } from '../base/Card';
import { Select } from '../forms/Select';
import { Checkbox } from '../forms/Checkbox';
import { RadioGroup } from '../forms/RadioGroup';
import { Switch } from '../forms/Switch';
import { Tabs } from '../navigation/Tabs';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { SegmentedControl } from '../navigation/SegmentedControl';
import { DropdownMenu } from '../navigation/DropdownMenu';
import { Dialog } from '../overlays/Dialog';
import { Drawer } from '../overlays/Drawer';
import { Table } from '../data-display/Table';
import { List, ListItem } from '../data-display/List';
import { ProgressBar, CircularProgress } from '../data-display/Progress';
import { Avatar } from '../data-display/Avatar';
import { CredentialChip } from '../data-display/CredentialChip';
import { ScoreContainer } from '../domain/ScoreContainer';
import { TimelineContainer } from '../domain/TimelineContainer';
import { ToolPanel } from '../domain/ToolPanel';
import { PracticeResultCard } from '../domain/PracticeResultCard';
import { FeedCard } from '../domain/FeedCard';
import { ProfileCard } from '../domain/ProfileCard';
import { CourseCard } from '../domain/CourseCard';
import { RoomCard } from '../domain/RoomCard';
import { MediaCard } from '../domain/MediaCard';
import { LoadingState } from '../feedback/LoadingState';
import { ErrorState } from '../feedback/ErrorState';
import { EmptyState } from '../feedback/EmptyState';
import { SuccessState } from '../feedback/SuccessState';
import { UserRole } from '../../../domain/types';
import {
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Baby,
  Layers,
  Palette,
  Sliders,
  FolderLock,
  Music,
} from 'lucide-react';
import { clsx } from 'clsx';

export const DesignSystemCatalog: React.FC = () => {
  // Navigation tabs within the Design System harness
  const [catalogTab, setCatalogTab] = useState<string>('tokens');
  
  // Device frame simulation
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isKidsMode, setIsKidsMode] = useState<boolean>(false);

  // States demo
  const [demoState, setDemoState] = useState<'default' | 'loading' | 'error' | 'empty' | 'success'>('default');

  // Interactive UI states for form controls demo
  const [inputText, setInputText] = useState('Dó maior com sétima maior (Cmaj7)');
  const [selectValue, setSelectValue] = useState('clef_treble');
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [checkboxIndeterminate, setCheckboxIndeterminate] = useState(false);
  const [radioValue, setRadioValue] = useState('equal');
  const [switchChecked, setSwitchChecked] = useState(true);
  const [segmentedValue, setSegmentedValue] = useState('audio');

  // Overlays state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Domain tools interactive state
  const [isScorePlaying, setIsScorePlaying] = useState(false);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);

  // Sample table data
  // A coluna de proveniencia citava uma catedra estrangeira em todas as linhas.
  // Trocada pelo capitulo do proprio curso onde o intervalo e ensinado, que e
  // a proveniencia que a plataforma de fato tem.
  const sampleTableData = [
    { id: '1', interval: 'Segunda Maior (M2)', semitones: 2, ratio: '9:8', frequencyC4: '293.66 Hz', provenance: 'Teoria, cap. X' },
    { id: '2', interval: 'Terça Maior (M3)', semitones: 4, ratio: '5:4', frequencyC4: '329.63 Hz', provenance: 'Teoria, cap. X' },
    { id: '3', interval: 'Quinta Justa (P5)', semitones: 7, ratio: '3:2', frequencyC4: '392.00 Hz', provenance: 'Teoria, cap. XVII' },
    { id: '4', interval: 'Oitava Justa (P8)', semitones: 12, ratio: '2:1', frequencyC4: '523.25 Hz', provenance: 'Teoria, cap. XVII' },
  ];

  return (
    <div id="design-system-catalog-root" className="space-y-8 pb-16">
      {/* Harness Control Header */}
      <div
        id="ds-harness-control-panel"
        className="p-5 bg-white border border-stone-200 rounded-lg shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-anil-800" aria-hidden="true" />
            <h1 className="text-base font-bold font-sans tracking-tight text-stone-900 uppercase">
              Design System Oficial • 17_DESIGN_SYSTEM.md
            </h1>
            <Badge id="ds-version-badge" variant="brand" size="sm">
              v1.0.0
            </Badge>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Identidade própria: sóbria, musical, acadêmica, tecnológica e sofisticada. Cores semânticas com vermelho institucional (#991b1b) para ação e sinal.
          </p>
        </div>

        {/* Device & Mode Simulators */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center bg-stone-100 p-1 rounded-md border border-stone-200 text-xs">
            <button
              id="btn-viewport-desktop"
              type="button"
              onClick={() => setDeviceViewport('desktop')}
              className={clsx(
                'px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors',
                deviceViewport === 'desktop' ? 'bg-white font-semibold text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              )}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              id="btn-viewport-tablet"
              type="button"
              onClick={() => setDeviceViewport('tablet')}
              className={clsx(
                'px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors',
                deviceViewport === 'tablet' ? 'bg-white font-semibold text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              )}
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet (768px)
            </button>
            <button
              id="btn-viewport-mobile"
              type="button"
              onClick={() => setDeviceViewport('mobile')}
              className={clsx(
                'px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors',
                deviceViewport === 'mobile' ? 'bg-white font-semibold text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              )}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
            </button>
          </div>

          <button
            id="btn-toggle-kids-mode"
            type="button"
            onClick={() => setIsKidsMode(!isKidsMode)}
            className={clsx(
              'px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors',
              isKidsMode
                ? 'bg-amber-100 text-amber-950 border-amber-300 font-semibold'
                : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
            )}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Modo Criança ({isKidsMode ? 'ATIVO' : 'DESLIGADO'})</span>
          </button>
        </div>
      </div>

      {/* Main Catalog Tabs */}
      <Tabs
        id="ds-main-tabs"
        activeTab={catalogTab}
        onChange={setCatalogTab}
        variant="pills"
        tabs={[
          { id: 'tokens', label: '1. Tokens & Fundações', icon: <Palette className="w-4 h-4" /> },
          { id: 'primitives', label: '2. Componentes Básicos & Formulários', icon: <Sliders className="w-4 h-4" /> },
          { id: 'navigation', label: '3. Navegação & Overlays', icon: <Layers className="w-4 h-4" /> },
          { id: 'data-display', label: '4. Exibição de Dados & Métricas', icon: <FolderLock className="w-4 h-4" /> },
          { id: 'domain', label: '5. Componentes de Domínio Musical', icon: <Music className="w-4 h-4" /> },
          { id: 'states', label: '6. Matriz de Estados Canônicos', icon: <Sparkles className="w-4 h-4" /> },
        ]}
      />

      {/* Responsive Viewport Wrapper */}
      <div
        id="ds-viewport-container"
        className={clsx(
          'mx-auto transition-all duration-300',
          deviceViewport === 'tablet' && 'max-w-[768px] border-x-4 border-stone-400 px-4 bg-stone-100/50 py-4 rounded-xl',
          deviceViewport === 'mobile' && 'max-w-[375px] border-x-4 border-stone-400 px-2 bg-stone-100/50 py-4 rounded-xl'
        )}
      >
        {/* ========================================================================= */}
        {/* TAB 1: TOKENS & FOUNDATIONS */}
        {/* ========================================================================= */}
        {catalogTab === 'tokens' && (
          <div id="tab-content-tokens" className="space-y-6">
            {/* Color Palette Matrix */}
            <Card
              id="card-tokens-colors"
              title="1. Paleta Semântica e Tokens de Cor"
              subtitle="Conforme 17_DESIGN_SYSTEM.md: Branco, preto, tons neutros de pedra e vermelho como sinal/ação semântica."
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                {/* Background */}
                <div id="token-color-bg" className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="h-10 rounded border border-stone-300 bg-[#fafaf9] mb-2" />
                  <span className="font-semibold text-stone-900 block">background</span>
                  <span className="text-[10px] font-mono text-stone-500">#fafaf9 / stone-50</span>
                  <p className="text-[10px] text-stone-400 mt-1">Canvas institucional limpo</p>
                </div>

                {/* Foreground */}
                <div id="token-color-fg" className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="h-10 rounded bg-[#1c1917] mb-2" />
                  <span className="font-semibold text-stone-900 block">foreground</span>
                  <span className="text-[10px] font-mono text-stone-500">#1c1917 / stone-900</span>
                  <p className="text-[10px] text-stone-400 mt-1">Legibilidade máxima WCAG AAA</p>
                </div>

                {/* Surface */}
                <div id="token-color-surface" className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="h-10 rounded bg-white border border-stone-200 shadow-xs mb-2" />
                  <span className="font-semibold text-stone-900 block">surface</span>
                  <span className="text-[10px] font-mono text-stone-500">#ffffff / white</span>
                  <p className="text-[10px] text-stone-400 mt-1">Superfície de cards e pautas</p>
                </div>

                {/* Border */}
                <div id="token-color-border" className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="h-10 rounded border-2 border-[#e7e5e4] bg-white mb-2" />
                  <span className="font-semibold text-stone-900 block">border</span>
                  <span className="text-[10px] font-mono text-stone-500">#e7e5e4 / stone-200</span>
                  <p className="text-[10px] text-stone-400 mt-1">Divisores arquitetônicos</p>
                </div>

                {/* Muted */}
                <div id="token-color-muted" className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="h-10 rounded bg-[#f5f5f4] border border-stone-200 mb-2 flex items-center justify-center text-stone-500 font-mono text-[10px]">
                    Aa
                  </div>
                  <span className="font-semibold text-stone-900 block">muted</span>
                  <span className="text-[10px] font-mono text-stone-500">#78716c / stone-500</span>
                  <p className="text-[10px] text-stone-400 mt-1">Metadados e compassos</p>
                </div>

                {/* Primary / Action (Red Signal) */}
                <div id="token-color-primary" className="p-3 bg-red-50/50 border border-red-200 rounded">
                  <div className="h-10 rounded bg-[#991b1b] mb-2" />
                  <span className="font-semibold text-anil-950 block">primary / accent</span>
                  <span className="text-[10px] font-mono text-anil-800">#991b1b / anil-800</span>
                  <p className="text-[10px] text-red-700 mt-1">Ação/sinal semântico estrito</p>
                </div>

                {/* Success */}
                <div id="token-color-success" className="p-3 bg-emerald-50/50 border border-emerald-200 rounded">
                  <div className="h-10 rounded bg-[#15803d] mb-2" />
                  <span className="font-semibold text-emerald-950 block">success</span>
                  <span className="text-[10px] font-mono text-emerald-800">#15803d / emerald-700</span>
                  <p className="text-[10px] text-emerald-700 mt-1">Afinação e aprovação</p>
                </div>

                {/* Warning */}
                <div id="token-color-warning" className="p-3 bg-amber-50/50 border border-amber-200 rounded">
                  <div className="h-10 rounded bg-[#b45309] mb-2" />
                  <span className="font-semibold text-amber-950 block">warning</span>
                  <span className="text-[10px] font-mono text-amber-800">#b45309 / amber-700</span>
                  <p className="text-[10px] text-amber-700 mt-1">Calibração e revisão</p>
                </div>

                {/* Danger */}
                <div id="token-color-danger" className="p-3 bg-rose-50/50 border border-rose-200 rounded">
                  <div className="h-10 rounded bg-[#b91c1c] mb-2" />
                  <span className="font-semibold text-rose-950 block">danger</span>
                  <span className="text-[10px] font-mono text-rose-800">#b91c1c / rose-700</span>
                  <p className="text-[10px] text-rose-700 mt-1">Erros e fora de tom</p>
                </div>

                {/* Focus */}
                <div id="token-color-focus" className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="h-10 rounded bg-white border border-stone-200 ring-2 ring-[#991b1b] ring-offset-2 mb-2" />
                  <span className="font-semibold text-stone-900 block">focus</span>
                  <span className="text-[10px] font-mono text-stone-500">2px solid #991b1b</span>
                  <p className="text-[10px] text-stone-400 mt-1">Anel de foco acessível</p>
                </div>

                {/* Disabled */}
                <div id="token-color-disabled" className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="h-10 rounded bg-[#f5f5f4] border border-stone-200 text-stone-400 flex items-center justify-center text-[10px] font-mono mb-2">
                    Inativo
                  </div>
                  <span className="font-semibold text-stone-900 block">disabled</span>
                  <span className="text-[10px] font-mono text-stone-500">#a8a29e / opacity 50</span>
                  <p className="text-[10px] text-stone-400 mt-1">Controles desabilitados</p>
                </div>

                {/* Dark Studio Surface */}
                <div id="token-color-studio" className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="h-10 rounded bg-[#18181b] mb-2" />
                  <span className="font-semibold text-stone-900 block">surface.studio</span>
                  <span className="text-[10px] font-mono text-stone-500">#18181b / zinc-900</span>
                  <p className="text-[10px] text-stone-400 mt-1">DAW, mixer e timeline</p>
                </div>
              </div>
            </Card>

            {/* Typography & Spacing Foundations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                id="card-tokens-typography"
                title="2. Tipografia & Escala Modular"
                subtitle="UI Sans para leitura densa, Serif para títulos institucionais, Monospace para notação e DSP."
              >
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1">
                    <span className="text-[11px] font-mono text-stone-400 uppercase">Serif Display (Institucional)</span>
                    <h2 className="text-xl font-serif font-bold text-stone-900">
                      Conservatório Muscicapa
                    </h2>
                    <p className="text-[11px] text-stone-500">Cinzel / Playfair Display / Georgia</p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1">
                    <span className="text-[11px] font-mono text-stone-400 uppercase">UI Sans (Interface & Conteúdo)</span>
                    <p className="text-sm font-sans text-stone-800 leading-relaxed max-w-[65ch]">
                      Linhas restritas a 65–75 caracteres para legibilidade acadêmica contínua sem fadiga ocular.
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-1">
                    <span className="text-[11px] font-mono text-stone-400 uppercase">Monospace (Teoria Musical & DSP)</span>
                    <p className="text-xs font-mono text-stone-800">
                      C4 (261.63 Hz) → G4 (392.00 Hz) • [Intervalo: 7 semitons (P5)]
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                id="card-tokens-math-rules"
                title="3. Regras Matemáticas: Raio & Espaçamento"
                subtitle="Nested border radius: Inner = Outer - Padding. Proporção horizontal = 2x vertical nos botões."
              >
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-300">
                    <div className="text-[11px] font-mono text-stone-600 mb-2">
                      Outer Container: radius = 12px (rounded-xl), padding = 16px (p-4)
                    </div>
                    <div
                      style={{ borderRadius: `${calculateInnerRadius(12, 4)}px` }}
                      className="p-3 bg-white border border-stone-300 shadow-xs"
                    >
                      <span className="font-semibold text-stone-900 block">Inner Box Calculado:</span>
                      <span className="font-mono text-stone-500 text-[11px]">
                        innerRadius = Math.max(0, 12 - 4) = 8px
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded border border-stone-200">
                    <span className="font-semibold text-stone-900 block mb-1">
                      Matriz de Espaçamento Rítmico (Grid de 4px):
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-stone-600 flex-wrap">
                      <span className="px-2 py-0.5 bg-stone-200 rounded">4px (1)</span>
                      <span className="px-2 py-0.5 bg-stone-200 rounded">8px (2)</span>
                      <span className="px-2 py-0.5 bg-stone-200 rounded">12px (3)</span>
                      <span className="px-2 py-0.5 bg-stone-200 rounded">16px (4)</span>
                      <span className="px-2 py-0.5 bg-stone-200 rounded">24px (6)</span>
                      <span className="px-2 py-0.5 bg-stone-200 rounded">48px (12 / Touch Target)</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRIMITIVES & FORMS */}
        {/* ========================================================================= */}
        {catalogTab === 'primitives' && (
          <div id="tab-content-primitives" className="space-y-6">
            {/* Buttons Showcase */}
            <Card
              id="card-showcase-buttons"
              title="1. Botões & Variantes de Ação"
              subtitle="Variantes: primary (vermelho institucional), secondary, outline, ghost, danger, accent. Suporte a Kids mode (>= 48px)."
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button id="btn-demo-primary" variant="primary" size={isKidsMode ? 'kids' : 'md'}>
                    Ação Primária (Matricular)
                  </Button>
                  <Button id="btn-demo-secondary" variant="secondary" size={isKidsMode ? 'kids' : 'md'}>
                    Secundário (Continuar)
                  </Button>
                  <Button id="btn-demo-outline" variant="outline" size={isKidsMode ? 'kids' : 'md'}>
                    Contorno (Partitura)
                  </Button>
                  <Button id="btn-demo-ghost" variant="ghost" size={isKidsMode ? 'kids' : 'md'}>
                    Fantasma (Cancelar)
                  </Button>
                  <Button id="btn-demo-danger" variant="danger" size={isKidsMode ? 'kids' : 'md'}>
                    Crítico / Excluir
                  </Button>
                  <Button id="btn-demo-accent" variant="accent" size={isKidsMode ? 'kids' : 'md'}>
                    Acento Suave
                  </Button>
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-stone-500 font-medium">Estados do Botão:</span>
                  <Button id="btn-state-loading" variant="primary" size="sm" isLoading>
                    Processando
                  </Button>
                  <Button id="btn-state-disabled" variant="primary" size="sm" disabled>
                    Desabilitado
                  </Button>
                  <Button id="btn-state-success" variant="primary" size="sm" isSuccess>
                    Concluído
                  </Button>
                </div>
              </div>
            </Card>

            {/* Inputs & Form Controls */}
            <Card
              id="card-showcase-forms"
              title="2. Controles de Formulário Acessíveis"
              subtitle="Inputs, Selects, Checkboxes, Radios e Switches com labels associados e WAI-ARIA."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    id="input-demo-text"
                    label="Nome da Obra ou Exercício"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    helperText="Exemplo: Sonata ao Luar (Op. 27, nº 2)"
                    sizeVariant={isKidsMode ? 'kids' : 'md'}
                  />

                  <Input
                    id="input-demo-error"
                    label="Frequência do Diapasão (Hz)"
                    value="999 Hz"
                    error="Valor fora dos limites acústicos recomendados (415 Hz a 444 Hz)."
                    sizeVariant={isKidsMode ? 'kids' : 'md'}
                  />

                  <Select
                    id="select-demo-clef"
                    label="Clave Principal"
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    options={[
                      { value: 'clef_treble', label: 'Clave de Sol na 2ª Linha (Treble)' },
                      { value: 'clef_bass', label: 'Clave de Fá na 4ª Linha (Bass)' },
                      { value: 'clef_alto', label: 'Clave de Dó na 3ª Linha (Alto)' },
                    ]}
                    sizeVariant={isKidsMode ? 'kids' : 'md'}
                  />
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-stone-700 block">Opções de Prática:</span>
                    <Checkbox
                      id="checkbox-demo-metronome"
                      label="Ativar Metrônomo com subdivisão em colcheias"
                      description="Gera clique auditivo via WebAudio Engine"
                      checked={checkboxChecked}
                      onChange={(e) => setCheckboxChecked(e.target.checked)}
                      sizeVariant={isKidsMode ? 'kids' : 'md'}
                    />
                    <Checkbox
                      id="checkbox-demo-indeterminate"
                      label="Sincronização de Trilha Parcial"
                      description="Estado intermediário / indeterminado de gravação"
                      indeterminate={checkboxIndeterminate}
                      checked={false}
                      onChange={() => setCheckboxIndeterminate(!checkboxIndeterminate)}
                      sizeVariant={isKidsMode ? 'kids' : 'md'}
                    />
                  </div>

                  <RadioGroup
                    id="radio-demo-temperament"
                    name="temperament"
                    label="Sistema de Afinação (Temperamento):"
                    value={radioValue}
                    onChange={setRadioValue}
                    sizeVariant={isKidsMode ? 'kids' : 'md'}
                    options={[
                      { value: 'equal', label: 'Temperamento Igual (12-EDO)', description: 'Padrão moderno da música ocidental' },
                      { value: 'just', label: 'Entonação Justa (Pitágoras / Zarlino)', description: 'Razões harmônicas puras' },
                    ]}
                  />

                  <Switch
                    id="switch-demo-tuner"
                    label="Detecção de Pitch em Tempo Real (DSP)"
                    description="Processa entrada do microfone pelo adapter"
                    checked={switchChecked}
                    onChange={setSwitchChecked}
                    sizeVariant={isKidsMode ? 'kids' : 'md'}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: NAVIGATION & OVERLAYS */}
        {/* ========================================================================= */}
        {catalogTab === 'navigation' && (
          <div id="tab-content-navigation" className="space-y-6">
            <Card
              id="card-showcase-nav"
              title="1. Elementos de Navegação"
              subtitle="Breadcrumbs, SegmentedControl e Menus suspensos acessíveis."
            >
              <div className="space-y-5">
                <Breadcrumbs
                  id="demo-breadcrumbs"
                  items={[
                    { id: 'acad', label: 'Academy', onClick: () => {} },
                    { id: 'prog', label: 'Teoria da Música', onClick: () => {} },
                    { id: 'curr', label: 'X. Intervalos', isCurrent: true },
                  ]}
                />

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div>
                    <span className="text-xs font-semibold text-stone-700 block mb-1">
                      Seletor de Modo (SegmentedControl):
                    </span>
                    <SegmentedControl
                      id="demo-segmented-control"
                      value={segmentedValue}
                      onChange={setSegmentedValue}
                      sizeVariant={isKidsMode ? 'kids' : 'md'}
                      options={[
                        { id: 'audio', label: 'Trilha de Áudio' },
                        { id: 'score', label: 'Notação / Partitura' },
                        { id: 'midi', label: 'Rolagem MIDI' },
                      ]}
                    />
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-stone-700 block mb-1">
                      Menu de Contexto Acessível:
                    </span>
                    <DropdownMenu
                      id="demo-dropdown-menu"
                      trigger={
                        <Button id="btn-trigger-dropdown" size="sm" variant="outline">
                          Opções da Partitura ▾
                        </Button>
                      }
                      items={[
                        { id: 'exp-xml', label: 'Exportar MusicXML', onClick: () => {} },
                        { id: 'exp-midi', label: 'Exportar Arquivo MIDI', onClick: () => {} },
                        'separator',
                        { id: 'reset-notes', label: 'Limpar Compassos', variant: 'danger', onClick: () => {} },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card
              id="card-showcase-overlays"
              title="2. Janelas Modais & Gavetas (Dialogs & Drawers)"
              subtitle="Foco acessível, teclado ESC e gerenciamento de camadas para inspeção de ferramentas e confirmação."
            >
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  id="btn-open-dialog-demo"
                  variant="primary"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Abrir Diálogo Modal (Dialog)
                </Button>

                <Button
                  id="btn-open-drawer-demo"
                  variant="outline"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Abrir Painel Lateral (Drawer)
                </Button>
              </div>

              {/* Dialog instance */}
              <Dialog
                id="demo-modal-dialog"
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                title="Confirmação de Registro Acadêmico"
                description="O envio desta partitura registrará uma tentativa de prática no portfólio discente."
                footer={
                  <>
                    <Button
                      id="btn-dialog-cancel"
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      id="btn-dialog-confirm"
                      variant="primary"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Confirmar Envio
                    </Button>
                  </>
                }
              >
                <div className="space-y-2 text-xs text-stone-700">
                  <p>
                    A avaliação acústica considerará pitch, timing rítmico e cobertura harmônica com base no motor calibrado.
                  </p>
                  <p className="font-mono text-stone-500 bg-stone-100 p-2 rounded">
                    Audit Token: 0x7f4b89 • Conteúdo autoral
                  </p>
                </div>
              </Dialog>

              {/* Drawer instance */}
              <Drawer
                id="demo-side-drawer"
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Inspetor de Trilha de Áudio"
                subtitle="Parâmetros de síntese e equalização"
                footer={
                  <Button
                    id="btn-drawer-close"
                    variant="primary"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full"
                  >
                    Fechar Inspetor
                  </Button>
                }
              >
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-stone-800 block mb-1">Volume da Trilha (Ganho)</label>
                    <input type="range" min="0" max="100" defaultValue="80" className="w-full accent-anil-800" />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-800 block mb-1">Panorâmica Estéreo (Pan)</label>
                    <input type="range" min="-50" max="50" defaultValue="0" className="w-full accent-anil-800" />
                  </div>
                </div>
              </Drawer>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DATA DISPLAY & METRICS */}
        {/* ========================================================================= */}
        {catalogTab === 'data-display' && (
          <div id="tab-content-data-display" className="space-y-6">
            {/* Table Component */}
            <Card
              id="card-showcase-table"
              title="1. Tabela de Dados Acadêmicos (Table)"
              subtitle="Colunas ordenáveis, dados tabulares alinhados e semântica acessível para pesquisa e histórico."
            >
              <Table
                id="demo-academic-intervals-table"
                caption="Tabela de intervalos musicais fundamentais"
                columns={[
                  { id: 'interval', header: 'Intervalo Teórico', sortable: true },
                  { id: 'semitones', header: 'Semitons', align: 'center' },
                  { id: 'ratio', header: 'Razão Física', align: 'center' },
                  { id: 'frequencyC4', header: 'Frequência (C4)', align: 'right' },
                  { id: 'provenance', header: 'Proveniência' },
                ]}
                data={sampleTableData}
                keyExtractor={(item) => item.id}
              />
            </Card>

            {/* Structured List, Badges & Avatars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                id="card-showcase-list"
                title="2. Lista Estruturada de Lições"
                subtitle="ListItem com leading, trailing badges e estados interativos."
              >
                <List id="demo-curriculum-list">
                  <ListItem
                    id="list-item-l1"
                    title="Palestra 1: Alturas, Pautas e Escalas"
                    subtitle="4 vídeos • 2 exercícios de leitura"
                    metadata="30 min"
                    leading={<Badge id="badge-l1" variant="brand">L1</Badge>}
                    trailing={<Badge id="badge-l1-status" variant="success">Concluído</Badge>}
                    onClick={() => {}}
                  />
                  <ListItem
                    id="list-item-l2"
                    title="Palestra 2: Intervalos e Razões Harmônicas"
                    subtitle="3 vídeos • 1 treino de percepção"
                    metadata="45 min"
                    leading={<Badge id="badge-l2" variant="brand">L2</Badge>}
                    trailing={<Badge id="badge-l2-status" variant="warning">Em Progresso</Badge>}
                    onClick={() => {}}
                    isActive
                  />
                  <ListItem
                    id="list-item-l3"
                    title="Palestra 3: Tríades Maiores e Menores"
                    subtitle="5 vídeos • Prática de teclado"
                    metadata="50 min"
                    leading={<Badge id="badge-l3" variant="brand">L3</Badge>}
                    trailing={<Badge id="badge-l3-status" variant="neutral">Pendente</Badge>}
                    onClick={() => {}}
                  />
                </List>
              </Card>

              <Card
                id="card-showcase-avatars-progress"
                title="3. Avatares & Métricas de Progresso"
                subtitle="CircularProgress com métrica de acurácia e Avatares com papéis institucionais."
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-around p-4 bg-stone-50 rounded border border-stone-200">
                    <CircularProgress
                      id="demo-circular-progress-88"
                      value={88}
                      size={80}
                      variant="success"
                      sublabel="Afinação"
                    />
                    <CircularProgress
                      id="demo-circular-progress-64"
                      value={64}
                      size={80}
                      variant="warning"
                      sublabel="Ritmo"
                    />
                    <CircularProgress
                      id="demo-circular-progress-45"
                      value={45}
                      size={80}
                      variant="danger"
                      sublabel="Cobertura"
                    />
                  </div>

                  <div className="space-y-2">
                    <ProgressBar
                      id="demo-progress-linear-75"
                      value={75}
                      label="Progresso no Módulo de Teoria"
                      showValueLabel
                      variant="primary"
                      sizeVariant={isKidsMode ? 'kids' : 'md'}
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar id="avatar-admin" name="Aline Silva" role={UserRole.ADMIN} size="md" isOnline />
                      <div className="text-xs">
                        <span className="font-semibold text-stone-900 block">Aline Silva</span>
                        <span className="text-[10px] text-stone-500">Fundadora (ADMIN)</span>
                      </div>
                    </div>

                    <CredentialChip
                      id="cred-chip-teoria"
                      title="Teoria Musical"
                      institution="Conservatório Muscicapa"
                      level="L1-5"
                      isVerified
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DOMAIN-SPECIFIC MUSICAL COMPONENTS */}
        {/* ========================================================================= */}
        {catalogTab === 'domain' && (
          <div id="tab-content-domain" className="space-y-8">
            {/* Score Notation Container */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                Domínio: Notação & Leitura de Partituras (ScoreContainer)
              </h3>
              <ScoreContainer
                id="score-demo-viewer"
                title="Estudo em Dó Maior"
                composer="Tradição Acadêmica Clássica"
                clef="treble"
                keySignature="C Maior (0♯, 0♭)"
                timeSignature="4/4"
                tempoBpm={108}
                isPlaying={isScorePlaying}
                onTogglePlay={() => setIsScorePlaying(!isScorePlaying)}
                onResetPlayback={() => setIsScorePlaying(false)}
              />
            </div>

            {/* DAW Timeline Container */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                Domínio: Estúdio & DAW Multitrilha (TimelineContainer)
              </h3>
              <TimelineContainer
                id="timeline-demo-studio"
                projectName="Projeto #01: Arranjo Coral"
                bpm={120}
                timecode="00:01:12.04"
                currentBar={3}
                isPlaying={isTimelinePlaying}
                onTogglePlay={() => setIsTimelinePlaying(!isTimelinePlaying)}
                onStop={() => setIsTimelinePlaying(false)}
                onToggleRecord={() => {}}
                onToggleMuteTrack={() => {}}
                onToggleSoloTrack={() => {}}
              />
            </div>

            {/* Tool Panel & Practice Result */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                  Domínio: Painel de Ferramentas Científicas (ToolPanel)
                </h3>
                <ToolPanel
                  id="tool-panel-synth"
                  toolName="Sintetizador Subtrativo de Referência"
                  toolCategory="sintese"
                  engineSource="AudioEngineAdapter (WebAudio API)"
                  status="ativo"
                  onReset={() => {}}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-700">Forma de Onda (Oscilador):</span>
                      <Badge id="badge-wave" variant="neutral">Senoidal (Pure Tone)</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-700">Frequência Fundamental:</span>
                      <span className="font-mono font-bold text-stone-900">440.0 Hz (Lá 4)</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-stone-500 mb-1">
                        <span>Filtro Cutoff (Low-pass)</span>
                        <span className="font-mono">2400 Hz</span>
                      </div>
                      <input type="range" min="200" max="8000" defaultValue="2400" className="w-full accent-anil-800" />
                    </div>
                  </div>
                </ToolPanel>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                  Domínio: Resultado de Prática Avaliado (PracticeResultCard)
                </h3>
                <PracticeResultCard
                  id="practice-result-demo"
                  exerciseTitle="Afinação Intervalar: 3ª Maior e 5ª Justa"
                  instrumentOrMode="Treino Vocal / Canto"
                  overallScore={84}
                  attemptNumber={2}
                  pitchAccuracy={89}
                  timingAccuracy={82}
                  coveragePercent={96}
                  pedagogicalFeedback="Excelente estabilidade de centro tonal na transição entre a terça e a quinta. Atenção ao ataque das notas agudas no compasso 3."
                  onRetry={() => {}}
                  onSaveEvidence={() => {}}
                />
              </div>
            </div>

            {/* Feed, Profile, Course & Room Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                  Domínio: Card de Curso & Proveniência (CourseCard)
                </h3>
                <CourseCard
                  id="course-card-demo"
                  title="Fundamentos da Teoria Musical Clássica"
                  description="Estudo rigoroso dos princípios acústicos, notação na pauta, tonalidades maiores e menores, e encadeamentos harmônicos iniciais."
                  instructorName="Prof. Dr. Michael Edwards"
                  level="Fundamentos Acadêmicos"
                  durationHours={18}
                  modulesCount={5}
                  progressPercent={60}
                  isEnrolled={true}
                  onActionClick={() => {}}
                />
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                  Domínio: Sala Virtual & Masterclass (RoomCard)
                </h3>
                <RoomCard
                  id="room-card-demo"
                  roomName="Mestrado em Contraponto & Fuga"
                  masterName="Prof. Arthur Zimmerman"
                  masterRole={UserRole.PROFESSOR}
                  currentTopic="Análise do Cravo Bem Temperado (Fuga nº 2 em Dó Menor)"
                  memberCount={14}
                  status="ao_vivo"
                  onEnterRoom={() => {}}
                />
              </div>
            </div>

            {/* Media Card & Feed Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                  Domínio: Publicação Acadêmica da Comunidade (FeedCard)
                </h3>
                <FeedCard
                  id="feed-card-demo"
                  authorName="Mariana Bastos"
                  authorRole={UserRole.MUSICO}
                  createdAtText="Há 2 horas"
                  topicCategory="Análise Harmônica"
                  title="Dúvida sobre a resolução da 7ª diminuída na Palestra 4"
                  content="Ao modular para o tom relativo menor, a sensível requer resolução estrita ascendente ou é permitida a condução em terças paralelas?"
                  attachment={{
                    type: 'audio',
                    title: 'Trecho gravado: Cadência de engano',
                    durationOrMeasures: '00:32',
                  }}
                  likesCount={12}
                  repliesCount={4}
                  isLiked={true}
                  onLike={() => {}}
                  onReply={() => {}}
                />
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                  Domínio: Card de Mídia / Audição de Aula (MediaCard)
                </h3>
                <MediaCard
                  id="media-card-demo"
                  title="Palestra 1: A Natureza Física do Som & Alturas"
                  performerOrLecturer="Conservatório Muscicapa"
                  mediaType="palestra"
                  durationText="24:18"
                  isPlaying={isMediaPlaying}
                  onTogglePlay={() => setIsMediaPlaying(!isMediaPlaying)}
                />
              </div>
            </div>

            {/* Profile Card */}
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
                Domínio: Identidade & Perfil Oficial (ProfileCard)
              </h3>
              <ProfileCard
                id="profile-card-demo"
                name="Aline Silva"
                email="maria.aparecida@exemplo.org"
                role={UserRole.ADMIN}
                bio="Administradora Fundadora da Conservatório Muscicapa. Pesquisadora em pedagogia musical contemporânea e interfaces digitais de partitura."
                isOwner={true}
                onEditProfile={() => {}}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CANONICAL UI STATES MATRIX */}
        {/* ========================================================================= */}
        {catalogTab === 'states' && (
          <div id="tab-content-states" className="space-y-6">
            <Card
              id="card-states-controller"
              title="Matriz de Estados Canônicos (48_ERROR_EMPTY_LOADING_STATES.md)"
              subtitle="Teste de renderização e acessibilidade para todos os estados universais da UI."
            >
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-stone-500 font-medium">Selecionar Estado a Simular:</span>
                {(['default', 'loading', 'error', 'empty', 'success'] as const).map((st) => (
                  <Button
                    key={st}
                    id={`btn-state-selector-${st}`}
                    size="sm"
                    variant={demoState === st ? 'primary' : 'outline'}
                    onClick={() => setDemoState(st)}
                  >
                    {st.toUpperCase()}
                  </Button>
                ))}
              </div>

              {/* State Container */}
              <div id="state-inspection-box" className="p-8 border border-stone-200 rounded-lg bg-stone-50/60 min-h-[260px] flex items-center justify-center">
                {demoState === 'default' && (
                  <div className="text-center space-y-2">
                    <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      ESTADO POPULADO (DEFAULT)
                    </span>
                    <p className="text-xs text-stone-600 max-w-md">
                      Dados carregados com sucesso. Todos os componentes operam no modo ativo com hierarquia clara.
                    </p>
                  </div>
                )}

                {demoState === 'loading' && (
                  <LoadingState
                    id="loader-demo"
                    message="Sincronizando partitura com o motor de análise teórica..."
                  />
                )}

                {demoState === 'error' && (
                  <ErrorState
                    id="error-demo"
                    title="Falha na Calibração do Dispositivo de Áudio"
                    message="A taxa de amostragem de 48000 Hz não pôde ser inicializada no contexto WebAudio."
                    onRetry={() => setDemoState('loading')}
                    retryLabel="Tentar Reconectar"
                  />
                )}

                {demoState === 'empty' && (
                  <EmptyState
                    id="empty-demo"
                    title="Nenhuma Tentativa Registrada Ainda"
                    description="Inicie a prática guiada do compasso 1 ao 4 para gerar evidências no seu histórico acadêmico."
                    actionLabel="Iniciar Exercício"
                    onAction={() => setDemoState('default')}
                  />
                )}

                {demoState === 'success' && (
                  <SuccessState
                    id="success-demo"
                    title="Exercício Concluído com Distinção!"
                    message="Todas as 12 notas foram executadas com acurácia de afinação superior a 95%."
                    actionLabel="Continuar para Próxima Lição"
                    onAction={() => setDemoState('default')}
                  />
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
