import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Textbook } from "@/types/api";

interface TextbookCardProps {
  textbook: Textbook;
}

export function TextbookCard({ textbook }: TextbookCardProps) {
  return (
    <Link
      href={`/textbooks/${textbook.id}`}
      className="group block rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
        <Image
          src={textbook.cover_url || "/placeholder-book.png"}
          alt={textbook.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 font-semibold">{textbook.name}</h3>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{textbook.grade}</Badge>
          <span className="text-sm text-muted-foreground">{textbook.publisher}</span>
        </div>
      </div>
    </Link>
  );
}
