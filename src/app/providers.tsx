'use client';

/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It handles standard logic and rendering.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import { SessionProvider } from "next-auth/react";

/**
 * Utility / Component: Providers
 * Provides specific functionality or UI elements for the surrounding context.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
