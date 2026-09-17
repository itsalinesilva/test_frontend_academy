import { AnalyticsEvent, AnalyticsEventType } from '../../domain/analytics';
import { logger } from '../logging/logger';

export interface AnalyticsDispatcher {
  dispatch(event: AnalyticsEvent): Promise<void>;
}

export class ConsoleAnalyticsDispatcher implements AnalyticsDispatcher {
  public async dispatch(event: AnalyticsEvent): Promise<void> {
    logger.debug(`[Analytics] ${event.type}: ${event.name}`, 'AnalyticsService', event.properties);
  }
}

export class AnalyticsService {
  private dispatchers: AnalyticsDispatcher[] = [new ConsoleAnalyticsDispatcher()];
  private userId?: string;

  public setUserId(userId?: string): void {
    this.userId = userId;
  }

  public registerDispatcher(dispatcher: AnalyticsDispatcher): void {
    this.dispatchers.push(dispatcher);
  }

  public async track(
    type: AnalyticsEventType,
    name: string,
    properties: Record<string, unknown> = {}
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: crypto.randomUUID ? crypto.randomUUID() : `event_${Date.now()}_${Math.random()}`,
      type,
      userId: this.userId,
      name,
      properties,
      timestamp: new Date().toISOString(),
    };

    await Promise.allSettled(this.dispatchers.map((d) => d.dispatch(event)));
  }

  public trackPageView(pageName: string, properties: Record<string, unknown> = {}): Promise<void> {
    return this.track(AnalyticsEventType.PAGE_VIEW, `view_${pageName}`, { pageName, ...properties });
  }

  public trackInteraction(action: string, target: string, properties: Record<string, unknown> = {}): Promise<void> {
    return this.track(AnalyticsEventType.INTERACTION, action, { target, ...properties });
  }

  public trackToolUsage(toolId: string, durationMs: number, status: string): Promise<void> {
    return this.track(AnalyticsEventType.TOOL_USAGE, `tool_${toolId}`, { toolId, durationMs, status });
  }
}

export const analyticsService = new AnalyticsService();
