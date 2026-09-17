import { EntityId, ISOTimestamp, UserRole } from './types';

export enum EntitlementId {
  ACADEMY_CORE = 'entitlement.academy.core',
  STUDIO_PRO = 'entitlement.studio.pro',
  ROOM_TEACHER = 'entitlement.room.teacher',
  KIDS_SAFETY = 'entitlement.kids.safety',
  ADMIN_GOVERNANCE = 'entitlement.admin.governance',
}

export enum EntitlementStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export interface UserEntitlement {
  id: EntityId;
  userId: EntityId;
  entitlementId: EntitlementId;
  status: EntitlementStatus;
  tier: 'free_institutional';
  grantedAt: ISOTimestamp;
  expiresAt?: ISOTimestamp;
  description: string;
}

export interface EntitlementMetadata {
  id: EntitlementId;
  name: string;
  description: string;
  targetRoles: UserRole[];
  features: string[];
}

export const ENTITLEMENT_DEFINITIONS: Record<EntitlementId, EntitlementMetadata> = {
  [EntitlementId.ACADEMY_CORE]: {
    id: EntitlementId.ACADEMY_CORE,
    name: 'Acesso Curricular Canônico',
    description: 'Acesso completo à grade de cursos, exercícios práticos, Community, Profile e Atlas dos Mundos.',
    targetRoles: [UserRole.ALUNO, UserRole.MUSICO, UserRole.PROFESSOR, UserRole.CRIANCA, UserRole.ADMIN],
    features: ['Grade de Teoria & Harmonia', 'Exercícios e Avaliações', 'Atlas dos Mundos', 'Comunidade Acadêmica'],
  },
  [EntitlementId.STUDIO_PRO]: {
    id: EntitlementId.STUDIO_PRO,
    name: 'Estúdio de Criação & Notação Completa',
    description: 'DAW multitrack de alta fidelidade, mixer de stems e editor canônico de partituras.',
    targetRoles: [UserRole.MUSICO, UserRole.PROFESSOR, UserRole.ADMIN],
    features: ['DAW Multitrack Completo', 'Mixer de Stems', 'Editor de Partituras (Score)', 'Exportação MusicXML / MIDI'],
  },
  [EntitlementId.ROOM_TEACHER]: {
    id: EntitlementId.ROOM_TEACHER,
    name: 'Cátedra & Gestão de Salas Acadêmicas',
    description: 'Capacidade de criar e gerenciar Rooms, emitir pareceres pedagógicos e atribuir tarefas semanais.',
    targetRoles: [UserRole.PROFESSOR, UserRole.ADMIN],
    features: ['Criação de Salas de Aula', 'Atribuição de Tarefas', 'Correção de Gravações', 'Chat de Turma Supervisionado'],
  },
  [EntitlementId.KIDS_SAFETY]: {
    id: EntitlementId.KIDS_SAFETY,
    name: 'Camada Pedagógica Kids & Tutela Parental',
    description: 'Interface adaptada para iniciação musical infantil com supervisão parental estrita.',
    targetRoles: [UserRole.CRIANCA],
    features: ['Interface Lúdica sem Distrações', 'Perfil Privado por Padrão', 'Sem Mensagens Diretas (No DM)', 'Supervisão por Responsável Legal'],
  },
  [EntitlementId.ADMIN_GOVERNANCE]: {
    id: EntitlementId.ADMIN_GOVERNANCE,
    name: 'Governança & Auditoria Institucional',
    description: 'Acesso irrestrito ao Console Administrativo, trilha de auditoria e moderação.',
    targetRoles: [UserRole.ADMIN],
    features: ['Console de Administração', 'Trilha de Auditoria Imutável', 'Gestão de Usuários & Papéis', 'Moderação de Conteúdo'],
  },
};
