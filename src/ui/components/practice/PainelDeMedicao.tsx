import React from 'react';
import { MedicaoReal } from '../../../domain/practice-measurement';
import { AlertTriangle } from 'lucide-react';

/**
 * Exibição de uma medição de prática.
 *
 * Existe como componente único porque três telas mostravam a mesma coisa de
 * três jeitos diferentes — e porque a regra que importa aqui é fácil de
 * esquecer ao reescrever cada uma: **ausência não é zero**.
 *
 * Uma dimensão não medida aparece como "—", cinza, com a etiqueta "não
 * medido". Preencher com zero faria o aluno ver uma nota ruim onde houve
 * apenas falta de sinal, e corrigir um erro que não cometeu.
 */

export interface PainelDeMedicaoProps {
  medicao: MedicaoReal;
  /** `compacto` para modal e listas; `completo` para a tela de detalhe. */
  variante?: 'compacto' | 'completo';
  id?: string;
}

interface Linha {
  rotulo: string;
  valor: number | null;
  detalhe: string | null;
  explicacao: string;
}

function linhasDe(m: MedicaoReal): Linha[] {
  return [
    {
      rotulo: 'Afinação',
      valor: m.afinacao.pontuacao,
      detalhe:
        m.afinacao.desvioCents !== null
          ? `${m.afinacao.desvioCents > 0 ? '+' : ''}${m.afinacao.desvioCents} cents${m.afinacao.notaAlvo ? ` de ${m.afinacao.notaAlvo}` : ''}`
          : null,
      explicacao:
        'Distância entre a altura executada e a nota alvo. Até 5 cents o desvio é inaudível; a partir de 50 já se ouve outra nota.',
    },
    {
      rotulo: 'Altura firme',
      valor: m.estabilidadeDeAltura,
      detalhe: m.afinacao.notaDetectada ? `detectado ${m.afinacao.notaDetectada}` : null,
      explicacao:
        'Quanto a altura oscila dentro da própria nota. Acertar o centro e balançar em volta dele não é o mesmo que sustentar.',
    },
    {
      rotulo: 'Tempo',
      valor: m.tempoRitmico.pontuacao,
      detalhe:
        m.tempoRitmico.desvioMedioMs !== null
          ? `${m.tempoRitmico.desvioMedioMs} ms do pulso`
          : null,
      explicacao:
        'Desvio médio dos ataques em relação à grade do metrônomo. Até 20 ms não se percebe; acima de 120 ms o ataque soa fora.',
    },
    {
      rotulo: 'Pulso',
      valor: m.estabilidadeRitmica,
      detalhe:
        m.tempoRitmico.bpmMedido !== null
          ? `${m.tempoRitmico.bpmMedido} BPM${m.tempoRitmico.bpmAlvo ? ` (alvo ${m.tempoRitmico.bpmAlvo})` : ''}`
          : null,
      explicacao:
        'Regularidade dos intervalos entre um ataque e o seguinte — se o andamento se mantém ou escorrega.',
    },
    {
      rotulo: 'Sustentação',
      valor: m.sustentacao.pontuacao,
      detalhe:
        m.sustentacao.realSegundos !== null && m.sustentacao.alvoSegundos !== null
          ? `${m.sustentacao.realSegundos.toFixed(1)}s de ${m.sustentacao.alvoSegundos.toFixed(1)}s`
          : null,
      explicacao: 'Se a duração executada corresponde à duração pedida.',
    },
    {
      rotulo: 'Resposta',
      valor: m.acerto.pontuacao,
      detalhe:
        m.acerto.correto === null
          ? null
          : `${m.acerto.correto ? 'correta' : 'incorreta'}${m.acerto.tempoDeRespostaMs !== null ? ` em ${(m.acerto.tempoDeRespostaMs / 1000).toFixed(1)}s` : ''}`,
      explicacao: 'Acerto da resposta, nos exercícios que se respondem em vez de executar.',
    },
  ];
}

function corDaNota(valor: number | null): string {
  if (valor === null) return 'text-stone-300';
  if (valor >= 85) return 'text-emerald-700';
  if (valor >= 70) return 'text-anil-800';
  if (valor >= 50) return 'text-amber-700';
  return 'text-red-700';
}

export const PainelDeMedicao: React.FC<PainelDeMedicaoProps> = ({
  medicao,
  variante = 'compacto',
  id = 'painel-medicao',
}) => {
  const linhas = linhasDe(medicao);
  // No modo compacto só aparece o que foi medido: uma grade de traços não
  // informa nada e empurra o que importa para fora da tela.
  const visiveis = variante === 'compacto' ? linhas.filter((l) => l.valor !== null) : linhas;

  return (
    <div id={id} className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
          Nota da tentativa
        </span>
        <span className="flex items-baseline gap-2">
          <span className={`font-mono text-2xl font-bold ${corDaNota(medicao.notaGlobal)}`}>
            {medicao.notaGlobal !== null ? medicao.notaGlobal : '—'}
          </span>
          <span className="font-mono text-[10px] text-stone-400">
            {medicao.notaGlobal !== null
              ? `de 100 · ${medicao.dimensoesMedidas.length} ${medicao.dimensoesMedidas.length === 1 ? 'dimensão' : 'dimensões'}`
              : 'nada foi medido'}
          </span>
        </span>
      </div>

      {visiveis.length > 0 && (
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visiveis.map((l) => (
            <div
              key={l.rotulo}
              title={l.explicacao}
              className={`rounded border p-2 ${
                l.valor === null ? 'border-stone-100 bg-stone-50/50' : 'border-stone-200 bg-white'
              }`}
            >
              <dt className="font-mono text-[10px] uppercase tracking-wide text-stone-500">
                {l.rotulo}
              </dt>
              <dd className={`font-mono text-base font-bold ${corDaNota(l.valor)}`}>
                {l.valor === null ? '—' : l.valor}
              </dd>
              <dd className="font-mono text-[9px] leading-tight text-stone-400">
                {l.valor === null ? 'não medido' : (l.detalhe ?? '')}
              </dd>
              {variante === 'completo' && (
                <dd className="mt-1 border-t border-stone-100 pt-1 text-[10px] leading-relaxed text-stone-500">
                  {l.explicacao}
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}

      {medicao.ausencias.length > 0 && (
        <ul className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-2.5">
          {medicao.ausencias.map((a, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-900"
            >
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
