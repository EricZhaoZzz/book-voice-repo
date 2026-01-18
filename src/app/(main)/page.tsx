"use client";

import { useTextbooks } from "@/features/textbooks/hooks/use-textbooks";
import { TextbookCard } from "@/components/textbooks/textbook-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data, isLoading } = useTextbooks();

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Recommended Textbooks</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          : data?.data.map((textbook) => <TextbookCard key={textbook.id} textbook={textbook} />)}
      </div>
    </div>
  );
}
