import { describe, it, expect } from 'vitest';
import { entitlementService } from '../src/infrastructure/entitlements/entitlement-service';
import { User, UserRole, UserCapability } from '../src/domain/types';

/**
 * NOTA DE CORREÇÃO DE TESTE
 *
 * O primeiro teste deste arquivo afirmava:
 *   "concede capabilities totais aos e-mails fundadores independentemente
 *    do primaryRole"
 *
 * Ele testava — e portanto protegia — a vulnerabilidade S-02: o cliente
 * decidindo privilégio administrativo a partir de uma lista de e-mails
 * embutida no bundle. A asserção foi invertida deliberadamente: hoje o
 * e-mail NÃO concede nada, e o privilégio deriva do papel ADMIN, que só
 * entra em `assignedRoles` a partir da sessão assinada pelo servidor.
 *
 * Isto não é remoção de teste para obter build verde (regra do CLAUDE_TODO):
 * é a correção de um teste que asseverava o comportamento errado.
 */

function makeUser(overrides: Partial<User> & Pick<User, 'id' | 'email' | 'primaryRole' | 'assignedRoles'>): User {
  return {
    name: 'Usuário de Teste',
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('Entitlements & Capabilities Service', () => {
  it('NÃO concede privilégio administrativo com base no e-mail (regressão S-02)', () => {
    const impostor = makeUser({
      id: 'usr_impostor',
      // Mesmo usando um e-mail que antes era tratado como fundador,
      // sem o papel outorgado pelo servidor não há autoridade alguma.
      email: 'office.alinesilva@gmail.com',
      primaryRole: UserRole.ALUNO,
      assignedRoles: [UserRole.ALUNO],
    });

    const caps = entitlementService.getEffectiveCapabilities(impostor);
    expect(caps).not.toContain(UserCapability.ACCESS_ADMIN_CONSOLE);
    expect(caps).not.toContain(UserCapability.MANAGE_USERS);
    expect(entitlementService.isAdministrator(impostor)).toBe(false);
  });

  it('concede capacidades administrativas quando o papel ADMIN foi outorgado pelo servidor', () => {
    const admin = makeUser({
      id: 'usr_admin',
      email: 'qualquer.identidade@exemplo.org',
      primaryRole: UserRole.ADMIN,
      assignedRoles: [UserRole.ADMIN, UserRole.ALUNO],
    });

    const caps = entitlementService.getEffectiveCapabilities(admin);
    expect(caps).toContain(UserCapability.ACCESS_ADMIN_CONSOLE);
    expect(caps).toContain(UserCapability.MANAGE_USERS);
    expect(caps).toContain(UserCapability.CREATE_ROOM);
    expect(entitlementService.isAdministrator(admin)).toBe(true);
  });

  it('restringe criação de salas para usuários com papel ALUNO comum', () => {
    const student = makeUser({
      id: 'usr_student_test',
      email: 'aluno.regular@escola.br',
      primaryRole: UserRole.ALUNO,
      assignedRoles: [UserRole.ALUNO],
    });

    expect(entitlementService.hasCapability(student, UserCapability.CREATE_ROOM)).toBe(false);
    expect(entitlementService.hasCapability(student, UserCapability.ACCESS_ADMIN_CONSOLE)).toBe(false);
    expect(entitlementService.hasCapability(student, UserCapability.ENROLL_COURSE)).toBe(true);
    expect(entitlementService.hasCapability(student, UserCapability.USE_TUNER)).toBe(true);
  });

  it('permite criação de salas para usuários com papel PROFESSOR', () => {
    const teacher = makeUser({
      id: 'usr_teacher_test',
      email: 'professor.mestre@conservatorio.br',
      primaryRole: UserRole.PROFESSOR,
      assignedRoles: [UserRole.PROFESSOR],
    });

    expect(entitlementService.hasCapability(teacher, UserCapability.CREATE_ROOM)).toBe(true);
    expect(entitlementService.hasCapability(teacher, UserCapability.ASSIGN_EXERCISE)).toBe(true);
    expect(entitlementService.hasCapability(teacher, UserCapability.ACCESS_ADMIN_CONSOLE)).toBe(false);
  });
});
