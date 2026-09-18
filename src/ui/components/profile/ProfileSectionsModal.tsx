import React, { useState } from 'react';
import { Card } from '../base/Card';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';
import { ProfileSectionConfig, VisibilityLevel } from '../../../domain/profile';
import { ArrowUp, ArrowDown, Eye, EyeOff, X, Save, CheckCircle2 } from 'lucide-react';

interface ProfileSectionsModalProps {
  sections: ProfileSectionConfig[];
  onSave: (updated: ProfileSectionConfig[]) => Promise<void>;
  onClose: () => void;
}

export const ProfileSectionsModal: React.FC<ProfileSectionsModalProps> = ({
  sections: initialSections,
  onSave,
  onClose,
}) => {
  const [sections, setSections] = useState<ProfileSectionConfig[]>([...initialSections]);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // Recalculate order indices
    copy.forEach((s, i) => {
      s.order = i + 1;
    });

    setSections(copy);
  };

  const toggleVisibility = (index: number, visibility: VisibilityLevel) => {
    const copy = [...sections];
    copy[index].visibility = visibility;
    setSections(copy);
  };

  const toggleEnabled = (index: number) => {
    const copy = [...sections];
    copy[index].enabled = !copy[index].enabled;
    setSections(copy);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(sections);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 400);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <Card variant="default" padding="lg" className="max-w-xl w-full space-y-4 shadow-xl border-stone-300">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <h2 className="font-serif font-bold text-base text-stone-900">
              Configuração & Ordenação das Seções do Perfil
            </h2>
            <p className="text-xs text-stone-600">
              Defina a ordem em que os blocos aparecem e a visibilidade granular de cada lente musical.
            </p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Configurações de visibilidade e ordenação gravadas no passaporte!</span>
          </div>
        )}

        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {sections.map((section, idx) => (
            <div
              key={section.key}
              className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors ${
                section.enabled
                  ? 'bg-stone-50 border-stone-200'
                  : 'bg-stone-100/60 border-stone-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Order controls */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, 'up')}
                    className="p-1 rounded text-stone-500 hover:bg-stone-200 disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => moveSection(idx, 'down')}
                    className="p-1 rounded text-stone-500 hover:bg-stone-200 disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-stone-900">
                      {idx + 1}. {section.label}
                    </span>
                    <Badge variant={section.enabled ? 'neutral' : 'muted'} size="sm">
                      {section.enabled ? 'Ativo' : 'Oculto'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Chave: {section.key}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <select
                  aria-label={`Quem vê a seção ${section.label}`}
                  value={section.visibility}
                  onChange={(e) => toggleVisibility(idx, e.target.value as VisibilityLevel)}
                  className="text-xs p-1.5 rounded border border-stone-300 bg-white font-medium"
                >
                  <option value="public">Público (Atlas & Comunidade)</option>
                  <option value="connections">Apenas Conexões</option>
                  <option value="room_members">Apenas Membros da Sala</option>
                  <option value="private">Privado (Apenas Você)</option>
                </select>

                <button
                  type="button"
                  onClick={() => toggleEnabled(idx)}
                  className={`p-1.5 rounded border text-xs flex items-center gap-1 ${
                    section.enabled
                      ? 'bg-stone-200/70 border-stone-300 text-stone-800'
                      : 'bg-white border-stone-300 text-stone-400'
                  }`}
                  title={section.enabled ? 'Desativar bloco' : 'Ativar bloco'}
                >
                  {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-1.5" />
            {isSaving ? 'Salvando...' : 'Aplicar Alterações'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
