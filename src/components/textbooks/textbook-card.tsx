import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Textbook } from "@/types";

interface TextbookCardProps {
  textbook: Textbook;
}

export function TextbookCard({ textbook }: TextbookCardProps) {
  return (
    <Link href={`/textbooks/${textbook.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-[3/4] relative bg-muted">
          {textbook.cover_url ? (
            <Image src={textbook.cover_url} alt={textbook.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              暂无封面
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{textbook.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{textbook.grade}</Badge>
            <span className="text-xs text-muted-foreground truncate">{textbook.publisher}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
