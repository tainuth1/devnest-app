/**
 * Standard API envelope returned by dev-nest-api.
 * Matches StandardResponse in app/shared/responses.py
 */
export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Validation error item returned by FastAPI / Pydantic (status 422).
 */
export interface ApiValidationError {
  type: string;
  loc: (string | number)[];
  msg: string;
  ctx?: Record<string, unknown>;
}

/**
 * Custom error thrown when an API request fails.
 */
export class ApiError<T = unknown> extends Error {
  public readonly status: number;
  public readonly data?: T;

  constructor(message: string, status: number = 400, data?: T) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Helper to determine if this error is an authentication error (401).
   */
  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Helper to determine if this error is a forbidden error (403).
   */
  public isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Helper to determine if this error is a validation error (422).
   */
  public isValidationError(): boolean {
    return this.status === 422;
  }
}

/**
 * Options for configuring API requests in ApiClient.
 */
export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  /**
   * Skip automatic redirect to login page when receiving a 401 Unauthorized.
   */
  skipAuthRedirect?: boolean;
  /**
   * Alias for skipAuthRedirect for backward-compatibility.
   */
  skipAuthRefresh?: boolean;
}
