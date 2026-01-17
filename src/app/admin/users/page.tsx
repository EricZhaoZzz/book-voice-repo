import { getUsers } from "../actions";
import { UserTable } from "./user-table";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const roleParam = params.role as string;
  const statusParam = params.status as string;

  const { data, count } = await getUsers({
    search: params.search as string,
    role: roleParam as "student" | "admin" | "super_admin" | undefined,
    status: statusParam as "active" | "suspended" | "banned" | undefined,
    page: Number(params.page) || 1,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      <UserTable users={data} total={count || 0} />
    </div>
  );
}
