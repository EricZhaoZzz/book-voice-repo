import { Card } from "@/components/ui/card";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Details</h1>
      <Card className="p-8 text-center text-muted-foreground">User details page - coming soon</Card>
    </div>
  );
}
