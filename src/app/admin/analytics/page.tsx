import { getAnalyticsData } from "../actions";
import { MetricCard } from "@/components/analytics/metric-card";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data.totalUsers}
          icon="👥"
          trend="+12% from last month"
        />
        <MetricCard title="New Today" value={data.todayNewUsers} icon="🆕" />
        <MetricCard title="Weekly Active" value={data.weeklyActiveUsers} icon="📈" />
        <MetricCard title="Lessons Completed" value={data.totalLessonsCompleted} icon="✅" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h3 className="font-medium mb-4">Learning Time Distribution</h3>
          <div className="h-48 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-lg">
            Chart placeholder - Learning time by hour
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-medium mb-4">Content Popularity</h3>
          <div className="h-48 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-lg">
            Chart placeholder - Top textbooks
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Learning Hours"
          value={Math.round(data.totalLearningMinutes / 60)}
          icon="⏱️"
        />
        <MetricCard title="Textbooks" value={data.textbookCount} icon="📚" />
        <MetricCard
          title="Avg. Session (min)"
          value={
            data.totalUsers > 0
              ? Math.round(data.totalLearningMinutes / Math.max(data.totalUsers, 1))
              : 0
          }
          icon="📊"
        />
        <MetricCard title="Completion Rate" value={0} icon="🎯" />
      </div>
    </div>
  );
}
