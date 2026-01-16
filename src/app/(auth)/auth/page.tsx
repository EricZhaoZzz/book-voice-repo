"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { login, register, enableGuestMode } from "@/features/auth/actions";

type FieldErrors = Record<string, string>;

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<FieldErrors>({});

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerErrors, setRegisterErrors] = useState<FieldErrors>({});

  const [generalError, setGeneralError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    setGeneralError("");

    const result = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });

    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setLoginErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(result.data.email, result.data.password);
      if (response.error) {
        setGeneralError(response.error);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setGeneralError("登录失败，请检查您的账号密码。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterErrors({});
    setGeneralError("");

    const result = registerSchema.safeParse({
      username: registerUsername,
      email: registerEmail,
      password: registerPassword,
      confirmPassword: registerConfirmPassword,
    });

    if (!result.success) {
      const errors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setRegisterErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(
        result.data.email,
        result.data.password,
        result.data.username
      );
      if (response.error) {
        setGeneralError(response.error);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setGeneralError("注册失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setIsLoading(true);
    try {
      await enableGuestMode();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setGeneralError("游客模式启用失败。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <CardHeader className="pb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="cursor-pointer">
              登录
            </TabsTrigger>
            <TabsTrigger value="register" className="cursor-pointer">
              注册
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <CardTitle className="text-xl">欢迎回来</CardTitle>
              <CardDescription>输入您的账号信息登录</CardDescription>

              {generalError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {generalError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">邮箱</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 ${loginErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!loginErrors.email}
                  aria-describedby={loginErrors.email ? "login-email-error" : undefined}
                />
                {loginErrors.email && (
                  <p id="login-email-error" className="text-sm text-red-500">
                    {loginErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">密码</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    忘记密码？
                  </Link>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="请输入密码"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 ${loginErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!loginErrors.password}
                  aria-describedby={loginErrors.password ? "login-password-error" : undefined}
                />
                {loginErrors.password && (
                  <p id="login-password-error" className="text-sm text-red-500">
                    {loginErrors.password}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    登录中...
                  </span>
                ) : (
                  "登录"
                )}
              </Button>

              <div className="relative w-full">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                  或
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 cursor-pointer"
                disabled={isLoading}
                onClick={handleGuestMode}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                游客模式
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <CardTitle className="text-xl">创建账号</CardTitle>
              <CardDescription>开启您的英语学习之旅</CardDescription>

              {generalError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {generalError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-username">用户名</Label>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="您的昵称"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 ${registerErrors.username ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!registerErrors.username}
                  aria-describedby={registerErrors.username ? "register-username-error" : undefined}
                />
                {registerErrors.username && (
                  <p id="register-username-error" className="text-sm text-red-500">
                    {registerErrors.username}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">邮箱</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 ${registerErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!registerErrors.email}
                  aria-describedby={registerErrors.email ? "register-email-error" : undefined}
                />
                {registerErrors.email && (
                  <p id="register-email-error" className="text-sm text-red-500">
                    {registerErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">密码</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="至少6个字符"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 ${registerErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!registerErrors.password}
                  aria-describedby={registerErrors.password ? "register-password-error" : undefined}
                />
                {registerErrors.password && (
                  <p id="register-password-error" className="text-sm text-red-500">
                    {registerErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">确认密码</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  placeholder="再次输入密码"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 ${registerErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!registerErrors.confirmPassword}
                  aria-describedby={
                    registerErrors.confirmPassword ? "register-confirm-password-error" : undefined
                  }
                />
                {registerErrors.confirmPassword && (
                  <p id="register-confirm-password-error" className="text-sm text-red-500">
                    {registerErrors.confirmPassword}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    创建中...
                  </span>
                ) : (
                  "创建账号"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                创建账号即表示您同意我们的{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  服务条款
                </Link>{" "}
                和{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  隐私政策
                </Link>
              </p>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function AuthFormSkeleton() {
  return (
    <Card className="border-0 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="h-10 bg-muted rounded-md animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-12 bg-muted rounded animate-pulse" />
          <div className="h-11 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          <div className="h-11 bg-muted rounded-md animate-pulse" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-11 w-full bg-muted rounded-md animate-pulse" />
      </CardFooter>
    </Card>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand & Decoration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <Link href="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828"
                />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">Book Voice</span>
          </Link>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            用听力
            <br />
            掌握英语
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            加入数千名 K12 学生，通过精选音频内容提升英语听力技能。
          </p>
          <div className="flex flex-col gap-4 text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span>与课本配套的音频内容</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <span>追踪学习进度</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span>随时随地学习</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold text-foreground">Book Voice</span>
            </Link>
          </div>

          <Suspense fallback={<AuthFormSkeleton />}>
            <AuthForm />
          </Suspense>

          <p className="text-center text-sm text-muted-foreground mt-6">
            需要帮助？{" "}
            <Link href="/support" className="text-primary hover:underline">
              联系客服
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
