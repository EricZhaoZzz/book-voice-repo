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
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/features/auth/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestPasswordReset(result.data.email);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("发送重置邮件失败，请重试。");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
        <Card className="w-full max-w-md border-0 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">检查您的邮箱</CardTitle>
            <CardDescription>我们已向 {email} 发送了密码重置链接</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">请检查您的邮箱并点击链接重置密码。</p>
          </CardContent>
          <CardFooter>
            <Link href="/auth" className="w-full">
              <Button className="w-full">返回登录</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
      <Card className="w-full max-w-md border-0 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">忘记密码</CardTitle>
            <CardDescription>输入您的邮箱地址，我们将发送重置链接</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "发送中..." : "发送重置链接"}
            </Button>
            <Link
              href="/auth"
              className="text-sm text-center text-muted-foreground hover:text-primary"
            >
              返回登录
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
