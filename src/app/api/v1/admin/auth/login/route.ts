import { NextRequest } from "next/server";
import { AuthService } from "@/services/auth.service";
import { success, errors } from "@/lib/api/response";
import { cookies } from "next/headers";

const REFRESH_TOKEN_COOKIE = "admin_refresh_token";
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errors.badRequest("Email and password are required");
    }

    const result = await AuthService.loginWithEmail(email, password);

    if (result.user.role !== "admin" && result.user.role !== "super_admin") {
      return errors.forbidden("Admin access required");
    }

    if (result.user.status !== "active") {
      return errors.forbidden("Account is suspended or banned");
    }

    const cookieStore = await cookies();
    cookieStore.set(REFRESH_TOKEN_COOKIE, result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return success({
      user: result.user,
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Invalid login credentials")) {
        return errors.unauthorized("Invalid email or password");
      }
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
