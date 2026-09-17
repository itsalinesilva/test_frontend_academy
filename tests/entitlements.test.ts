import { describe, it, expect } from 'vitest';
import { entitlementService } from '../src/infrastructure/entitlements/entitlement-service';
import { User, UserRole, UserCapability } from '../src/domain/types';
import { FOUNDER_ADMIN_EMAILS } from '../src/domain/capabilities';

describe('Entitlements & Capabilities Service', () => {
  it('concede capabilities totais aos e-mails fundadores independentemente do primaryRole', () => {
    const founderUser: User = {
      id: 'usr_founder_test',
      email: FOUNDER_ADMIN_EMAILS[0],
      name: 'Aline Silva',
      primaryRole: UserRole.ALUNO, // Mesmo que o primaryRole seja aluno, o e-mail de fundadora concede autoridade máxima
      assignedRoles: [UserRole.ALUNO],
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const caps = entitlementService.getEffectiveCapabilities(founderUser);
    expect(caps).toContain(UserCapability.ACCESS_ADMIN_CONSOLE);
    expect(caps).toContain(UserCapability.MANAGE_USERS);
    expect(caps).toContain(UserCapability.CREATE_ROOM);
    expect(entitlementService.isAdministrator(founderUser)).toBe(true);
  });

  it('restringe criação de salas para usuários com papel ALUNO comum', () => {
    const studentUser: User = {
      id: 'usr_student_test',
      email: 'aluno.regular@escola.br',
      name: 'Aluno Regular',
      primaryRole: UserRole.ALUNO,
      assignedRoles: [UserRole.ALUNO],
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(entitlementService.hasCapability(studentUser, UserCapability.CREATE_ROOM)).toBe(false);
    expect(entitlementService.hasCapability(studentUser, UserCapability.ACCESS_ADMIN_CONSOLE)).toBe(false);
    expect(entitlementService.hasCapability(studentUser, UserCapability.ENROLL_COURSE)).toBe(true);
    expect(entitlementService.hasCapability(studentUser, UserCapability.USE_TUNER)).toBe(true);
  });

  it('permite criação de salas para usuários com papel PROFESSOR', () => {
    const teacherUser: User = {
      id: 'usr_teacher_test',
      email: 'professor.mestre@conservatorio.br',
      name: 'Professor Mestre',
      primaryRole: UserRole.PROFESSOR,
      assignedRoles: [UserRole.PROFESSOR],
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(entitlementService.hasCapability(teacherUser, UserCapability.CREATE_ROOM)).toBe(true);
    expect(entitlementService.hasCapability(teacherUser, UserCapability.ASSIGN_EXERCISE)).toBe(true);
    expect(entitlementService.hasCapability(teacherUser, UserCapability.ACCESS_ADMIN_CONSOLE)).toBe(false);
  });
});
