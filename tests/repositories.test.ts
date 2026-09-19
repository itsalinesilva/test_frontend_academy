import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentUserRepository } from '../src/repositories/user.repository';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import { UserRole } from '../src/domain/types';

describe('Persistent Repositories & Seeds', () => {
  let userRepo: PersistentUserRepository;

  beforeEach(() => {
    const memStorage = new MemoryStorageAdapter();
    userRepo = new PersistentUserRepository(memStorage);
  });

  /**
   * NOTA DE CORREÇÃO DE TESTE — este caso afirmava "semeia automaticamente
   * os usuários fundadores com o papel ADMIN". Era a vulnerabilidade S-02
   * transformada em requisito: o repositório do cliente criava um
   * administrador só de ver um e-mail. A asserção foi invertida.
   */
  it('NÃO provisiona administrador a partir de e-mail (regressão S-02)', async () => {
    const found = await userRepo.findByEmail('office.alinesilva@gmail.com');
    expect(found).toBeNull();

    const all = await userRepo.listAll();
    expect(all).toHaveLength(0);
  });

  it('persiste o papel exatamente como recebido, sem coerção por e-mail', async () => {
    const saved = await userRepo.save({
      id: 'usr_x',
      email: 'office.alinesilva@gmail.com',
      name: 'Identidade Qualquer',
      primaryRole: UserRole.ALUNO,
      assignedRoles: [UserRole.ALUNO],
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(saved.primaryRole).toBe(UserRole.ALUNO);
    expect(saved.assignedRoles).not.toContain(UserRole.ADMIN);
  });

  /**
   * Os dois casos que ficavam aqui exercitavam `course.repository.ts`: um
   * catálogo fabricado, paralelo ao real, que NENHUMA tela consumia. Ele foi
   * apagado, e com ele a única razão de os casos existirem.
   *
   * O que eles cobriam de útil passou para arquivos onde o alvo é o catálogo
   * de verdade: a ausência de citação de fonte está em
   * `tests/integridade-do-academy.test.ts` e no verificador
   * `scripts/verify-no-citations.mjs`; o vaivém do progresso está em
   * `tests/persistencia-e-isolamento.test.ts`, contra o repositório que a
   * plataforma realmente usa.
   */
});
