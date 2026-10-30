import { describe, it, expect, afterEach } from 'vitest';
import {
  checkerInventory,
  clearInjectedSources,
  injectSources,
} from '../scripts/qa/core.mjs';
import * as fluxo from '../scripts/qa/flow.mjs';
import * as seguranca from '../scripts/qa/security.mjs';
import * as texto from '../scripts/qa/text.mjs';

/**
 * Todo verificador precisa ter sido visto acusando.
 *
 * O PROBLEMA
 * ----------
 * "Passou" só significa alguma coisa se o verificador **consegue** falhar. Eu
 * provava isso à mão — reintroduzia o defeito, via a acusação, desfazia — e
 * não deixava prova. Quarenta e um dos quarenta e três estavam assim: verdes,
 * e sem ninguém nunca ter visto um deles acusar.
 *
 * Três já nasceram vazios neste repositório. `checkDevToolInProduction` não
 * pegava o caso que o motivou. Duas regex viraram BACKSPACE ao passar por
 * heredoc e nunca casaram com nada — compilavam, rodavam, e devolviam lista
 * vazia para sempre.
 *
 * COMO ESTA PROVA FUNCIONA
 * ------------------------
 * Injeta um arquivo com o defeito e exige que o verificador o encontre. Não é
 * "o verificador devolve um array": é **o verificador vê o que existe para ser
 * visto**. Verificar o nome em vez do conteúdo foi exatamente o erro que
 * levou a camada editorial a se declarar completa procurando a string
 * `'LICAO'` num arquivo.
 */

interface Prova {
  nome: string;
  rodar: () => { file: string; detail?: string }[];
  defeito: { file: string; content: string };
}

const PROVAS: Prova[] = [
  {
    nome: 'checkFabricatedData',
    rodar: fluxo.checkFabricatedData,
    defeito: {
      file: 'src/ui/screens/x/XScreen.tsx',
      content: `const autor = 'Clara Schumann';`,
    },
  },
  {
    nome: 'checkDeadButton',
    rodar: fluxo.checkDeadButton,
    defeito: {
      file: 'src/ui/screens/x/YScreen.tsx',
      content: `export const Y = () => <button onClick={() => alert('faria isso')}>Ir</button>;`,
    },
  },
  {
    nome: 'checkInflatedAggregate',
    rodar: fluxo.checkInflatedAggregate,
    defeito: {
      file: 'src/services/application/x.service.ts',
      content: `const totalMinutes = lista.reduce((a, b) => a + b, 0) + 125;`,
    },
  },
  {
    nome: 'checkHardcodedMetric',
    rodar: fluxo.checkHardcodedMetric,
    defeito: {
      file: 'src/ui/screens/x/ZScreen.tsx',
      content: `export const Z = () => <p className="text-2xl">8.920</p>;`,
    },
  },
  {
    nome: 'checkDataInsideScreen',
    rodar: fluxo.checkDataInsideScreen,
    defeito: {
      file: 'src/ui/screens/x/WScreen.tsx',
      content: [
        `const resultados = [`,
        `  { id: 'a', title: 'Sonata', link: '/x/1', context: 'Atlas' },`,
        `  { id: 'b', title: 'Fuga', link: '/x/2', context: 'Atlas' },`,
        `];`,
      ].join('\n'),
    },
  },
  {
    nome: 'checkRetiredVocabulary',
    rodar: fluxo.checkRetiredVocabulary,
    defeito: {
      file: 'src/domain/x.ts',
      content: `export const triboId = 'x';`,
    },
  },
  {
    nome: 'checkDegreeClaims',
    rodar: fluxo.checkDegreeClaims,
    defeito: {
      file: 'src/ui/screens/x/VScreen.tsx',
      content: `const texto = 'Diploma reconhecido pelo MEC';`,
    },
  },
  {
    nome: 'checkPersonalSectionWithoutSession',
    rodar: fluxo.checkPersonalSectionWithoutSession,
    defeito: {
      file: 'src/ui/screens/academy/UScreen.tsx',
      content: `export const U = () => <h2>Seu progresso</h2>;`,
    },
  },
  {
    nome: 'checkRecordOwnership',
    rodar: seguranca.checkRecordOwnership,
    defeito: {
      file: 'src/services/application/y.service.ts',
      content: `  public async getThing(id: string): Promise<AssessmentSubmission | null> { return null; }`,
    },
  },
  {
    nome: 'checkNoGuessableAdminRoute',
    rodar: seguranca.checkNoGuessableAdminRoute,
    defeito: {
      file: 'src/ui/navigation/x.ts',
      content: `const rota = '/admin/users';`,
    },
  },
  {
    nome: 'checkTechnicalNameInUi',
    rodar: seguranca.checkTechnicalNameInUi,
    defeito: {
      file: 'src/ui/components/x/Menu.tsx',
      content: `const item = { label: 'Academy' };`,
    },
  },
  {
    nome: 'checkPerUserFilter',
    rodar: seguranca.checkPerUserFilter,
    defeito: {
      file: 'src/repositories/x.repository.ts',
      content: [
        `export class R {`,
        `  public async listProgress(userId: string): Promise<unknown[]> {`,
        `    const all = this.storage.get(this.STORAGE_KEYS.PROGRESS) || [];`,
        `    return all;`,
        `  }`,
        `}`,
      ].join('\n'),
    },
  },
  {
    nome: 'checkSuccessWithoutEffect',
    rodar: fluxo.checkSuccessWithoutEffect,
    defeito: {
      file: 'src/ui/screens/x/AScreen.tsx',
      /**
       * A indentação importa: o verificador fecha o corpo em `\n  };`, que é
       * como um manipulador dentro de um componente aparece. Fixture no nível
       * zero não casava — e isso é limite dele, anotado em `72_QUALITY_SWEEP`.
       */
      content: [
        `export const A = () => {`,
        `  const handleSalvar = () => {`,
        `    setIsSaved(true);`,
        `    setTimeout(() => setIsSaved(false), 3000);`,
        `  };`,
        `};`,
      ].join('\n'),
    },
  },
  {
    nome: 'checkComingSoonPromise',
    rodar: fluxo.checkComingSoonPromise,
    defeito: {
      file: 'src/ui/screens/x/BScreen.tsx',
      content: `const aviso = 'Esta funcionalidade estará disponível em breve';`,
    },
  },
  {
    nome: 'checkAccessibleName',
    rodar: fluxo.checkAccessibleName,
    defeito: {
      file: 'src/ui/components/x/C.tsx',
      content: `export const C = () => <button type="button"><Icone /></button>;`,
    },
  },
  {
    nome: 'checkKeyboardReach',
    rodar: fluxo.checkKeyboardReach,
    defeito: {
      file: 'src/ui/components/x/D.tsx',
      content: `export const D = () => <div onClick={() => abrir()}>Abrir</div>;`,
    },
  },
  {
    nome: 'checkNavigationTargets',
    rodar: fluxo.checkNavigationTargets,
    defeito: {
      file: 'src/ui/screens/x/EScreen.tsx',
      content: `const ir = () => navigate('/rota-que-nao-existe-em-lugar-nenhum');`,
    },
  },
  {
    nome: 'checkConsoleLeak',
    rodar: seguranca.checkConsoleLeak,
    defeito: {
      file: 'src/services/application/z.service.ts',
      content: `console.log('sessao do aluno', session.user.email);`,
    },
  },
  {
    nome: 'checkAdminAuthority',
    rodar: seguranca.checkAdminAuthority,
    defeito: {
      file: 'src/ui/screens/x/FScreen.tsx',
      content: `const dono = 'fundadora@gmail.com';`,
    },
  },
  {
    nome: 'checkHtmlInjection',
    rodar: seguranca.checkHtmlInjection,
    defeito: {
      file: 'src/ui/components/x/G.tsx',
      content: `export const G = () => <div dangerouslySetInnerHTML={{ __html: texto }} />;`,
    },
  },
  {
    nome: 'checkEnglishLeakInSentence',
    rodar: texto.checkEnglishLeakInSentence,
    defeito: {
      file: 'src/ui/components/x/Frase.tsx',
      content: `export const F = () => <p>Sair e perder o progress</p>;`,
    },
  },
];

afterEach(() => clearInjectedSources());

describe('cada verificador acusa o defeito que o motivou', () => {
  for (const prova of PROVAS) {
    it(prova.nome, () => {
      const antes = prova.rodar().length;

      injectSources([prova.defeito]);
      const depois = prova.rodar();

      expect(
        depois.length,
        `${prova.nome} não viu o defeito injetado em ${prova.defeito.file}`
      ).toBeGreaterThan(antes);

      expect(
        depois.some((f) => f.file === prova.defeito.file),
        `${prova.nome} acusou, mas não o arquivo do defeito`
      ).toBe(true);
    });
  }
});

describe('nenhum verificador fica esquecido', () => {
  it('todo verificador está ligado ao pente fino', () => {
    /**
     * Verificação que ninguém roda é pior que verificação ausente: ela dá a
     * impressão de cobertura que não existe.
     */
    const soltos = checkerInventory().filter((c) => !c.ligado && !/^checker/.test(c.nome));
    expect(soltos.map((c) => c.nome), 'não estão em scripts/qa.mjs').toEqual([]);
  });

  it('o inventário enxerga os verificadores de verdade', () => {
    // Se o inventário viesse vazio, as duas regras acima passariam sem medir.
    expect(checkerInventory().length).toBeGreaterThan(30);
  });

  it('a lista de provas cobre os verificadores de conteúdo', () => {
    /**
     * Não são todos: alguns leem arquivo fixo — a tabela da economia, o
     * outlet, a tabela de audiência — e não passam pela injeção. Esses estão
     * provados nos seus próprios testes, e o que se cobra aqui é que a lista
     * não encolha sem alguém reparar.
     */
    expect(PROVAS.length).toBeGreaterThanOrEqual(21);
  });
});
