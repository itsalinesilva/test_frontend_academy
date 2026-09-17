import { EntityId, ISOTimestamp } from './types';
import { VisibilityScope } from './identity';

/**
 * COMMUNITY DOMAIN
 * Forums, musicological topics, discussions, connections, institutional events, rooms, and memberships.
 */

export enum ForumCategory {
  ANALYSIS = 'ANALYSIS',
  HARMONY = 'HARMONY',
  REPERTOIRE = 'REPERTOIRE',
  INSTRUMENTS = 'INSTRUMENTS',
  PEDAGOGY = 'PEDAGOGY',
  LOUNGE = 'LOUNGE',
}

export enum TopicStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  LOCKED = 'LOCKED',
  ARCHIVED = 'ARCHIVED',
}

export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  BLOCKED = 'BLOCKED',
}

export enum ConnectionType {
  PEER = 'PEER',
  CHAMBER_PARTNER = 'CHAMBER_PARTNER',
  MENTOR_STUDENT = 'MENTOR_STUDENT',
  COLLEAGUE = 'COLLEAGUE',
}

export enum EventType {
  MASTERCLASS = 'MASTERCLASS',
  RECITAL = 'RECITAL',
  WORKSHOP = 'WORKSHOP',
  EXAM_BOARD = 'EXAM_BOARD',
  LECTURE = 'LECTURE',
}

export enum RoomType {
  REGULAR_CLASS = 'REGULAR_CLASS',
  MASTERCLASS_SERIES = 'MASTERCLASS_SERIES',
  CHAMBER_ENSEMBLE = 'CHAMBER_ENSEMBLE',
  THEORY_WORKSHOP = 'THEORY_WORKSHOP',
}

export enum RoomMembershipRole {
  OWNER = 'OWNER',
  TEACHER = 'TEACHER',
  TEACHING_ASSISTANT = 'TEACHING_ASSISTANT',
  STUDENT = 'STUDENT',
  GUEST_AUDITOR = 'GUEST_AUDITOR',
}

export interface ForumSection {
  id: EntityId;
  slug: string;
  name: string;
  description: string;
  category: ForumCategory;
  icon: string;
  topicCount: number;
  postCount: number;
  isRestricted: boolean;
  createdAt: ISOTimestamp;
}

export interface ForumTopic {
  id: EntityId;
  forumId: EntityId;
  authorId: EntityId;
  authorName: string;
  authorAvatarUrl?: string;
  title: string;
  slug: string;
  isPinned: boolean;
  isLocked: boolean;
  isAnnouncement: boolean;
  status: TopicStatus;
  viewCount: number;
  replyCount: number;
  tags: string[];
  lastActivityAt: ISOTimestamp;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDeleted: boolean;
  deletedAt?: ISOTimestamp;
}

export interface ForumPost {
  id: EntityId;
  topicId: EntityId;
  authorId: EntityId;
  authorName: string;
  authorAvatarUrl?: string;
  contentMarkdown: string;
  attachments: {
    type: 'score' | 'audio' | 'image' | 'link';
    url: string;
    label: string;
  }[];
  upvoteCount: number;
  downvoteCount: number;
  isAcceptedSolution: boolean;
  isHiddenByModeration: boolean;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDeleted: boolean;
  deletedAt?: ISOTimestamp;
}

export interface PostComment {
  id: EntityId;
  postId: EntityId;
  authorId: EntityId;
  authorName: string;
  parentCommentId?: EntityId;
  content: string;
  upvoteCount: number;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface PeerConnection {
  id: EntityId;
  requesterId: EntityId;
  addresseeId: EntityId;
  status: ConnectionStatus;
  relationshipType: ConnectionType;
  mutualInterests: string[];
  requestedAt: ISOTimestamp;
  respondedAt?: ISOTimestamp;
}

export interface CommunityEvent {
  id: EntityId;
  hostId: EntityId;
  hostName: string;
  title: string;
  description: string;
  type: EventType;
  scheduledStartTime: ISOTimestamp;
  scheduledEndTime: ISOTimestamp;
  meetingUrl?: string;
  maxAttendees?: number;
  attendeeCount: number;
  isPublic: boolean;
  visibility: VisibilityScope;
  status: 'SCHEDULED' | 'LIVE' | 'CONCLUDED' | 'CANCELLED';
  repertoireRef?: EntityId;
  createdAt: ISOTimestamp;
}

export interface CommunityRoom {
  id: EntityId;
  ownerTeacherId: EntityId;
  ownerTeacherName: string;
  name: string;
  slug: string;
  description: string;
  type: RoomType;
  capacity?: number;
  isPrivate: boolean;
  enrollmentKey?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

export interface RoomMembershipRecord {
  id: EntityId;
  roomId: EntityId;
  userId: EntityId;
  userName: string;
  role: RoomMembershipRole;
  joinedAt: ISOTimestamp;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'EXPELLED';
}
