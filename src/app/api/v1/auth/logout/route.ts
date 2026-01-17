import { AuthService } from "@/services/auth.service";
import { success, errors } from "@/lib/api/response";
import { cookies } from "next/headers";

const REFRESH_TOKEN_COOKIE = "refresh_token";

export async function POST() {
  try {
    await AuthService.logout();

    const cookieStore = await cookies();
    cookieStore.delete(REFRESH_TOKEN_COOKIE);

    return success({ message: "Logged out successfully" });
  } catch (error) {
    if (error instanceof Error) {
      return errors.badRequest(error.message);
    }
    return errors.internal();
  }
}
