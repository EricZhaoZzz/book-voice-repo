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
        if (confirm("确定要删除此项吗？")) {
          startTransition(() => action(id));
        }
      }}
    >
      {isPending ? "..." : "删除"}
    </Button>
  );
}
