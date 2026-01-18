"use client";

import type { Database } from "@/types/database";

type UserDetail = Database["public"]["Tables"]["users"]["Row"] & {
  user_stats?: Database["public"]["Tables"]["user_stats"]["Row"] | null;
  learning_records?: Array<{
    id: string;
    lesson_id: string;
    played_seconds: number;
    completed: boolean;
    created_at: string;
    lessons?: {
      id: string;
      name: string;
      unit_id: string;
      units?: {
        id: string;
        textbook_id: string;
        name: string;
        textbooks?: {
          id: string;
          name: string;
        } | null;
      } | null;
    } | null;
  }>;
};

interface UserDetailsProps {
  user: UserDetail;
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

export function UserDetails({ user }: UserDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p className="font-medium">{user.email || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Username</label>
            <p className="font-medium">{user.username || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Role</label>
            <p className="font-medium">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  roleColors[user.role as string] || roleColors.student
                }`}
              >
                {user.role}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Status</label>
            <p className="font-medium">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  statusColors[user.status as string] || statusColors.active
                }`}
              >
                {user.status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Registered</label>
            <p className="font-medium">
              {user.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Last Login</label>
            <p className="font-medium">
              {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Learning Statistics</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{user.user_stats?.total_learning_minutes || 0}</p>
            <p className="text-sm text-muted-foreground">Total Minutes</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{user.user_stats?.total_lessons_completed || 0}</p>
            <p className="text-sm text-muted-foreground">Lessons Completed</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{user.user_stats?.streak_days || 0}</p>
            <p className="text-sm text-muted-foreground">Streak Days</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">
              {user.user_stats?.last_activity_at
                ? new Date(user.user_stats.last_activity_at).toLocaleDateString()
                : "Never"}
            </p>
            <p className="text-sm text-muted-foreground">Last Active</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Learning Records</h2>
        {user.learning_records && user.learning_records.length > 0 ? (
          <div className="space-y-2">
            {user.learning_records.slice(0, 10).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">
                    {record.lessons?.units?.textbooks?.name || "Unknown Textbook"} -{" "}
                    {record.lessons?.units?.name || "Unknown Unit"} -{" "}
                    {record.lessons?.name || "Unknown Lesson"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(record.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{Math.round(record.played_seconds / 60)} min</p>
                  <p
                    className={`text-sm ${record.completed ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {record.completed ? "Completed" : "In Progress"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No learning records found</p>
        )}
      </div>
    </div>
  );
}
