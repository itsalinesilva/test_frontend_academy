import React, { useState } from 'react';
import { ChevronDown, Flame, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { PracticeProfile, StreakTracker } from '../../../domain/practice';
import { estadoDaDefensiva, frasesDaDefensiva } from '../../../domain/defensiva';

/**
 * O PAINEL DO LABORATÓRIO — tudo o que está sendo medido agora.
 *
 * Não é resumo de perfil, e não é histórico. É o **painel de controle do que
 * tem ascendência em curso**: o que está subindo, o que está caindo, e o que
 * está a um passo de mudar de faixa.
 *
 * 🔴 POR QUE A HIERARQUIA É OBRIGATÓRIA
 * -------------------------------------
 * O painel reúne dezenas de medidas — ligas, percursos, habilidades, XP,
 * jornadas, classificações de agremiação e de clube. Uma lista plana de
 * dezenas de números **não informa: esconde**. Quem olha não sabe por onde
 * começar, e o que importa some no meio do que não importa.
 *
 * Então são dois níveis, e só dois:
 *
 *   DESTAQUE   três medidas, sempre abertas, escolhidas por MOVIMENTO —
 *              a que mais subiu, a que mais caiu, e a que está mais perto
 *              de mudar de faixa. Não são as maiores: são as que mudaram.
 *
 *   TÓPICOS    o resto, em blocos fechados, com o resumo na cabeça.
 *
 * 🔴 E O QUE ELE NÃO PODE FAZER
 * -----------------------------
 * Inventar número. Quando não há dado, vale o **esqueleto** — cinza, sem nome,
 * sem número, mostrando a forma. A tela anterior fazia o contrário: exibia
 * `#3` como posição de liga para quem não estava em liga nenhuma, porque o
 * código era `rankPosition || 3`.
 */

/** Uma medida do painel, com a direção em que ela se move. */
export interface MedidaDoPainel {
  id: string;
  rotulo: string;
  valor: string;
  /** Para onde ela foi desde a última apuração. */
  direcao: 'SUBIU' | 'CAIU' | 'PARADA';
  /** O que falta para mudar de faixa, quando faz sentido dizer. */
  aUmPasso?: string;
}

export interface TopicoDoPainel {
  id: string;
  titulo: string;
  /** O resumo que aparece na cabeça, com o bloco fechado. */
  resumo: string;
  medidas: MedidaDoPainel[];
}

const Seta: React.FC<{ direcao: MedidaDoPainel['direcao'] }> = ({ direcao }) => {
  if (direcao === 'SUBIU') {
    return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-label="subiu" />;
  }
  if (direcao === 'CAIU') {
    return <TrendingDown className="h-3.5 w-3.5 text-red-600" aria-label="caiu" />;
  }
  return <Minus className="h-3.5 w-3.5 text-stone-400" aria-label="parada" />;
};

/**
 * O CALENDÁRIO DA DEFENSIVA, com a semana no rodapé.
 *
 * A semana visível vem da referência (Duolingo B4). O que não se adota é o
 * constrangimento: zero declarado sem drama já é a regra da casa.
 */
const CalendarioDaDefensiva: React.FC<{ streak: StreakTracker }> = ({ streak }) => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const praticados = new Set(
    streak.calendarHistory.filter((d) => d.completedMinutes > 0).map((d) => d.date)
  );

  const doDia = (dia: number) =>
    `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

  /**
   * AS SETE EM TRACK: os últimos sete dias, do mais antigo para hoje.
   *
   * Sete, e não a semana do calendário: o que interessa é a sequência que a
   * pessoa está sustentando agora, e ela não recomeça no domingo.
   */
  /**
   * O nível sai do domínio, e não de uma conta escrita aqui.
   *
   * Espalhar a divisão por sete faria cada tela escolher a própria regra — e a
   * regra tem uma decisão embutida que não pode variar: quebrar a sequência
   * **não tira nível**, só para de subir.
   */
  /**
   * 🔴 O NÍVEL VEM DO REGISTRO, e não da sequência corrente.
   *
   * Esta linha passava só `currentStreakDays`. Como a conta é `dias / 7`,
   * quebrar a sequência zerava os dias — e o nível **sumia junto**. Quem
   * fechou três semanas e faltou um dia via "Sem defensiva ativa", como se as
   * três semanas nunca tivessem existido.
   *
   * `completedCyclesCount` é o que foi conquistado. A sequência atual só entra
   * como piso, para as fichas gravadas antes do campo — e nunca para rebaixar.
   */
  const defensiva = estadoDaDefensiva(
    streak.currentStreakDays,
    0,
    streak.completedCyclesCount
  );
  const frases = frasesDaDefensiva(defensiva);

  const seteDias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - (6 - i));
    return {
      iso: d.toISOString().slice(0, 10),
      letra: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][d.getDay()],
    };
  });

  return (
    <section
      className="rounded-xl border border-stone-200 bg-white p-4"
      aria-label="Calendário da defensiva"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Defensiva</h3>
        <span className="flex items-center gap-1 font-mono text-sm font-bold text-stone-900">
          <Flame className="h-4 w-4 text-ouro-600" aria-hidden="true" />
          {streak.currentStreakDays}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {Array.from({ length: diasNoMes }, (_, i) => i + 1).map((dia) => (
          <div
            key={dia}
            title={doDia(dia)}
            className={`aspect-square rounded-sm text-[9px] leading-none flex items-center justify-center ${
              praticados.has(doDia(dia))
                ? 'bg-ouro-500 text-white font-bold'
                : 'bg-stone-100 text-stone-400'
            }`}
          >
            {dia}
          </div>
        ))}
      </div>

      {/*
        O DETALHE DA DEFENSIVA FICA ABAIXO DO CALENDÁRIO.

        O calendário é o cronograma — onde se vê o mês inteiro. O detalhe é o
        que aquilo produziu: o nível, e quanto falta para o próximo. Pôr o
        nível em cima faria o número competir com o mês; embaixo, ele é a
        conclusão do que se acabou de ver.
      */}
      <div className="mt-3 border-t border-stone-100 pt-3">
        <p className="text-xs font-semibold text-stone-800">{frases.titulo}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-600">{frases.detalhe}</p>

        {/*
          🔴 SETE DIAS FECHADOS VALEM UM NÍVEL, e quebrar NÃO tira nível.
          Só para de subir. Ver `src/domain/defensiva.ts`.
        */}
        {defensiva.nivel > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="rounded-full bg-ouro-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
              Nível {defensiva.nivel}
            </span>
            {defensiva.temCicloParaResgatar && (
              <span className="rounded-full border border-ouro-400 px-2 py-0.5 text-[10px] text-ouro-800">
                XP do ciclo a resgatar
              </span>
            )}
          </div>
        )}

        {/* a barra do ciclo corrente: quanto da semana já foi */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-ouro-500 transition-all"
            style={{ width: `${(defensiva.diasNoCicloAtual / 7) * 100}%` }}
          />
        </div>

        <p className="mt-2 text-[10px] uppercase tracking-wide text-stone-400">Últimos sete dias</p>
        <ul className="mt-1.5 flex justify-between" aria-label="Sete defensivas em track">
          {seteDias.map((d, i) => (
            <li key={d.iso} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-stone-500">{d.letra}</span>
              <span
                aria-label={praticados.has(d.iso) ? `${d.iso}: praticado` : `${d.iso}: sem prática`}
                className={`h-5 w-5 rounded-full border-2 ${
                  praticados.has(d.iso)
                    ? 'border-ouro-500 bg-ouro-500'
                    : i === 6
                      ? 'border-stone-400 bg-white'
                      : 'border-stone-200 bg-white'
                }`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const Topico: React.FC<{ topico: TopicoDoPainel }> = ({ topico }) => {
  const [aberto, setAberto] = useState(false);

  return (
    <section className="rounded-xl border border-stone-200 bg-white" aria-label={topico.titulo}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-2 p-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-stone-800">{topico.titulo}</span>
          <span className="block truncate text-[11px] text-stone-500">{topico.resumo}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${aberto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {aberto && (
        <ul className="space-y-1.5 border-t border-stone-100 px-3 pb-3 pt-2">
          {topico.medidas.length === 0 ? (
            /*
              🔴 ESQUELETO, e não linha inventada.

              Quando o tópico não tem medida, mostra-se a FORMA — cinza, sem
              nome, sem número. É a melhor solução de estado vazio das
              referências, e é o contrário de preencher a tabela com gente que
              não existe.
            */
            <li>
              <p className="text-[11px] text-stone-500">
                Nada medido aqui ainda. As linhas aparecem quando houver o que contar.
              </p>
              <div className="mt-1.5 space-y-1" aria-hidden="true">
                <div className="h-3 w-3/4 rounded bg-stone-100" />
                <div className="h-3 w-1/2 rounded bg-stone-100" />
              </div>
            </li>
          ) : (
            topico.medidas.map((m) => (
              <li key={m.id} className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[11px] text-stone-600">{m.rotulo}</span>
                <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] font-semibold text-stone-900">
                  {m.valor}
                  <Seta direcao={m.direcao} />
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
};

export const PainelDoLaboratorio: React.FC<{
  perfil: PracticeProfile | null;
  destaques: MedidaDoPainel[];
  topicos: TopicoDoPainel[];
}> = ({ perfil, destaques, topicos }) => {
  /**
   * 🔴 SEM NOME, SEM MEDIDA — e o convite no lugar.
   *
   * A tela anterior desenhava "Ofensiva 0 Dias", "Meta Diária 0%" e "Liga
   * Semanal Conservatório (#3)" para quem não está logado. Os dois primeiros
   * são medida de alguém sobre ninguém; o terceiro era pior — a posição `#3`
   * vinha de `rankPosition || 3`, um número **inventado** para preencher o
   * campo.
   *
   * Medição exige nome. O que a tela pode fazer sem nome é dizer o que ela
   * mede, e convidar.
   */
  /**
   * 🔴 SEM PERFIL AQUI SIGNIFICA **CARREGANDO**, e não visitante.
   *
   * O convite ao visitante saiu deste componente e virou o `VisitorInvitation`
   * padrão da casa, montado pela tela. O que sobrava aqui — um cartão mais um
   * esqueleto de calendário parado — desenhava **uma caixa branca vazia**, que
   * é a pior coisa que se pode pôr no espaço mais valioso da tela.
   *
   * Quem chega a este ramo tem nome e o perfil ainda não voltou. Então o que
   * se diz é isso, com a forma do que vem — que é o uso legítimo do esqueleto.
   */
  if (!perfil) {
    return (
      <div className="space-y-3">
        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">Carregando o seu painel…</p>
          <div className="mt-3 space-y-2" aria-hidden="true">
            <div className="h-3 w-1/2 animate-pulse rounded bg-stone-200" />
            <div className="h-16 animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-stone-200" />
          </div>
        </section>
      </div>
    );
  }

  /**
   * 🔴 ISTO ERA UM `aside` COM O MESMO NOME DO `aside` QUE O ENVOLVE.
   *
   * O `PageLayout.Aside` já monta o marco complementar, com o rótulo que a
   * tela declara. Este componente montava **outro**, aninhado e com o mesmo
   * nome — e um leitor de tela anunciava dois painéis idênticos, um dentro do
   * outro.
   *
   * Marco é estrutura de página, e quem decide a estrutura é o layout. O que
   * entra aqui é conteúdo.
   */
  return (
    <div className="space-y-3">
      <CalendarioDaDefensiva streak={perfil.streak} />

      {/* ------------------------------- o que se move ------------------------------- */}
      <section
        className="rounded-xl border border-ouro-300 bg-ouro-50 p-4"
        aria-label="Em destaque agora"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600">
          Em movimento agora
        </h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-stone-600">
          Não são as maiores medidas: são as que mudaram.
        </p>

        {destaques.length === 0 ? (
          <p className="mt-2 text-[11px] text-stone-600">
            Nada se moveu desde a última apuração. Uma sessão muda isso.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {destaques.map((m) => (
              <li key={m.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs font-medium text-stone-800">{m.rotulo}</span>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-sm font-bold text-stone-900">
                    {m.valor}
                    <Seta direcao={m.direcao} />
                  </span>
                </div>
                {m.aUmPasso && (
                  <p className="text-[10px] leading-tight text-stone-600">{m.aUmPasso}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {topicos.map((t) => (
        <Topico key={t.id} topico={t} />
      ))}
    </div>
  );
};
