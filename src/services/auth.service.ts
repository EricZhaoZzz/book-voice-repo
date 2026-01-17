import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { User, AuthTokens } from "@/types/api";

interface WechatSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createAdminClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export class AuthService {
  static async loginWithEmail(
    email: string,
    password: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error("Login failed");
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error("User profile not found");
    }

    await supabase
      .from("users")
      .update({
        last_login_at: new Date().toISOString(),
        login_count: userProfile.login_count + 1,
      })
      .eq("id", data.user.id);

    return {
      user: userProfile,
      tokens: {
        accessToken: data.session.access_token,
        expiresIn: data.session.expires_in,
      },
    };
  }

  static async registerWithEmail(
    email: string,
    password: string,
    username: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error("Registration failed - email confirmation may be required");
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error("User profile not found");
    }

    return {
      user: userProfile,
      tokens: {
        accessToken: data.session.access_token,
        expiresIn: data.session.expires_in,
      },
    };
  }

  static async loginWithWechat(code: string): Promise<{ user: User; tokens: AuthTokens }> {
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error("WeChat configuration missing");
    }

    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

    const wxResponse = await fetch(wxUrl);
    const wxData = (await wxResponse.json()) as WechatSessionResponse;

    if (wxData.errcode) {
      throw new Error(wxData.errmsg || "WeChat authentication failed");
    }

    const { openid, unionid } = wxData;
    const adminClient = getAdminClient();

    const { data: existingUser } = await adminClient
      .from("users")
      .select("*")
      .eq("wechat_openid", openid)
      .single();

    let userId: string;
    let userProfile: User;

    if (existingUser) {
      userId = existingUser.id;
      userProfile = existingUser;

      await adminClient
        .from("users")
        .update({
          last_login_at: new Date().toISOString(),
          login_count: existingUser.login_count + 1,
          ...(unionid && { wechat_unionid: unionid }),
        })
        .eq("id", userId);
    } else {
      const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email: `wx_${openid}@wechat.placeholder`,
        email_confirm: true,
        user_metadata: {
          wechat_openid: openid,
          wechat_unionid: unionid,
        },
      });

      if (authError || !authUser.user) {
        throw new Error(authError?.message || "Failed to create user");
      }

      userId = authUser.user.id;

      const { data: newUser, error: profileError } = await adminClient
        .from("users")
        .update({
          wechat_openid: openid,
          wechat_unionid: unionid || null,
          username: `user_${openid.slice(-8)}`,
          email: null,
        })
        .eq("id", userId)
        .select()
        .single();

      if (profileError || !newUser) {
        throw new Error("Failed to create user profile");
      }

      userProfile = newUser;
    }

    const { data: sessionData, error: sessionError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: `wx_${openid}@wechat.placeholder`,
    });

    if (sessionError || !sessionData) {
      throw new Error("Failed to generate session");
    }

    const supabase = await createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `wx_${openid}@wechat.placeholder`,
      password: openid,
    });

    if (signInError) {
      await adminClient.auth.admin.updateUserById(userId, {
        password: openid,
      });

      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email: `wx_${openid}@wechat.placeholder`,
        password: openid,
      });

      if (retryError || !retryData.session) {
        throw new Error("Failed to create session for WeChat user");
      }

      return {
        user: userProfile,
        tokens: {
          accessToken: retryData.session.access_token,
          expiresIn: retryData.session.expires_in,
        },
      };
    }

    if (!signInData.session) {
      throw new Error("Failed to create session");
    }

    return {
      user: userProfile,
      tokens: {
        accessToken: signInData.session.access_token,
        expiresIn: signInData.session.expires_in,
      },
    };
  }

  static async refreshAccessToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error("Failed to refresh token");
    }

    return {
      tokens: {
        accessToken: data.session.access_token,
        expiresIn: data.session.expires_in,
      },
    };
  }

  static async getCurrentUser(userId: string): Promise<User> {
    const supabase = await createClient();

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

    if (error || !data) {
      throw new Error("User not found");
    }

    return data;
  }

  static async logout(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
}
