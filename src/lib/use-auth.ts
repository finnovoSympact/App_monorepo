"use client";

// Re-export everything from the shared auth context.
// All components must import from here (not from auth-provider directly)
// so that tree-shaking and barrel imports stay consistent.
export { useAuth, AuthProvider, type UserRole, type MockUser } from "@/components/auth-provider";

export function roleRedirect(role: string): string {
  if (role === "bank") return "/bank";
  if (role === "individual") return "/chat";
  return "/dashboard";
}
