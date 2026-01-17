import { NextRequest } from "next/server";
import { AuthService } from "@/services/auth.service";
import { success, errors } from "@/lib/api/response";
import { cookies } from "next/headers";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return errors.badRequest("Email, password, and username are required");
    }

    if (password.length < 6) {
      return errors.validationError("Password must be at least 6 characters");
    }

    const result = await AuthService.registerWithEmail(email, password, username);

    const cookieStore = await cookies();
    cookieStore.set(REFRESH_TOKEN_COOKIE, result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return success(
      {
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn,
      },
      201
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already registered")) {
        return errors.conflict("Email already registered");
      }
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
