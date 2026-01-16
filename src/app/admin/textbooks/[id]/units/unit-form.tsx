"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUnit, updateUnit } from "@/app/admin/actions";
import type { Database } from "@/types/database";

type Unit = Database["public"]["Tables"]["units"]["Row"];

export function UnitForm({ textbookId, unit }: { textbookId: string; unit?: Unit }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      order_num: parseInt(formData.get("order_num") as string),
      description: (formData.get("description") as string) || undefined,
      is_free: formData.get("is_free") === "on",
      requires_vip: formData.get("requires_vip") === "on",
    };

    startTransition(async () => {
      if (unit) {
        await updateUnit(unit.id, data);
      } else {
        await createUnit({ ...data, textbook_id: textbookId });
      }
      router.push(`/admin/textbooks/${textbookId}/units`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={unit?.name} required />
      </div>
      <div>
        <Label htmlFor="order_num">Order</Label>
        <Input
          id="order_num"
          name="order_num"
          type="number"
          defaultValue={unit?.order_num || 1}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" defaultValue={unit?.description || ""} />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_free" name="is_free" defaultChecked={unit?.is_free} />
          <Label htmlFor="is_free">Free</Label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requires_vip"
            name="requires_vip"
            defaultChecked={unit?.requires_vip}
          />
          <Label htmlFor="requires_vip">Requires VIP</Label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : unit ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
