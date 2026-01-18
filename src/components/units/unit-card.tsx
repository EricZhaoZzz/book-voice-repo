import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Unit } from "@/types";

interface UnitCardProps {
  unit: Unit;
  textbookId: string;
}

export function UnitCard({ unit, textbookId }: UnitCardProps) {
  return (
    <Link href={`/textbooks/${textbookId}/units/${unit.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="font-semibold">{unit.name}</h3>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        {unit.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{unit.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
