import { AuthService } from "@/services/auth.service";
import { success, errors } from "@/lib/api/response";
import { cookies } from "next/headers";

const REFRESH_TOKEN_COOKIE = "refresh_token";
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      return errors.unauthorized("No refresh token provided");
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    cookieStore.set(REFRESH_TOKEN_COOKIE, result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
    });

    return success({
      accessToken: result.tokens.accessToken,
      expiresIn: result.tokens.expiresIn,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("expired") || error.message.includes("invalid")) {
        const cookieStore = await cookies();
        cookieStore.delete(REFRESH_TOKEN_COOKIE);
        return errors.tokenExpired("Refresh token expired");
      }
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
