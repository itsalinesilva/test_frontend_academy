import { EntityId, ISOTimestamp } from './types';

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  INTERACTION = 'interaction',
  TOOL_USAGE = 'tool_usage',
  LESSON_PROGRESS = 'lesson_progress',
  ERROR_ENCOUNTERED = 'error_encountered',
}

export interface AnalyticsEvent {
  id: EntityId;
  type: AnalyticsEventType;
  userId?: EntityId;
  name: string;
  properties: Record<string, unknown>;
  timestamp: ISOTimestamp;
}
