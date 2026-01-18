"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonItem } from "@/components/lessons/lesson-item";
import { useUnit, useUnitLessons } from "@/features/textbooks/hooks";

export default function UnitLessonsPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { id: textbookId, unitId } = use(params);
  const { data: unit, isLoading: unitLoading } = useUnit(unitId);
  const { data: lessons, isLoading: lessonsLoading } = useUnitLessons(unitId);

  if (unitLoading || lessonsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Unit not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/textbooks/${textbookId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Textbook
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{unit.title}</h1>
        {unit.description && <p className="text-muted-foreground mt-2">{unit.description}</p>}
      </div>

      <div className="space-y-3">
        {lessons?.data && lessons.data.length > 0 ? (
          lessons.data.map((lesson) => <LessonItem key={lesson.id} lesson={lesson} />)
        ) : (
          <p className="text-center text-muted-foreground py-8">No lessons available</p>
        )}
      </div>
    </div>
  );
}
