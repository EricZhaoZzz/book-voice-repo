import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export const registerSchema = z
  .object({
    username: z.string().min(2, "用户名至少需要2个字符").max(50, "用户名不能超过50个字符"),
    email: z.string().email("请输入有效的邮箱地址"),
    password: z
      .string()
      .min(6, "密码至少需要6个字符")
      .regex(/[a-zA-Z]/, "密码必须包含至少一个字母")
      .regex(/[0-9]/, "密码必须包含至少一个数字"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "密码至少需要6个字符")
      .regex(/[a-zA-Z]/, "密码必须包含至少一个字母")
      .regex(/[0-9]/, "密码必须包含至少一个数字"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
