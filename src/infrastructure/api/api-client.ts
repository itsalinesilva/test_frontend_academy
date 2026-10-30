import { ApiResponse, ApiErrorResponse } from '../../contracts/api-types';
import {
  DomainError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../domain/errors';
import { logger } from '../logging/logger';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  skipAuth?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private defaultTimeoutMs: number;

  constructor(baseUrl = '/api/v1', defaultTimeoutMs = 10000) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  private async executeFetch<T>(
    endpoint: string,
    options: RequestInit,
    reqOptions?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(reqOptions?.headers || {}),
    };

    if (this.authToken && !reqOptions?.skipAuth) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, reqOptions?.timeoutMs ?? this.defaultTimeoutMs);

    try {
      logger.debug(`API Request: ${options.method || 'GET'} ${url}`, 'ApiClient');
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type');
      let responseBody: unknown = null;
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
      }

      if (!response.ok) {
        this.handleErrorResponse(response.status, responseBody);
      }

      const apiResponse = responseBody as ApiResponse<T>;
      return apiResponse.data;
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new DomainError('A requisição excedeu o tempo limite.', 'TIMEOUT_ERROR');
      }
      const message = error instanceof Error ? error.message : 'Falha na comunicação com a API.';
      logger.error(`API Error: ${url}`, 'ApiClient', error);
      throw new DomainError(message, 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeout);
    }
  }

  private handleErrorResponse(status: number, body: unknown): never {
    const errorBody = body as ApiErrorResponse | undefined;
    const message = errorBody?.error?.message || `Erro HTTP ${status}`;
    const code = errorBody?.error?.code || 'UNKNOWN_ERROR';
    const details = errorBody?.error?.details;

    switch (status) {
      case 401:
        throw new UnauthorizedError(message, details);
      case 403:
        throw new ForbiddenError(message, details);
      case 404:
        throw new NotFoundError(details?.['entityName'] as string || 'Recurso', details?.['entityId'] as string || 'desconhecido');
      case 422:
        throw new ValidationError(message, details?.['fieldErrors'] as Record<string, string[]> || {});
      default:
        throw new DomainError(message, code, details);
    }
  }

  public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.executeFetch<T>(endpoint, { method: 'GET' }, options);
  }

  public async post<T, TBody = unknown>(endpoint: string, body: TBody, options?: RequestOptions): Promise<T> {
    return this.executeFetch<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      options
    );
  }

  public async put<T, TBody = unknown>(endpoint: string, body: TBody, options?: RequestOptions): Promise<T> {
    return this.executeFetch<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      options
    );
  }

  public async patch<T, TBody = unknown>(endpoint: string, body: TBody, options?: RequestOptions): Promise<T> {
    return this.executeFetch<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, options);
  }

  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.executeFetch<T>(endpoint, { method: 'DELETE' }, options);
  }
}

export const apiClient = new ApiClient();
