import { apiClient } from "@/shared/services/api-client";
import {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  VerifyOtpRequest,
  VerifyOtpResponseData,
  UserMeResponseData,
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UpdateAvatarRequest,
  SessionResponseData,
  HoneypotFields,
} from "../types";

export const HONEYPOT_DEFAULTS: Required<HoneypotFields> = {
  website: "",
  phone_confirm: "",
} as const;

export const AUTH_COOKIES = {
  SESSION: "session_id",
  PENDING_VERIFY_EMAIL: "pending_verification_email",
  PENDING_RESET_EMAIL: "pending_reset_email",
  PENDING_RESET_VERIFIED: "pending_reset_verified",
} as const;

export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number = 900
): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export class AuthService {
  /**
   * Phase 1 of registration: Submit credentials and trigger email OTP.
   * Protected with Honeypot bot detection.
   */
  public static async register(
    data: RegisterRequest
  ): Promise<RegisterResponseData> {
    const payload = { ...HONEYPOT_DEFAULTS, ...data };
    const response = await apiClient.post<RegisterResponseData>(
      "/api/auth/register",
      payload
    );
    if (!response.data) {
      throw new Error(response.message || "Failed to register");
    }
    // Record pending verification email in cookie for proxy.ts and step protection
    setCookie(AUTH_COOKIES.PENDING_VERIFY_EMAIL, data.email, 900);
    return response.data;
  }

  /**
   * Phase 2 of registration: Verify OTP and activate account.
   * Protected with Honeypot bot detection.
   */
  public static async verifyOtp(
    data: VerifyOtpRequest
  ): Promise<VerifyOtpResponseData> {
    const payload = { ...HONEYPOT_DEFAULTS, ...data };
    const response = await apiClient.post<VerifyOtpResponseData>(
      "/api/auth/verify-otp",
      payload
    );
    if (!response.data) {
      throw new Error(response.message || "Failed to verify activation code");
    }
    // Clean up verification step cookie upon success
    deleteCookie(AUTH_COOKIES.PENDING_VERIFY_EMAIL);
    return response.data;
  }

  /**
   * Authenticate user with login ID (email or username) and password.
   * Protected with Honeypot bot detection.
   */
  public static async login(data: LoginRequest): Promise<LoginResponseData> {
    const payload = { ...HONEYPOT_DEFAULTS, ...data };
    const response = await apiClient.post<LoginResponseData>(
      "/api/auth/login",
      payload
    );
    if (!response.data) {
      throw new Error(response.message || "Login failed");
    }
    return response.data;
  }

  /**
   * Retrieve currently authenticated user profile.
   */
  public static async getMe(): Promise<UserMeResponseData> {
    const response = await apiClient.get<UserMeResponseData>("/api/auth/me", {
      skipAuthRedirect: true,
    });
    if (!response.data) {
      throw new Error("Unable to retrieve user session");
    }
    return response.data;
  }

  /**
   * Sign out current user and invalidate server-side session.
   */
  public static async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/logout", undefined, {
        skipAuthRedirect: true,
      });
    } finally {
      // Clear all flow cookies
      deleteCookie(AUTH_COOKIES.PENDING_VERIFY_EMAIL);
      deleteCookie(AUTH_COOKIES.PENDING_RESET_EMAIL);
      deleteCookie(AUTH_COOKIES.PENDING_RESET_VERIFIED);
    }
  }

  /**
   * Phase 1 of password reset: Request reset OTP.
   * Protected with Honeypot bot detection.
   */
  public static async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<{ email: string }> {
    const payload = { ...HONEYPOT_DEFAULTS, ...data };
    const response = await apiClient.post<{ email: string }>(
      "/api/auth/forgot-password",
      payload
    );
    // Record pending reset email in cookie
    setCookie(AUTH_COOKIES.PENDING_RESET_EMAIL, data.email, 900);
    deleteCookie(AUTH_COOKIES.PENDING_RESET_VERIFIED);
    return response.data || { email: data.email };
  }

  /**
   * Phase 2 of password reset: Verify reset OTP.
   * Protected with Honeypot bot detection.
   */
  public static async verifyResetOtp(
    data: VerifyResetOtpRequest
  ): Promise<{ email: string }> {
    const payload = { ...HONEYPOT_DEFAULTS, ...data };
    const response = await apiClient.post<{ email: string }>(
      "/api/auth/verify-reset-otp",
      payload
    );
    // Mark reset OTP as verified in cookie for proxy.ts and step protection
    setCookie(AUTH_COOKIES.PENDING_RESET_VERIFIED, "true", 900);
    return response.data || { email: data.email };
  }

  /**
   * Phase 3 of password reset: Set new password.
   * Protected with Honeypot bot detection.
   */
  public static async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const payload = { ...HONEYPOT_DEFAULTS, ...data };
    await apiClient.post("/api/auth/reset-password", payload);
    // Clear reset flow cookies
    deleteCookie(AUTH_COOKIES.PENDING_RESET_EMAIL);
    deleteCookie(AUTH_COOKIES.PENDING_RESET_VERIFIED);
  }

  /**
   * Change password for currently authenticated user.
   */
  public static async changePassword(
    data: ChangePasswordRequest
  ): Promise<void> {
    await apiClient.post("/api/auth/change-password", data);
  }

  /**
   * Update profile information.
   */
  public static async updateProfile(
    data: UpdateProfileRequest
  ): Promise<UserMeResponseData> {
    const response = await apiClient.patch<UserMeResponseData>(
      "/api/auth/me",
      data
    );
    if (!response.data) {
      throw new Error(response.message || "Failed to update profile");
    }
    return response.data;
  }

  /**
   * Update avatar image URL.
   */
  public static async updateAvatar(
    data: UpdateAvatarRequest
  ): Promise<UserMeResponseData> {
    const response = await apiClient.patch<UserMeResponseData>(
      "/api/auth/me/avatar",
      data
    );
    if (!response.data) {
      throw new Error(response.message || "Failed to update avatar");
    }
    return response.data;
  }

  /**
   * List active sessions for the current user.
   */
  public static async getSessions(): Promise<SessionResponseData[]> {
    const response =
      await apiClient.get<SessionResponseData[]>("/api/auth/sessions");
    return response.data || [];
  }

  /**
   * Revoke a specific session.
   */
  public static async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/auth/sessions/${sessionId}`);
  }

  /**
   * Revoke all sessions for current user.
   */
  public static async revokeAllSessions(): Promise<void> {
    await apiClient.delete("/api/auth/sessions");
  }
}
