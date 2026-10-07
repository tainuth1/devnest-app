"use client";

import React from "react";

export interface HoneypotTrapProps {
  /**
   * Value for the honeypot website field. Real users must leave this empty.
   */
  website?: string;
  /**
   * Value for the honeypot phone confirmation field. Real users must leave this empty.
   */
  phoneConfirm?: string;
  /**
   * Change event handler to bind to form state.
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Honeypot bot protection trap component.
 *
 * Injects hidden form fields ("website" and "phone_confirm") that match the backend
 * OWASP A07 honeypot contract in `dev-nest-api`.
 * Real human users will never see, focus, or fill these fields.
 * Automated bots, scrapers, and spam scripts that blindly populate all inputs
 * will fill them, triggering silent rejection on the backend.
 */
export function HoneypotTrap({
  website = "",
  phoneConfirm = "",
  onChange,
}: HoneypotTrapProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-[-9999px] -z-50 h-0 w-0 overflow-hidden opacity-0"
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        height: 0,
        width: 0,
        opacity: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: -1,
      }}
      tabIndex={-1}
    >
      <label htmlFor="auth-field-website">Website</label>
      <input
        id="auth-field-website"
        type="text"
        name="website"
        value={website}
        onChange={onChange}
        tabIndex={-1}
        autoComplete="off"
      />

      <label htmlFor="auth-field-phone-confirm">Confirm Phone</label>
      <input
        id="auth-field-phone-confirm"
        type="text"
        name="phone_confirm"
        value={phoneConfirm}
        onChange={onChange}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
