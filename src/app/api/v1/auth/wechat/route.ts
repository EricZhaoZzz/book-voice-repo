import { NextRequest } from "next/server";
import { AuthService } from "@/services/auth.service";
import { success, errors } from "@/lib/api/response";
import { cookies } from "next/headers";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return errors.badRequest("WeChat code is required");
    }

    const result = await AuthService.loginWithWechat(code);

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
      if (error.message.includes("configuration missing")) {
        return errors.internal("WeChat login not configured");
      }
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
