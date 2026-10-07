import { ApiError, ApiResponse, ApiRequestOptions } from "../types";

export interface ApiClientConfig {
  baseURL?: string;
  loginPath?: string;
  protectedPaths?: string[];
  onUnauthorized?: () => void;
}

export class ApiClient {
  private baseURL: string;
  private loginPath: string;
  private protectedPaths: string[];
  private onUnauthorized?: () => void;

  constructor(config?: string | ApiClientConfig) {
    if (typeof config === "string") {
      this.baseURL = config.replace(/\/+$/, "");
      this.loginPath = "/auth/login";
      this.protectedPaths = ["/workspace", "/dashboard"];
    } else {
      const defaultUrl =
        typeof window !== "undefined"
          ? (process.env.NEXT_PUBLIC_API_URL ?? "")
          : process.env.INTERNAL_API_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            "http://127.0.0.1:8000";
      const rawUrl =
        config?.baseURL !== undefined ? config.baseURL : defaultUrl;
      this.baseURL = rawUrl.replace(/\/+$/, "");
      this.loginPath = config?.loginPath || "/auth/login";
      this.protectedPaths = config?.protectedPaths || [
        "/workspace",
        "/dashboard",
      ];
      this.onUnauthorized = config?.onUnauthorized;
    }
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Determine if the current window pathname is considered a protected route.
   */
  private isCurrentPathProtected(): boolean {
    if (typeof window === "undefined") return false;
    const pathname = window.location.pathname;
    return this.protectedPaths.some((prefix) => pathname.startsWith(prefix));
  }

  /**
   * Perform automatic redirect to login page when session is expired or revoked.
   * Uses dev-nest-app's `/auth/login` route and prevents redirect loops.
   */
  private handleAuthFailure(): void {
    if (this.onUnauthorized) {
      this.onUnauthorized();
    }

    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname + window.location.search;
      const targetLoginPath = this.loginPath.startsWith("/")
        ? this.loginPath
        : `/${this.loginPath}`;

      // Only redirect if user is on a protected route and not already on auth pages
      const isProtected = this.isCurrentPathProtected();
      const isAlreadyOnAuthPage = window.location.pathname.includes("/auth/");

      if (isProtected && !isAlreadyOnAuthPage) {
        const redirectUrl = `${targetLoginPath}?redirect=${encodeURIComponent(currentPath)}`;
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = redirectUrl;
      }
    }
  }

  /**
   * Checks whether the given endpoint is an authentication endpoint.
   * On these endpoints (like login / register / OTP), a 401/400 is a normal credential rejection
   * rather than an expired session, so we don't trigger automatic page redirection.
   */
  private isAuthEndpoint(endpoint: string): boolean {
    const authEndpoints = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/verify-otp",
      "/api/auth/forgot-password",
      "/api/auth/verify-reset-otp",
      "/api/auth/reset-password",
    ];
    return authEndpoints.some((path) => endpoint.includes(path));
  }

  /**
   * Main request handler configured for cookie-based session management.
   * Automatically includes HttpOnly session cookies via credentials: "include".
   */
  public async request<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      body,
      headers: customHeaders,
      skipAuthRedirect = false,
      skipAuthRefresh = false, // Kept for backward compatibility
      ...customOptions
    } = options;

    const shouldSkipRedirect = skipAuthRedirect || skipAuthRefresh;

    // Construct URL with query parameters
    let url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    // Prepare default headers
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(customHeaders as Record<string, string>),
    };

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      if (body instanceof FormData || typeof body === "string") {
        requestBody = body;
      } else {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify(body);
      }
    }

    // Always include credentials to send/receive the session_id HttpOnly cookie
    const response = await fetch(url, {
      ...customOptions,
      headers,
      credentials: "include",
      body: requestBody,
    });

    // Check if session has expired or is invalid
    if (
      response.status === 401 &&
      !shouldSkipRedirect &&
      !this.isAuthEndpoint(endpoint)
    ) {
      this.handleAuthFailure();
      throw new ApiError(
        "Session expired or invalid. Please sign in again.",
        401
      );
    }

    return this.parseResponse<T>(response);
  }

  /**
   * Parse response envelope and handle application or HTTP errors.
   */
  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let responseData: ApiResponse<T>;
    try {
      responseData = await response.json();
    } catch {
      throw new ApiError(
        `Server returned status ${response.status}`,
        response.status
      );
    }

    // Check both HTTP status and StandardResponse envelope success field
    if (!response.ok || !responseData.success) {
      const errorMessage =
        responseData?.message ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, responseData?.data);
    }

    return responseData;
  }

  public get<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  public put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  public delete<T = unknown>(
    endpoint: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
export { ApiError, type ApiResponse, type ApiRequestOptions };
