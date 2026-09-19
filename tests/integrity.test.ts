import { describe, it, expect } from 'vitest';
import {
  canonicalJson,
  sha256Hex,
  computeEvidenceHash,
  verifyEvidenceIntegrity,
  EvidenciaHashavel,
} from '../src/domain/integrity';

const base: EvidenciaHashavel = {
  userId: 'usr_1',
  source: 'ACADEMY',
  sourceEntityId: 'course_1',
  title: 'Fuga a quatro vozes sobre tema próprio',
  description: 'Entrega final da cátedra de contraponto.',
  artifactType: 'score',
  artifactUrl: 'https://exemplo.org/fuga.musicxml',
  skills: ['contraponto', 'fuga'],
  instruments: ['Cravo'],
  evaluator: { name: 'Banca de Contraponto', decision: 'APROVADO' },
  createdAt: '2026-03-01T12:00:00.000Z',
};

/**
 * Regressão P-07.
 *
 * O `sha256Hash` das evidências e dos certificados era
 * `Math.random()` com o texto "sha256:" na frente. Não derivava do conteúdo,
 * não detectava adulteração, e a interface o anunciava como "prova matemática
 * de integridade". Estes casos fixam as três propriedades que um hash de
 * integridade precisa ter — e que o valor anterior não tinha nenhuma.
 */
describe('Integridade criptográfica de evidências (regressão P-07)', () => {
  it('produz um SHA-256 hexadecimal de 64 caracteres', async () => {
    const hash = await computeEvidenceHash(base);
    expect(hash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('é DETERMINÍSTICO: o mesmo conteúdo dá sempre o mesmo hash', async () => {
    // A versão anterior falhava aqui — dois cálculos do mesmo registro
    // devolviam valores diferentes, porque vinham de Math.random().
    const a = await computeEvidenceHash(base);
    const b = await computeEvidenceHash({ ...base });
    expect(a).toBe(b);
  });

  it('independe da ordem em que as propriedades foram escritas', async () => {
    const reordenado: EvidenciaHashavel = {
      createdAt: base.createdAt,
      evaluator: base.evaluator,
      instruments: base.instruments,
      skills: base.skills,
      artifactUrl: base.artifactUrl,
      artifactType: base.artifactType,
      description: base.description,
      title: base.title,
      sourceEntityId: base.sourceEntityId,
      source: base.source,
      userId: base.userId,
    };
    expect(await computeEvidenceHash(reordenado)).toBe(await computeEvidenceHash(base));
  });

  it('independe da ordem de competências e instrumentos', async () => {
    const trocado = { ...base, skills: ['fuga', 'contraponto'] };
    expect(await computeEvidenceHash(trocado)).toBe(await computeEvidenceHash(base));
  });

  it('MUDA quando o conteúdo muda', async () => {
    const original = await computeEvidenceHash(base);
    expect(await computeEvidenceHash({ ...base, title: 'Outra obra' })).not.toBe(original);
    expect(await computeEvidenceHash({ ...base, userId: 'usr_2' })).not.toBe(original);
    expect(
      await computeEvidenceHash({
        ...base,
        evaluator: { name: 'Banca de Contraponto', decision: 'REPROVADO' },
      })
    ).not.toBe(original);
  });

  it('verifica como VÁLIDA uma evidência íntegra', async () => {
    const sha256Hash = await computeEvidenceHash(base);
    expect(await verifyEvidenceIntegrity({ ...base, sha256Hash })).toBe('valida');
  });

  it('detecta ADULTERAÇÃO quando o conteúdo muda após a emissão', async () => {
    const sha256Hash = await computeEvidenceHash(base);
    const adulterada = { ...base, sha256Hash, evaluator: { name: 'Banca', decision: 'APROVADO' } };
    expect(await verifyEvidenceIntegrity(adulterada)).toBe('adulterada');
  });

  it('marca como NÃO VERIFICÁVEL o formato antigo, em vez de aprovar ou acusar', async () => {
    // Exatamente o que a implementação antiga gerava.
    const antigo = `sha256:${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;
    expect(await verifyEvidenceIntegrity({ ...base, sha256Hash: antigo })).toBe('nao_verificavel');
  });

  it('a visibilidade não entra no hash: torná-la privada não é adulterar', async () => {
    const sha256Hash = await computeEvidenceHash(base);
    const comVisibilidade = { ...base, sha256Hash, visibility: 'private' };
    expect(await verifyEvidenceIntegrity(comVisibilidade)).toBe('valida');
  });
});

describe('Serialização canônica', () => {
  it('ordena chaves em toda a profundidade', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('preserva a ordem de arrays, que é significativa', () => {
    expect(canonicalJson([3, 1, 2])).toBe('[3,1,2]');
  });

  it('descarta undefined e normaliza null', () => {
    expect(canonicalJson({ a: undefined, b: null })).toBe('{"b":null}');
  });

  it('confere com um vetor conhecido de SHA-256', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });
});
