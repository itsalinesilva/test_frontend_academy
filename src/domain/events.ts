import { EntityId, ISOTimestamp } from './types';

export interface DomainEvent<TPayload = unknown> {
  id: EntityId;
  name: string;
  aggregateId: EntityId;
  aggregateType: string;
  occurredAt: ISOTimestamp;
  version: number;
  payload: TPayload;
}

export interface LessonCompletedPayload {
  userId: EntityId;
  courseId: EntityId;
  lessonId: EntityId;
  durationSeconds: number;
}

export interface PracticeAttemptCompletedPayload {
  sessionId: EntityId;
  userId: EntityId;
  toolType: string;
  tempoBpm: number;
  accuracyScore: number;
  durationSeconds: number;
}

export interface CourseEnrolledPayload {
  userId: EntityId;
  courseId: EntityId;
}
