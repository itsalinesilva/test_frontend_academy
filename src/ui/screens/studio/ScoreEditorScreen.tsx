import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { ScoreContainer } from '../../components/domain/ScoreContainer';
import { ArrowLeft } from 'lucide-react';

export const ScoreEditorScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [keySignature, setKeySignature] = useState('C Major');
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [tempo, setTempo] = useState(60);

  return (
    <ScreenContainer
      id="score-editor"
      title="Editor de Partituras"
      subtitle="Composição formal e gravação gráfica em pautas canônicas com suporte a MusicXML e MIDI."
      badgeLabel="Motor de Notação"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Voltar ao estúdio',
        icon: ArrowLeft,
        onClick: () => navigate('/studio'),
      }}
      emptyProps={{
        title: 'Nenhuma partitura carregada',
        description: 'Crie uma nova pauta para iniciar a edição ou importe um arquivo MusicXML existente.',
        actionLabel: 'Iniciar Nova Pauta',
        onAction: () => {},
      }}
    >
      <div className="space-y-6">
        {/* Score Toolbar Controls */}
        <div className="p-3 bg-white border border-stone-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Clave:</span>
              <select
                value={clef}
                onChange={(e) => setClef(e.target.value as any)}
                className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs"
              >
                <option value="treble">Sol (2ª Linha)</option>
                <option value="bass">Fá (4ª Linha)</option>
                <option value="alto">Dó (3ª Linha)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Armadura:</span>
              <select
                value={keySignature}
                onChange={(e) => setKeySignature(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs"
              >
                <option value="C Major">Dó Maior / Lá menor (0 acidentes)</option>
                <option value="G Major">Sol Maior / Mi menor (1 sustenido)</option>
                <option value="F Major">Fá Maior / Ré menor (1 bemol)</option>
                <option value="D Major">Ré Maior / Si menor (2 sustenidos)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Fórmula:</span>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs font-mono"
              >
                <option value="4/4">4/4 (Quaternário)</option>
                <option value="3/4">3/4 (Ternário)</option>
                <option value="2/4">2/4 (Binário)</option>
                <option value="6/8">6/8 (Composto)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Tempo:</span>
              <input
                type="number"
                min="40"
                max="240"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-16 bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs font-mono"
              />
              <span className="text-xs text-stone-500">BPM</span>
            </div>
          </div>

        </div>

        {/* The Interactive Canonical Score Component */}
        <ScoreContainer
          id="active-editor-score"
          title="Estudo Contrapontístico a Quatro Vozes"
          composer="Sessão Interativa do Aluno"
          keySignature={keySignature}
          timeSignature={timeSignature}
          tempo={tempo}
        />
      </div>
    </ScreenContainer>
  );
};
