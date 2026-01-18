"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTextbook, updateTextbook } from "../actions";
import type { Database } from "@/types/database";

type Textbook = Database["public"]["Tables"]["textbooks"]["Row"];

export function TextbookForm({ textbook }: { textbook?: Textbook }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      grade: formData.get("grade") as string,
      publisher: formData.get("publisher") as string,
      version: formData.get("version") as string,
      description: (formData.get("description") as string) || undefined,
      is_free: formData.get("is_free") === "on",
      free_units_count: parseInt(formData.get("free_units_count") as string) || 0,
    };

    startTransition(async () => {
      if (textbook) {
        await updateTextbook(textbook.id, data);
      } else {
        await createTextbook(data);
      }
      router.push("/admin/textbooks");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <Label htmlFor="name">名称</Label>
        <Input id="name" name="name" defaultValue={textbook?.name} required />
      </div>
      <div>
        <Label htmlFor="grade">年级</Label>
        <Input id="grade" name="grade" defaultValue={textbook?.grade} required />
      </div>
      <div>
        <Label htmlFor="publisher">出版社</Label>
        <Input id="publisher" name="publisher" defaultValue={textbook?.publisher} required />
      </div>
      <div>
        <Label htmlFor="version">版本</Label>
        <Input id="version" name="version" defaultValue={textbook?.version} required />
      </div>
      <div>
        <Label htmlFor="description">描述</Label>
        <Input id="description" name="description" defaultValue={textbook?.description || ""} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_free"
          name="is_free"
          defaultChecked={textbook?.is_free ?? true}
        />
        <Label htmlFor="is_free">免费</Label>
      </div>
      <div>
        <Label htmlFor="free_units_count">免费单元数</Label>
        <Input
          id="free_units_count"
          name="free_units_count"
          type="number"
          defaultValue={textbook?.free_units_count || 0}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : textbook ? "更新" : "创建"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </form>
  );
}
