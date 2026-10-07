/**
 * TypeScript types corresponding to dev-nest-api authentication module.
 * Source: dev-nest-api/app/modules/auth/schemas.py
 */

export interface UserInfoData {
  id: string;
  email: string;
  username: string | null;
  role: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export interface UserMeResponseData extends UserInfoData {
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface HoneypotFields {
  website?: string;
  phone_confirm?: string;
}

export interface LoginRequest extends HoneypotFields {
  login_id: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponseData {
  user: UserInfoData;
}

export interface RegisterRequest extends HoneypotFields {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponseData {
  email: string;
}

export interface VerifyOtpRequest extends HoneypotFields {
  email: string;
  otp_code: string;
}

export interface VerifyOtpResponseData {
  email: string;
  username: string;
}

export interface UpdateProfileRequest {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
}

export interface UpdateAvatarRequest {
  avatar_url: string;
}

export interface SessionResponseData {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  is_current: boolean;
  created_at: string;
  expires_at: string;
}

export interface ForgotPasswordRequest extends HoneypotFields {
  email: string;
}

export interface VerifyResetOtpRequest extends HoneypotFields {
  email: string;
  otp_code: string;
}

export interface ResetPasswordRequest extends HoneypotFields {
  email: string;
  otp_code: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AuthState {
  user: UserMeResponseData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<LoginResponseData>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<RegisterResponseData>;
  verifyOtp: (data: VerifyOtpRequest) => Promise<VerifyOtpResponseData>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<{ email: string }>;
  verifyResetOtp: (data: VerifyResetOtpRequest) => Promise<{ email: string }>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  refreshUser: () => Promise<UserMeResponseData | null>;
  pendingRegistrationEmail: string | null;
  setPendingRegistrationEmail: (email: string | null) => void;
  pendingResetEmail: string | null;
  setPendingResetEmail: (email: string | null) => void;
  pendingResetOtp: string | null;
  setPendingResetOtp: (otp: string | null) => void;
  isResetOtpVerified: boolean;
  setIsResetOtpVerified: (verified: boolean) => void;
  clearFlowState: () => void;
}
