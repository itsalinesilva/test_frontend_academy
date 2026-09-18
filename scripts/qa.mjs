/**
 * Pente fino — `npm run qa`.
 *
 * Um comando, um relatório, e nenhuma afirmação de qualidade que não venha de
 * uma verificação que acabou de rodar.
 *
 * COMO LER O RELATÓRIO
 * --------------------
 *   FALHA  o produto está errado agora; sai com código diferente de zero
 *   AVISO  o produto tem defeito real, mas não impede publicar hoje
 *   ok     a propriedade foi verificada e passou
 *
 * "ok" quer dizer que *aquela* verificação passou. Não quer dizer que a tela
 * está boa. O que nenhuma verificação alcança está escrito em
 * `docs/harness/72_PENTE_FINO_QUALIDADE.md`, na seção "o que isto não cobre" — e está
 * aberto em `CLAUDE_TODO.md` até alguém fechar.
 *
 * Uso:  node scripts/qa.mjs [--json] [--so-falhas]
 */
import { execFileSync } from 'node:child_process';
import { GRAVIDADE as G, relatar, imprimir } from './qa/nucleo.mjs';
import { checarTexto, checarMarkdownDoConteudo } from './qa/texto.mjs';
import {
  checarColisaoDeChaves,
  checarFiltroPorUsuario,
  checarConteudoNaoApagaAluno,
  checarAutoridadeDeAdmin,
  checarVazamentoNoConsole,
  checarInjecaoDeHtml,
  checarEncerramentoDeSessao,
} from './qa/seguranca.mjs';
import {
  checarDestinosDeNavegacao,
  checarPromessaDeTitulacao,
  checarRessalvaDeCursoLivre,
  checarDadoFabricado,
  checarRepertorioLivre,
  checarBotaoFalso,
  checarSucessoSemEfeito,
  checarDadosDentroDaTela,
  checarPromessaDeEmBreve,
  checarNomeAcessivel,
  checarRotuloDeCampo,
  checarTextoAlternativo,
  checarAlcancePorTeclado,
} from './qa/fluxo.mjs';

/** A auditoria de rotas já existia; entra aqui em vez de virar comando à parte. */
function checarRotas() {
  const r = JSON.parse(
    execFileSync('node', ['scripts/auditar-rotas.mjs', '--json'], { encoding: 'utf-8' })
  );
  return {
    orfas: r.orfas.map((n) => ({ arquivo: n, detalhe: 'tela existe e nenhuma rota a abre' })),
    vazando: r.vazando.map((n) => ({
      arquivo: n,
      detalhe: 'promete ao visitante o que só o aluno tem',
    })),
    total: r.rotas.length,
    telas: r.telas.length,
    distinguem: r.telas.filter((t) => t.cheсaSessao).length,
  };
}

const texto = checarTexto();
const rotas = checarRotas();

const SECOES = [
  {
    titulo: 'SEGURANÇA — dado de um aluno não aparece para outro',
    checagens: [
      relatar('leitura de dado de aluno filtra por usuário', checarFiltroPorUsuario(), G.BLOQUEIA),
      relatar('nenhuma chave de armazenamento colide', checarColisaoDeChaves(), G.BLOQUEIA),
      relatar('publicar conteúdo não apaga dado do aluno', checarConteudoNaoApagaAluno(), G.BLOQUEIA),
      relatar('privilégio de admin não é decidido no cliente', checarAutoridadeDeAdmin(), G.BLOQUEIA),
      relatar('nenhum dado pessoal vai ao console', checarVazamentoNoConsole(), G.BLOQUEIA),
      relatar('nenhuma injeção de HTML sem sanitização', checarInjecaoDeHtml(), G.BLOQUEIA),
      relatar('encerrar sessão apaga a sessão local', checarEncerramentoDeSessao(), G.BLOQUEIA),
    ],
  },
  {
    titulo: 'NEGÓCIO — a plataforma não promete o que não entrega',
    checagens: [
      relatar('nenhuma promessa de titulação reconhecida', checarPromessaDeTitulacao(), G.BLOQUEIA),
      relatar('a ressalva de curso livre está escrita', checarRessalvaDeCursoLivre(), G.BLOQUEIA),
      relatar('nenhum dado fabricado no catálogo', checarDadoFabricado(), G.BLOQUEIA),
      relatar('nenhum botão falso', checarBotaoFalso(), G.BLOQUEIA),
      relatar('nenhum sucesso anunciado sem efeito', checarSucessoSemEfeito(), G.BLOQUEIA),
      relatar('nenhum conjunto de dados escrito na tela', checarDadosDentroDaTela(), G.BLOQUEIA),
      relatar('nada prometido para "em breve"', checarPromessaDeEmBreve(), G.CORRIGIR),
      relatar('todo o repertório é de domínio público', checarRepertorioLivre(), G.CORRIGIR),
    ],
  },
  {
    titulo: 'ROTAS E FLUXO — todo caminho chega a algum lugar',
    checagens: [
      relatar('nenhuma tela órfã', rotas.orfas, G.BLOQUEIA),
      relatar('nenhuma tela vaza conteúdo de logado', rotas.vazando, G.BLOQUEIA),
      relatar('todo destino de navegação existe', checarDestinosDeNavegacao(), G.BLOQUEIA),
    ],
  },
  {
    titulo: 'TEXTO — o que o aluno lê está escrito certo',
    checagens: [
      relatar('nenhuma codificação corrompida', texto.mojibake, G.BLOQUEIA),
      relatar('nenhuma marca de trabalho inacabado', texto.inacabado, G.BLOQUEIA),
      relatar('nenhum markdown quebrado no conteúdo', checarMarkdownDoConteudo(), G.BLOQUEIA),
      relatar('ortografia: acentuação', texto.ortografia, G.CORRIGIR),
      relatar('pontuação e espaçamento', texto.pontuacao, G.CORRIGIR),
      relatar('nenhum inglês na interface em português', texto.ingles, G.CORRIGIR),
    ],
  },
  {
    titulo: 'USABILIDADE — a interface é operável por quem não usa mouse nem enxerga',
    checagens: [
      relatar('todo botão tem nome acessível', checarNomeAcessivel(), G.CORRIGIR),
      relatar('todo campo tem rótulo', checarRotuloDeCampo(), G.CORRIGIR),
      relatar('toda imagem tem alt', checarTextoAlternativo(), G.CORRIGIR),
      relatar('todo clicável alcançável pelo teclado', checarAlcancePorTeclado(), G.CORRIGIR),
    ],
  },
];

const todas = SECOES.flatMap((s) => s.checagens);

if (process.argv.includes('--json')) {
  console.log(
    JSON.stringify(
      {
        rotas: rotas.total,
        telas: rotas.telas,
        telasQueDistinguemVisitante: rotas.distinguem,
        checagens: todas.map((c) => ({
          nome: c.nome,
          gravidade: c.gravidade,
          achados: c.achados.length,
          detalhes: c.achados,
        })),
      },
      null,
      2
    )
  );
  process.exitCode = 0;
} else {
  const soFalhas = process.argv.includes('--so-falhas');
  console.log('');
  for (const secao of SECOES) {
    const visiveis = soFalhas ? secao.checagens.filter((c) => c.achados.length) : secao.checagens;
    if (!visiveis.length) continue;
    console.log(secao.titulo);
    console.log(imprimir(visiveis).texto.split('\n').slice(0, -2).join('\n'));
    console.log('');
  }

  const { bloqueios, correcoes } = imprimir(todas);
  console.log('---');
  console.log(`rotas ${rotas.total} · telas ${rotas.telas} · distinguem visitante ${rotas.distinguem}`);
  console.log(`bloqueios ${bloqueios} · a corrigir ${correcoes}`);
  console.log('não coberto por máquina: docs/harness/72_PENTE_FINO_QUALIDADE.md');
  process.exitCode = bloqueios > 0 ? 1 : 0;
}
