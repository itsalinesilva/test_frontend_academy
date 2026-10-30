import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { VisitorInvitation } from '../../components/visitor/VisitorInvitation';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { practiceService } from '../../../services/application/practice.service';
import { academyService } from '../../../services/application/academy.service';
import {
  CadeiraNaArvore,
  CursoNaArvore,
  proximaSugerida,
} from '../../../domain/arvore-de-licoes';
import { AcademyModule } from '../../../domain/academy';
import { Livreto } from '../../../domain/booklet';
import { bookletService } from '../../../services/application/booklet.service';
import { NivelamentoDoVisitante } from './NivelamentoDoVisitante';
import { PracticeProfile, PracticeSession } from '../../../domain/practice';
import {
  MedidaDoPainel,
  PainelDoLaboratorio,
  TopicoDoPainel,
} from './PainelDoLaboratorio';

/**
 * O LABORATÓRIO.
 *
 * 🔴 O QUE ESTA TELA ERA
 * ----------------------
 * Uma coluna única com tudo despejado: dez modalidades, seis árvores, quatro
 * atalhos, um banner, e três blocos de medida pessoal — **sem navegação
 * nenhuma**. Nenhum marco de página, nenhuma região, nenhuma barra: o leitor
 * de tela recebia uma lista de vinte e cinco botões sem nome de seção.
 *
 * Dois defeitos eram piores que a desorganização:
 *
 *   **medida pessoal para visitante.** "Ofensiva 0 Dias", "Meta Diária 0%" e
 *   "Liga Semanal" desenhavam para quem não tem nome. Medida de alguém sobre
 *   ninguém.
 *
 *   **posição de liga INVENTADA.** O código era
 *   `leaderboard.find(...)?.rankPosition || 3` — quem não estava na tabela
 *   aparecia em **terceiro lugar**. É o antipadrão que a auditoria de
 *   referência nomeia, e que já tinha acontecido aqui com Bach em primeiro.
 *
 * A ESTRUTURA, E POR QUE ELA É ESTA
 * ---------------------------------
 * Três abas fixas, e não mais. Cada uma responde a uma pergunta diferente —
 * e é isso que justifica serem três em vez de uma lista de atalhos:
 *
 *   Feed      o que eu deixei aberto?
 *   Lições    o que eu posso estudar?
 *   Práticas  onde e quando isso aconteceu?
 *
 * O painel lateral é **fixo** e não muda de aba, porque o que ele mostra — o
 * que está sendo medido agora — não depende de onde a pessoa está olhando.
 *
 * Ver `docs/harness/88_LABORATORIO.md`.
 */

type Aba = 'FEED' | 'LICOES' | 'PRATICAS';

/**
 * As abas vivem na chamada de `PageLayout.Tabs`, e não numa tabela à parte.
 *
 * A tabela existia para desenhar cápsulas com ícone e uma linha de pergunta
 * embaixo — duas coisas que saíram junto com o desvio de padrão. A aba padrão
 * da casa é rótulo mais contagem, e a contagem vem do dado, não de uma
 * constante.
 */

export const LaboratorioScreen: React.FC<{ abaInicial?: Aba }> = ({ abaInicial }) => {
  const { navigate, query } = useRouter();
  const { userId } = useCurrentUser();

  /**
   * `?aba=licoes` abre direto na árvore acadêmica. É para onde vão os botões
   * que antes levavam à árvore escrita à mão (LX-1), e o que o endereço antigo
   * `/practice/skill-tree` passou a abrir.
   */
  const abaDoEndereco = query.get('aba');
  const [aba, setAba] = useState<Aba>(
    abaInicial ??
      (abaDoEndereco === 'licoes' ? 'LICOES' : abaDoEndereco === 'praticas' ? 'PRATICAS' : 'FEED')
  );
  /**
   * 🔴 A ÁRVORE ACADÊMICA, e não competências soltas.
   *
   * Aqui havia `SkillTree[]` — teoria, percepção, ritmo, leitura —, uma lista
   * sem curso, sem módulo e sem ordem. Quem abria não sabia o que vinha antes
   * nem a que curso aquilo pertencia.
   */
  const [arvore, setArvore] = useState<CadeiraNaArvore[]>([]);
  /**
   * Os módulos com o `order` CRU — é neles que o nivelamento casa o capítulo
   * diagnosticado. A árvore renumera as posições para exibição, e casar por ali
   * colocaria a pessoa no módulo errado no dia em que um capítulo saísse.
   *
   * São de TODOS os cursos, e não só de Teoria: o nivelamento agora é por
   * cadeira, e quem nivelar Violino tem de chegar a um módulo de Violino.
   */
  const [modulos, setModulos] = useState<AcademyModule[]>([]);
  /** Os livretos são de onde saem as trilhas e as perguntas do nivelamento. */
  const [livretos, setLivretos] = useState<Livreto[]>([]);
  const [perfil, setPerfil] = useState<PracticeProfile | null>(null);
  /**
   * 🔴 ABERTO, e não concluído.
   *
   * Aqui estava `PracticeResult[]`, vindo de `getPracticeHistory` — e
   * resultado só existe quando a sessão **acabou**. O Feed dizia "em
   * andamento" e listava o que tinha terminado: o rótulo e o conteúdo diziam
   * coisas opostas, e quem lê acredita no rótulo.
   */
  const [abertas, setAbertas] = useState<PracticeSession[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;

    /**
     * O que é público carrega para qualquer um; o que é medida exige nome.
     *
     * 🔴 E o `setCarregando(false)` fica no `finally`. A versão anterior desta
     * tela saía com `if (!userId) return;` ANTES de desligar o carregamento, e
     * o visitante ficava com esqueleto eterno — sem erro, sem aviso.
     */
    (async () => {
      try {
        /**
         * A árvore é PÚBLICA: ela é a estrutura do curso, e mostrar a
         * estrutura não expõe ninguém. O que exige nome é o progresso dentro
         * dela.
         */
        const [lida, cursos, livretosLidos] = await Promise.all([
          academyService.arvoreDeLicoes([]),
          academyService.getCourses(),
          bookletService.listarLivretos(),
        ]);

        const modulosLidos = (
          await Promise.all(cursos.map((c) => academyService.getModules(c.id)))
        ).flat();

        if (!vivo) return;
        setArvore(lida);
        setModulos(modulosLidos);
        setLivretos(livretosLidos);

        if (!userId) return;

        const [p, sessoes] = await Promise.all([
          practiceService.getPracticeProfile(userId),
          practiceService.sessoesAbertas(userId),
        ]);
        if (!vivo) return;

        setPerfil(p);
        setAbertas(sessoes);
      } finally {
        if (vivo) setCarregando(false);
      }
    })();

    return () => {
      vivo = false;
    };
  }, [userId]);

  /**
   * OS TRÊS DESTAQUES — escolhidos por MOVIMENTO, e não por tamanho.
   *
   * O painel reúne dezenas de medidas. Pôr as maiores em cima mostraria
   * sempre as mesmas; pôr as que **mudaram** mostra o que aconteceu desde a
   * última vez, que é o que faz alguém voltar.
   */
  const destaques = useMemo<MedidaDoPainel[]>(() => {
    if (!perfil) return [];

    const lista: MedidaDoPainel[] = [];

    const { dailyGoal: meta, experience: xp, streak } = perfil;

    if (meta.targetXp > 0) {
      const falta = Math.max(0, meta.targetXp - meta.completedXp);
      lista.push({
        id: 'meta',
        rotulo: 'Meta do dia',
        valor: `${meta.completedXp}/${meta.targetXp} XP`,
        direcao: meta.completedXp > 0 ? 'SUBIU' : 'PARADA',
        aUmPasso: meta.isCompleted ? 'Cumprida hoje.' : `Faltam ${falta} XP para fechar o dia.`,
      });
    }

    if (xp.nextLevelXp > xp.currentLevelXp) {
      lista.push({
        id: 'nivel',
        rotulo: `Nível ${xp.level}`,
        valor: `${xp.weeklyXp} XP na semana`,
        direcao: xp.weeklyXp > 0 ? 'SUBIU' : 'PARADA',
        aUmPasso: `Faltam ${xp.nextLevelXp - xp.currentLevelXp} XP para o nível ${xp.level + 1}.`,
      });
    }

    lista.push({
      id: 'defensiva',
      rotulo: 'Defensiva',
      valor: `${streak.currentStreakDays} dias`,
      direcao: streak.currentStreakDays > 0 ? 'SUBIU' : 'PARADA',
      aUmPasso:
        streak.currentStreakDays >= 7
          ? 'Sustentada há uma semana ou mais.'
          : `Faltam ${7 - streak.currentStreakDays} dias para a primeira semana inteira.`,
    });

    /**
     * 🔴 SÓ ENTRA O QUE DE FATO SE MOVEU.
     *
     * A seção se chama "em movimento agora" e dizia, no próprio texto, que não
     * são as maiores medidas: são as que mudaram. E listava três paradas em
     * zero para quem ainda não praticou — o rótulo prometia uma coisa e o
     * conteúdo entregava outra.
     *
     * Quando nada se moveu, a seção diz isso. Uma frase honesta ocupa menos
     * espaço que três linhas que não informam.
     */
    return lista.filter((m) => m.direcao !== 'PARADA').slice(0, 3);
  }, [perfil]);

  const topicos = useMemo<TopicoDoPainel[]>(() => {
    if (!perfil) return [];

    const m = perfil.masteryCount;
    const totalDeMaestrias = m.novato + m.aprendiz + m.competente + m.mestre + m.virtuoso;

    return [
      {
        id: 'ligas',
        titulo: 'Ligas e classificações',
        /**
         * 🔴 `currentLeague` é `null` até haver conclusões suficientes, e o
         * texto diz isso em vez de mostrar uma liga qualquer. Era aqui que a
         * tela anterior escrevia `#3`.
         */
        resumo: perfil.currentLeague
          ? `Liga ${perfil.currentLeague}`
          : 'Ainda fora de liga — faltam conclusões',
        medidas: perfil.currentLeague
          ? [
              {
                id: 'liga',
                rotulo: 'Liga da semana',
                valor: String(perfil.currentLeague),
                direcao: 'PARADA',
              },
            ]
          : [],
      },
      {
        id: 'habilidades',
        titulo: 'Habilidades',
        resumo:
          totalDeMaestrias > 0
            ? `${totalDeMaestrias} em acompanhamento`
            : 'Nenhuma medida ainda',
        medidas: [
          { id: 'virtuoso', rotulo: 'Virtuoso', valor: String(m.virtuoso), direcao: 'PARADA' },
          { id: 'mestre', rotulo: 'Mestre', valor: String(m.mestre), direcao: 'PARADA' },
          { id: 'competente', rotulo: 'Competente', valor: String(m.competente), direcao: 'PARADA' },
          { id: 'aprendiz', rotulo: 'Aprendiz', valor: String(m.aprendiz), direcao: 'PARADA' },
          { id: 'novato', rotulo: 'Novato', valor: String(m.novato), direcao: 'PARADA' },
        ].filter((x) => Number(x.valor) > 0) as MedidaDoPainel[],
      },
      {
        id: 'pontuacao',
        titulo: 'Pontuação',
        resumo: `${perfil.experience.totalXp} XP no total`,
        medidas: [
          {
            id: 'total',
            rotulo: 'XP total',
            valor: String(perfil.experience.totalXp),
            direcao: 'PARADA',
          },
          {
            id: 'semana',
            rotulo: 'XP na semana',
            valor: String(perfil.experience.weeklyXp),
            direcao: perfil.experience.weeklyXp > 0 ? 'SUBIU' : 'PARADA',
          },
          {
            id: 'mes',
            rotulo: 'XP no mês',
            valor: String(perfil.experience.monthlyXp),
            direcao: 'PARADA',
          },
        ],
      },
      {
        id: 'percursos',
        titulo: 'Percursos',
        resumo: `${perfil.totalSessionsCount} sessões concluídas`,
        medidas: [
          {
            id: 'sessoes',
            rotulo: 'Sessões',
            valor: String(perfil.totalSessionsCount),
            direcao: 'PARADA',
          },
          {
            id: 'minutos',
            rotulo: 'Minutos de treino',
            valor: String(perfil.totalPracticeTimeMinutes),
            direcao: 'PARADA',
          },
          /**
           * `null` enquanto não houve resultado — e isso é diferente de ter
           * errado tudo. A linha só entra quando há o que medir.
           */
          ...(perfil.overallAccuracyPercentage !== null
            ? [
                {
                  id: 'precisao',
                  rotulo: 'Precisão geral',
                  valor: `${perfil.overallAccuracyPercentage}%`,
                  direcao: 'PARADA' as const,
                },
              ]
            : []),
        ],
      },
    ];
  }, [perfil]);

  return (
    <PageLayout
      id="laboratorio"
      form="detail"
      density="catalog"
      state={carregando && !userId ? 'loading' : 'content'}
      loadingMessage="Carregando o laboratório…"
      asideLabel="Painel do laboratório"
    >
      {/*
        🔴 A NAVBAR É A PRIMEIRA COISA DA TELA, e é a padrão da casa.

        A versão anterior punha dois parágrafos acima dela e desenhava cápsulas
        — dois desvios do padrão ao mesmo tempo. O resto do site usa aba
        sublinhada com contagem, colada no topo do conteúdo, sem nada antes.

        Uma tela que inventa a própria barra obriga quem navega a reaprender o
        gesto em cada lugar. O padrão não é estética: é o que faz a segunda
        tela custar menos que a primeira.
      */}
      <PageLayout.Tabs
        id="laboratorio-abas"
        activeTab={aba}
        onChange={(t) => setAba(t as Aba)}
        tabs={[
          { id: 'FEED', label: 'Feed', badge: abertas.length || undefined },
          {
            id: 'LICOES',
            label: 'Lições',
            /** A contagem é de LIÇÕES, e não de gavetas. */
            badge:
              arvore.reduce((n, c) => n + c.cursos.reduce((m, x) => m + x.totalDeLicoes, 0), 0) ||
              undefined,
          },
          { id: 'PRATICAS', label: 'Práticas' },
        ]}
      />

      <PageLayout.Main>
        <div className="space-y-4">
          {/*
            O BANNER HERO, só para quem não tem nome.

            Quem chega precisa saber o que este espaço faz antes de decidir
            entrar. Para quem já entrou ele é ruído: a pessoa já sabe, e o
            espaço é melhor gasto com o que ela veio ver.
          */}
          {!userId && aba === 'FEED' && <ApresentacaoDoLaboratorio arvore={arvore} />}

          {aba === 'FEED' && (
            <FeedEmAndamento
              carregando={carregando}
              temNome={Boolean(userId)}
              sessoes={abertas}
              onIrParaLicoes={() => setAba('LICOES')}
              onEntrar={() => navigate('/auth/login')}
            />
          )}

          {aba === 'LICOES' && (
            <div className="space-y-4">
              {/*
                🔴 O NIVELAMENTO VEM ANTES DA ESTRUTURA, e só para quem não tem nome.

                Aqui o visitante recebia a árvore inteira e mais nada — vinte
                portas para quem ainda não sabe qual é a sua. Escolher entre
                elas pressupõe saber o que já se sabe, que é exatamente o que
                ainda não se sabe.

                A estrutura continua logo abaixo, e o convite tem saída para
                ela: quem prefere olhar antes de responder não fica preso no
                teste.
              */}
              {!userId && (
                <NivelamentoDoVisitante
                  livretos={livretos}
                  modulos={modulos}
                  onEntrar={() => navigate('/auth/login')}
                  onAbrir={navigate}
                  onVerEstrutura={() => {
                    document
                      .getElementById('estrutura-do-conservatorio')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
              )}

              <MapaDeLicoes arvore={arvore} temNome={Boolean(userId)} onAbrir={navigate} />
            </div>
          )}

          {aba === 'PRATICAS' && <MapaDePraticas onAbrir={navigate} />}
        </div>
      </PageLayout.Main>

      <PageLayout.Aside>
        {/*
          🔴 O QUADRO BRANCO VAZIO SAIU DAQUI.

          O painel do visitante desenhava um cartão de convite e, abaixo, um
          esqueleto de calendário — que na tela virava **um quadro branco sem
          nada dentro**. Esqueleto serve para dizer "isto está carregando" ou
          "esta é a forma da tabela"; parado, sem contexto, ele é só uma caixa
          vazia ocupando o espaço mais valioso da tela.

          No lugar entra o convite padrão da casa, que diz o que o espaço faz,
          com números REAIS medidos por quem chama.
        */}
        {!userId ? (
          <VisitorInvitation
            space="Laboratório"
            summary="Onde o que se estuda vira treino medido — e a medida fica registrada em seu nome."
            highlights={[
              {
                value: String(
                  arvore.reduce((n, c) => n + c.cursos.reduce((m, x) => m + x.totalDeLicoes, 0), 0)
                ),
                label: 'lições catalogadas',
              },
              { value: '7', label: 'dias na defensiva' },
              { value: '6', label: 'faixas de liga' },
            ]}
            steps={[
              {
                title: 'Faça o nivelamento',
                description:
                  'As perguntas seguem a ordem do curso e param onde você parar. Sem conta, sem nota.',
              },
              {
                title: 'Entre com a conta Google',
                description: 'Sem senha para criar nem para lembrar.',
              },
              {
                title: 'Toque, cante ou bata a resposta',
                description: 'O microfone mede afinação e ritmo. O acerto vira XP, e o XP vira faixa.',
              },
            ]}
            primaryLabel="Entrar para medir"
            onPrimary={() => navigate('/auth/login')}
            secondaryLabel="Descobrir por onde entrar"
            onSecondary={() => setAba('LICOES')}
            disclaimer="Curso livre, com certificação própria do Conservatório."
          />
        ) : (
          <PainelDoLaboratorio
            perfil={perfil}
            destaques={destaques}
            topicos={topicos}
          />
        )}
      </PageLayout.Aside>
    </PageLayout>
  );
};

/**
 * O BANNER DE APRESENTAÇÃO — o que o Laboratório faz, para quem ainda não sabe.
 *
 * Não é slogan: é a lista do que existe aqui dentro. Quem chega de fora vê
 * "Feed · Lições · Práticas" e não tem como adivinhar que por trás disso há
 * medição de afinação, histórico, liga e defensiva.
 *
 * Some assim que a pessoa entra: para quem já tem nome, isto é ruído.
 */
const ApresentacaoDoLaboratorio: React.FC<{ arvore: CadeiraNaArvore[] }> = ({ arvore }) => (
  <section
    className="rounded-xl border border-anil-200 bg-gradient-to-br from-anil-50 to-white p-5"
    aria-label="O que é o Laboratório"
  >
    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-anil-700">
      Laboratório
    </p>
    <h2 className="mt-1 font-serif text-xl font-bold leading-snug text-stone-900 sm:text-2xl">
      Estudar é uma coisa. Treinar com medida é outra.
    </h2>
    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-700">
      A Academia ensina; o Laboratório mede. Você toca, canta ou bate a resposta, e o que sai
      disso vira registro — não impressão.
    </p>

    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
      {[
        {
          titulo: 'Lições e práticas',
          texto: `${arvore.reduce((n, c) => n + c.cursos.reduce((m, x) => m + x.totalDeLicoes, 0), 0)} lições, em ${arvore.length} cadeiras — na ordem em que o curso as ensina.`,
        },
        {
          titulo: 'Defensiva',
          texto: 'A sequência de dias praticados, com a semana visível. Zero declarado sem drama.',
        },
        {
          titulo: 'Histórico e métricas',
          texto: 'Minutos, sessões, precisão por dimensão. Ausência de medida aparece como ausência.',
        },
        {
          titulo: 'Ligas e classificações',
          texto: 'Seis faixas, por agremiação e por clube. Sem tabela preenchida com gente inventada.',
        },
        {
          titulo: 'Percursos e jornadas',
          texto: 'O que você abriu fica aberto, e o Feed mostra onde parou.',
        },
        {
          titulo: 'Habilidades em ascensão',
          texto: 'Novato a virtuoso — e a que decaiu por desuso também aparece.',
        },
      ].map((b) => (
        <li key={b.titulo} className="rounded-lg border border-stone-200 bg-white p-3">
          <p className="text-xs font-semibold text-stone-900">{b.titulo}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-stone-600">{b.texto}</p>
        </li>
      ))}
    </ul>
  </section>
);

/**
 * O FEED — só o que está aberto.
 *
 * Não é catálogo, não é sugestão, não é descoberta. Se não há nada aberto, ele
 * diz isso e aponta para Lições: feed vazio com sugestões seria a tela mudando
 * de assunto sozinha.
 */
const FeedEmAndamento: React.FC<{
  carregando: boolean;
  temNome: boolean;
  sessoes: PracticeSession[];
  onIrParaLicoes: () => void;
  onEntrar: () => void;
}> = ({ carregando, temNome, sessoes, onIrParaLicoes, onEntrar }) => {
  if (!temNome) {
    return (
      <section className="rounded-xl border border-stone-200 bg-white p-5" aria-label="Em andamento">
        <h2 className="font-serif text-lg font-bold text-stone-900">O que você deixou aberto</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
          O Feed guarda lições e práticas que você começou e não terminou, e a meta do dia em
          processamento. Nada disso existe sem nome — é registro de alguém.
        </p>
        <button
          type="button"
          onClick={onEntrar}
          className="mt-3 rounded-lg bg-anil-800 px-3 py-2 text-sm font-semibold text-white hover:bg-anil-700"
        >
          Entrar
        </button>
      </section>
    );
  }

  if (carregando) {
    return (
      <div className="space-y-2" aria-label="Carregando o que está em andamento">
        <div className="h-20 animate-pulse rounded-xl bg-stone-200" />
        <div className="h-20 animate-pulse rounded-xl bg-stone-200" />
      </div>
    );
  }

  if (sessoes.length === 0) {
    return (
      <section className="rounded-xl border border-stone-200 bg-white p-5" aria-label="Em andamento">
        <h2 className="font-serif text-lg font-bold text-stone-900">Nada aberto agora</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
          Quando você começar uma lição ou uma prática, ela fica aqui até terminar.
        </p>
        <button
          type="button"
          onClick={onIrParaLicoes}
          className="mt-3 rounded-lg border border-anil-800 px-3 py-2 text-sm font-semibold text-anil-800 hover:bg-anil-50"
        >
          Ver as lições disponíveis
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-2" aria-label="Em andamento">
      <h2 className="font-serif text-lg font-bold text-stone-900">Em andamento</h2>
      <p className="text-xs leading-relaxed text-stone-600">
        Sessões que você começou e não fechou. Elas ficam aqui até terminarem.
      </p>
      <ul className="space-y-2">
        {sessoes.slice(0, 12).map((s) => (
          <li key={s.id} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-semibold text-stone-900">
              {s.modality} · {s.exerciseIds.length}{' '}
              {s.exerciseIds.length === 1 ? 'exercício' : 'exercícios'}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-stone-500">
              aberta em {new Date(s.startedAt).toLocaleDateString('pt-BR')}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

/**
 * LIÇÕES — o mapa do que está disponível para o meu perfil.
 *
 * Em cima, o que eu alcanço por vínculo. Embaixo, o que existe e está fechado,
 * **com o motivo escrito**: cadeado que diz o que falta, e não cadeado mudo.
 * Esconder o que está fechado faria a plataforma parecer menor do que é.
 */
const MapaDeLicoes: React.FC<{
  arvore: CadeiraNaArvore[];
  temNome: boolean;
  onAbrir: (rota: string) => void;
}> = ({ arvore, temNome, onAbrir }) => {
  const minhas = arvore.filter((c) => c.pertence);
  const demais = arvore.filter((c) => !c.pertence);

  return (
    <div className="space-y-4">
      {minhas.length > 0 && (
        <section className="space-y-3" aria-label="Disponíveis para você">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Pelas suas agremiações
          </h2>
          {minhas.map((c) => (
            <CadeiraAberta key={c.cadeira.id} cadeira={c} onAbrir={onAbrir} />
          ))}
        </section>
      )}

      {/*
        🔴 A ESTRUTURA É PÚBLICA, e o progresso é que exige nome.

        Mostrar a árvore inteira a quem chega não expõe ninguém — e é o que
        permite decidir se vale entrar. Esconder faria a plataforma parecer
        menor do que é.
      */}
      <section
        id="estrutura-do-conservatorio"
        className="space-y-3 scroll-mt-28"
        aria-label={minhas.length > 0 ? 'Outras cadeiras' : 'Disponíveis para você'}
      >
        <h2 className="font-serif text-lg font-bold text-stone-900">
          {minhas.length > 0 ? 'As demais cadeiras' : 'A estrutura do Conservatório'}
        </h2>
        <p className="text-xs leading-relaxed text-stone-600">
          {temNome
            ? 'Visíveis, e abertas ao entrar no Grêmio correspondente.'
            : 'Cadeira, curso, módulo e lição — nesta ordem, porque a sequência é o que o curso ensina. Entrar abre o acompanhamento; a estrutura já é pública.'}
        </p>

        {demais.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
            Nenhuma cadeira catalogada com lições ainda.
          </p>
        ) : (
          demais.map((c) => (
            <CadeiraAberta key={c.cadeira.id} cadeira={c} onAbrir={onAbrir} fechada />
          ))
        )}
      </section>
    </div>
  );
};

/**
 * Uma cadeira, com os cursos dela e a árvore de cada um.
 *
 * `fechada` marca a que exige vínculo — e a marcação **diz o que falta**, em
 * vez de esconder. Cadeado mudo faz quem lê concluir que não existe.
 */
const CadeiraAberta: React.FC<{
  cadeira: CadeiraNaArvore;
  onAbrir: (rota: string) => void;
  fechada?: boolean;
}> = ({ cadeira, onAbrir, fechada }) => (
  <article
    className={`rounded-xl border p-4 ${
      fechada ? 'border-stone-200 bg-stone-50' : 'border-stone-200 bg-white'
    }`}
  >
    <header className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="font-serif text-base font-bold text-stone-900">{cadeira.cadeira.name}</h3>
      {fechada ? (
        <span className="flex items-center gap-1 rounded-full border border-stone-300 px-2 py-0.5 text-[10px] text-stone-600">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Entrar no {cadeira.cadeira.guildName} abre o acompanhamento
        </span>
      ) : (
        <span className="rounded-full bg-anil-800 px-2 py-0.5 text-[10px] font-semibold text-white">
          {cadeira.cadeira.guildName}
        </span>
      )}
    </header>

    <div className="mt-3 space-y-3">
      {cadeira.cursos.map((curso) => (
        <CursoNaLista key={curso.id} curso={curso} onAbrir={onAbrir} />
      ))}
    </div>
  </article>
);

/**
 * Um curso, com os módulos numerados e as lições em ordem.
 *
 * 🔴 A ORDEM É SUGESTÃO, E NÃO CADEADO. Toda lição é clicável, inclusive a
 * vigésima da décima seção. O que o número faz é **dizer onde aquilo fica** —
 * quem pula não fechou as seções anteriores, e vai encontrar pressupostos que
 * não estudou. Dizer isso é diferente de proibir.
 */
const CursoNaLista: React.FC<{
  curso: CursoNaArvore;
  onAbrir: (rota: string) => void;
}> = ({ curso, onAbrir }) => {
  const [aberto, setAberto] = useState(false);
  const proxima = proximaSugerida(curso, new Set());

  return (
    <section className="rounded-lg border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-2 p-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-stone-900">{curso.titulo}</span>
          <span className="block text-[11px] text-stone-500">
            {curso.modulos.length} {curso.modulos.length === 1 ? 'módulo' : 'módulos'} ·{' '}
            {curso.totalDeLicoes} {curso.totalDeLicoes === 1 ? 'lição' : 'lições'}
            {proxima && ` · começa em "${proxima.licao.titulo}"`}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${aberto ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {aberto && (
        <ol className="space-y-2 border-t border-stone-100 px-3 pb-3 pt-2">
          {curso.modulos.map((m) => (
            <li key={m.id}>
              <p className="font-mono text-[10px] uppercase tracking-wide text-stone-400">
                Seção {m.ordem} · {m.titulo}
              </p>
              <ol className="mt-1 space-y-0.5">
                {m.licoes.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => onAbrir(`/academia/lesson/${l.id}`)}
                      className="flex w-full items-baseline gap-2 rounded px-1 py-0.5 text-left text-xs text-stone-700 hover:bg-stone-50 hover:text-anil-800"
                    >
                      <span className="font-mono text-[10px] text-stone-400">
                        {m.ordem}.{l.ordem}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{l.titulo}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

/**
 * PRÁTICAS — e aqui a tela diz o que ela AINDA NÃO É.
 *
 * 🔴 O mapa de práticas é um **globo**: forma geográfica, marcações por
 * compositor, régua de eras que repovoa as regiões ao andar no tempo, zoom que
 * separa os pontos, e a tabela correspondente embaixo.
 *
 * Isso **não existe**. O que existe é o Atlas, que já lê o catálogo canônico e
 * já agrega por era e região — mas desenha lista, e não geografia.
 *
 * Desenhar aqui uma lista chamada "mapa" seria repetir o erro que este
 * documento nomeia. A tela diz o que falta e leva ao que existe.
 */
const MapaDePraticas: React.FC<{ onAbrir: (rota: string) => void }> = ({ onAbrir }) => (
  <section className="space-y-3" aria-label="Mapa de práticas">
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="font-serif text-lg font-bold text-stone-900">O mapa do repertório</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
        Um globo com as regiões marcadas por compositor, uma régua de eras que repovoa o mapa ao
        andar no tempo, e a tabela correspondente embaixo — com busca e filtro.
      </p>

      <div className="mt-3 rounded-lg border border-ouro-300 bg-ouro-50 p-3">
        <p className="text-xs leading-relaxed text-stone-800">
          <strong>O globo ainda não foi construído.</strong> O que existe é o Atlas, que lê o mesmo
          catálogo — 1.004 compositores em 8 eras e 8 regiões — e já anda no tempo, mas desenha
          lista em vez de geografia.
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-stone-700">
          Dizer isso é melhor que chamar a lista de mapa: quem abre esperando um globo e encontra
          uma lista conclui que a plataforma está quebrada — e está.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onAbrir('/worlds')}
        className="mt-3 rounded-lg bg-anil-800 px-3 py-2 text-sm font-semibold text-white hover:bg-anil-700"
      >
        Abrir o Atlas
      </button>
    </div>
  </section>
);
