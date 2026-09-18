import React from 'react';
import {
  CONCLUIDOS_PARA_ENTRAR,
  FaixaDaLiga,
  FAIXAS_EM_ORDEM,
  LinhaDaClassificacao,
  NOME_DA_FAIXA,
  RecorteDaLiga,
} from '../../../domain/liga';
import { ChevronDown, ChevronUp, Minus } from 'lucide-react';

interface TelaDaLigaProps {
  faixa: FaixaDaLiga;
  recorte: RecorteDaLiga;
  /** Os recortes que esta pessoa pode ver — sai do que ela estuda e pratica. */
  recortesDisponiveis: { recorte: RecorteDaLiga; rotulo: string }[];
  aoTrocarRecorte: (recorte: RecorteDaLiga) => void;
  classificacao: LinhaDaClassificacao[];
  /** Nome de quem participa. Vem de fora: a tela não inventa gente. */
  nomeDe: (userId: string) => string;
  /** Quem está olhando, para destacar a própria linha. `null` se não participa. */
  meuUserId: string | null;
  /** Quantas conclusões a pessoa tem, quando ainda não entrou. */
  conclusoes: number;
  /** Quando a semana fecha, já escrito. */
  fechaEm: string;
}

/**
 * A liga.
 *
 * A REGRA DURA
 * ------------
 * **Tabela vazia mostra a forma, e nunca gente inventada.** Já houve aqui um
 * ranking com Bach em primeiro e Clara Schumann em segundo — numa plataforma
 * sem um único usuário. Isso não é enfeite: é dizer a alguém que ela está em
 * décimo lugar numa competição que não existe.
 *
 * O esqueleto cinza resolve o mesmo problema sem mentir: mostra que a liga
 * funciona, que há posições, que há zona de subida e de queda, e que aquilo
 * vai encher. O que ele não faz é afirmar que já encheu.
 *
 * COMPETE-SE EM VÁRIOS RECORTES AO MESMO TEMPO
 * --------------------------------------------
 * "O melhor da plataforma" diz pouco. "O melhor da tribo dos violinistas", ou
 * "de quem estuda o Barroco", diz muito — é gente comparável fazendo a mesma
 * coisa. Por isso o recorte é a primeira escolha da tela, e não um filtro
 * escondido.
 */
export const TelaDaLiga: React.FC<TelaDaLigaProps> = ({
  faixa,
  recorte,
  recortesDisponiveis,
  aoTrocarRecorte,
  classificacao,
  nomeDe,
  meuUserId,
  conclusoes,
  fechaEm,
}) => {
  const vazia = classificacao.length === 0;
  const participo = meuUserId !== null && classificacao.some((l) => l.userId === meuUserId);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6">
      <Escada faixaAtual={faixa} />

      <nav aria-label="Recorte da liga" className="mt-6 flex flex-wrap gap-2">
        {recortesDisponiveis.map(({ recorte: r, rotulo }) => {
          const ativo = r.tipo === recorte.tipo && r.entidadeId === recorte.entidadeId;
          return (
            <button
              key={`${r.tipo}:${r.entidadeId ?? ''}`}
              type="button"
              onClick={() => aoTrocarRecorte(r)}
              aria-current={ativo ? 'true' : undefined}
              className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                ativo
                  ? 'border-anil-800 bg-anil-800 text-white'
                  : 'border-stone-300 bg-white text-stone-600 hover:border-stone-500'
              }`}
            >
              {rotulo}
            </button>
          );
        })}
      </nav>

      <p className="mt-4 text-xs leading-relaxed text-stone-500">
        A classificação é por experiência <strong>da semana</strong>, e não pelo total
        acumulado. Fecha {fechaEm}.
      </p>

      {vazia ? (
        <Esqueleto />
      ) : (
        <ol className="mt-6 space-y-1">
          {classificacao.map((linha) => (
            <Linha
              key={linha.userId}
              linha={linha}
              nome={nomeDe(linha.userId)}
              euMesmo={linha.userId === meuUserId}
            />
          ))}
        </ol>
      )}

      {!participo && !vazia && (
        <p className="mt-6 rounded-xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
          Você ainda não está nesta liga. Faltam{' '}
          <strong>{Math.max(0, CONCLUIDOS_PARA_ENTRAR - conclusoes)}</strong> conclusões para
          entrar — a liga existe para comparar quem está praticando.
        </p>
      )}
    </div>
  );
};

/** A escada de faixas, com a atual marcada. */
const Escada: React.FC<{ faixaAtual: FaixaDaLiga }> = ({ faixaAtual }) => (
  <ol className="flex items-end justify-between gap-1" aria-label="Faixas da liga">
    {FAIXAS_EM_ORDEM.map((f) => {
      const atual = f === faixaAtual;
      return (
        <li key={f} className="flex flex-1 flex-col items-center gap-1.5">
          <span
            aria-hidden="true"
            className={`h-1.5 w-full rounded-full ${atual ? 'bg-ouro-500' : 'bg-stone-200'}`}
          />
          <span
            className={`text-center font-mono text-[10px] uppercase tracking-wider ${
              atual ? 'font-bold text-ouro-600' : 'text-stone-400'
            }`}
          >
            {NOME_DA_FAIXA[f]}
            {atual && <span className="sr-only"> — sua faixa atual</span>}
          </span>
        </li>
      );
    })}
  </ol>
);

const DESTINO = {
  SOBE: { Icone: ChevronUp, cor: 'text-emerald-600', rotulo: 'sobe de faixa' },
  FICA: { Icone: Minus, cor: 'text-stone-300', rotulo: 'permanece na faixa' },
  CAI: { Icone: ChevronDown, cor: 'text-red-600', rotulo: 'cai de faixa' },
} as const;

const Linha: React.FC<{
  linha: LinhaDaClassificacao;
  nome: string;
  euMesmo: boolean;
}> = ({ linha, nome, euMesmo }) => {
  const { Icone, cor, rotulo } = DESTINO[linha.destino];

  return (
    <li
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        euMesmo ? 'border-anil-700 bg-anil-50' : 'border-transparent bg-white'
      }`}
    >
      <span className="w-6 text-right font-mono text-sm font-bold text-stone-400">
        {linha.posicao}
      </span>
      <Icone className={`h-4 w-4 shrink-0 ${cor}`} aria-hidden="true" />
      <span className="sr-only">{rotulo}</span>
      <span className={`min-w-0 flex-1 truncate text-sm ${euMesmo ? 'font-bold' : ''}`}>
        {nome}
        {euMesmo && <span className="ml-2 text-xs font-normal text-anil-700">você</span>}
      </span>
      <span className="font-mono text-sm font-bold text-stone-700">{linha.xpDaSemana} XP</span>
    </li>
  );
};

/**
 * O esqueleto.
 *
 * Mostra a forma da tabela — posições, zona de subida, zona de queda — sem
 * afirmar que há alguém nelas. É o oposto de preencher com nomes plausíveis:
 * a pessoa entende que a liga funciona e que ainda não começou.
 */
const Esqueleto: React.FC = () => (
  <div className="mt-6">
    <ol aria-hidden="true" className="space-y-1">
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-transparent bg-white px-4 py-3"
        >
          <span className="w-6 text-right font-mono text-sm font-bold text-stone-300">
            {i + 1}
          </span>
          <span className="h-3 w-3 rounded-full bg-stone-100" />
          <span className="h-3 flex-1 rounded-full bg-stone-100" />
          <span className="h-3 w-12 rounded-full bg-stone-100" />
        </li>
      ))}
    </ol>

    <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
      Ninguém entrou nesta liga esta semana ainda. As posições aparecem conforme as pessoas
      praticam — entra-se com <strong>{CONCLUIDOS_PARA_ENTRAR} conclusões</strong>, e a
      classificação é por experiência da semana.
    </p>
  </div>
);
