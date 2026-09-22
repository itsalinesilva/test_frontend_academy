// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { NivelamentoDoVisitante } from '../../src/ui/screens/practice/NivelamentoDoVisitante';
import { academyService } from '../../src/services/application/academy.service';
import { LIVRETOS_PADRAO } from '../../src/data/seed-booklets';
import { AcademyModule } from '../../src/domain/academy';
import { ChairId } from '../../src/domain/chair';
import {
  iniciarNivelamento,
  questaoAtual,
  responderNivelamento,
} from '../../src/domain/nivelamento';

/**
 * O NIVELAMENTO DO VISITANTE, NA TELA.
 *
 * 🔴 O QUE ESTAVA AQUI
 * --------------------
 * A seção de Lições do visitante era a árvore inteira e mais nada: vinte
 * portas para quem ainda não sabe qual é a sua.
 *
 * E a primeira correção disto ainda estava errada: o nivelamento entrava direto
 * em Teoria, sem perguntar nada, porque o gerador de exercícios só cobre
 * Teoria. Quem chegou pelo violino respondia sobre armadura de clave.
 *
 * POR QUE DOIS NÍVEIS DE MONTAGEM
 * -------------------------------
 * Os casos de **presença** sobem a tela inteira pelo roteador de verdade — é a
 * única forma de provar que o nivelamento está montado onde se diz que está.
 * Os casos de **percurso** montam o componente direto, com semente fixa: errar
 * de propósito duas vezes no mesmo capítulo exige saber qual é a resposta
 * certa, e a semente é o que torna isso reproduzível.
 *
 * Em nenhum dos dois há serviço de mentira: os livretos e os módulos são os do
 * acervo, e as questões são as mesmas que a tela mostra.
 */

const SEMENTE = 4242;
const TEORIA = LIVRETOS_PADRAO.find((l) => l.cursoId === 'crs_teoria_fundamentos')!;

let MODULOS: AcademyModule[] = [];

beforeEach(async () => {
  localStorage.clear();
  vi.restoreAllMocks();
  if (MODULOS.length === 0) {
    const cursos = await academyService.getCourses();
    MODULOS = (await Promise.all(cursos.map((c) => academyService.getModules(c.id)))).flat();
  }
});

// ---------------------------------------------------------------------------
// Presença: a tela de verdade, pelo roteador de verdade
// ---------------------------------------------------------------------------

const abrirLicoes = async () => {
  window.location.hash = '#/practice';
  render(
    <RouterProvider>
      <AppRouterOutlet />
    </RouterProvider>
  );

  await screen.findByRole('tab', { name: /Feed/ }, { timeout: 40000 });
  const user = userEvent.setup();
  await user.click(screen.getByRole('tab', { name: /Lições/ }));
  return user;
};

describe('🔴 o visitante escolhe a CADEIRA antes de qualquer pergunta', () => {
  it('a aba de Lições abre no seletor, com as cadeiras de verdade', async () => {
    await abrirLicoes();

    const escolha = await screen.findByRole(
      'region',
      { name: 'Escolha da cadeira para nivelamento' },
      { timeout: 40000 }
    );

    expect(escolha.textContent).toMatch(/Que cadeira você quer nivelar/i);

    /** As três cadeiras do Conservatório, nomeadas com o Grêmio de cada uma. */
    for (const nome of ['Teoria da Música', 'História da Música', 'Violino']) {
      expect(
        within(escolha).getByRole('heading', { name: nome }),
        `"${nome}" não aparece no seletor`
      ).toBeInTheDocument();
    }
  });

  it('🔴 cada trilha anuncia capítulos e questões MEDIDOS do livreto', async () => {
    await abrirLicoes();

    const escolha = await screen.findByRole(
      'region',
      { name: 'Escolha da cadeira para nivelamento' },
      { timeout: 40000 }
    );

    for (const l of LIVRETOS_PADRAO) {
      const questoes = l.capitulos.reduce((n, c) => n + c.questoes.length, 0);
      expect(
        within(escolha).getByText(`${l.capitulos.length} capítulos · ${questoes} questões`),
        `"${l.titulo}" não anuncia a contagem medida`
      ).toBeInTheDocument();
    }
  });

  it('História aparece com as TRÊS trilhas separadas', async () => {
    /**
     * Os três cursos de História não são sequência um do outro. Fundi-los
     * colocaria quem sabe música brasileira a responder sobre a ocidental.
     */
    await abrirLicoes();
    const escolha = await screen.findByRole(
      'region',
      { name: 'Escolha da cadeira para nivelamento' },
      { timeout: 40000 }
    );

    const historia = within(escolha).getByRole('heading', { name: 'História da Música' })
      .parentElement!.parentElement!;

    const trilhas = within(historia)
      .getAllByRole('button')
      .filter((b) => /capítulos ·/.test(b.textContent ?? ''));

    expect(trilhas.length, 'História não foi separada em três trilhas').toBe(3);
  });

  it('a estrutura continua visível — o nivelamento não é pedágio', async () => {
    const user = await abrirLicoes();

    const escolha = await screen.findByRole(
      'region',
      { name: 'Escolha da cadeira para nivelamento' },
      { timeout: 40000 }
    );
    expect(
      within(escolha).getByRole('button', { name: /veja a estrutura inteira/i })
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Disponíveis para você' })).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.getAllByRole('article').length).toBeGreaterThan(0));

    await user.click(within(escolha).getAllByRole('button', { name: /capítulos ·/ })[0]);

    expect(
      screen.getByRole('region', { name: 'Disponíveis para você' }),
      'começar o teste escondeu a estrutura'
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Percurso: componente direto, semente fixa, dados reais
// ---------------------------------------------------------------------------

const montar = () => {
  const abertas: string[] = [];
  render(
    <NivelamentoDoVisitante
      livretos={LIVRETOS_PADRAO}
      modulos={MODULOS}
      semente={SEMENTE}
      onEntrar={() => abertas.push('/auth/login')}
      onAbrir={(r) => abertas.push(r)}
      onVerEstrutura={() => {}}
    />
  );
  return { user: userEvent.setup(), abertas };
};

/** Abre a trilha de Teoria a partir do seletor. */
async function abrirTeoria(user: ReturnType<typeof userEvent.setup>) {
  const escolha = screen.getByRole('region', { name: 'Escolha da cadeira para nivelamento' });
  const botao = within(escolha)
    .getAllByRole('button')
    .find((b) => (b.textContent ?? '').includes(TEORIA.titulo))!;
  await user.click(botao);
}

/** O texto da alternativa certa e de uma errada, pelo mesmo domínio da tela. */
function alternativas(errosAntes: number) {
  let e = iniciarNivelamento(TEORIA, ChairId.TEORIA, SEMENTE);
  for (let i = 0; i < errosAntes; i++) e = responderNivelamento(e, false);

  const q = questaoAtual(e)!;
  return {
    certo: q.choices.find((c) => c.id === q.resposta)!.texto,
    errado: q.choices.find((c) => c.id !== q.resposta)!.texto,
    explicacao: q.explanation,
  };
}

async function responder(user: ReturnType<typeof userEvent.setup>, texto: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(escapar(texto)) }));
  await user.click(screen.getByRole('button', { name: 'Conferir' }));
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('🔴 dá para TROCAR de cadeira e FECHAR a qualquer momento', () => {
  it('"Trocar de cadeira" volta ao seletor no meio do teste', async () => {
    /**
     * Um teste do qual só se sai respondendo até o fim é um teste que as
     * pessoas abandonam fechando a aba — e aí não se sabe sequer que tentaram.
     */
    const { user } = montar();
    await abrirTeoria(user);

    expect(screen.getByRole('region', { name: 'Nivelamento' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Trocar de cadeira/ }));

    expect(
      screen.getByRole('region', { name: 'Escolha da cadeira para nivelamento' }),
      'trocar de cadeira não voltou ao seletor'
    ).toBeInTheDocument();
  });

  it('depois de trocar, dá para começar OUTRA trilha', async () => {
    const { user } = montar();
    await abrirTeoria(user);
    await user.click(screen.getByRole('button', { name: /Trocar de cadeira/ }));

    const escolha = screen.getByRole('region', { name: 'Escolha da cadeira para nivelamento' });
    const violino = within(escolha)
      .getAllByRole('button')
      .find((b) => (b.textContent ?? '').includes('Violino'))!;

    await user.click(violino);

    const nivelamento = screen.getByRole('region', { name: 'Nivelamento' });
    expect(nivelamento.textContent, 'a trilha não mudou ao trocar de cadeira').toMatch(/Violino/i);
  });

  it('a troca no meio DESCARTA o progresso da anterior — e recomeça do zero', async () => {
    const { user } = montar();
    await abrirTeoria(user);

    await responder(user, alternativas(0).certo);
    await user.click(screen.getByRole('button', { name: /Continuar/ }));

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).not.toBe('0');

    await user.click(screen.getByRole('button', { name: /Trocar de cadeira/ }));
    await abrirTeoria(user);

    expect(
      screen.getByRole('progressbar').getAttribute('aria-valuenow'),
      'a trilha reaberta manteve progresso de antes'
    ).toBe('0');
  });

  it('🔴 "Encerrar" dá um resultado que fala em PISO, e não em entrada', async () => {
    /**
     * Quem parou sem errar não tem ponto de entrada medido. Dizer "você entra
     * aqui" afirmaria o que o teste não apurou.
     */
    const { user } = montar();
    await abrirTeoria(user);

    await responder(user, alternativas(0).certo);
    await user.click(screen.getByRole('button', { name: /Continuar/ }));

    await user.click(screen.getByRole('button', { name: /Encerrar e ver o resultado/ }));

    const resultado = screen.getByRole('region', { name: 'Resultado do nivelamento' });
    expect(resultado.textContent).toMatch(/sem errar/i);
    expect(resultado.textContent).toMatch(/piso/i);
    expect(
      within(resultado).queryByRole('button', { name: /Abrir este módulo/ }),
      'apontou módulo para quem não errou'
    ).toBeNull();
  });

  it('do resultado dá para nivelar outra cadeira, ou refazer a mesma', async () => {
    const { user } = montar();
    await abrirTeoria(user);
    await user.click(screen.getByRole('button', { name: /Encerrar e ver o resultado/ }));

    const resultado = screen.getByRole('region', { name: 'Resultado do nivelamento' });
    expect(within(resultado).getByRole('button', { name: /Refazer esta/ })).toBeInTheDocument();

    await user.click(within(resultado).getByRole('button', { name: /Nivelar outra cadeira/ }));

    expect(
      screen.getByRole('region', { name: 'Escolha da cadeira para nivelamento' })
    ).toBeInTheDocument();
  });
});

describe('a questão é respondível, e não aceita resposta em branco', () => {
  it('tem enunciado, alternativas, capítulo nomeado e barra em zero', async () => {
    const { user } = montar();
    await abrirTeoria(user);

    const nivelamento = screen.getByRole('region', { name: 'Nivelamento' });

    expect(
      within(nivelamento).getByRole('progressbar').getAttribute('aria-valuenow'),
      'a barra já começa preenchida'
    ).toBe('0');

    /** O capítulo é nomeado: quem responde sabe sobre o que está respondendo. */
    expect(nivelamento.textContent).toMatch(/cap\.\s*1/);

    const alts = within(nivelamento)
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-pressed') !== null);
    expect(alts.length).toBeGreaterThan(1);

    expect(
      (within(nivelamento).getByRole('button', { name: 'Conferir' }) as HTMLButtonElement).disabled,
      'dá para conferir sem responder'
    ).toBe(true);
  });

  it('a explicação aparece nos dois vereditos — é a parte que ensina', async () => {
    const { user } = montar();
    await abrirTeoria(user);

    const { errado, explicacao } = alternativas(0);
    await responder(user, errado);

    const veredito = screen.getByRole('status');
    expect(veredito.textContent).toContain('Não é essa');
    expect(veredito.textContent, 'errou e não recebeu explicação').toContain(explicacao);
  });
});

describe('🔴 errar uma vez não encerra — e a segunda chance é DITA', () => {
  it('o erro abre confirmação do MESMO capítulo, com o aviso escrito', async () => {
    const { user } = montar();
    await abrirTeoria(user);

    await responder(user, alternativas(0).errado);
    await user.click(screen.getByRole('button', { name: /Continuar/ }));

    expect(
      screen.queryByRole('region', { name: 'Resultado do nivelamento' }),
      'um erro só encerrou o nivelamento'
    ).toBeNull();

    expect(
      screen.getByText(/para confirmar/i).textContent,
      'a confirmação não avisa que esta decide'
    ).toMatch(/dois seguidos/i);

    /** E a barra não andou: é o mesmo capítulo. */
    expect(
      screen.getByRole('progressbar').getAttribute('aria-valuenow'),
      'a confirmação fez a barra andar'
    ).toBe('0');
  });

  it('acertar a confirmação SEGUE em frente', async () => {
    const { user } = montar();
    await abrirTeoria(user);

    await responder(user, alternativas(0).errado);
    await user.click(screen.getByRole('button', { name: /Continuar/ }));

    await responder(user, alternativas(1).certo);
    expect(screen.getByRole('status').textContent).toContain('Certo');
    await user.click(screen.getByRole('button', { name: /Continuar/ }));

    expect(
      screen.queryByRole('region', { name: 'Resultado do nivelamento' }),
      'quem se recuperou foi reprovado assim mesmo'
    ).toBeNull();
    expect(screen.queryByText(/para confirmar/i), 'continuou em modo de confirmação').toBeNull();
  });
});

describe('🔴 o resultado aponta para um MÓDULO QUE EXISTE', () => {
  async function ateOResultado(user: ReturnType<typeof userEvent.setup>) {
    await abrirTeoria(user);
    await responder(user, alternativas(0).errado);
    await user.click(screen.getByRole('button', { name: /Continuar/ }));
    await responder(user, alternativas(1).errado);
    await user.click(screen.getByRole('button', { name: /Continuar/ }));
    return screen.findByRole('region', { name: 'Resultado do nivelamento' });
  }

  it('o capítulo anunciado casa com um módulo real do curso certo', async () => {
    const { user } = montar();
    const resultado = await ateOResultado(user);

    const capitulo = Number((resultado.textContent ?? '').match(/cap[íi]tulo (\d+)/i)?.[1]);
    expect(Number.isFinite(capitulo), 'o resultado não nomeia capítulo nenhum').toBe(true);

    const modulo = MODULOS.find(
      (m) => m.courseId === TEORIA.cursoId && m.order === capitulo
    );
    expect(modulo, `o capítulo ${capitulo} não tem módulo no acervo`).toBeDefined();
    expect(resultado.textContent, 'o título mostrado não é o do acervo').toContain(modulo!.title);
  });

  it('🔴 o botão do módulo leva à rota que EXISTE na tabela', async () => {
    /**
     * `/academia/module/:id` compilava e não estava na tabela — foi assim que
     * o artigo deixou de abrir. A rota de módulo pede o curso também.
     */
    const { user, abertas } = montar();
    const resultado = await ateOResultado(user);

    await user.click(within(resultado).getByRole('button', { name: /Abrir este módulo/ }));

    expect(abertas.length, 'o botão não navegou para lugar nenhum').toBe(1);
    expect(abertas[0]).toMatch(/^\/academia\/course\/[^/]+\/module\/[^/]+$/);

    const [, , , cursoId, , moduloId] = abertas[0].split('/');
    const modulo = MODULOS.find((m) => m.id === moduloId);
    expect(modulo, 'a rota aponta para um módulo que não existe').toBeDefined();
    expect(modulo!.courseId, 'a rota casa o módulo com outro curso').toBe(cursoId);
  });

  it('o resultado diz que cobre só esta trilha', async () => {
    const { user } = montar();
    const resultado = await ateOResultado(user);

    expect(resultado.textContent).toContain(TEORIA.titulo);
    expect(resultado.textContent, 'não avisa que as outras cadeiras têm nivelamento próprio').toMatch(
      /nivelamento próprio/i
    );
  });

  it('quem caiu no primeiro não aparece com capítulo nenhum de pé', async () => {
    const { user } = montar();
    const resultado = await ateOResultado(user);

    const dePe = within(resultado).getByText('Capítulos de pé').parentElement;
    expect(dePe?.textContent, 'contou como dominado o que derrubou').toMatch(/Capítulos de pé0/);
  });

  it('entrar guarda o resultado, e é botão de verdade', async () => {
    const { user, abertas } = montar();
    const resultado = await ateOResultado(user);

    await user.click(within(resultado).getByRole('button', { name: /Entrar para guardar/ }));
    expect(abertas).toContain('/auth/login');
  });
});
