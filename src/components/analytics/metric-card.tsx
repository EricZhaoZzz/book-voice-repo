interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  trend?: string;
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
