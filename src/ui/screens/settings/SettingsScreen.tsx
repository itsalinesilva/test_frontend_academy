import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Shield,
  Volume2,
  Eye,
  Sparkles,
  Save,
  CheckCircle2,
  Link,
  GraduationCap,
  KeyRound,
  Baby,
} from 'lucide-react';
import { authService } from '../../../services/application/auth.service';
import { AuthSessionResponse } from '../../../contracts/auth-contracts';
import { AppMode, UserRole } from '../../../domain/types';

export const SettingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audio' | 'seguranca' | 'privacidade' | 'acessibilidade'>('audio');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [session, setSession] = useState<AuthSessionResponse | null>(null);

  // Audio settings
  const [inputDevice, setInputDevice] = useState('Microfone Padrão do Sistema');
  const [sampleRate, setSampleRate] = useState('48000');
  const [bufferSize, setBufferSize] = useState('256');

  // Accessibility
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  // Account Linking
  const [linkingMessage] = useState<string | null>(null);

  // Email password setting

  useEffect(() => {
    async function loadSession() {
      const s = await authService.getActiveSession();
      setSession(s);
    }
    loadSession();
  }, []);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const isGoogleLinked =
    session?.user.authProvider === 'google' ||
    session?.user.linkedAccounts?.some((la) => la.provider === 'google');


  const hasTeacherCapability =
    session?.user.primaryRole === UserRole.PROFESSOR ||
    session?.user.assignedRoles.includes(UserRole.PROFESSOR) ||
    session?.user.primaryRole === UserRole.ADMIN;

  return (
    <ScreenContainer
      id="settings"
      title="Configurações & Preferências"
      subtitle="Parâmetros de hardware (Áudio/MIDI), vinculação de contas, gestão de sessão e acessibilidade."
      badgeLabel="Parâmetros do Sistema"
      badgeVariant="neutral"
      primaryAction={{
        label: savedSuccess ? 'Configurações Salvas' : 'Salvar Preferências',
        icon: savedSuccess ? CheckCircle2 : Save,
        onClick: handleSave,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-1">
          {[
            { id: 'audio', label: 'Áudio & Dispositivos MIDI', icon: Volume2 },
            { id: 'seguranca', label: 'Conta & Autenticação', icon: Shield },
            { id: 'privacidade', label: 'Privacidade & Kids', icon: Eye },
            { id: 'acessibilidade', label: 'Acessibilidade & Visão', icon: Sparkles },
          ].map((item) => {
            const IconComp = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Tab 1: Audio & MIDI */}
          {activeTab === 'audio' && (
            <Card variant="default" padding="lg" className="space-y-4">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Parâmetros de Áudio e Interface de Entrada
              </h3>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 block">
                    Dispositivo de Entrada do Microfone
                  </label>
                  <select
                    value={inputDevice}
                    onChange={(e) => setInputDevice(e.target.value)}
                    className="w-full p-2 rounded border border-stone-300 bg-white"
                  >
                    <option value="Microfone Padrão do Sistema">Microfone Padrão do Sistema (Built-in)</option>
                    <option value="Interface USB de Áudio">Interface USB Externa (Focusrite / Presonus)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">
                      Taxa de Amostragem (Sample Rate)
                    </label>
                    <select
                      value={sampleRate}
                      onChange={(e) => setSampleRate(e.target.value)}
                      className="w-full p-2 rounded border border-stone-300 bg-white font-mono"
                    >
                      <option value="44100">44.1 kHz (CD Standard)</option>
                      <option value="48000">48.0 kHz (Recomendado)</option>
                      <option value="96000">96.0 kHz (Alta Resolução)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 block">
                      Tamanho do Buffer de Latência
                    </label>
                    <select
                      value={bufferSize}
                      onChange={(e) => setBufferSize(e.target.value)}
                      className="w-full p-2 rounded border border-stone-300 bg-white font-mono"
                    >
                      <option value="128">128 samples (Latência ultra-baixa: ~2.9ms)</option>
                      <option value="256">256 samples (Balanceado: ~5.8ms)</option>
                      <option value="512">512 samples (Estabilidade em projetos pesados)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded border border-stone-200">
                  <p className="font-mono text-[11px] text-stone-600">
                    Latência estimada de ida e volta: <strong>5.8 ms</strong>. Adequada para afinação ao vivo.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 2: Conta & Autenticação (Linking, Persistence, Mode, Teacher Capability) */}
          {activeTab === 'seguranca' && (
            <div className="space-y-5">
              {linkingMessage && (
                <div className="p-3 bg-stone-100 border border-stone-300 rounded-lg text-xs text-stone-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{linkingMessage}</span>
                </div>
              )}

              {/* Account Linking Section */}
              <Card variant="default" padding="lg" className="space-y-4">
                <div className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-anil-800" />
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Vinculação de Contas (Account Linking)
                  </h3>
                </div>
                <p className="text-xs text-stone-600">
                  Vincule múltiplos métodos de autenticação para acessar seu perfil soberano tanto por Google OAuth quanto por E-mail institucional.
                </p>

                <div className="space-y-3 pt-1">
                  {/* Google Provider Status */}
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-stone-200 bg-stone-50/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                          <span>Conta Google</span>
                          {isGoogleLinked && (
                            <Badge variant="brand" size="sm">
                              Vinculada
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {isGoogleLinked
                            ? 'Permite login com um clique e sincroniza seu avatar oficial.'
                            : 'Vincule para habilitar acesso com Google e usar seu avatar.'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      {isGoogleLinked ? 'Ativo' : 'Provedor único'}
                    </span>
                  </div>

                  {/* Sem senha: a plataforma autentica exclusivamente via Google (ADR-001.A). */}
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50/60">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center shrink-0">
                        <KeyRound className="w-4 h-4 text-stone-700" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-stone-900">Sem senha institucional</p>
                        <p className="text-[11px] leading-relaxed text-stone-600">
                          A Academia não cria, armazena nem redefine senhas. Seu acesso é governado
                          inteiramente pela sua Conta Google, inclusive verificação em duas etapas
                          e recuperação.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Teacher Capability & Academic Standing */}
              <Card variant="default" padding="lg" className="space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-anil-800" />
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Cátedra Docente (Teacher Capability)
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Na Conservatório Muscicapa, <strong>Professor não é um mundo separado</strong>.
                  Professor é uma <strong>capability adquirida</strong> que concede ferramentas para abrir novas salas de aula virtuais (Rooms) e orientar discípulos.
                </p>

                <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-900 block">
                      Status da Outorga Docente:
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {hasTeacherCapability
                        ? 'Cátedra ativa. Você tem permissão para abrir e gerenciar salas acadêmicas.'
                        : 'Você possui permissões de estudante/músico. A outorga docente pode ser habilitada.'}
                    </span>
                  </div>
                  <Badge variant={hasTeacherCapability ? 'brand' : 'neutral'} size="md">
                    {hasTeacherCapability ? 'Docente Habilitado' : 'Estudante'}
                  </Badge>
                </div>
              </Card>

              {/* Active Session & Storage Persistence */}
              <Card variant="default" padding="lg" className="space-y-3">
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Persistência de Sessão & Auditoria
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded border border-stone-200">
                    <div>
                      <span className="font-semibold text-stone-900 block">Identificador de Sessão</span>
                      <span className="text-[11px] font-mono text-stone-500 truncate max-w-xs block">
                        {session?.accessToken || 'Sessão anônima'}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold">Persistente</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded border border-stone-200">
                    <div>
                      <span className="font-semibold text-stone-900 block">Expiração da Credencial</span>
                      <span className="text-[11px] font-mono text-stone-500">
                        {session ? new Date(session.expiresAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => authService.logout().then(() => window.location.reload())}
                    >
                      Encerrar Sessão
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 3: Privacidade & Kids Mode */}
          {activeTab === 'privacidade' && (
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-anil-800" />
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Privacidade, Modos & Proteção Parental
                </h3>
              </div>
              <p className="text-xs text-stone-600">
                Configure como suas evidências de prática, repertório e participações comunitárias são exibidas.
              </p>

              <div className="space-y-3 text-xs pt-1">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {session?.mode === AppMode.KIDS ? (
                      <Baby className="w-5 h-5 text-amber-700" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-stone-800" />
                    )}
                    <div>
                      <span className="font-semibold text-stone-900 block">
                        Modo Atual da Conta:
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {session?.mode === AppMode.KIDS
                          ? 'Modo Kids (Ambiente sob tutela parental ativa)'
                          : 'Modo Tradicional (Acesso integral às ferramentas soberanas)'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={session?.mode === AppMode.KIDS ? 'brand' : 'neutral'} size="sm">
                    {session?.mode?.toUpperCase() || 'TRADITIONAL'}
                  </Badge>
                </div>

                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-anil-800" />
                  <span>Exibir histórico de estudos para colegas de turma</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="accent-anil-800" />
                  <span>Notificar por e-mail sobre correções e avaliações de professores</span>
                </label>
              </div>
            </Card>
          )}

          {/* Tab 4: Acessibilidade */}
          {activeTab === 'acessibilidade' && (
            <Card variant="default" padding="lg" className="space-y-4">
              <h3 className="font-serif font-bold text-base text-stone-900">
                Acessibilidade Visual & Auditiva
              </h3>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-2.5 rounded border border-stone-200">
                  <div>
                    <span className="font-semibold text-stone-900 block">Modo de Alto Contraste</span>
                    <span className="text-stone-500">Aumenta a separação cromática entre pautas e fundo</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="accent-anil-800"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded border border-stone-200">
                  <div>
                    <span className="font-semibold text-stone-900 block">Reduzir Movimento</span>
                    <span className="text-stone-500">Desativa transições dinâmicas nas pautas e grafos</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                    className="accent-anil-800"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded border border-stone-200">
                  <div>
                    <span className="font-semibold text-stone-900 block">Tipografia Amigável para Dislexia</span>
                    <span className="text-stone-500">Substitui fontes do corpo por traçados de base pesada</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dyslexicFont}
                    onChange={(e) => setDyslexicFont(e.target.checked)}
                    className="accent-anil-800"
                  />
                </label>
              </div>
            </Card>
          )}
        </div>
      </div>

    </ScreenContainer>
  );
};
