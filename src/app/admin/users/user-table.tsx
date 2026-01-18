"use client";

import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"] & {
  user_stats?: Database["public"]["Tables"]["user_stats"]["Row"] | null;
};

interface UserTableProps {
  users: User[];
  total: number;
}

const roleColors: Record<string, string> = {
  student: "bg-gray-100 text-gray-800",
  admin: "bg-blue-100 text-blue-800",
  super_admin: "bg-purple-100 text-purple-800",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-yellow-100 text-yellow-800",
  banned: "bg-red-100 text-red-800",
};

export function UserTable({ users, total }: UserTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium">User</th>
            <th className="text-left p-3 font-medium">Role</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Learning Time</th>
            <th className="text-left p-3 font-medium">Completed</th>
            <th className="text-left p-3 font-medium">Last Active</th>
            <th className="text-left p-3 font-medium">Registered</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t hover:bg-muted/25">
              <td className="p-3">
                <div className="font-medium">{user.email || "No email"}</div>
                <div className="text-xs text-muted-foreground">
                  {user.username || "No username"}
                </div>
              </td>
              <td className="p-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    roleColors[user.role as string] || roleColors.student
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="p-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    statusColors[user.status as string] || statusColors.active
                  }`}
                >
                  {user.status}
                </span>
              </td>
              <td className="p-3">
                {Math.round((user.user_stats?.total_learning_minutes || 0) / 60)}h
              </td>
              <td className="p-3">{user.user_stats?.total_lessons_completed || 0}</td>
              <td className="p-3">
                {user.user_stats?.last_activity_at
                  ? new Date(user.user_stats.last_activity_at).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-3">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </td>
              <td className="p-3">
                <a href={`/admin/users/${user.id}`} className="text-primary hover:underline">
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
