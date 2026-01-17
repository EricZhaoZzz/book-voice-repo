"use client";

interface LogsTableProps {
  logs: Array<{
    id: string;
    user_id: string | null;
    action: string;
    module: string;
    resource_type: string | null;
    resource_id: string | null;
    ip_address: string | null;
    created_at: string;
    users?: { email: string | null } | null;
  }>;
  total: number;
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  login: "bg-gray-100 text-gray-800",
  logout: "bg-gray-100 text-gray-800",
};

export function LogsTable({ logs }: LogsTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium">Time</th>
            <th className="text-left p-3 font-medium">User</th>
            <th className="text-left p-3 font-medium">Module</th>
            <th className="text-left p-3 font-medium">Action</th>
            <th className="text-left p-3 font-medium">Resource</th>
            <th className="text-left p-3 font-medium">IP Address</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log.id} className="border-t hover:bg-muted/25">
                <td className="p-3 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-3">{log.users?.email || "System"}</td>
                <td className="p-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted">
                    {log.module}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      actionColors[log.action] || "bg-gray-100"
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="p-3">
                  {log.resource_type && (
                    <span className="text-muted-foreground">
                      {log.resource_type}
                      {log.resource_id && ` (${log.resource_id.slice(0, 8)}...)`}
                    </span>
                  )}
                </td>
                <td className="p-3 font-mono text-xs">{log.ip_address || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                No operation logs found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
