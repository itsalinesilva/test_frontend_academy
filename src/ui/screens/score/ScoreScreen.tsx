import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { ScoreContainer } from '../../components/domain/ScoreContainer';
import { CirculationBar } from '../../components/navigation/CirculationBar';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import {
  FileMusic,
  Play,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const ScoreScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [clef, setClef] = useState<'treble' | 'bass'>('treble');
  const [keySignature, setKeySignature] = useState('C Major');
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [tempo, setTempo] = useState(72);
  const [activeScoreTitle, setActiveScoreTitle] = useState('Estudo Contrapontístico em Dó Maior');
  const [composerName, setComposerName] = useState('Johann Sebastian Bach (Revisão Urtext)');

  const urtextCatalog = [
    {
      id: 'score-bach-inv1',
      title: 'Invenção nº 1 a Duas Vozes em Dó Maior (BWV 772)',
      composer: 'J. S. Bach',
      key: 'C Major',
      time: '4/4',
      tempo: 84,
      clef: 'treble',
    },
    {
      id: 'score-mozart-k545',
      title: 'Sonata Fácil em Dó Maior (K. 545)',
      composer: 'W. A. Mozart',
      key: 'C Major',
      time: '4/4',
      tempo: 120,
      clef: 'treble',
    },
    {
      id: 'score-chopin-prelude',
      title: 'Prelúdio em Mi menor (Op. 28 nº 4)',
      composer: 'Frédéric Chopin',
      key: 'G Major',
      time: '2/2',
      tempo: 50,
      clef: 'treble',
    },
  ];

  const handleSelectRepertoire = (item: typeof urtextCatalog[0]) => {
    setActiveScoreTitle(item.title);
    setComposerName(item.composer);
    setKeySignature(item.key);
    setTimeSignature(item.time);
    setTempo(item.tempo);
    setClef(item.clef as 'treble' | 'bass');
  };

  const handleAuditionScore = () => {
    // Play canonical opening motif using real Web Audio synth
    webAudioSynth.playSequence([261.63, 293.66, 329.63, 349.23, 293.66, 329.63, 261.63, 392.00], 0.3);
  };

  /*
    Aqui existia `handleSaveScore`: acendia "Salvo!" em verde por tres
    segundos e apagava. Nao gravava a partitura em lugar nenhum — e quem
    usava nao tinha como distinguir isso de ter salvado, ate voltar e nao
    encontrar nada.

    Guardar partitura de verdade exige um repositorio de partituras e uma
    serializacao do que o editor tem na tela. Nenhum dos dois existe hoje;
    esta aberto em CLAUDE_TODO.md. Ate la, o botao nao esta aqui.
  */

  return (
    <ScreenContainer
      id="score-hub"
      title="Partituras & Notação Urtext"
      subtitle="Editor de pautas canônicas, gravação gráfica contrapontística e catálogo de partituras auditadas."
      badgeLabel="Motor de Notação Urtext"
      badgeVariant="brand"
      primaryAction={{
        label: 'Avançar para Estúdio DAW',
        icon: ArrowRight,
        onClick: () => navigate('/studio'),
      }}
      secondaryActions={[
        {
          label: 'Voltar para Prática',
          onClick: () => navigate('/practice'),
        },
      ]}
      emptyProps={{
        title: 'Nenhuma partitura aberta',
        description: 'Selecione uma obra do catálogo Urtext ou inicie um manuscrito em branco.',
        actionLabel: 'Carregar Estudo Canônico',
        onAction: () => handleSelectRepertoire(urtextCatalog[0]),
      }}
    >
      <div className="space-y-6">
        {/* Circulation Bar */}
        <CirculationBar id="score-circulation" />

        {/* Repertoire Urtext Quick Selector */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-anil-800" />
              <h3 className="text-xs font-bold text-stone-900 font-serif">
                Repertório Canônico Urtext Disponível
              </h3>
            </div>
            <span className="text-[11px] font-mono text-stone-400">Padrão Internacional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {urtextCatalog.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectRepertoire(item)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  activeScoreTitle === item.title
                    ? 'border-anil-800 bg-red-50/50 shadow-xs'
                    : 'border-stone-200 hover:border-stone-400 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">{item.composer}</span>
                  {activeScoreTitle === item.title && <Badge variant="brand" size="sm">Ativo</Badge>}
                </div>
                <p className="text-xs font-semibold text-stone-900 mt-1 truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-stone-500">
                  <span>{item.key}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                  <span>•</span>
                  <span>{item.tempo} BPM</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Score Toolbar Controls */}
        <div className="p-3.5 bg-white border border-stone-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Clave:</span>
              <select
                value={clef}
                onChange={(e) => setClef(e.target.value as 'treble' | 'bass')}
                className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-anil-800"
              >
                <option value="treble">Sol (2ª Linha - Treble)</option>
                <option value="bass">Fá (4ª Linha - Bass)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700">Armadura:</span>
              <select
                value={keySignature}
                onChange={(e) => setKeySignature(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-anil-800"
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
                className="bg-stone-50 border border-stone-300 rounded px-2 py-1 text-xs font-mono focus:ring-1 focus:ring-anil-800"
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAuditionScore}
              leadingIcon={<Play className="w-3.5 h-3.5 text-anil-800" />}
            >
              Auditar Partitura
            </Button>

          </div>
        </div>

        {/* The Interactive Canonical Score Component */}
        <ScoreContainer
          id="active-editor-score"
          title={activeScoreTitle}
          composer={composerName}
          keySignature={keySignature}
          timeSignature={timeSignature}
          tempo={tempo}
        />

        {/* Next step in circulation prompt */}
        <div className="p-4 bg-stone-100 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 text-anil-800 shrink-0">
              <FileMusic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                Próximo Elo da Circulação: Estúdio DAW (Studio)
              </h4>
              <p className="text-[11px] text-stone-600">
                Grave performances de áudio multicanal, adicione instrumentos virtuais e faça a mixagem da partitura.
              </p>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={() => navigate('/studio')}>
            Ir para Estúdio DAW (Studio)
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};
