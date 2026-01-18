import { z } from "zod";

export const createSubscriptionSchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  school_contact: z.string().email().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  student_count: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export const updateSubscriptionSchema = createSubscriptionSchema.partial();

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
