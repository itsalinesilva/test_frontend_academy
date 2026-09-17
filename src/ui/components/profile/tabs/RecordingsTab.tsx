import React, { useState } from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Play, Pause, Volume2, Calendar } from 'lucide-react';

interface RecordingsTabProps {
  profile: UnifiedProfileRecord;
}

export const RecordingsTab: React.FC<RecordingsTabProps> = ({ profile }) => {
  const recordings = profile.recordingsList || [];
  const [playingId, setPlayingId] = useState<string | null>(null);
  const currentProgress = 35;

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <div id="profile-recordings-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Dossiê de Gravações em Áudio & Acústica Histórica
        </h2>
        <p className="text-xs text-stone-600">
          Registros sonoros em alta fidelidade realizados em espaços acústicos tratados com instrumentos históricos
        </p>
      </div>

      <div className="space-y-4">
        {recordings.map((rec) => {
          const isPlaying = playingId === rec.id;
          const waveform = rec.waveformSnippet || [
            20, 35, 50, 80, 65, 90, 75, 60, 45, 70, 85, 95, 60, 40, 30, 55, 70, 80, 50, 25,
          ];

          return (
            <Card key={rec.id} variant="default" padding="lg" className="border-stone-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => togglePlay(rec.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm ${
                      isPlaying
                        ? 'bg-amber-900 text-white'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>

                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900">{rec.title}</h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {rec.workReference} • {rec.composer}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-2">
                      <span className="flex items-center gap-1 font-mono text-stone-700">
                        <Calendar className="w-3 h-3" /> {rec.recordingDate}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-stone-700">{rec.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Interactive Waveform Player */}
                <div className="flex-1 max-w-md bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-1.5">
                    <span>{isPlaying ? '01:14' : '00:00'}</span>
                    <span className="flex items-center gap-1 text-emerald-800">
                      <Volume2 className="w-3 h-3" /> FLAC 24-bit / 96kHz
                    </span>
                    <span>{rec.duration}</span>
                  </div>

                  <div className="flex items-end gap-1 h-8 px-1">
                    {waveform.map((height, idx) => {
                      const isActive = (idx / waveform.length) * 100 <= (isPlaying ? currentProgress : 0);
                      return (
                        <div
                          key={idx}
                          className={`w-full rounded-xs transition-all duration-200 ${
                            isActive ? 'bg-amber-800' : 'bg-stone-300'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Technical Acoustic Metadata */}
              <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-stone-50/70 rounded border border-stone-200">
                  <span className="text-[10px] font-semibold text-stone-500 uppercase block">
                    Instrumento Utilizado
                  </span>
                  <span className="font-medium text-stone-800 text-xs mt-0.5 block">
                    {rec.instrumentUsed}
                  </span>
                </div>

                <div className="p-2.5 bg-stone-50/70 rounded border border-stone-200">
                  <span className="text-[10px] font-semibold text-stone-500 uppercase block">
                    Espaço Acústico & Reverberação
                  </span>
                  <span className="font-medium text-stone-800 text-xs mt-0.5 block">
                    {rec.acousticSpace}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
