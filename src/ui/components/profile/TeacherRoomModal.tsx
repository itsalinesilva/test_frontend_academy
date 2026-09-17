import React, { useState } from 'react';
import { Card } from '../base/Card';
import { Button } from '../base/Button';
import { TeacherRoomProfile } from '../../../domain/profile';
import { X, Save, School, Plus, Trash2 } from 'lucide-react';

interface TeacherRoomModalProps {
  teacherProfile: TeacherRoomProfile;
  onSave: (updated: Partial<TeacherRoomProfile>) => Promise<void>;
  onClose: () => void;
}

export const TeacherRoomModal: React.FC<TeacherRoomModalProps> = ({
  teacherProfile,
  onSave,
  onClose,
}) => {
  const [roomName, setRoomName] = useState(teacherProfile.roomName);
  const [tagline, setTagline] = useState(teacherProfile.tagline);
  const [description, setDescription] = useState(teacherProfile.description);
  const [heroImageUrl, setHeroImageUrl] = useState(teacherProfile.heroImageUrl || '');
  const [exposeStudentCount, setExposeStudentCount] = useState(teacherProfile.exposeStudentCount);
  const [exposeUpcomingLives, setExposeUpcomingLives] = useState(teacherProfile.exposeUpcomingLives);
  const [exposeGuidedProjects, setExposeGuidedProjects] = useState(teacherProfile.exposeGuidedProjects);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [announcements, setAnnouncements] = useState([...teacherProfile.teacherAnnouncements]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addAnnouncement = () => {
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;
    setAnnouncements([
      {
        id: `ann_${Date.now()}`,
        title: newAnnouncementTitle,
        content: newAnnouncementContent,
        date: new Date().toISOString(),
      },
      ...announcements,
    ]);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        roomName,
        tagline,
        description,
        heroImageUrl: heroImageUrl.trim() || undefined,
        exposeStudentCount,
        exposeUpcomingLives,
        exposeGuidedProjects,
        teacherAnnouncements: announcements,
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
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 text-red-800 rounded-md">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Configurar Cátedra Docente & Room Própria
              </h2>
              <p className="text-xs text-stone-600">
                Defina os dados institucionais, cursos e avisos expostos em sua sala oficial de ensino.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block">
              Nome da Cátedra / Sala de Aula Oficial *
            </label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block">
              Lema / Tagline Acadêmico
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block">
              Descrição Metodológica & Linha Pedagógica
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block">
              URL da Imagem de Capa (Hero da Sala)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              className="w-full text-xs p-2 rounded border border-stone-300 font-mono"
            />
          </div>

          {/* Privacy & Exposure Controls */}
          <div className="space-y-2 p-3 bg-stone-50 border border-stone-200 rounded-md">
            <span className="text-xs font-bold text-stone-900 block">
              Controles de Exposição Pública da Cátedra
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exposeStudentCount}
                  onChange={(e) => setExposeStudentCount(e.target.checked)}
                  className="rounded border-stone-300 text-red-800"
                />
                <span>Exibir Total de Alunos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exposeUpcomingLives}
                  onChange={(e) => setExposeUpcomingLives(e.target.checked)}
                  className="rounded border-stone-300 text-red-800"
                />
                <span>Exibir Próximas Lives</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exposeGuidedProjects}
                  onChange={(e) => setExposeGuidedProjects(e.target.checked)}
                  className="rounded border-stone-300 text-red-800"
                />
                <span>Exibir Projetos Guiados</span>
              </label>
            </div>
          </div>

          {/* Announcements Management */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-900 block">
              Comunicados Oficiais do Docente
            </span>

            <div className="space-y-2 p-2 bg-stone-50 border border-stone-200 rounded-md">
              <input
                type="text"
                placeholder="Título do comunicado"
                value={newAnnouncementTitle}
                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                className="w-full text-xs p-1.5 rounded border border-stone-300"
              />
              <textarea
                rows={2}
                placeholder="Texto do aviso aos estudantes..."
                value={newAnnouncementContent}
                onChange={(e) => setNewAnnouncementContent(e.target.value)}
                className="w-full text-xs p-1.5 rounded border border-stone-300"
              />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" type="button" onClick={addAnnouncement}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Comunicado
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-2 border border-stone-200 rounded bg-white flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-stone-800 block">{ann.title}</span>
                    <p className="text-[11px] text-stone-600">{ann.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAnnouncement(ann.id)}
                    className="text-stone-400 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
              {isSubmitting ? 'Salvando...' : 'Salvar Cátedra'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
