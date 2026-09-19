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
 * `docs/harness/72_QUALITY_SWEEP.md`, na seção "o que isto não cobre" — e está
 * aberto em `CLAUDE_TODO.md` até alguém fechar.
 *
 * Uso:  node scripts/qa.mjs [--json] [--so-falhas]
 */
import { execFileSync } from 'node:child_process';
import { SEVERITY as G, report, printReport } from './qa/core.mjs';
import { checkText, checkContentMarkdown } from './qa/text.mjs';
import {
  checkKeyCollision,
  checkPerUserFilter,
  checkRecordOwnership,
  checkAdminScreensBehindAdminAudience,
  checkGuardCoversEveryAudience,
  checkPersonalRouteInheritingPublic,
  checkNoGuessableAdminRoute,
  checkTechnicalNameInUi,
  checkPublishKeepsStudentData,
  checkAdminAuthority,
  checkConsoleLeak,
  checkHtmlInjection,
  checkSessionTeardown,
  checkCommittedSecret,
} from './qa/security.mjs';
import {
  checkNavigationTargets,
  checkDegreeClaims,
  checkFreeCourseDisclaimer,
  checkFabricatedData,
  checkInflatedAggregate,
  checkHardcodedMetric,
  checkRetiredVocabulary,
  checkPersonalSectionWithoutSession,
  checkPublicDomainRepertoire,
  checkDeadButton,
  checkSuccessWithoutEffect,
  checkDataInsideScreen,
  checkDevToolInProduction,
  checkComingSoonPromise,
  checkAccessibleName,
  checkFieldLabel,
  checkAltText,
  checkKeyboardReach,
} from './qa/flow.mjs';
import {
  checkCountingSymbol,
  checkCountingVocabulary,
  checkValueOutsideTable,
  checkDivergentValue,
} from './qa/economy.mjs';

/** A auditoria de rotas já existia; entra aqui em vez de virar comando à parte. */
function checarRotas() {
  const r = JSON.parse(
    execFileSync('node', ['scripts/audit-routes.mjs', '--json'], { encoding: 'utf-8' })
  );
  return {
    orphans: r.orphans.map((n) => ({ file: n, detail: 'tela existe e nenhuma rota a abre' })),
    leaking: r.leaking.map((n) => ({
      file: n,
      detail: 'promete ao visitante o que só o aluno tem',
    })),
    total: r.routes.length,
    screens: r.screens.length,
    distinguishing: r.screens.filter((t) => t.cheсaSessao).length,
  };
}

const texto = checkText();
const routes = checarRotas();

const SECTIONS = [
  {
    heading: 'SEGURANÇA — dado de um aluno não aparece para outro',
    checks: [
      report('leitura de dado de aluno filtra por usuário', checkPerUserFilter(), G.BLOCKS),
      report('registro pessoal buscado por id confere o dono', checkRecordOwnership(), G.BLOCKS),
    ],
  },
  {
    heading: 'HIERARQUIA — visitante, aluno e administração ficam separados',
    checks: [
      report(
        'tela administrativa só abre em rota que exige administração',
        checkAdminScreensBehindAdminAudience(),
        G.BLOCKS
      ),
      report('a guarda trata todos os níveis de audiência', checkGuardCoversEveryAudience(), G.BLOCKS),
      report(
        'nenhuma rota pessoal vale como pública sem a tela saber quem pergunta',
        checkPersonalRouteInheritingPublic(),
        G.BLOCKS
      ),
      report('a rota administrativa não se chama pelo nome óbvio', checkNoGuessableAdminRoute(), G.BLOCKS),
    ],
  },
  {
    heading: 'ISOLAMENTO — o que é de um não chega ao outro',
    checks: [
      report('nenhuma chave de armazenamento colide', checkKeyCollision(), G.BLOCKS),
      report('publicar conteúdo não apaga dado do aluno', checkPublishKeepsStudentData(), G.BLOCKS),
      report('privilégio de admin não é decidido no cliente', checkAdminAuthority(), G.BLOCKS),
      report('nenhum dado pessoal vai ao console', checkConsoleLeak(), G.BLOCKS),
      report('nenhuma injeção de HTML sem sanitização', checkHtmlInjection(), G.BLOCKS),
      report('encerrar sessão apaga a sessão local', checkSessionTeardown(), G.BLOCKS),
      report('nenhum segredo de credencial versionado', checkCommittedSecret(), G.BLOCKS),
    ],
  },
  {
    heading: 'NEGÓCIO — a plataforma não promete o que não entrega',
    checks: [
      report('nenhuma promessa de titulação reconhecida', checkDegreeClaims(), G.BLOCKS),
      report('a ressalva de curso livre está escrita', checkFreeCourseDisclaimer(), G.BLOCKS),
      report('nenhum dado fabricado no catálogo', checkFabricatedData(), G.BLOCKS),
      report('nenhum agregado inflado nem ausência disfarçada', checkInflatedAggregate(), G.BLOCKS),
      report('nenhuma medida cravada na tela', checkHardcodedMetric(), G.BLOCKS),
      report('nenhuma palavra aposentada do vocabulário', checkRetiredVocabulary(), G.BLOCKS),
      report('nenhum botão falso', checkDeadButton(), G.BLOCKS),
      report('nenhum sucesso anunciado sem efeito', checkSuccessWithoutEffect(), G.BLOCKS),
      report('nenhum conjunto de dados escrito na tela', checkDataInsideScreen(), G.BLOCKS),
      report('nada prometido para "em breve"', checkComingSoonPromise(), G.FIX),
      report(
        'nenhuma ferramenta de desenvolvimento em produção',
        checkDevToolInProduction(),
        G.BLOCKS
      ),
      report('todo o repertório é de domínio público', checkPublicDomainRepertoire(), G.FIX),
    ],
  },
  {
    heading: 'ECONOMIA — a tabela de contagem e o código dizem a mesma coisa',
    checks: [
      report('todo símbolo afirmado na contagem existe', checkCountingSymbol(), G.BLOCKS),
      report('nenhum XP atribuído fora da tabela', checkValueOutsideTable(), G.BLOCKS),
      report('a tabela e as constantes dizem o mesmo número', checkDivergentValue(), G.BLOCKS),
      report('o vocabulário do Atlas está certo na contagem', checkCountingVocabulary(), G.FIX),
    ],
  },
  {
    heading: 'ROTAS E FLUXO — todo caminho chega a algum lugar',
    checks: [
      report('nenhuma tela órfã', routes.orphans, G.BLOCKS),
      report('nenhuma tela vaza conteúdo de logado', routes.leaking, G.BLOCKS),
      report(
        'nenhuma seção pessoal em tela que o visitante alcança',
        checkPersonalSectionWithoutSession(),
        G.BLOCKS
      ),
      report('todo destino de navegação existe', checkNavigationTargets(), G.BLOCKS),
    ],
  },
  {
    heading: 'TEXTO — o que o aluno lê está escrito certo',
    checks: [
      report('nenhuma codificação corrompida', texto.mojibake, G.BLOCKS),
      report('nenhuma marca de trabalho inacabado', texto.inacabado, G.BLOCKS),
      report('nenhum markdown quebrado no conteúdo', checkContentMarkdown(), G.BLOCKS),
      report('ortografia: acentuação', texto.ortografia, G.FIX),
      report('pontuação e espaçamento', texto.pontuacao, G.FIX),
      report('nenhum inglês na interface em português', texto.ingles, G.FIX),
      report('nenhum nome técnico vazando para a tela', checkTechnicalNameInUi(), G.FIX),
    ],
  },
  {
    heading: 'USABILIDADE — a interface é operável por quem não usa mouse nem enxerga',
    checks: [
      report('todo botão tem nome acessível', checkAccessibleName(), G.FIX),
      report('todo campo tem rótulo', checkFieldLabel(), G.FIX),
      report('toda imagem tem alt', checkAltText(), G.FIX),
      report('todo clicável alcançável pelo teclado', checkKeyboardReach(), G.FIX),
    ],
  },
];

const allChecks = SECTIONS.flatMap((s) => s.checks);

if (process.argv.includes('--json')) {
  console.log(
    JSON.stringify(
      {
        routes: routes.total,
        screens: routes.screens,
        screensDistinguishingVisitor: routes.distinguishing,
        checks: allChecks.map((c) => ({
          nome: c.nome,
          severity: c.severity,
          findings: c.findings.length,
          details: c.findings,
        })),
      },
      null,
      2
    )
  );
  process.exitCode = 0;
} else {
  const onlyFailures = process.argv.includes('--so-falhas');
  console.log('');
  for (const section of SECTIONS) {
    const visible = onlyFailures ? section.checks.filter((c) => c.findings.length) : section.checks;
    if (!visible.length) continue;
    console.log(section.heading);
    console.log(printReport(visible).texto.split('\n').slice(0, -2).join('\n'));
    console.log('');
  }

  const { blockers, fixables } = printReport(allChecks);
  console.log('---');
  console.log(`rotas ${routes.total} · telas ${routes.screens} · distinguem visitante ${routes.distinguishing}`);
  console.log(`bloqueios ${blockers} · a corrigir ${fixables}`);
  console.log('não coberto por máquina: docs/harness/72_QUALITY_SWEEP.md');
  process.exitCode = blockers > 0 ? 1 : 0;
}
