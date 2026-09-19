import React, { useState } from 'react';
import { Card } from '../base/Card';
import { Button } from '../base/Button';
import {
  ProfileOfficialLink,
  OfficialLinkType,
  VisibilityLevel,
  UnifiedProfileRecord,
} from '../../../domain/profile';
import { UpdateProfileHeaderRequest } from '../../../contracts/profile-contracts';
import { X, Save, Plus, Trash2, Link2 } from 'lucide-react';

interface EditHeaderModalProps {
  profile: UnifiedProfileRecord;
  onSave: (data: UpdateProfileHeaderRequest) => Promise<void>;
  onClose: () => void;
}

export const EditHeaderModal: React.FC<EditHeaderModalProps> = ({
  profile,
  onSave,
  onClose,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [title, setTitle] = useState(profile.title || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [biography, setBiography] = useState(profile.biography || '');
  const [instrumentsInput, setInstrumentsInput] = useState(profile.instruments.join(', '));
  const [specialtiesInput, setSpecialtiesInput] = useState((profile.specialties || []).join(', '));
  const [location, setLocation] = useState(profile.location || '');
  const [currentStatus, setCurrentStatus] = useState(profile.currentStatus || '');
  const [interestsInput, setInterestsInput] = useState(profile.musicalInterests.join(', '));
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel || 'conservatorio');
  const [overallVisibility, setOverallVisibility] = useState<VisibilityLevel>(profile.overallVisibility || 'public');
  const [officialLinks, setOfficialLinks] = useState<ProfileOfficialLink[]>([...profile.officialLinks]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addLink = () => {
    const newLink: ProfileOfficialLink = {
      id: `lnk_${Date.now()}`,
      type: 'website',
      label: 'Novo Link Oficial',
      url: 'https://',
      isPublic: true,
    };
    setOfficialLinks([...officialLinks, newLink]);
  };

  const removeLink = (id: string) => {
    setOfficialLinks(officialLinks.filter((l) => l.id !== id));
  };

  const updateLink = (id: string, field: keyof ProfileOfficialLink, value: any) => {
    setOfficialLinks(
      officialLinks.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const parsedInstruments = instrumentsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const parsedInterests = interestsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const parsedSpecialties = specialtiesInput.split(',').map((s) => s.trim()).filter(Boolean);

      await onSave({
        displayName,
        title,
        headline,
        biography,
        instruments: parsedInstruments,
        musicalInterests: parsedInterests,
        specialties: parsedSpecialties,
        location: location.trim() || undefined,
        currentStatus: currentStatus.trim() || undefined,
        experienceLevel,
        overallVisibility,
        officialLinks,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <Card variant="default" padding="lg" className="max-w-2xl w-full space-y-4 shadow-xl border-stone-300">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h2 className="font-serif font-bold text-base text-stone-900">
              Editar Cabeçalho, Biografia & Links Oficiais
            </h2>
            <p className="text-xs text-stone-600">
              Personalize sua apresentação artística, titulação e referências institucionais públicas.
            </p>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-nome-de-exibicao-canonico">
                Nome de Exibição Canônico *
              </label>
              <input id="edit-header-modal-nome-de-exibicao-canonico"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-titulo-institucional-artistico">
                Título Institucional / Artístico
              </label>
              <input id="edit-header-modal-titulo-institucional-artistico"
                type="text"
                placeholder="Ex: Pianista, Pesquisadora & Mestre"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-headline-linha-de-atuacao-musical">
              Headline / Linha de Atuação Musical
            </label>
            <input id="edit-header-modal-headline-linha-de-atuacao-musical"
              type="text"
              placeholder="Ex: Música de Concerto • Polifonia Barroca • Performance ao Teclado"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-biografia-trajetoria-academica">
              Biografia & Trajetória Acadêmica
            </label>
            <textarea id="edit-header-modal-biografia-trajetoria-academica"
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-instrumentos-separados-por-virgula">
                Instrumentos (separados por vírgula)
              </label>
              <input id="edit-header-modal-instrumentos-separados-por-virgula"
                type="text"
                value={instrumentsInput}
                onChange={(e) => setInstrumentsInput(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-areas-de-interesse-pesquisa">
                Áreas de Interesse & Pesquisa
              </label>
              <input id="edit-header-modal-areas-de-interesse-pesquisa"
                type="text"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-especialidades-focos-de-atuacao-separada">
              Especialidades & Focos de Atuação (separadas por vírgula)
            </label>
            <input id="edit-header-modal-especialidades-focos-de-atuacao-separada"
              type="text"
              placeholder="Ex: Contraponto Bachiano, Música de Câmara, Cravo Histórico"
              value={specialtiesInput}
              onChange={(e) => setSpecialtiesInput(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-localizacao-instituicao-afiliada-opciona">
                Localização / Instituição Afiliada (opcional)
              </label>
              <input id="edit-header-modal-localizacao-instituicao-afiliada-opciona"
                type="text"
                placeholder="Ex: São Paulo, Brasil • Conservatório de Tatuí"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-status-atual-atividade-recente">
                Status Atual / Atividade Recente
              </label>
              <input id="edit-header-modal-status-atual-atividade-recente"
                type="text"
                placeholder="Ex: 🟢 Gravando o Cravo Bem Temperado (Livro I)"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-nivel-de-formacao">Nível de Formação</label>
              <select id="edit-header-modal-nivel-de-formacao"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full text-sm p-2 rounded border border-stone-300 bg-white"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
                <option value="conservatorio">Conservatório / Superior</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block" htmlFor="edit-header-modal-visibilidade-geral">Visibilidade Geral</label>
              <select id="edit-header-modal-visibilidade-geral"
                value={overallVisibility}
                onChange={(e) => setOverallVisibility(e.target.value as any)}
                className="w-full text-sm p-2 rounded border border-stone-300 bg-white"
              >
                <option value="public">Público (Visível em toda a rede)</option>
                <option value="connections">Apenas Conexões</option>
                <option value="room_members">Apenas Membros das Minhas Salas</option>
                <option value="private">Privado (Apenas eu)</option>
              </select>
            </div>
          </div>

          {/* Official Links Management */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <Link2 className="w-4 h-4 text-anil-800" />
                <span>Links Oficiais (Lattes, YouTube, site pessoal)</span>
              </div>
              <Button variant="outline" size="sm" type="button" onClick={addLink}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Link
              </Button>
            </div>

            <div className="space-y-2">
              {officialLinks.map((link) => (
                <div
                  key={link.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 bg-stone-50 border border-stone-200 rounded-md items-center"
                >
                  <div className="sm:col-span-3">
                    <select
                      aria-label="Tipo do link oficial"
                      value={link.type}
                      onChange={(e) => updateLink(link.id, 'type', e.target.value as OfficialLinkType)}
                      className="w-full text-xs p-1.5 rounded border border-stone-300 bg-white font-medium"
                    >
                      <option value="website">Website</option>
                      <option value="lattes">Lattes CNPq</option>
                      <option value="youtube">YouTube</option>
                      <option value="spotify">Spotify</option>
                      <option value="orcid">ORCID</option>
                      <option value="github">GitHub</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <input
        aria-label="Rótulo (ex: Currículo Lattes)"
                      type="text"
                      placeholder="Rótulo (ex: Currículo Lattes)"
                      value={link.label}
                      onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-stone-300"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <input
        aria-label="https://"
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-stone-300 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="p-1 text-stone-400 hover:text-red-700"
                      title="Remover link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-1.5" />
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
