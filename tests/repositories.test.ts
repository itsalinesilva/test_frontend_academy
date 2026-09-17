import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentUserRepository } from '../src/repositories/user.repository';
import { PersistentCourseRepository } from '../src/repositories/course.repository';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import { FOUNDER_ADMIN_EMAILS } from '../src/domain/capabilities';
import { UserRole } from '../src/domain/types';

describe('Persistent Repositories & Seeds', () => {
  let userRepo: PersistentUserRepository;
  let courseRepo: PersistentCourseRepository;

  beforeEach(() => {
    const memStorage = new MemoryStorageAdapter();
    userRepo = new PersistentUserRepository(memStorage);
    courseRepo = new PersistentCourseRepository(memStorage);
  });

  it('semeia automaticamente os usuários fundadores com o papel ADMIN', async () => {
    const founder = await userRepo.findByEmail(FOUNDER_ADMIN_EMAILS[0]);
    expect(founder).not.toBeNull();
    expect(founder?.primaryRole).toBe(UserRole.ADMIN);
    expect(founder?.email).toBe(FOUNDER_ADMIN_EMAILS[0]);
  });

  it('lista cursos publicados com dados rigorosos de proveniência intelectual', async () => {
    const courses = await courseRepo.listPublishedCourses();
    expect(courses.length).toBeGreaterThan(0);

    const first = courses[0];
    expect(first.provenance).toBeDefined();
    expect(first.provenance.source).toContain('University of Edinburgh');
    expect(first.provenance.citation).toBeDefined();
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
