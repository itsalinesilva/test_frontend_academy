import React, { useMemo, useState } from 'react';
import { UnifiedProfileRecord, ProfileScoreItem } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { EmptyState } from '../../feedback/EmptyState';
import { Music, FileText, Award, Calendar, Activity } from 'lucide-react';

interface ActivityTabProps {
  profile: UnifiedProfileRecord;
}

/**
 * Linha do tempo do perfil.
 *
 * Esta aba trazia cinco atividades escritas no código — uma gravação de Bach
 * ao cravo francês, uma edição crítica publicada, datas de abril de 2024 — e
 * as mostrava em QUALQUER perfil. Todo músico da plataforma aparecia com a
 * mesma obra gravada no mesmo dia.
 *
 * Agora a linha do tempo é MONTADA a partir do que o perfil realmente tem:
 * gravações, partituras e conquistas que a pessoa registrou. Não existe um
 * repositório de "atividades" separado, e inventar um seria trocar uma
 * ficção por outra — a atividade é a consequência do registro, e é dele que
 * ela deve nascer.
 */
type Categoria = 'todas' | 'gravacoes' | 'partituras' | 'conquistas';

interface Atividade {
  id: string;
  categoria: Exclude<Categoria, 'todas'>;
  titulo: string;
  descricao: string;
  /** Ano ou data ISO, conforme o item de origem registra. */
  quando: string;
  selo: string;
  Icone: typeof Music;
  cor: string;
}

const TIPO_DE_PARTITURA: Record<ProfileScoreItem['type'], string> = {
  edicao_critica: 'Edição crítica',
  arranjo: 'Arranjo',
  composicao_original: 'Composição original',
  transcricao: 'Transcrição',
};

const FILTROS: { valor: Categoria; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'gravacoes', rotulo: 'Gravações' },
  { valor: 'partituras', rotulo: 'Partituras' },
  { valor: 'conquistas', rotulo: 'Conquistas' },
];

export const ActivityTab: React.FC<ActivityTabProps> = ({ profile }) => {
  const [filtro, setFiltro] = useState<Categoria>('todas');

  const atividades = useMemo<Atividade[]>(() => {
    const lista: Atividade[] = [];

    for (const r of profile.recordingsList ?? []) {
      lista.push({
        id: `rec_${r.id}`,
        categoria: 'gravacoes',
        titulo: r.title,
        descricao: [r.composer, r.workReference, r.instrumentUsed].filter(Boolean).join(' · '),
        quando: r.recordingDate,
        selo: 'Gravação',
        Icone: Music,
        cor: 'bg-amber-100 text-amber-900',
      });
    }

    for (const s of profile.scoresList ?? []) {
      lista.push({
        id: `scr_${s.id}`,
        categoria: 'partituras',
        titulo: s.title,
        descricao: [s.composer, s.workReference, TIPO_DE_PARTITURA[s.type]]
          .filter(Boolean)
          .join(' · '),
        quando: s.publishedAt,
        selo: 'Partitura',
        Icone: FileText,
        cor: 'bg-anil-100 text-anil-900',
      });
    }

    for (const a of profile.achievementsList ?? []) {
      lista.push({
        id: `ach_${a.id}`,
        categoria: 'conquistas',
        titulo: a.title,
        descricao: a.description,
        quando: String(a.year),
        selo: a.issuer,
        Icone: Award,
        cor: 'bg-stone-100 text-stone-800',
      });
    }

    return lista.sort((x, y) => y.quando.localeCompare(x.quando));
  }, [profile]);

  const visiveis = filtro === 'todas' ? atividades : atividades.filter((a) => a.categoria === filtro);

  return (
    <div id="profile-activity-tab" className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-base font-bold text-stone-900">
            Linha do tempo de atividades
          </h2>
          <p className="text-xs text-stone-600">
            Gravações, partituras e conquistas registradas neste perfil, da mais recente para a
            mais antiga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtrar atividades">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              role="tab"
              aria-selected={filtro === f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`rounded px-2.5 py-1 text-xs transition-colors ${
                filtro === f.valor
                  ? 'bg-stone-900 font-medium text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
      </div>

      {visiveis.length === 0 ? (
        <EmptyState
          id="profile-activity-empty"
          icon={<Activity className="h-8 w-8 stroke-1" aria-hidden="true" />}
          title={
            atividades.length === 0
              ? 'Nenhuma atividade registrada'
              : 'Nada nesta categoria'
          }
          description={
            atividades.length === 0
              ? 'Gravações, partituras e conquistas registradas no perfil aparecem aqui em ordem cronológica.'
              : 'Escolha outra categoria para ver o que já foi registrado.'
          }
        />
      ) : (
        <div className="relative space-y-6 border-l-2 border-stone-200 pl-6">
          {visiveis.map((act) => (
            <div key={act.id} className="relative">
              <div
                className={`absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-xs ${act.cor}`}
                aria-hidden="true"
              >
                <act.Icone className="h-3.5 w-3.5" />
              </div>

              <Card variant="default" padding="md" className="transition-colors hover:border-stone-400">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <span className="text-xs font-bold text-stone-900">{act.titulo}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-stone-200 bg-stone-100 px-2 py-0.5 font-mono text-[10px] text-stone-700">
                      {act.selo}
                    </span>
                    {act.quando && (
                      <span className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Calendar className="h-3 w-3" aria-hidden="true" /> {act.quando}
                      </span>
                    )}
                  </div>
                </div>
                {act.descricao && <p className="mt-2 text-xs text-stone-600">{act.descricao}</p>}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
