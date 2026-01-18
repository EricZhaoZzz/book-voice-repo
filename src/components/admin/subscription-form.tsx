"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const subscriptionSchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  contact_email: z.string().email("Invalid email"),
  contact_phone: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  student_count: z.number().min(1, "Must have at least 1 student"),
  notes: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

interface SubscriptionFormProps {
  initialData?: Partial<SubscriptionFormData>;
  onSubmit: (data: SubscriptionFormData) => Promise<void>;
}

export function SubscriptionForm({ initialData, onSubmit }: SubscriptionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">School Name</label>
        <Input {...register("school_name")} />
        {errors.school_name && <p className="text-red-500 text-sm">{errors.school_name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contact Person</label>
        <Input {...register("contact_person")} />
        {errors.contact_person && (
          <p className="text-red-500 text-sm">{errors.contact_person.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contact Email</label>
        <Input type="email" {...register("contact_email")} />
        {errors.contact_email && (
          <p className="text-red-500 text-sm">{errors.contact_email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contact Phone</label>
        <Input {...register("contact_phone")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input type="date" {...register("start_date")} />
          {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input type="date" {...register("end_date")} />
          {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Student Count</label>
        <Input type="number" {...register("student_count", { valueAsNumber: true })} />
        {errors.student_count && (
          <p className="text-red-500 text-sm">{errors.student_count.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea {...register("notes")} className="w-full border rounded p-2" rows={4} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
