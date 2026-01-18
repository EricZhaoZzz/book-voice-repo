"use client";

import Link from "next/link";
import { Clock, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Lesson } from "@/types/api";

interface LessonItemProps {
  lesson: Lesson;
}

export function LessonItem({ lesson }: LessonItemProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Link href={`/lessons/${lesson.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base truncate">{lesson.title}</h3>
              {lesson.description && (
                <p className="text-sm text-muted-foreground truncate mt-1">{lesson.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(lesson.duration)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
