import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, RotateCcw, X } from 'lucide-react';
import { AcademyModule } from '../../../domain/academy';
import { Livreto } from '../../../domain/booklet';
import {
  CadeiraNivelavel,
  EstadoDoNivelamento,
  TrilhaDeNivelamento,
  cadeirasNivelaveis,
  diagnosticar,
  iniciarNivelamento,
  interromperNivelamento,
  moduloDoDiagnostico,
  progressoDoNivelamento,
  questaoAtual,
  responderNivelamento,
} from '../../../domain/nivelamento';

/**
 * O NIVELAMENTO — o que o visitante vê no lugar das disciplinas soltas.
 *
 * 🔴 O QUE ESTAVA AQUI ANTES
 * --------------------------
 * Uma lista de tópicos sem curso, sem módulo e sem ordem, cada um convidando a
 * começar por ali. Quem chega não tem como escolher entre eles: escolher
 * pressupõe saber o que já se sabe, e é exatamente isso que ainda não se sabe.
 *
 * A TELA TEM TRÊS ESTADOS, E O CAMINHO ENTRE ELES É DE MÃO DUPLA
 * --------------------------------------------------------------
 * ```
 *   ESCOLHA ──▶ PERGUNTAS ──▶ DIAGNÓSTICO
 *      ▲            │              │
 *      └── trocar ──┴──── outra ───┘
 * ```
 * Voltar à escolha é sempre possível, em qualquer ponto. Um teste do qual só
 * se sai respondendo até o fim é um teste que as pessoas abandonam fechando a
 * aba — e aí não se sabe sequer que elas tentaram.
 *
 * 🔴 SAIR NO MEIO NÃO É ERRAR
 * ---------------------------
 * Quem encerra no capítulo 12 sem ter errado não tem ponto de entrada medido:
 * tem um **piso**. O diagnóstico de quem interrompeu diz isso, e não inventa
 * uma entrada que o teste não apurou. Ver `interromperNivelamento`.
 *
 * A REGRA FICA NO DOMÍNIO
 * -----------------------
 * Esta tela não decide nada: ela chama `responderNivelamento` e mostra o que
 * volta. Guardar a lógica do diagnóstico aqui a colocaria onde nenhum teste de
 * domínio alcança — e é a parte que mais importa estar certa.
 */
export const NivelamentoDoVisitante: React.FC<{
  /** Os livretos, que são de onde saem as perguntas e as trilhas. */
  livretos: readonly Livreto[];
  /** Todos os módulos da Academia — o diagnóstico casa o capítulo com um deles. */
  modulos: readonly AcademyModule[];
  onEntrar: () => void;
  onAbrir: (rota: string) => void;
  /** Para quem prefere olhar a estrutura antes de responder qualquer coisa. */
  onVerEstrutura: () => void;
  /**
   * A semente das perguntas.
   *
   * Existe como propriedade porque uma sequência irreprodutível não é
   * verificável: sem poder fixá-la, um caso não consegue errar de propósito
   * duas vezes no mesmo capítulo, e a regra que mais importa — a confirmação
   * depois do erro — ficaria sem prova.
   */
  semente?: number;
}> = ({ livretos, modulos, onEntrar, onAbrir, onVerEstrutura, semente }) => {
  const [estado, setEstado] = useState<EstadoDoNivelamento | null>(null);
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [conferida, setConferida] = useState<boolean | null>(null);

  const cadeiras = useMemo(() => cadeirasNivelaveis(livretos), [livretos]);
  const questao = useMemo(() => (estado ? questaoAtual(estado) : null), [estado]);

  function comecar(trilha: TrilhaDeNivelamento) {
    const livreto = livretos.find((l) => l.cursoId === trilha.cursoId);
    if (!livreto) return;
    setEstado(iniciarNivelamento(livreto, trilha.cadeira, semente ?? Date.now() % 100000));
    setEscolhida(null);
    setConferida(null);
  }

  /** Volta ao seletor. É o mesmo gesto de "trocar de cadeira" e de "fechar". */
  function voltarAEscolha() {
    setEstado(null);
    setEscolhida(null);
    setConferida(null);
  }

  if (!estado) {
    return (
      <EscolhaDaCadeira cadeiras={cadeiras} onComecar={comecar} onVerEstrutura={onVerEstrutura} />
    );
  }

  if (estado.encerrado) {
    return (
      <ResultadoDoNivelamento
        estado={estado}
        modulos={modulos}
        onTrocar={voltarAEscolha}
        onRefazer={() => comecar(estado.trilha)}
        onEntrar={onEntrar}
        onAbrir={onAbrir}
      />
    );
  }

  if (!questao) {
    /**
     * Estado impossível pelo domínio — mas declarado, e não em branco. Uma
     * área vazia sem explicação é lida como tela quebrada, e é exatamente o
     * que o quadro branco do painel era.
     */
    return (
      <section className="rounded-xl border border-stone-200 bg-white p-4" aria-label="Nivelamento">
        <p className="text-sm text-stone-600">O nivelamento não conseguiu montar esta pergunta.</p>
        <button
          type="button"
          onClick={voltarAEscolha}
          className="mt-3 rounded-lg bg-anil-800 px-4 py-2 text-sm font-semibold text-white"
        >
          Escolher outra cadeira
        </button>
      </section>
    );
  }

  const passo = estado.passos[estado.indice];
  const p = progressoDoNivelamento(estado);

  function conferir() {
    if (!escolhida || !questao) return;
    setConferida(escolhida === questao.resposta);
  }

  function seguir() {
    if (conferida === null) return;
    setEstado((e) => (e ? responderNivelamento(e, conferida) : e));
    setEscolhida(null);
    setConferida(null);
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4" aria-label="Nivelamento">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/*
            🔴 A SAÍDA FICA NO TOPO, e não escondida no rodapé.

            Um teste do qual só se sai respondendo até o fim é um teste que as
            pessoas abandonam fechando a aba. Trocar de cadeira no meio é uso
            previsto, e não desistência.
          */}
          <button
            type="button"
            onClick={voltarAEscolha}
            className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-anil-800"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Trocar de cadeira
          </button>

          <button
            type="button"
            onClick={() => setEstado((e) => (e ? interromperNivelamento(e) : e))}
            className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-anil-800"
          >
            Encerrar e ver o resultado
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 font-mono text-[10px] uppercase tracking-wide text-anil-800">
            {estado.trilha.titulo} · cap. {passo.capitulo}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-stone-500">
            {p.respondidas} de {p.total}
          </span>
        </div>

        <p className="truncate text-xs font-semibold text-stone-700" title={passo.titulo}>
          {passo.titulo}
        </p>

        {/*
          A barra mede o que foi RESPONDIDO, e não o que foi aberto. A
          confirmação depois de um erro não a faz andar: é o mesmo capítulo.
        */}
        <div
          className="h-1.5 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={p.percentual}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do nivelamento"
        >
          <div className="h-full rounded-full bg-anil-700" style={{ width: `${p.percentual}%` }} />
        </div>

        {estado.tentativa > 0 && (
          /*
            🔴 A SEGUNDA CHANCE É DITA, e não silenciosa.
            Quem errou precisa saber que não foi reprovado ainda — e que esta
            pergunta decide. Confirmar sem avisar transformaria o deslize num
            veredito invisível.
          */
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
            Outra questão deste mesmo capítulo, para confirmar. Um erro pode ser escorregão; dois
            seguidos é onde você entra.
          </p>
        )}
      </header>

      <p className="mt-3 text-sm font-medium leading-relaxed text-stone-900">{questao.prompt}</p>

      <ul className="mt-3 grid gap-2">
        {questao.choices.map((alt) => {
          const marcada = escolhida === alt.id;
          const correta = alt.id === questao.resposta;

          let estilo = 'border-stone-200 bg-white text-stone-800 hover:border-stone-400';
          if (conferida !== null) {
            if (correta) estilo = 'border-emerald-500 bg-emerald-50 font-bold text-emerald-950';
            else if (marcada) estilo = 'border-red-500 bg-red-50 font-bold text-red-950';
            else estilo = 'border-stone-200 bg-stone-50 text-stone-400';
          } else if (marcada) {
            estilo = 'border-anil-700 bg-anil-50 font-medium text-anil-950';
          }

          return (
            <li key={alt.id}>
              <button
                type="button"
                disabled={conferida !== null}
                aria-pressed={marcada}
                onClick={() => setEscolhida(alt.id)}
                className={`flex w-full items-baseline gap-2.5 rounded-lg border-2 p-3 text-left text-sm transition-all ${estilo}`}
              >
                <span className="font-mono text-[11px] uppercase opacity-60">{alt.id}</span>
                <span className="min-w-0 flex-1">{alt.texto}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {conferida !== null && (
        <div
          className={`mt-3 rounded-lg p-3 text-xs leading-relaxed ${
            conferida ? 'bg-emerald-50 text-emerald-950' : 'bg-red-50 text-red-950'
          }`}
          role="status"
        >
          <p className="flex items-center gap-1.5 font-bold">
            {conferida ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {conferida ? 'Certo' : 'Não é essa'}
          </p>
          {/* A explicação aparece nos dois casos: é a parte que ensina. */}
          <p className="mt-1">{questao.explanation}</p>
        </div>
      )}

      <footer className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onVerEstrutura}
          className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800"
        >
          Ver a estrutura
        </button>

        {conferida === null ? (
          <button
            type="button"
            disabled={!escolhida}
            onClick={conferir}
            className="rounded-lg bg-anil-800 px-4 py-2 text-sm font-semibold text-white disabled:bg-stone-300"
          >
            Conferir
          </button>
        ) : (
          <button
            type="button"
            onClick={seguir}
            className="flex items-center gap-1.5 rounded-lg bg-anil-800 px-4 py-2 text-sm font-semibold text-white"
          >
            Continuar
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </footer>
    </section>
  );
};

/**
 * 🔴 A ESCOLHA DA CADEIRA — o primeiro passo, e não um detalhe.
 *
 * As três cadeiras nivelam coisas diferentes, e quem chega sabe em qual tem
 * interesse mesmo sem saber o próprio nível. Começar por Teoria para todo mundo
 * mandaria quem veio pelo violino responder sobre armadura de clave.
 *
 * As trilhas saem dos livretos. História tem três cursos, e eles **não são
 * sequência um do outro**: nivelar "História" como percurso único colocaria
 * quem sabe música brasileira a responder sobre a ocidental, e leria o erro
 * como lacuna.
 */
const EscolhaDaCadeira: React.FC<{
  cadeiras: CadeiraNivelavel[];
  onComecar: (t: TrilhaDeNivelamento) => void;
  onVerEstrutura: () => void;
}> = ({ cadeiras, onComecar, onVerEstrutura }) => (
  <section
    className="rounded-xl border border-anil-200 bg-anil-50 p-5"
    aria-label="Escolha da cadeira para nivelamento"
  >
    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-anil-800">
      <Compass className="h-3.5 w-3.5" aria-hidden="true" />
      Antes de escolher uma lição
    </span>

    <h2 className="mt-2 font-serif text-xl font-bold text-stone-900">
      Que cadeira você quer nivelar?
    </h2>

    <p className="mt-2 text-sm leading-relaxed text-stone-700">
      As perguntas seguem a ordem em que o curso ensina, capítulo a capítulo. Elas param onde você
      parar — e o ponto em que pararem é por onde começar. Dá para trocar de cadeira ou encerrar a
      qualquer momento. Não vale nota, não tranca nada e não precisa de conta.
    </p>

    {cadeiras.length === 0 ? (
      <p className="mt-4 rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-600">
        Nenhuma cadeira tem livreto de questões ainda, e sem questões não há nivelamento.
      </p>
    ) : (
      <ul className="mt-4 space-y-3">
        {cadeiras.map(({ cadeira, trilhas }) => (
          <li key={cadeira.id} className="rounded-lg border border-stone-200 bg-white p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-serif text-base font-bold text-stone-900">{cadeira.name}</h3>
              <span className="rounded-full bg-anil-800 px-2 py-0.5 text-[10px] font-semibold text-white">
                {cadeira.guildName}
              </span>
            </div>

            <ul className="mt-2 space-y-1.5">
              {trilhas.map((t) => (
                <li key={t.cursoId}>
                  <button
                    type="button"
                    onClick={() => onComecar(t)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-stone-200 p-2.5 text-left hover:border-anil-700 hover:bg-anil-50"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-stone-900">{t.titulo}</span>
                      {/* Números medidos do livreto, e não arredondados para impressionar. */}
                      <span className="block text-[11px] text-stone-500">
                        {t.capitulos} capítulos · {t.questoes} questões
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-anil-800" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    )}

    <button
      type="button"
      onClick={onVerEstrutura}
      className="mt-4 text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
    >
      Ou veja a estrutura inteira, sem responder nada
    </button>
  </section>
);

const ResultadoDoNivelamento: React.FC<{
  estado: EstadoDoNivelamento;
  modulos: readonly AcademyModule[];
  onTrocar: () => void;
  onRefazer: () => void;
  onEntrar: () => void;
  onAbrir: (rota: string) => void;
}> = ({ estado, modulos, onTrocar, onRefazer, onEntrar, onAbrir }) => {
  const d = diagnosticar(estado);
  const modulo = moduloDoDiagnostico(d, modulos);

  return (
    <section
      className="rounded-xl border border-stone-200 bg-white p-5"
      aria-label="Resultado do nivelamento"
    >
      <span className="font-mono text-[10px] uppercase tracking-wide text-anil-800">
        Resultado · {d.trilha.titulo}
      </span>

      <h2 className="mt-2 font-serif text-xl font-bold text-stone-900">{d.frases.titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">{d.frases.detalhe}</p>

      {/*
        🔴 O MÓDULO É O DA ACADEMIA, com o título que ele tem lá.

        Escrever aqui "Módulo de intervalos" seria inventar um nome que não
        existe em lugar nenhum, e quem clicasse chegaria a outra coisa.
      */}
      {modulo && (
        <div className="mt-4 rounded-lg border border-anil-200 bg-anil-50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wide text-anil-800">
            Seu módulo · capítulo {modulo.order}
          </p>
          <p className="mt-1 font-serif text-base font-bold text-stone-900">{modulo.title}</p>
          {modulo.description && (
            <p className="mt-1 text-xs leading-relaxed text-stone-600">{modulo.description}</p>
          )}
          <button
            type="button"
            onClick={() => onAbrir(`/academia/course/${modulo.courseId}/module/${modulo.id}`)}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-anil-800 px-4 py-2 text-sm font-semibold text-white"
          >
            Abrir este módulo
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-stone-500">Capítulos de pé</dt>
          <dd className="font-mono text-lg font-bold text-stone-900">{d.dominados}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-stone-500">Na trilha</dt>
          <dd className="font-mono text-lg font-bold text-stone-900">{d.total}</dd>
        </div>
      </dl>

      <p className="mt-3 text-[11px] leading-relaxed text-stone-500">
        Este nivelamento cobre {d.trilha.titulo}, e não mais que isso. As outras cadeiras têm
        nivelamento próprio — dá para fazer um de cada.
      </p>

      <footer className="mt-4 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4">
        <button
          type="button"
          onClick={onEntrar}
          className="rounded-lg border border-anil-800 px-4 py-2 text-sm font-semibold text-anil-800"
        >
          Entrar para guardar este resultado
        </button>
        <button
          type="button"
          onClick={onTrocar}
          className="flex items-center gap-1.5 text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Nivelar outra cadeira
        </button>
        <button
          type="button"
          onClick={onRefazer}
          className="flex items-center gap-1.5 text-xs text-stone-500 underline underline-offset-2 hover:text-stone-800"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          Refazer esta
        </button>
      </footer>
    </section>
  );
};
