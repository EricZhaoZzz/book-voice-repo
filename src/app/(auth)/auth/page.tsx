"use client";

import { useState } from "react";
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

type FieldErrors = Record<string, string>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<FieldErrors>({});

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerErrors, setRegisterErrors] = useState<FieldErrors>({});

  // General error
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
      // TODO: Implement Supabase auth login
      console.log("Login:", result.data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect to home page after successful login
      // router.push('/');
    } catch {
      setGeneralError("Login failed. Please check your credentials.");
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
      // TODO: Implement Supabase auth register
      console.log("Register:", result.data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect to home page after successful registration
      // router.push('/');
    } catch {
      setGeneralError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    // TODO: Implement guest mode with localStorage
    console.log("Continue as guest");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
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
          <p className="mt-2 text-muted-foreground">English Listening Platform</p>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="cursor-pointer">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="cursor-pointer">
                  Register
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <CardTitle className="text-xl">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>

                  {generalError && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                      {generalError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
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
                      <Label htmlFor="login-password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
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
                        Signing in...
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>

                  <div className="relative w-full">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                      or
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 cursor-pointer"
                    disabled={isLoading}
                    onClick={handleGuestMode}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Continue as Guest
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <CardTitle className="text-xl">Create an account</CardTitle>
                  <CardDescription>Start your English learning journey today</CardDescription>

                  {generalError && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                      {generalError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Your name"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      disabled={isLoading}
                      className={`h-11 ${registerErrors.username ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={!!registerErrors.username}
                      aria-describedby={
                        registerErrors.username ? "register-username-error" : undefined
                      }
                    />
                    {registerErrors.username && (
                      <p id="register-username-error" className="text-sm text-red-500">
                        {registerErrors.username}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
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
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      disabled={isLoading}
                      className={`h-11 ${registerErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={!!registerErrors.password}
                      aria-describedby={
                        registerErrors.password ? "register-password-error" : undefined
                      }
                    />
                    {registerErrors.password && (
                      <p id="register-password-error" className="text-sm text-red-500">
                        {registerErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className={`h-11 ${registerErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={!!registerErrors.confirmPassword}
                      aria-describedby={
                        registerErrors.confirmPassword
                          ? "register-confirm-password-error"
                          : undefined
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
                        Creating account...
                      </span>
                    ) : (
                      "Create account"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help?{" "}
          <Link href="/support" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
