import Link from "next/link";
import { getTextbooks, deleteTextbook } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "./delete-button";

export default async function TextbooksPage() {
  const textbooks = await getTextbooks();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Textbooks</h1>
        <Link href="/admin/textbooks/new">
          <Button>Add Textbook</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Grade</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Publisher</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Version</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {textbooks.map((textbook) => (
              <tr key={textbook.id} className="border-b">
                <td className="px-4 py-3 text-sm">{textbook.name}</td>
                <td className="px-4 py-3 text-sm">{textbook.grade}</td>
                <td className="px-4 py-3 text-sm">{textbook.publisher}</td>
                <td className="px-4 py-3 text-sm">{textbook.version}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <Link href={`/admin/textbooks/${textbook.id}/units`}>
                    <Button variant="ghost" size="sm">
                      Units
                    </Button>
                  </Link>
                  <Link href={`/admin/textbooks/${textbook.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <DeleteButton id={textbook.id} action={deleteTextbook} />
                </td>
              </tr>
            ))}
            {textbooks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No textbooks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
