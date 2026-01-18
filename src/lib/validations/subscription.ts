import { z } from "zod";

export const createSubscriptionSchema = z
  .object({
    school_name: z.string().min(1, "School name is required"),
    school_contact: z.string().email().optional().or(z.literal("")),
    start_date: z.string().refine((val) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
      const date = new Date(val);
      return !isNaN(date.getTime()) && val === date.toISOString().split("T")[0];
    }, "Invalid date"),
    end_date: z.string().refine((val) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
      const date = new Date(val);
      return !isNaN(date.getTime()) && val === date.toISOString().split("T")[0];
    }, "Invalid date"),
    student_count: z.number().int().min(0).default(0),
    notes: z.string().optional(),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export const updateSubscriptionSchema = z.object({
  school_name: z.string().min(1, "School name is required").optional(),
  school_contact: z.string().email().optional().or(z.literal("")),
  start_date: z
    .string()
    .refine((val) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
      const date = new Date(val);
      return !isNaN(date.getTime()) && val === date.toISOString().split("T")[0];
    }, "Invalid date")
    .optional(),
  end_date: z
    .string()
    .refine((val) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
      const date = new Date(val);
      return !isNaN(date.getTime()) && val === date.toISOString().split("T")[0];
    }, "Invalid date")
    .optional(),
  student_count: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
