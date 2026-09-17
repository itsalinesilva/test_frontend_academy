import React, { useState } from 'react';
import { Card } from '../base/Card';
import { Button } from '../base/Button';
import { PortfolioItemCategory, VisibilityLevel, Evidence } from '../../../domain/profile';
import { PublishPortfolioItemRequest } from '../../../contracts/profile-contracts';
import { Upload, X, Save, ShieldCheck } from 'lucide-react';

interface PublishPortfolioModalProps {
  availableEvidences: Evidence[];
  onPublish: (item: PublishPortfolioItemRequest) => Promise<void>;
  onClose: () => void;
}

export const PublishPortfolioModal: React.FC<PublishPortfolioModalProps> = ({
  availableEvidences,
  onPublish,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PortfolioItemCategory>('gravacao');
  const [context, setContext] = useState('');
  const [objective, setObjective] = useState('');
  const [userRoleInProject, setUserRoleInProject] = useState('Intérprete Principal');
  const [skillsInput, setSkillsInput] = useState('Afinação Histórica, Articulação Barroca');
  const [instrumentsInput, setInstrumentsInput] = useState('Violino, Piano');
  const [workReferences, setWorkReferences] = useState('');
  const [processNotes, setProcessNotes] = useState('');
  const [resultSummary, setResultSummary] = useState('');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [artifactUrl, setArtifactUrl] = useState('');
  const [visibility, setVisibility] = useState<VisibilityLevel>('public');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedSkills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const parsedInstruments = instrumentsInput.split(',').map((i) => i.trim()).filter(Boolean);

      await onPublish({
        title,
        category,
        context,
        objective,
        userRoleInProject,
        skills: parsedSkills,
        instruments: parsedInstruments,
        workReferences: workReferences.trim() || undefined,
        processNotes: processNotes.trim() || undefined,
        resultSummary: resultSummary.trim() || undefined,
        evidenceIds: selectedEvidenceIds,
        artifactUrl: artifactUrl.trim() || undefined,
        visibility,
        isFeatured,
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEvidence = (id: string) => {
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <Card variant="default" padding="lg" className="max-w-2xl w-full space-y-4 shadow-xl border-stone-300">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 text-anil-800 rounded-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Publicar Artefato no Portfólio de Evidências
              </h2>
              <p className="text-xs text-stone-600">
                Adicione gravações, partituras, composições ou projetos com proveniência e contexto rigoroso.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Título do Artefato / Obra *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: J.S. Bach - Prelúdio e Fuga em Dó Menor BWV 847"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300 focus:ring-1 focus:ring-anil-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">Categoria *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PortfolioItemCategory)}
                className="w-full text-sm p-2 rounded border border-stone-300 bg-white"
              >
                <option value="gravacao">Gravação de Áudio</option>
                <option value="partitura">Partitura / Score</option>
                <option value="composicao">Composição Original</option>
                <option value="projeto">Projeto Multitrack DAW</option>
                <option value="video">Performance em Vídeo</option>
                <option value="musica">Música / Faixa</option>
                <option value="producao">Produção & Masterização</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Seu Papel no Projeto *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Cravista Solo, Compositora, Editora Notacional"
                value={userRoleInProject}
                onChange={(e) => setUserRoleInProject(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Referência da Obra / Catálogo
              </label>
              <input
                type="text"
                placeholder="Ex: J.S. Bach - BWV 847 / Beethoven Op. 13"
                value={workReferences}
                onChange={(e) => setWorkReferences(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block">
              Contexto do Artefato (Onde e como foi realizado?)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Gravado na Capela de Santa Cecília com acústica natural para recital de formatura."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block">
              Objetivo & Proposta Musical
            </label>
            <input
              type="text"
              placeholder="Ex: Demonstrar execução polifônica em andamento andante com ornamentação francesa."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Habilidades (separadas por vírgula)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Instrumentos Empregados
              </label>
              <input
                type="text"
                value={instrumentsInput}
                onChange={(e) => setInstrumentsInput(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Notas do Processo Técnico / Metodológico
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Microfonação estéreo, edição sem compressão, estudo prévio de partituras..."
                value={processNotes}
                onChange={(e) => setProcessNotes(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">
                Síntese do Resultado Obtido
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Registro com equilíbrio tímbrico e separação clara de vozes polifônicas."
                value={resultSummary}
                onChange={(e) => setResultSummary(e.target.value)}
                className="w-full text-sm p-2 rounded border border-stone-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 block">
              URL do Arquivo / Artefato (Áudio, MusicXML, Vídeo)
            </label>
            <input
              type="text"
              placeholder="https://storage.academia.mus.br/artefatos/minha_obra.mp3"
              value={artifactUrl}
              onChange={(e) => setArtifactUrl(e.target.value)}
              className="w-full text-sm p-2 rounded border border-stone-300 font-mono text-xs"
            />
          </div>

          {/* Evidence Linking */}
          {availableEvidences.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-md bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Vincular Evidência Auditada Existente</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Selecione registros de prática ou avaliações que comprovam a execução deste item:
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableEvidences.map((evi) => (
                  <label
                    key={evi.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-100 text-xs text-stone-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvidenceIds.includes(evi.id)}
                      onChange={() => toggleEvidence(evi.id)}
                      className="rounded border-stone-300 text-anil-800"
                    />
                    <span className="truncate">{evi.title}</span>
                    <span className="text-[10px] text-stone-500 font-mono shrink-0">
                      ({evi.artifactType})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">Visibilidade do Item</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as VisibilityLevel)}
                className="w-full text-sm p-2 rounded border border-stone-300 bg-white font-medium"
              >
                <option value="public">Público (Exibido a todos)</option>
                <option value="connections">Apenas Conexões</option>
                <option value="room_members">Apenas Membros da Sala</option>
                <option value="private">Privado (Apenas eu)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="featured-check"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-stone-300 text-anil-800"
              />
              <label htmlFor="featured-check" className="text-xs font-semibold text-stone-800 cursor-pointer">
                Destacar no Topo do Portfólio
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-1.5" />
              {isSubmitting ? 'Publicando...' : 'Publicar no Portfólio'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
