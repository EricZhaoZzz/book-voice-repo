"use client";

import { use } from "react";
import Image from "next/image";
import { useTextbook, useTextbookUnits } from "@/features/textbooks/hooks/use-textbooks";
import { UnitCard } from "@/components/units/unit-card";

export default function TextbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const textbook = useTextbook(id);
  const units = useTextbookUnits(id);

  if (textbook.isLoading || units.isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (textbook.error || units.error) {
    return <div className="p-6 text-red-500">Error loading textbook</div>;
  }

  if (!textbook.data) {
    return <div className="p-6">Textbook not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex gap-6">
        {textbook.data.cover_url && (
          <Image
            src={textbook.data.cover_url}
            alt={textbook.data.name}
            width={200}
            height={280}
            className="rounded-lg shadow-md"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{textbook.data.name}</h1>
          <div className="space-y-1 text-muted-foreground">
            <p>Grade: {textbook.data.grade}</p>
            <p>Publisher: {textbook.data.publisher}</p>
            <p>Version: {textbook.data.version}</p>
          </div>
          {textbook.data.description && <p className="mt-4 text-sm">{textbook.data.description}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {units.data?.map((unit) => (
          <UnitCard key={unit.id} unit={unit} textbookId={id} />
        ))}
      </div>
    </div>
  );
}
