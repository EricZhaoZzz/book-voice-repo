"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function DeleteButton({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Are you sure you want to delete this item?")) {
          startTransition(() => action(id));
        }
      }}
    >
      {isPending ? "..." : "Delete"}
    </Button>
  );
}
