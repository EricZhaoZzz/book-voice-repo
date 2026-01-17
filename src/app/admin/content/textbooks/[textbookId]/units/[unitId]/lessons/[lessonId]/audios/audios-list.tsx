"use client";

import { useState, useTransition } from "react";
import { createAudio, updateAudio, deleteAudio, setDefaultAudio } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Audio {
  id: string;
  lesson_id: string;
  title: string;
  type: "main" | "listening" | "practice";
  audio_url: string;
  duration: number | null;
  order_num: number;
  is_default: boolean;
  subtitle_text: unknown;
  created_at: string;
  updated_at: string;
}

interface AudiosListProps {
  lessonId: string;
  audios: Audio[];
}

const typeColors: Record<string, string> = {
  main: "bg-blue-100 text-blue-800",
  listening: "bg-green-100 text-green-800",
  practice: "bg-purple-100 text-purple-800",
};

export function AudiosList({ lessonId, audios }: AudiosListProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "main" as "main" | "listening" | "practice",
    audio_url: "",
    duration: "",
    order_num: 0,
    is_default: false,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      type: "main",
      audio_url: "",
      duration: "",
      order_num: 0,
      is_default: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (editingId) {
          await updateAudio(editingId, {
            title: formData.title,
            type: formData.type,
            audio_url: formData.audio_url,
            duration: formData.duration ? parseInt(formData.duration) : undefined,
            order_num: formData.order_num,
            is_default: formData.is_default,
          });
        } else {
          await createAudio({
            lesson_id: lessonId,
            title: formData.title,
            type: formData.type,
            audio_url: formData.audio_url,
            duration: formData.duration ? parseInt(formData.duration) : undefined,
            order_num: formData.order_num,
            is_default: formData.is_default,
          });
        }
        resetForm();
      } catch (error) {
        console.error("Failed to save audio:", error);
      }
    });
  };

  const handleEdit = (audio: Audio) => {
    setEditingId(audio.id);
    setFormData({
      title: audio.title,
      type: audio.type,
      audio_url: audio.audio_url,
      duration: audio.duration?.toString() || "",
      order_num: audio.order_num,
      is_default: audio.is_default,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audio?")) return;
    startTransition(async () => {
      try {
        await deleteAudio(id);
      } catch (error) {
        console.error("Failed to delete audio:", error);
      }
    });
  };

  const handleSetDefault = async (id: string) => {
    startTransition(async () => {
      try {
        await setDefaultAudio(id);
      } catch (error) {
        console.error("Failed to set default audio:", error);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Audio Files</h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          {showForm ? "Cancel" : "Add Audio"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Audio title"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "main" | "listening" | "practice",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="main">Main</option>
                  <option value="listening">Listening</option>
                  <option value="practice">Practice</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Audio URL</label>
                <Input
                  value={formData.audio_url}
                  onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Duration (seconds)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Order</label>
                <Input
                  type="number"
                  value={formData.order_num}
                  onChange={(e) =>
                    setFormData({ ...formData, order_num: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is_default" className="text-sm font-medium">
                  Set as default audio
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Duration</th>
              <th className="text-left p-3 font-medium">Default</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {audios.length > 0 ? (
              audios.map((audio) => (
                <tr key={audio.id} className="border-t hover:bg-muted/25">
                  <td className="p-3">{audio.order_num}</td>
                  <td className="p-3 font-medium">{audio.title}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        typeColors[audio.type] || "bg-gray-100"
                      }`}
                    >
                      {audio.type}
                    </span>
                  </td>
                  <td className="p-3">
                    {audio.duration
                      ? `${Math.floor(audio.duration / 60)}:${String(audio.duration % 60).padStart(2, "0")}`
                      : "-"}
                  </td>
                  <td className="p-3">
                    {audio.is_default ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
                        Default
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(audio.id)}
                        disabled={isPending}
                      >
                        Set Default
                      </Button>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(audio)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(audio.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No audio files found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
