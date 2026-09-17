import { EntityId, ISOTimestamp } from './types';

/**
 * COMMERCIAL & BILLING DOMAIN
 * Subscriptions, plans, quotas, purchases, and access grants.
 */

export enum PlanTier {
  GRATUITO = 'GRATUITO',
  PRO_MUSICO = 'PRO_MUSICO',
  PROFESSOR_CATEDRA = 'PROFESSOR_CATEDRA',
  INSTITUCIONAL_CONSERVATORIO = 'INSTITUCIONAL_CONSERVATORIO',
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
  LIFETIME = 'LIFETIME',
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PurchaseItemType {
  COURSE_ENROLLMENT = 'COURSE_ENROLLMENT',
  SHEET_MUSIC_EDITION = 'SHEET_MUSIC_EDITION',
  MASTERCLASS_PASS = 'MASTERCLASS_PASS',
  SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
  DIPLOMA_ISSUANCE = 'DIPLOMA_ISSUANCE',
}

export enum PurchaseStatus {
  PENDING = 'PENDING',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface SubscriptionPlan {
  id: EntityId;
  slug: string;
  name: string;
  tier: PlanTier;
  priceBrlCents: number;
  billingPeriod: BillingPeriod;
  featureCapabilities: string[];
  maxActiveRooms: number;
  maxCloudStorageMb: number;
  unlimitedScores: boolean;
  unlimitedDawTracks: boolean;
  isPublic: boolean;
  createdAt: ISOTimestamp;
}

export interface UserCommercialEntitlement {
  id: EntityId;
  userId: EntityId;
  planId?: EntityId;
  featureKey: string;
  maxQuota: number; // e.g. 10 (or -1 for unlimited)
  currentUsage: number;
  validFrom: ISOTimestamp;
  validUntil?: ISOTimestamp;
  isActive: boolean;
}

export interface UserSubscription {
  id: EntityId;
  userId: EntityId;
  planId: EntityId;
  gatewaySubscriptionId?: string;
  status: SubscriptionStatus;
  startedAt: ISOTimestamp;
  currentPeriodStart: ISOTimestamp;
  currentPeriodEnd: ISOTimestamp;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: ISOTimestamp;
}

export interface CommercialPurchase {
  id: EntityId;
  userId: EntityId;
  itemType: PurchaseItemType;
  itemId: EntityId;
  itemTitle: string;
  amountCents: number;
  currency: 'BRL' | 'USD' | 'EUR';
  paymentMethod: 'CREDIT_CARD' | 'PIX' | 'BOLETO' | 'OAUTH_PASS';
  gatewayTransactionId?: string;
  status: PurchaseStatus;
  timestamp: ISOTimestamp;
}

export interface FeatureAccessGrant {
  id: EntityId;
  userId: EntityId;
  featureKey: string;
  isAllowed: boolean;
  grantReason: 'PLAN_ENTITLEMENT' | 'ADMIN_OVERRIDE' | 'TRIAL_PERIOD' | 'PROMO_CODE';
  expiresAt?: ISOTimestamp;
}
