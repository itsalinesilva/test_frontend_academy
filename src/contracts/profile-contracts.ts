import {
  Evidence,
  EvidenceSource,
  ArtifactType,
  PortfolioItemCategory,
  ProfileSectionConfig,
  ProfileOfficialLink,
  UnifiedProfileRecord,
  VisibilityLevel,
} from '../domain/profile';
import { EntityId, ISOTimestamp } from '../domain/types';

/**
 * Contract for receiving evidence produced by Academy, Practice, Studio, Rooms, and Community engines.
 * (Docs 08 & 30)
 */
export interface IngestEvidenceRequest {
  userId: EntityId;
  source: EvidenceSource;
  sourceEntityId: EntityId;
  title: string;
  description: string;
  artifactType: ArtifactType;
  artifactUrl: string;
  skills?: string[];
  instruments?: string[];
  evaluator?: {
    id: EntityId;
    name: string;
    title: string;
    decision: 'aprovado' | 'aprovado_com_louvor' | 'revisar';
    feedbackNotes?: string;
  };
  metadata?: Record<string, any>;
  visibility?: VisibilityLevel;
}

export interface IngestEvidenceResponse {
  evidence: Evidence;
  integrityHash: string;
  registeredAt: ISOTimestamp;
}

/**
 * Publishing and managing portfolio items (Doc 08)
 */
export interface PublishPortfolioItemRequest {
  title: string;
  category: PortfolioItemCategory;
  context: string;
  objective: string;
  userRoleInProject: string;
  skills: string[];
  instruments: string[];
  workReferences?: string;
  processNotes?: string;
  resultSummary?: string;
  evidenceIds: EntityId[];
  artifactUrl?: string;
  audioPreviewUrl?: string;
  visibility: VisibilityLevel;
  isFeatured?: boolean;
}

export interface UpdatePortfolioItemRequest extends Partial<PublishPortfolioItemRequest> {
  id: EntityId;
  orderIndex?: number;
}

/**
 * Reordering and Visibility of Profile Lenses/Sections
 */
export interface UpdateProfileSectionsConfigRequest {
  sections: ProfileSectionConfig[];
}

/**
 * Profile Header & Official Links update
 */
export interface UpdateProfileHeaderRequest {
  displayName: string;
  title: string;
  headline: string;
  biography: string;
  avatarUrl?: string;
  instruments: string[];
  musicalInterests: string[];
  experienceLevel: 'iniciante' | 'intermediario' | 'avancado' | 'conservatorio';
  officialLinks: ProfileOfficialLink[];
  overallVisibility: VisibilityLevel;
  specialties?: string[];
  location?: string;
  currentStatus?: string;
  capabilities?: string[];
}

/**
 * Server-approved public projection.
 * Never send private fields to the frontend (Docs 30 & 54).
 */
export interface PublicProfileProjectionResponse {
  isPublicView: true;
  profile: UnifiedProfileRecord;
}

/**
 * Full owner profile representation with editorial tools.
 */
export interface OwnerProfileResponse {
  isPublicView: false;
  profile: UnifiedProfileRecord;
  availableEvidences: Evidence[];
}
