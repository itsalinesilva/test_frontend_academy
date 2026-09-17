import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Button } from '../../components/base/Button';
import {
  Play,
  Square,
  Circle,
  Plus,
  RotateCcw,
  RotateCw,
  Save,
  ArrowLeft,
} from 'lucide-react';

export const DawProjectScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const projectId = params.id || 'arranjo-satb-coral';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tempo, setTempo] = useState(64);
  const [tracks, setTracks] = useState([
    { id: 'trk-soprano', name: '01. Voz Soprano (SATB)', muted: false, solo: false, vol: 80, pan: 0 },
    { id: 'trk-contralto', name: '02. Voz Contralto (SATB)', muted: false, solo: false, vol: 75, pan: -15 },
    { id: 'trk-tenor', name: '03. Voz Tenor (SATB)', muted: false, solo: false, vol: 78, pan: 15 },
    { id: 'trk-baixo', name: '04. Voz Baixo (SATB)', muted: false, solo: false, vol: 85, pan: 0 },
  ]);

  const toggleMute = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t))
    );
  };

  const toggleSolo = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, solo: !t.solo } : t))
    );
  };

  return (
    <ScreenContainer
      id="daw-project"
      title={`Projeto DAW: ${projectId}`}
      subtitle="Estúdio Digital Multitrack • Processamento não-destrutivo com preservação de versões"
      badgeLabel="Autosave Habilitado"
      badgeVariant="brand"
      primaryAction={{
        label: 'Salvar Snapshot',
        icon: Save,
        onClick: () => alert('Snapshot da versão salvo no histórico seguro do projeto.'),
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Hub',
          icon: ArrowLeft,
          onClick: () => navigate('/studio'),
        },
      ]}
      emptyProps={{
        title: 'Projeto não encontrado',
        description: `O arquivo [${projectId}] não existe ou foi excluído.`,
        actionLabel: 'Ver Projetos no Estúdio',
        onAction: () => navigate('/studio'),
      }}
    >
      <div className="space-y-4">
        {/* DAW Transport Bar */}
        <div className="p-3 bg-stone-900 text-stone-100 rounded-lg border border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-full transition-colors ${
                isPlaying ? 'bg-amber-600 text-white' : 'bg-red-800 text-white hover:bg-red-700'
              }`}
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setIsRecording(false);
              }}
              className="p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white"
              title="Parar"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-full transition-colors ${
                isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-800 text-stone-400 hover:text-red-500'
              }`}
              title="Gravar"
            >
              <Circle className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Time & Counter readout */}
          <div className="flex items-center gap-4 font-mono text-xs text-stone-300">
            <div className="bg-stone-950 px-3 py-1 rounded border border-stone-800">
              <span className="text-red-400">00:01:24</span>
              <span className="text-stone-500 text-[10px] ml-1">SMPTE</span>
            </div>
            <div className="bg-stone-950 px-3 py-1 rounded border border-stone-800 flex items-center gap-2">
              <span className="text-stone-400">BPM:</span>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-12 bg-transparent text-white focus:outline-none text-right font-mono"
              />
            </div>
            <div className="bg-stone-950 px-3 py-1 rounded border border-stone-800">
              <span className="text-stone-400">Compasso:</span> 4/4
            </div>
          </div>

          {/* History Controls */}
          <div className="flex items-center gap-1">
            <button type="button" className="p-1.5 rounded bg-stone-800 text-stone-400 hover:text-white" title="Desfazer (Ctrl+Z)">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="p-1.5 rounded bg-stone-800 text-stone-400 hover:text-white" title="Refazer (Ctrl+Y)">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Multitrack Stems View */}
        <div className="border border-stone-200 rounded-lg overflow-hidden bg-white divide-y divide-stone-100">
          {tracks.map((track) => (
            <div key={track.id} className="flex flex-col sm:flex-row items-stretch sm:items-center">
              {/* Track Header / Mixer Channel */}
              <div className="w-full sm:w-64 p-3 bg-stone-50 border-r border-stone-200 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 truncate">{track.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleMute(track.id)}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-bold ${
                        track.muted ? 'bg-red-800 text-white' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSolo(track.id)}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-bold ${
                        track.solo ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      S
                    </button>
                  </div>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
                  <span>VOL:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={track.vol}
                    onChange={() => {}}
                    className="w-full accent-red-800 h-1 bg-stone-200 rounded"
                  />
                  <span className="w-6 text-right">{track.vol}</span>
                </div>
              </div>

              {/* Simulated Waveform Lane */}
              <div className="flex-1 p-3 bg-stone-100/50 flex items-center justify-center min-h-[64px] relative">
                <div className="w-full h-8 bg-stone-200/80 rounded flex items-center px-4 overflow-hidden">
                  <div className="w-3/4 h-5 bg-stone-400/50 rounded flex items-center justify-around px-2">
                    {Array.from({ length: 28 }).map((_, barIdx) => (
                      <span
                        key={barIdx}
                        className="w-0.5 bg-stone-600 rounded-full"
                        style={{ height: `${((barIdx * 7) % 18) + 4}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>Formatos de exportação suportados: WAV 24-bit 48kHz, FLAC, MIDI 2.0 e MusicXML</span>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Pista de Áudio
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};
