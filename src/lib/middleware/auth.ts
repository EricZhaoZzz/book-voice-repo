import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { errors } from "@/lib/api/response";
import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

export interface AuthContext {
  userId: string;
  user: User;
}

export interface AdminAuthContext extends AuthContext {
  user: User & { role: "admin" | "super_admin" };
}

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export async function withAuth<T>(
  request: NextRequest,
  handler: (context: AuthContext) => Promise<T>
): Promise<T | ReturnType<typeof errors.unauthorized | typeof errors.tokenExpired>> {
  const token = extractToken(request);

  if (!token) {
    return errors.unauthorized("No authorization token provided");
  }

  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError) {
    if (authError.message.includes("expired")) {
      return errors.tokenExpired();
    }
    return errors.unauthorized(authError.message);
  }

  if (!authUser) {
    return errors.unauthorized("Invalid token");
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profileError || !userProfile) {
    return errors.unauthorized("User profile not found");
  }

  if (userProfile.status !== "active") {
    return errors.forbidden("Account is suspended or banned");
  }

  return handler({ userId: authUser.id, user: userProfile });
}

export async function withAdminAuth<T>(
  request: NextRequest,
  handler: (context: AdminAuthContext) => Promise<T>
): Promise<T | ReturnType<typeof errors.unauthorized | typeof errors.forbidden>> {
  const token = extractToken(request);

  if (!token) {
    return errors.unauthorized("No authorization token provided");
  }

  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError) {
    if (authError.message.includes("expired")) {
      return errors.tokenExpired();
    }
    return errors.unauthorized(authError.message);
  }

  if (!authUser) {
    return errors.unauthorized("Invalid token");
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profileError || !userProfile) {
    return errors.unauthorized("User profile not found");
  }

  if (userProfile.status !== "active") {
    return errors.forbidden("Account is suspended or banned");
  }

  if (userProfile.role !== "admin" && userProfile.role !== "super_admin") {
    return errors.forbidden("Admin access required");
  }

  return handler({
    userId: authUser.id,
    user: userProfile as User & { role: "admin" | "super_admin" },
  });
}
