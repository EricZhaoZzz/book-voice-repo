"use client";

import { useTextbooks } from "@/features/textbooks/hooks";
import { TextbookCard } from "@/components/textbooks/textbook-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: textbooks, isLoading } = useTextbooks();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">推荐课本</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {textbooks?.data.map((textbook) => (
              <TextbookCard key={textbook.id} textbook={textbook} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
