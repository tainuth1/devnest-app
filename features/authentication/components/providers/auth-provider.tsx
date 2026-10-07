"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  AuthContextValue,
  UserMeResponseData,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  VerifyOtpRequest,
  VerifyOtpResponseData,
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
} from "../../types";
import {
  AuthService,
  AUTH_COOKIES,
  getCookie,
  setCookie,
  deleteCookie,
} from "../../services/auth.service";

export const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEYS = {
  PENDING_REGISTER_EMAIL: "devnest_pending_register_email",
  PENDING_RESET_EMAIL: "devnest_pending_reset_email",
  PENDING_RESET_OTP: "devnest_pending_reset_otp",
  RESET_OTP_VERIFIED: "devnest_reset_otp_verified",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserMeResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Multi-step flow state initialized lazily to avoid cascading renders
  const [pendingRegistrationEmail, setPendingRegEmailState] = useState<
    string | null
  >(() => {
    if (typeof window === "undefined") return null;
    return (
      getCookie(AUTH_COOKIES.PENDING_VERIFY_EMAIL) ||
      sessionStorage.getItem(STORAGE_KEYS.PENDING_REGISTER_EMAIL)
    );
  });

  const [pendingResetEmail, setPendingResetEmailState] = useState<
    string | null
  >(() => {
    if (typeof window === "undefined") return null;
    return (
      getCookie(AUTH_COOKIES.PENDING_RESET_EMAIL) ||
      sessionStorage.getItem(STORAGE_KEYS.PENDING_RESET_EMAIL)
    );
  });

  const [pendingResetOtp, setPendingResetOtpState] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return null;
      return sessionStorage.getItem(STORAGE_KEYS.PENDING_RESET_OTP);
    }
  );

  const [isResetOtpVerified, setIsResetOtpVerifiedState] = useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      return (
        getCookie(AUTH_COOKIES.PENDING_RESET_VERIFIED) === "true" ||
        sessionStorage.getItem(STORAGE_KEYS.RESET_OTP_VERIFIED) === "true"
      );
    }
  );

  const setPendingRegistrationEmail = useCallback((email: string | null) => {
    setPendingRegEmailState(email);
    if (typeof window !== "undefined") {
      if (email) {
        setCookie(AUTH_COOKIES.PENDING_VERIFY_EMAIL, email, 900);
        sessionStorage.setItem(STORAGE_KEYS.PENDING_REGISTER_EMAIL, email);
      } else {
        deleteCookie(AUTH_COOKIES.PENDING_VERIFY_EMAIL);
        sessionStorage.removeItem(STORAGE_KEYS.PENDING_REGISTER_EMAIL);
      }
    }
  }, []);

  const setPendingResetEmail = useCallback((email: string | null) => {
    setPendingResetEmailState(email);
    if (typeof window !== "undefined") {
      if (email) {
        setCookie(AUTH_COOKIES.PENDING_RESET_EMAIL, email, 900);
        sessionStorage.setItem(STORAGE_KEYS.PENDING_RESET_EMAIL, email);
      } else {
        deleteCookie(AUTH_COOKIES.PENDING_RESET_EMAIL);
        sessionStorage.removeItem(STORAGE_KEYS.PENDING_RESET_EMAIL);
      }
    }
  }, []);

  const setPendingResetOtp = useCallback((otp: string | null) => {
    setPendingResetOtpState(otp);
    if (typeof window !== "undefined") {
      if (otp) {
        sessionStorage.setItem(STORAGE_KEYS.PENDING_RESET_OTP, otp);
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.PENDING_RESET_OTP);
      }
    }
  }, []);

  const setIsResetOtpVerified = useCallback((verified: boolean) => {
    setIsResetOtpVerifiedState(verified);
    if (typeof window !== "undefined") {
      if (verified) {
        setCookie(AUTH_COOKIES.PENDING_RESET_VERIFIED, "true", 900);
        sessionStorage.setItem(STORAGE_KEYS.RESET_OTP_VERIFIED, "true");
      } else {
        deleteCookie(AUTH_COOKIES.PENDING_RESET_VERIFIED);
        sessionStorage.removeItem(STORAGE_KEYS.RESET_OTP_VERIFIED);
      }
    }
  }, []);

  const clearFlowState = useCallback(() => {
    setPendingRegistrationEmail(null);
    setPendingResetEmail(null);
    setPendingResetOtp(null);
    setIsResetOtpVerified(false);
  }, [
    setPendingRegistrationEmail,
    setPendingResetEmail,
    setPendingResetOtp,
    setIsResetOtpVerified,
  ]);

  const refreshUser =
    useCallback(async (): Promise<UserMeResponseData | null> => {
      try {
        const userData = await AuthService.getMe();
        setUser(userData);
        return userData;
      } catch {
        setUser(null);
        return null;
      }
    }, []);

  // Fetch authenticated user profile on initial load
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const userData = await AuthService.getMe();
        if (isMounted) {
          setUser(userData);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (data: LoginRequest): Promise<LoginResponseData> => {
      const res = await AuthService.login(data);
      // Refresh current user session
      await refreshUser();
      clearFlowState();
      return res;
    },
    [refreshUser, clearFlowState]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      clearFlowState();
      router.push("/auth/login");
    }
  }, [clearFlowState, router]);

  const register = useCallback(
    async (data: RegisterRequest): Promise<RegisterResponseData> => {
      const res = await AuthService.register(data);
      setPendingRegistrationEmail(data.email);
      return res;
    },
    [setPendingRegistrationEmail]
  );

  const verifyOtp = useCallback(
    async (data: VerifyOtpRequest): Promise<VerifyOtpResponseData> => {
      const res = await AuthService.verifyOtp(data);
      setTimeout(() => {
        setPendingRegistrationEmail(null);
      }, 500);
      return res;
    },
    [setPendingRegistrationEmail]
  );

  const forgotPassword = useCallback(
    async (data: ForgotPasswordRequest): Promise<{ email: string }> => {
      const res = await AuthService.forgotPassword(data);
      setPendingResetEmail(data.email);
      setIsResetOtpVerified(false);
      setPendingResetOtp(null);
      return res;
    },
    [setPendingResetEmail, setIsResetOtpVerified, setPendingResetOtp]
  );

  const verifyResetOtp = useCallback(
    async (data: VerifyResetOtpRequest): Promise<{ email: string }> => {
      const res = await AuthService.verifyResetOtp(data);
      setIsResetOtpVerified(true);
      setPendingResetOtp(data.otp_code);
      return res;
    },
    [setIsResetOtpVerified, setPendingResetOtp]
  );

  const resetPassword = useCallback(
    async (data: ResetPasswordRequest): Promise<void> => {
      await AuthService.resetPassword(data);
      setTimeout(() => {
        clearFlowState();
      }, 500);
    },
    [clearFlowState]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      role: user?.role || null,
      login,
      logout,
      register,
      verifyOtp,
      forgotPassword,
      verifyResetOtp,
      resetPassword,
      refreshUser,
      pendingRegistrationEmail,
      setPendingRegistrationEmail,
      pendingResetEmail,
      setPendingResetEmail,
      pendingResetOtp,
      setPendingResetOtp,
      isResetOtpVerified,
      setIsResetOtpVerified,
      clearFlowState,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      register,
      verifyOtp,
      forgotPassword,
      verifyResetOtp,
      resetPassword,
      refreshUser,
      pendingRegistrationEmail,
      setPendingRegistrationEmail,
      pendingResetEmail,
      setPendingResetEmail,
      pendingResetOtp,
      setPendingResetOtp,
      isResetOtpVerified,
      setIsResetOtpVerified,
      clearFlowState,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
