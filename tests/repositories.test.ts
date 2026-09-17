import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentUserRepository } from '../src/repositories/user.repository';
import { PersistentCourseRepository } from '../src/repositories/course.repository';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import { UserRole } from '../src/domain/types';

describe('Persistent Repositories & Seeds', () => {
  let userRepo: PersistentUserRepository;
  let courseRepo: PersistentCourseRepository;

  beforeEach(() => {
    const memStorage = new MemoryStorageAdapter();
    userRepo = new PersistentUserRepository(memStorage);
    courseRepo = new PersistentCourseRepository(memStorage);
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
   * NOTA DE CORREÇÃO DE TESTE — este caso exigia que a proveniência do curso
   * citasse "University of Edinburgh". Era a citação de fonte externa
   * transformada em requisito. A plataforma transmite conteúdo autoral e não
   * menciona obra de referência alguma, então a asserção foi invertida.
   */
  it('NÃO expõe citação de fonte externa nos cursos publicados', async () => {
    const courses = await courseRepo.listPublishedCourses();
    expect(courses.length).toBeGreaterThan(0);

    const serializado = JSON.stringify(courses);
    for (const proibido of ['Edinburgh', 'Grout', 'IMSLP', 'Bohumil', 'Piston', 'Kostka']) {
      expect(serializado).not.toContain(proibido);
    }
  });

  it('persiste e recupera progresso do usuário no curso', async () => {
    const progress = await courseRepo.saveUserProgress({
      userId: 'usr_test_1',
      courseId: 'crs_fomt_01',
      enrolledAt: new Date().toISOString(),
      completedLessonIds: ['les_fomt_101_1'],
      progressPercentage: 25,
    });
    expect(progress.progressPercentage).toBe(25);

    const retrieved = await courseRepo.getUserProgress('usr_test_1', 'crs_fomt_01');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.completedLessonIds).toContain('les_fomt_101_1');
    expect(retrieved?.progressPercentage).toBe(25);
  });
});
