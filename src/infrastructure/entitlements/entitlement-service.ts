import { User, UserRole, UserCapability } from '../../domain/types';
import { ROLE_CAPABILITIES_MAP } from '../../domain/capabilities';
import { EntitlementId, EntitlementStatus, UserEntitlement, ENTITLEMENT_DEFINITIONS } from '../../domain/entitlements';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors';

export interface ResourceOwnershipContext {
  resourceOwnerId: string;
  isResourcePublic?: boolean;
}

export class EntitlementService {
  /**
   * Resolves active entitlements for a user.
   * In this foundational phase, all entitled features remain completely free
   * with zero paywalls.
   */
  public getEffectiveEntitlements(user: User | null): UserEntitlement[] {
    if (!user) return [];

    // O papel ADMIN só existe em `assignedRoles` porque o servidor o concedeu.
    const isFounder = user.assignedRoles.includes(UserRole.ADMIN);
    const roles = isFounder
      ? [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MUSICO, UserRole.ALUNO]
      : [user.primaryRole, ...(user.assignedRoles || [])];

    const entitlements: UserEntitlement[] = [];

    // Core academy is granted to all accounts
    entitlements.push({
      id: `ent_core_${user.id}`,
      userId: user.id,
      entitlementId: EntitlementId.ACADEMY_CORE,
      status: EntitlementStatus.ACTIVE,
      tier: 'free_institutional',
      grantedAt: user.createdAt,
      description: ENTITLEMENT_DEFINITIONS[EntitlementId.ACADEMY_CORE].description,
    });

    // Músico or Professor or Admin has Studio Pro
    if (roles.includes(UserRole.MUSICO) || roles.includes(UserRole.PROFESSOR) || roles.includes(UserRole.ADMIN)) {
      entitlements.push({
        id: `ent_studio_${user.id}`,
        userId: user.id,
        entitlementId: EntitlementId.STUDIO_PRO,
        status: EntitlementStatus.ACTIVE,
        tier: 'free_institutional',
        grantedAt: user.createdAt,
        description: ENTITLEMENT_DEFINITIONS[EntitlementId.STUDIO_PRO].description,
      });
    }

    // Professor or Admin has Room Teacher management
    if (roles.includes(UserRole.PROFESSOR) || roles.includes(UserRole.ADMIN)) {
      entitlements.push({
        id: `ent_room_${user.id}`,
        userId: user.id,
        entitlementId: EntitlementId.ROOM_TEACHER,
        status: EntitlementStatus.ACTIVE,
        tier: 'free_institutional',
        grantedAt: user.createdAt,
        description: ENTITLEMENT_DEFINITIONS[EntitlementId.ROOM_TEACHER].description,
      });
    }

    // Criança has Kids safety suite
    if (roles.includes(UserRole.CRIANCA)) {
      entitlements.push({
        id: `ent_kids_${user.id}`,
        userId: user.id,
        entitlementId: EntitlementId.KIDS_SAFETY,
        status: EntitlementStatus.ACTIVE,
        tier: 'free_institutional',
        grantedAt: user.createdAt,
        description: ENTITLEMENT_DEFINITIONS[EntitlementId.KIDS_SAFETY].description,
      });
    }

    // Admin has Governance
    if (roles.includes(UserRole.ADMIN) || isFounder) {
      entitlements.push({
        id: `ent_admin_${user.id}`,
        userId: user.id,
        entitlementId: EntitlementId.ADMIN_GOVERNANCE,
        status: EntitlementStatus.ACTIVE,
        tier: 'free_institutional',
        grantedAt: user.createdAt,
        description: ENTITLEMENT_DEFINITIONS[EntitlementId.ADMIN_GOVERNANCE].description,
      });
    }

    return entitlements;
  }

  public hasEntitlement(user: User | null, entitlementId: EntitlementId): boolean {
    if (!user) return false;
    const list = this.getEffectiveEntitlements(user);
    return list.some((e) => e.entitlementId === entitlementId && e.status === EntitlementStatus.ACTIVE);
  }

  public assertEntitlement(user: User | null, entitlementId: EntitlementId): void {
    if (!user) {
      throw new UnauthorizedError('Usuário não autenticado.');
    }
    if (!this.hasEntitlement(user, entitlementId)) {
      throw new ForbiddenError(`Habilitação ausente: ${entitlementId}`);
    }
  }

  /**
   * Resolves the effective capabilities for a user.
   * Ensures founder emails automatically receive ADMIN capabilities.
   */
  public getEffectiveCapabilities(user: User | null): UserCapability[] {
    if (!user) {
      return [];
    }

    // Server-side enforcement of founder admin privileges
    if (user.assignedRoles.includes(UserRole.ADMIN)) {
      return Object.values(UserCapability);
    }

    const caps = new Set<UserCapability>();
    const roles = [user.primaryRole, ...(user.assignedRoles || [])];

    roles.forEach((role) => {
      const roleCaps = ROLE_CAPABILITIES_MAP[role] || [];
      roleCaps.forEach((c) => caps.add(c));
    });

    return Array.from(caps);
  }

  public hasCapability(user: User | null, capability: UserCapability): boolean {
    if (!user) return false;
    const effective = this.getEffectiveCapabilities(user);
    return effective.includes(capability);
  }

  public assertCapability(user: User | null, capability: UserCapability): void {
    if (!user) {
      throw new UnauthorizedError('Usuário não autenticado.');
    }
    if (!this.hasCapability(user, capability)) {
      throw new ForbiddenError(`Privilégio ausente: ${capability}`);
    }
  }

  public canAccessResource(
    user: User | null,
    requiredCapability: UserCapability,
    ownership?: ResourceOwnershipContext
  ): boolean {
    if (!user) return false;

    // Founder admins have broad audit/governance access
    if (user.assignedRoles.includes(UserRole.ADMIN)) return true;

    if (!this.hasCapability(user, requiredCapability)) return false;

    if (ownership) {
      if (ownership.isResourcePublic) return true;
      return ownership.resourceOwnerId === user.id;
    }

    return true;
  }

  public assertResourceAccess(
    user: User | null,
    requiredCapability: UserCapability,
    ownership?: ResourceOwnershipContext
  ): void {
    if (!user) {
      throw new UnauthorizedError('Usuário não autenticado.');
    }
    if (!this.canAccessResource(user, requiredCapability, ownership)) {
      throw new ForbiddenError('Acesso negado ao recurso especificado.');
    }
  }

  public isAdministrator(user: User | null): boolean {
    if (!user) return false;
    if (user.assignedRoles.includes(UserRole.ADMIN)) return true;
    return user.primaryRole === UserRole.ADMIN || user.assignedRoles.includes(UserRole.ADMIN);
  }
}

export const entitlementService = new EntitlementService();
