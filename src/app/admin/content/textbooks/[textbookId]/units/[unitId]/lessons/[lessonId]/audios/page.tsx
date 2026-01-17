import { Card } from "@/components/ui/card";

export default function LessonAudiosPage({ params }: { params: Promise<{ lessonId: string }> }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Audio Management</h1>
      <Card className="p-8 text-center text-muted-foreground">
        Audio management page - coming soon
      </Card>
    </div>
  );
}
