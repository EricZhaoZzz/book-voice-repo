"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLesson } from "@/features/textbooks/hooks";
import { AudioPlayer } from "@/features/player/components/AudioPlayer";
import { SubtitleDisplay } from "@/features/player/components/SubtitleDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubtitleData } from "@/types";

export default function PlayPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const { data: lesson, isLoading } = useLesson(lessonId);
  const [currentTime, setCurrentTime] = useState(0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return <div>课程不存在</div>;
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/textbooks/${lesson.unit.textbook.id}/units/${lesson.unit_id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回课程列表
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{lesson.name}</h1>
        <p className="text-muted-foreground">
          {lesson.unit.textbook.name} - {lesson.unit.name}
        </p>
      </div>

      <AudioPlayer lesson={lesson} onTimeUpdate={setCurrentTime} />

      {lesson.subtitle_text && (
        <SubtitleDisplay
          subtitleData={lesson.subtitle_text as SubtitleData}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      )}
    </div>
  );
}
