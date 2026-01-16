import { createClient } from "@/lib/supabase/server";
import { UnitForm } from "../../unit-form";

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const { id, unitId } = await params;
  const supabase = await createClient();
  const { data: unit } = await supabase.from("units").select("*").eq("id", unitId).single();

  if (!unit) {
    return <div>Unit not found</div>;
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Unit</h1>
      <UnitForm textbookId={id} unit={unit} />
    </div>
  );
}
