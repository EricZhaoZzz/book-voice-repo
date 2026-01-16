"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLesson, updateLesson } from "@/app/admin/actions";
import type { Database } from "@/types/database";

type Lesson = Database["public"]["Tables"]["lessons"]["Row"];

export function LessonForm({
  textbookId,
  unitId,
  lesson,
}: {
  textbookId: string;
  unitId: string;
  lesson?: Lesson;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [audioUrl, setAudioUrl] = useState(lesson?.audio_url || "");
  const [audioDuration, setAudioDuration] = useState(lesson?.audio_duration || 0);
  const [uploading, setUploading] = useState(false);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setAudioUrl(data.url);
        setAudioDuration(data.duration || 0);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      order_num: parseInt(formData.get("order_num") as string),
      audio_url: audioUrl,
      audio_duration: audioDuration,
    };

    startTransition(async () => {
      if (lesson) {
        await updateLesson(lesson.id, data);
      } else {
        await createLesson({ ...data, unit_id: unitId });
      }
      router.push(`/admin/textbooks/${textbookId}/units/${unitId}/lessons`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={lesson?.name} required />
      </div>
      <div>
        <Label htmlFor="order_num">Order</Label>
        <Input
          id="order_num"
          name="order_num"
          type="number"
          defaultValue={lesson?.order_num || 1}
          required
        />
      </div>
      <div>
        <Label htmlFor="audio">Audio File</Label>
        <Input
          id="audio"
          type="file"
          accept="audio/mpeg"
          onChange={handleAudioUpload}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {audioUrl && (
          <p className="text-sm text-green-600">
            Audio uploaded ({Math.floor(audioDuration / 60)}:
            {(audioDuration % 60).toString().padStart(2, "0")})
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !audioUrl}>
          {isPending ? "Saving..." : lesson ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
