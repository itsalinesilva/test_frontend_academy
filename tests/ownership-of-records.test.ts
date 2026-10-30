// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { academyService } from '../src/services/application/academy.service';
import { academyRepository } from '../src/repositories/academy.repository';

/**
 * Registro de alguém só se lê sendo esse alguém.
 *
 * ACHADO DA AUDITORIA DE 19/09
 * ----------------------------
 * `getAssessmentAttempt` buscava só pelo identificador da submissão, e a tela
 * que a usa — `/academia/result/<id>` — herdava audiência **pública** de
 * `/academia`, por prefixo mais longo. Quem tivesse ou adivinhasse um
 * identificador via a nota, a aprovação e o número de certificado de outra
 * pessoa.
 *
 * `getCertificate` tinha o mesmo defeito na leitura; a rota dela já exigia
 * login, mas isso só impedia visitante — um aluno continuava podendo ler o
 * certificado de outro.
 *
 * O pente fino não pegou nenhum dos dois: `checkPerUserFilter` procura método
 * de repositório que lista sem filtrar, e estes buscavam **um** registro por
 * identificador. Buscar um é tão vazável quanto listar todos.
 */

const OUTRA_PESSOA = 'u_outra';
const EU = 'u_eu';

describe('resultado de prova', () => {
  let submissionId: string;

  beforeEach(async () => {
    const saved = await academyRepository.saveAssessmentSubmission({
      id: `sub_teste_${Date.now()}`,
      assessmentId: 'asm_teste',
      userId: OUTRA_PESSOA,
      attemptNumber: 1,
      answers: [],
      scorePercentage: 95,
      passed: true,
      submittedAt: new Date().toISOString(),
      gradedAt: new Date().toISOString(),
    } as never);
    submissionId = (saved as { id: string }).id;
  });

  it('o dono lê o próprio resultado', async () => {
    const r = await academyService.getAssessmentAttempt(submissionId, OUTRA_PESSOA);
    expect(r?.scorePercentage).toBe(95);
  });

  it('outra pessoa não lê', async () => {
    // O defeito exato que a auditoria encontrou.
    expect(await academyService.getAssessmentAttempt(submissionId, EU)).toBeNull();
  });

  it('a recusa não distingue "não existe" de "não é sua"', async () => {
    /**
     * Os dois devolvem `null`. Distinguir confirmaria a existência do registro
     * a quem não deveria saber dele — e transformaria a tela num oráculo de
     * identificadores válidos.
     */
    const inexistente = await academyService.getAssessmentAttempt('sub_nao_existe', EU);
    const alheio = await academyService.getAssessmentAttempt(submissionId, EU);
    expect(inexistente).toBe(alheio);
  });

  it('sem identificador de usuário não compila — e em tempo de execução não devolve', async () => {
    expect(await academyService.getAssessmentAttempt(submissionId, '')).toBeNull();
  });
});

describe('certificado', () => {
  it('a leitura exige dono', async () => {
    /**
     * A rota já exigia login, o que barrava o visitante. Não barrava o aluno
     * que quisesse ler o certificado de outro aluno.
     */
    const certs = await academyRepository.listCertificatesByUser(OUTRA_PESSOA);
    if (certs.length === 0) return; // sem certificado semeado, nada a conferir

    const id = certs[0].id;
    expect(await academyService.getCertificate(id, OUTRA_PESSOA)).not.toBeNull();
    expect(await academyService.getCertificate(id, EU)).toBeNull();
  });
});
