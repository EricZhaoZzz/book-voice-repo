import Link from "next/link";
import { getTextbook, getUnits, deleteUnit } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/app/admin/textbooks/delete-button";

export default async function UnitsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [textbook, units] = await Promise.all([getTextbook(id), getUnits(id)]);

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/textbooks" className="text-sm text-gray-500 hover:underline">
          ← Back to Textbooks
        </Link>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Units - {textbook.name}</h1>
        <Link href={`/admin/textbooks/${id}/units/new`}>
          <Button>Add Unit</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Order</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Free</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="border-b">
                <td className="px-4 py-3 text-sm">{unit.order_num}</td>
                <td className="px-4 py-3 text-sm">{unit.name}</td>
                <td className="px-4 py-3 text-sm">{unit.is_free ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/admin/textbooks/${id}/units/${unit.id}/lessons`}>
                    <Button variant="ghost" size="sm">
                      Lessons
                    </Button>
                  </Link>
                  <Link href={`/admin/textbooks/${id}/units/${unit.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <DeleteButton id={unit.id} action={deleteUnit} />
                </td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No units found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
