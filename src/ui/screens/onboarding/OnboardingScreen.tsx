import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { ProgressBar } from '../../components/data-display/Progress';
import { Badge } from '../../components/base/Badge';
import {
  AppMode,
  UserRole,
  ProfilePrivacySettings,
  GuardianRelationship,
  ChildAccountControls,
} from '../../../domain/types';
import { authService } from '../../../services/application/auth.service';
import {
  GraduationCap,
  Baby,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';

const ONBOARDING_DRAFT_KEY = 'onboarding_draft_state_v2';

export const OnboardingScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Mode (Traditional vs. Kids)
  const [mode, setMode] = useState<AppMode>(AppMode.TRADITIONAL);

  // Step 2: Name & Avatar
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarSource, setAvatarSource] = useState<'google' | 'custom' | 'initials'>('google');
  const [hasGoogleAvatar, setHasGoogleAvatar] = useState(false);

  // Step 3: Instruments & Level
  const [instruments, setInstruments] = useState<string[]>(['Piano']);
  const [experienceLevel, setExperienceLevel] = useState<
    'iniciante' | 'intermediario' | 'avancado' | 'conservatorio'
  >('iniciante');

  // Step 4: Goals & Interests
  const [goals, setGoals] = useState<string[]>([
    'Harmonia Funcional & Análise Musical',
    'Percepção Auditiva & Solfejo',
  ]);
  const [interests, setInterests] = useState<string[]>([
    'J.S. Bach & Contraponto',
    'Música Clássica Vienense',
  ]);

  // Step 5: Preferences
  const [tuningStandard, setTuningStandard] = useState<'440hz' | '432hz'>('440hz');
  const [notationSystem, setNotationSystem] = useState<'syllabic' | 'alphabetical'>('syllabic');
  const [preferredClef, setPreferredClef] = useState<'g_treble' | 'f_bass' | 'c_alto'>('g_treble');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyVisibility, setPrivacyVisibility] = useState<'public' | 'institutional' | 'private'>(
    'public'
  );

  // Step 6: Kids Mode fields (when applicable)
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [parentConsent, setParentConsent] = useState(false);
  const [screenTimeMinutes, setScreenTimeMinutes] = useState(45);

  // Load session data & draft
  useEffect(() => {
    async function init() {
      const session = await authService.getActiveSession();
      if (session) {
        setDisplayName(session.profile?.displayName || session.user.name || '');
        if (session.user.avatarUrl) {
          setAvatarUrl(session.user.avatarUrl);
          setHasGoogleAvatar(session.user.authProvider === 'google');
          setAvatarSource('google');
        }
        if (session.mode) {
          setMode(session.mode);
        }
        if (session.profile?.guardian?.guardianEmail) {
          setGuardianEmail(session.profile.guardian.guardianEmail);
          setGuardianName(session.profile.guardian.guardianName || '');
        }
      }

      try {
        const saved = localStorage.getItem(ONBOARDING_DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.mode) setMode(draft.mode);
          if (draft.displayName) setDisplayName(draft.displayName);
          if (draft.avatarUrl) setAvatarUrl(draft.avatarUrl);
          if (draft.avatarSource) setAvatarSource(draft.avatarSource);
          if (draft.instruments) setInstruments(draft.instruments);
          if (draft.experienceLevel) setExperienceLevel(draft.experienceLevel);
          if (draft.goals) setGoals(draft.goals);
          if (draft.interests) setInterests(draft.interests);
          if (draft.tuningStandard) setTuningStandard(draft.tuningStandard);
          if (draft.notationSystem) setNotationSystem(draft.notationSystem);
          if (draft.preferredClef) setPreferredClef(draft.preferredClef);
          if (draft.guardianEmail) setGuardianEmail(draft.guardianEmail);
          if (draft.guardianName) setGuardianName(draft.guardianName);
        }
      } catch {
        // Draft parse fallback
      }
    }
    init();
  }, []);

  // Save draft
  useEffect(() => {
    try {
      const draft = {
        mode,
        displayName,
        avatarUrl,
        avatarSource,
        instruments,
        experienceLevel,
        goals,
        interests,
        tuningStandard,
        notationSystem,
        preferredClef,
        guardianEmail,
        guardianName,
      };
      localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Draft storage fallback
    }
  }, [
    mode,
    displayName,
    avatarUrl,
    avatarSource,
    instruments,
    experienceLevel,
    goals,
    interests,
    tuningStandard,
    notationSystem,
    preferredClef,
    guardianEmail,
    guardianName,
  ]);

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((x) => x !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isKids = mode === AppMode.KIDS;

      if (isKids && (!guardianEmail || !guardianEmail.includes('@'))) {
        throw new Error('O Modo Kids exige o e-mail verificado de um responsável legal.');
      }
      if (isKids && !parentConsent) {
        throw new Error('É necessário o consentimento formal dos pais para o Modo Kids.');
      }

      const guardian: GuardianRelationship | undefined = isKids
        ? {
            guardianEmail: guardianEmail.trim().toLowerCase(),
            guardianName: guardianName.trim() || undefined,
            guardianPhone: guardianPhone.trim() || undefined,
            parentalConsentGiven: true,
            consentTimestamp: new Date().toISOString(),
          }
        : undefined;

      const childControls: ChildAccountControls | undefined = isKids
        ? {
            isKidModeActive: true,
            maxDailyScreenMinutes: screenTimeMinutes,
            restrictedChat: true,
            contentFilterLevel: 'strict',
          }
        : undefined;

      const privacySettings: ProfilePrivacySettings = {
        visibility: isKids ? 'private' : privacyVisibility,
        showAcademicHistory: !isKids,
        showPracticeLog: !isKids,
        showPortfolio: !isKids,
        allowCommunityInteraction: !isKids,
      };

      await authService.completeOnboarding({
        displayName: displayName.trim() || 'Estudante da Academia',
        avatarSource: avatarUrl ? avatarSource : 'initials',
        avatarUrl,
        mode,
        instruments: instruments.length > 0 ? instruments : ['Piano'],
        experienceLevel,
        goals: goals.length > 0 ? goals : ['Harmonia & Repertório'],
        musicalInterests: interests.length > 0 ? interests : ['Teoria Musical'],
        preferences: {
          tuningStandard,
          notationSystem,
          preferredClef,
          notificationsEnabled,
        },
        privacySettings,
        guardian,
        childControls,
        selectedRole: isKids ? UserRole.CRIANCA : UserRole.ALUNO,
        title: isKids ? 'Iniciação Musical Kids' : 'Estudante da Academia',
        biography: `Perfil de ingresso no Modo ${mode === AppMode.KIDS ? 'Kids' : 'Tradicional'} da Academia Musical Digital.`,
      });

      // Clear draft
      localStorage.removeItem(ONBOARDING_DRAFT_KEY);

      // Rule 7: "direcionar para Home"
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao concluir configuração do perfil.');
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <ScreenContainer
      id="onboarding-flow"
      title="Passaporte de Ingresso na Academia"
      subtitle={`Etapa ${currentStep} de ${totalSteps} • Identidade, modo formativo e preferências canônicas.`}
      badgeLabel={`Etapa ${currentStep} de ${totalSteps}`}
      badgeVariant="brand"
      primaryAction={{
        label: 'Pular para o Início',
        onClick: () => navigate('/'),
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress Bar Strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-600 font-mono">
            <span>Progresso da Matrícula</span>
            <span>{progressPercent}%</span>
          </div>
          <ProgressBar id="onboarding-progress-bar" value={progressPercent} variant="primary" sizeVariant="md" />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center gap-2">
            <span className="font-bold">Atenção:</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: MODOS (Traditional vs Kids) & Professor Explanation */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                1. Selecione o Tipo Inicial de Experiência
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Escolha o ecossistema formativo mais adequado. O modo pode ser alternado posteriormente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Traditional Mode */}
              <button
                type="button"
                id="onboarding-mode-traditional"
                onClick={() => setMode(AppMode.TRADITIONAL)}
                className={`p-5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  mode === AppMode.TRADITIONAL
                    ? 'border-red-800 bg-red-50/40 ring-2 ring-red-800/20 shadow-md'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-red-400" />
                    </div>
                    {mode === AppMode.TRADITIONAL && (
                      <Badge variant="brand" size="sm">
                        Selecionado
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-stone-900">
                      Modo Tradicional
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Acesso acadêmico pleno para estudantes, músicos e instrumentistas. Inclui teoria rigorosa, estúdio DAW, partituras Urtext e comunidade.
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-stone-200/60 mt-4 flex items-center text-[11px] text-stone-500 font-mono">
                  <span>Currículo Soberano Completo</span>
                </div>
              </button>

              {/* Kids Mode */}
              <button
                type="button"
                id="onboarding-mode-kids"
                onClick={() => setMode(AppMode.KIDS)}
                className={`p-5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  mode === AppMode.KIDS
                    ? 'border-red-800 bg-red-50/40 ring-2 ring-red-800/20 shadow-md'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                      <Baby className="w-5 h-5 text-amber-700" />
                    </div>
                    {mode === AppMode.KIDS && (
                      <Badge variant="brand" size="sm">
                        Selecionado
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-stone-900">Modo Kids</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Iniciação musical lúdica e segura para crianças. Proteção parental estrita, controle de tempo de tela e sem mensagens diretas abertas.
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-stone-200/60 mt-4 flex items-center text-[11px] text-amber-700 font-mono">
                  <span>Ambiente Protegido por Tutela</span>
                </div>
              </button>
            </div>

            {/* Architectural Clarification Callout */}
            <Card variant="muted" padding="md" className="border-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-stone-800 font-semibold text-xs">
                <Info className="w-4 h-4 text-red-800 shrink-0" />
                <span>Sobre a Cátedra Docente (Professor):</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Na Academia Musical Digital, <strong>Professor não é escolhido como um mundo separado</strong>.
                Professor é uma <strong>capability adquirida</strong> que pode ser ativada mediante habilitação acadêmica ou outorga institucional, permitindo criar salas de aula e orientar alunos sem isolar sua circulação.
              </p>
            </Card>
          </div>
        )}

        {/* STEP 2: NOME & AVATAR (Google Avatar when available) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                2. Nome & Avatar Institucional
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Defina como seu nome aparecerá nos certificados, partituras e salas de estudo.
              </p>
            </div>

            <Card variant="default" padding="lg" className="space-y-5">
              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="onboarding-name-input"
                  className="block text-xs font-semibold text-stone-800"
                >
                  Nome Completo ou Nome Artístico
                </label>
                <input
                  id="onboarding-name-input"
                  type="text"
                  required
                  placeholder="Ex: Frédéric Chopin ou Clara Schumann"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-red-800"
                />
              </div>

              {/* Avatar Selection & Preview */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-800">
                  Retrato / Avatar da Conta
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-300 bg-stone-100 flex items-center justify-center shrink-0 shadow-sm">
                    {avatarUrl && avatarSource !== 'initials' ? (
                      <img
                        src={avatarUrl}
                        alt={displayName || 'Avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-serif font-bold text-lg text-stone-700">
                        {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    {hasGoogleAvatar && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Avatar sincronizado da sua Conta Google</span>
                      </div>
                    )}
                    <p className="text-xs text-stone-500">
                      O avatar é utilizado no cabeçalho institucional, salas de aula e portfólio.
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      {avatarUrl && (
                        <Button
                          variant={avatarSource === 'google' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setAvatarSource('google')}
                        >
                          Usar Foto da Conta
                        </Button>
                      )}
                      <Button
                        variant={avatarSource === 'initials' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setAvatarSource('initials')}
                      >
                        Monograma Clássico
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 3: INSTRUMENTOS & NÍVEL */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                3. Instrumentos & Nível de Experiência
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Indique seus instrumentos de prática para calibrar as partituras e exercícios propostos.
              </p>
            </div>

            <Card variant="default" padding="lg" className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800">
                  Instrumentos Principais (selecione um ou mais)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Piano',
                    'Violino',
                    'Violoncelo',
                    'Canto Lírico',
                    'Órgão de Tubos',
                    'Cravo',
                    'Flauta Transversal',
                    'Clarinete',
                    'Violão Clássico',
                    'Composição & Regência',
                  ].map((inst) => {
                    const isSelected = instruments.includes(inst);
                    return (
                      <button
                        key={inst}
                        type="button"
                        onClick={() => toggleItem(instruments, setInstruments, inst)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-red-800 text-white border-red-800 shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{inst}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-800">
                  Nível de Proficiência Atual
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'iniciante',
                      label: 'Iniciante / Fundamentos',
                      desc: 'Primeiros contatos com teoria, notas e postura.',
                    },
                    {
                      id: 'intermediario',
                      label: 'Intermediário',
                      desc: 'Leitura fluente de partituras e repertório clássico médio.',
                    },
                    {
                      id: 'avancado',
                      label: 'Avançado',
                      desc: 'Obras de concerto, contraponto e análise estrutural.',
                    },
                    {
                      id: 'conservatorio',
                      label: 'Conservatório / Graduação',
                      desc: 'Formação acadêmica superior e pesquisa musicológica.',
                    },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id as any)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        experienceLevel === lvl.id
                          ? 'border-red-800 bg-red-50 text-red-950 font-medium'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <div className="text-xs font-semibold">{lvl.label}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 4: OBJETIVOS & INTERESSES */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                4. Objetivos & Interesses Musicais
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Personalize o algoritmo de sugestão de cátedras, obras e salas temáticas.
              </p>
            </div>

            <Card variant="default" padding="lg" className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800">
                  Objetivos Principais de Estudo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Harmonia Funcional & Análise Musical',
                    'Percepção Auditiva & Solfejo',
                    'Leitura à Primeira Vista de Partituras',
                    'Técnica Instrumental & Interpretação',
                    'Contraponto Rigoroso & Fuga',
                    'Composição & Orquestração',
                  ].map((g) => {
                    const active = goals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleItem(goals, setGoals, g)}
                        className={`p-2.5 text-left rounded-lg text-xs border transition-colors flex items-center justify-between ${
                          active
                            ? 'bg-red-50 text-red-900 border-red-300 font-semibold'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <span>{g}</span>
                        {active && <Check className="w-3.5 h-3.5 text-red-800 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-800">
                  Áreas e Estilos de Interesse
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'J.S. Bach & Polifonia Barroca',
                    'Música Clássica Vienense (Mozart, Beethoven)',
                    'Romantismo Musical (Chopin, Liszt, Brahms)',
                    'Música Antiga & Prática Informada',
                    'Teoria Schenkeriana & Análise',
                    'Acústica Musical & DAW',
                  ].map((area) => {
                    const active = interests.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleItem(interests, setInterests, area)}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                          active
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 5: PREFERÊNCIAS MUSICAIS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                5. Preferências de Notação & Diapasão
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Configure os parâmetros acústicos e as convenções visuais do leitor de partituras.
              </p>
            </div>

            <Card variant="default" padding="lg" className="space-y-5">
              {/* Diapason Standard */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-800">
                  Diapasão de Afinação de Referência
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTuningStandard('440hz')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      tuningStandard === '440hz'
                        ? 'border-red-800 bg-red-50 text-red-950 font-semibold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="text-xs">Lá 440 Hz</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Padrão Internacional Moderno (ISO 16)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTuningStandard('432hz')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      tuningStandard === '432hz'
                        ? 'border-red-800 bg-red-50 text-red-950 font-semibold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="text-xs">Lá 432 Hz</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Afinação Histórica / Filosófica (Verdi)</div>
                  </button>
                </div>
              </div>

              {/* Notation System */}
              <div className="space-y-1.5 pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-800">
                  Convenção de Nomenclatura das Notas
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNotationSystem('syllabic')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      notationSystem === 'syllabic'
                        ? 'border-red-800 bg-red-50 text-red-950 font-semibold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="text-xs">Silábica (Românica)</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Dó, Ré, Mi, Fá, Sol, Lá, Si</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotationSystem('alphabetical')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      notationSystem === 'alphabetical'
                        ? 'border-red-800 bg-red-50 text-red-950 font-semibold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="text-xs">Alfabética (Anglo-Germânica)</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">C, D, E, F, G, A, B</div>
                  </button>
                </div>
              </div>

              {/* Clef Preference */}
              <div className="space-y-1.5 pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-800">
                  Clave Principal de Leitura
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'g_treble', label: 'Clave de Sol', sub: '2ª Linha (Agudo)' },
                    { id: 'f_bass', label: 'Clave de Fá', sub: '4ª Linha (Grave)' },
                    { id: 'c_alto', label: 'Clave de Dó', sub: '3ª Linha (Médio)' },
                  ].map((clef) => (
                    <button
                      key={clef.id}
                      type="button"
                      onClick={() => setPreferredClef(clef.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        preferredClef === clef.id
                          ? 'border-red-800 bg-red-50 text-red-950 font-semibold'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="text-xs">{clef.label}</div>
                      <div className="text-[10px] text-stone-500">{clef.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Visibility */}
              <div className="space-y-1.5 pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-800">
                  Visibilidade Inicial do Perfil
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'public', label: 'Público', desc: 'Comunidade' },
                    { id: 'institutional', label: 'Institucional', desc: 'Apenas Academia' },
                    { id: 'private', label: 'Privado', desc: 'Apenas Você' },
                  ].map((vis) => (
                    <button
                      key={vis.id}
                      type="button"
                      onClick={() => setPrivacyVisibility(vis.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        privacyVisibility === vis.id
                          ? 'border-red-800 bg-red-50 text-red-950 font-semibold'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="text-xs">{vis.label}</div>
                      <div className="text-[10px] text-stone-500">{vis.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications Toggle */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-800 block">
                    Notificações e Lembretes de Prática
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Avisos de novas lições, correções de professores e lembrete de streak diário.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 text-red-800 rounded border-stone-300"
                />
              </div>
            </Card>
          </div>
        )}

        {/* STEP 6: KIDS MODE (quando aplicável) ou REVISÃO FINAL */}
        {currentStep === 6 && (
          <div className="space-y-6">
            {mode === AppMode.KIDS ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-amber-700" />
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      6. Tutela Parental & Salvaguardas Kids
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    O Modo Kids opera sob estrita salvaguarda institucional. É necessário indicar o responsável legal.
                  </p>
                </div>

                <Card variant="default" padding="lg" className="space-y-4 border-amber-200 bg-amber-50/20">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-800 block">
                      Nome do Responsável Legal (Pai, Mãe ou Tutor) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Leopold Mozart"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-800 block">
                      E-mail do Responsável *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="responsavel@familia.mus.br"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-800 block">
                      Telefone do Responsável (Opcional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+55 (11) 99999-9999"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-800 block">
                      Limite de Tempo Diário de Tela
                    </label>
                    <select
                      value={screenTimeMinutes}
                      onChange={(e) => setScreenTimeMinutes(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value={30}>30 minutos por dia</option>
                      <option value={45}>45 minutos por dia (Recomendado)</option>
                      <option value={60}>60 minutos por dia</option>
                    </select>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs text-stone-700 space-y-1.5">
                    <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Salvaguardas Ativas no Modo Kids:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-600">
                      <li>Perfil estritamente privado (invisível para busca pública).</li>
                      <li>Sem mensagens diretas abertas (chat restrito a salas supervisionadas).</li>
                      <li>Catálogo com filtro pedagógico para infância.</li>
                    </ul>
                  </div>

                  <label className="flex items-start gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentConsent}
                      onChange={(e) => setParentConsent(e.target.checked)}
                      className="w-4 h-4 text-red-800 rounded border-stone-300 mt-0.5"
                    />
                    <span className="text-xs text-stone-700">
                      Confirmo que sou o responsável legal e autorizo a criação da conta no Modo Kids sob tutela parental.
                    </span>
                  </label>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    6. Confirmação do Passaporte Acadêmico
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Revise seus dados de matrícula antes de ingressar no ecossistema da Academia Musical Digital.
                  </p>
                </div>

                <Card variant="default" padding="lg" className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                    <div className="w-12 h-12 rounded-full border border-stone-300 bg-stone-900 text-white font-serif font-bold text-base flex items-center justify-center shrink-0">
                      {avatarUrl && avatarSource !== 'initials' ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        displayName.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900">{displayName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="brand" size="sm">
                          Modo Tradicional
                        </Badge>
                        <span className="text-xs text-stone-500 font-mono">
                          {experienceLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-stone-50 rounded-lg">
                      <span className="text-[10px] text-stone-500 font-mono uppercase block">
                        Instrumentos
                      </span>
                      <span className="font-medium text-stone-800">
                        {instruments.join(', ')}
                      </span>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-lg">
                      <span className="text-[10px] text-stone-500 font-mono uppercase block">
                        Afinação & Notação
                      </span>
                      <span className="font-medium text-stone-800">
                        Lá {tuningStandard.toUpperCase()} • {notationSystem === 'syllabic' ? 'Silábica' : 'Alfabética'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Seu passaporte está pronto para circulação integral por todos os pilares da plataforma.</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Anterior
            </Button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setCurrentStep((prev) => prev + 1)}
            >
              Próximo <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleFinishOnboarding}
              disabled={isSubmitting}
              className="bg-red-800 hover:bg-red-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <span>Emitindo Passaporte...</span>
              ) : (
                <span className="inline-flex items-center">
                  Concluir Matrícula & Ingressar <ArrowRight className="w-4 h-4 ml-1.5" />
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
};
