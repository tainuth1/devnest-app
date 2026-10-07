"use client";

import { useContext } from "react";
import { AuthContext } from "../components/providers/auth-provider";
import { AuthContextValue } from "../types";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
