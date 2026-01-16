import Link from "next/link";
import { getTextbooks, deleteTextbook } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "./delete-button";

export default async function TextbooksPage() {
  const textbooks = await getTextbooks();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">教材管理</h1>
        <Link href="/admin/textbooks/new">
          <Button>添加教材</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium">年级</th>
              <th className="px-4 py-3 text-left text-sm font-medium">出版社</th>
              <th className="px-4 py-3 text-left text-sm font-medium">版本</th>
              <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
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
                      单元
                    </Button>
                  </Link>
                  <Link href={`/admin/textbooks/${textbook.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      编辑
                    </Button>
                  </Link>
                  <DeleteButton id={textbook.id} action={deleteTextbook} />
                </td>
              </tr>
            ))}
            {textbooks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  暂无教材
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
