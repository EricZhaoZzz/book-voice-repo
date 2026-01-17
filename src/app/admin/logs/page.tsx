import { getOperationLogs } from "../actions";
import { LogsTable } from "./logs-table";

interface LogData {
  data: Array<{
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
  count: number;
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  let logsData: LogData = { data: [], count: 0 };
  try {
    const result = await getOperationLogs({
      module: params.module as string,
      startDate: params.start as string,
      endDate: params.end as string,
      page: Number(params.page) || 1,
    });
    logsData = {
      data: result.data as LogData["data"],
      count: result.count,
    };
  } catch {
    // Return empty if not super_admin
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Operation Logs</h1>
      <LogsTable logs={logsData.data} total={logsData.count} />
    </div>
  );
}
