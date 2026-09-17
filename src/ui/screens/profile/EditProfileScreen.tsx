import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { authService } from '../../../services/application/auth.service';
import { profileService } from '../../../services/application/profile.service';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

export const EditProfileScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [instrumentsInput, setInstrumentsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'iniciante' | 'intermediario' | 'avancado' | 'conservatorio'>('intermediario');
  const [visibility, setVisibility] = useState<'public' | 'institutional' | 'private'>('institutional');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const session = await authService.getActiveSession();
      if (session?.profile) {
        const p = session.profile;
        setName(p.displayName || session.user.name);
        setTitle(p.title || '');
        setHeadline(p.headline || '');
        setBio(p.biography || '');
        setInstrumentsInput((p.instruments || []).join(', '));
        setInterestsInput((p.musicalInterests || []).join(', '));
        if (p.experienceLevel) setExperienceLevel(p.experienceLevel);
        if (p.privacySettings?.visibility) setVisibility(p.privacySettings.visibility);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedInstruments = instrumentsInput
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
      const parsedInterests = interestsInput
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      await profileService.updateMyProfile({
        displayName: name,
        title,
        headline,
        biography: bio,
        instruments: parsedInstruments,
        musicalInterests: parsedInterests,
        experienceLevel,
        isPublic: visibility === 'public',
        privacySettings: {
          visibility,
          showAcademicHistory: visibility !== 'private',
          showPracticeLog: visibility !== 'private',
          showPortfolio: visibility !== 'private',
          allowCommunityInteraction: true,
        },
      });

      setSavedSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer
      id="edit-profile"
      title="Editar Perfil do Músico"
      subtitle="Atualize suas informações biográficas, instrumentos e visibilidade institucional."
      badgeLabel="Edição Canônica"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Voltar ao Perfil',
        icon: ArrowLeft,
        onClick: () => navigate('/profile'),
      }}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Perfil acadêmico atualizado com sucesso! Redirecionando...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Nome de Exibição Acadêmico *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">
                  Título Musical ou Acadêmico
                </label>
                <input
                  type="text"
                  value={title}
                  placeholder="Ex: Pianista, Pesquisador, Mestre"
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm p-2.5 rounded border border-stone-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">
                  Nível de Formação
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full text-sm p-2.5 rounded border border-stone-300 bg-white"
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                  <option value="conservatorio">Conservatório / Bacharelado</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Linha de Pesquisa / Headline
              </label>
              <input
                type="text"
                value={headline}
                placeholder="Ex: Contraponto Barroco e Prática Pianística"
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Biografia Acadêmica
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Instrumentos (separados por vírgula)
              </label>
              <input
                type="text"
                value={instrumentsInput}
                placeholder="Ex: Piano Clássico, Cravo, Violino"
                onChange={(e) => setInstrumentsInput(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Áreas de Interesse (separadas por vírgula)
              </label>
              <input
                type="text"
                value={interestsInput}
                placeholder="Ex: Harmonia Funcional, Fuga, Solfejo"
                onChange={(e) => setInterestsInput(e.target.value)}
                className="w-full text-sm p-2.5 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1 pt-2 border-t border-stone-100">
              <label className="text-xs font-semibold text-stone-700 block">
                Privacidade & Visibilidade do Perfil
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full text-sm p-2.5 rounded border border-stone-300 bg-white"
              >
                <option value="institutional">Institucional (Visível apenas para membros da Academia)</option>
                <option value="public">Público (Visível no Atlas e Comunidade)</option>
                <option value="private">Privado (Apenas você e docentes têm acesso)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <Button variant="ghost" size="sm" type="button" onClick={() => navigate('/profile')}>
                Cancelar
              </Button>
              <Button variant="primary" size="md" type="submit" disabled={isSaving}>
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </ScreenContainer>
  );
};
