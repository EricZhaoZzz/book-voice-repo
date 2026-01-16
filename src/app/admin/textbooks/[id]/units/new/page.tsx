import { UnitForm } from "../unit-form";

export default async function NewUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">New Unit</h1>
      <UnitForm textbookId={id} />
    </div>
  );
}
