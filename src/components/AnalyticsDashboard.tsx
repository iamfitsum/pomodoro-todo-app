import {
  AlarmCheck,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Flame,
  ListChecks,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { api } from "~/utils/api";

const weeklyConfig = {
  done: {
    label: "Done",
    color: "#38bdf8",
  },
  open: {
    label: "Open",
    color: "#082f49",
  },
};

const priorityConfig = {
  LOW: {
    label: "Low",
    color: "#bae6fd",
  },
  MEDIUM: {
    label: "Medium",
    color: "#38bdf8",
  },
  HIGH: {
    label: "High",
    color: "#0369a1",
  },
};

const focusConfig = {
  focusMinutes: {
    label: "Focus Minutes",
    color: "#0ea5e9",
  },
};

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  hint,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}) => {
  return (
    <Card className="bg-muted/40">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-sky-500" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      </CardContent>
    </Card>
  );
};

const AnalyticsDashboardSkeleton = () => {
  return (
    <div className="grid h-full w-full min-h-0 gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`skeleton-top-${index}`} className="bg-muted/40">
            <CardHeader className="pb-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="h-7 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`skeleton-mid-${index}`} className="bg-muted/40">
            <CardHeader className="pb-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="h-7 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="bg-muted/40 min-h-0">
          <CardHeader className="pb-2">
            <div className="h-4 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </CardHeader>
          <CardContent className="h-[220px] pt-0">
            <div className="h-full w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </CardContent>
        </Card>
        <Card className="bg-muted/40 min-h-0">
          <CardHeader className="pb-2">
            <div className="h-4 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </CardHeader>
          <CardContent className="h-[220px] pt-0">
            <div className="h-full w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/40 min-h-0">
        <CardHeader className="pb-2">
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </CardHeader>
        <CardContent className="h-[180px] pt-0">
          <div className="h-full w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </CardContent>
      </Card>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const { data, isLoading } = api.todo.analyticsOverview.useQuery();

  if (isLoading || !data) {
    return <AnalyticsDashboardSkeleton />;
  }

  const { kpis, weeklyTrend, weeklyFocusTrend, priorityDistribution } = data;
  const hasPriorityData = priorityDistribution.some((item) => item.total > 0);
  const hasWeeklyTaskData = weeklyTrend.some(
    (item) => item.done > 0 || item.open > 0
  );
  const priorityTotal = priorityDistribution.reduce(
    (acc, item) => acc + item.total,
    0
  );
  const priorityChartData = priorityDistribution.map((item) => ({
    ...item,
    __total: priorityTotal,
  }));

  return (
    <div className="grid h-full w-full min-h-0 gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          title="Completion Rate"
          value={`${kpis.completionRate}%`}
          icon={CheckCircle2}
          hint={`${kpis.completedTasks}/${kpis.totalTasks} tasks`}
        />
        <StatCard
          title="Focus Time"
          value={formatMinutes(kpis.focusMinutes)}
          icon={Clock3}
          hint={`${kpis.totalTomatoes} tomatoes total`}
        />
        <StatCard
          title="Overdue Open"
          value={kpis.overdueOpen}
          icon={AlertTriangle}
          hint="needs immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard
          title="New (7 Days)"
          value={kpis.createdLast7Days}
          icon={ListChecks}
          hint="tasks created recently"
        />
        <StatCard
          title="Completed"
          value={kpis.completedTasks}
          icon={AlarmCheck}
          hint="all-time completed tasks"
        />
        <StatCard
          title="Tomatoes"
          value={kpis.totalTomatoes}
          icon={Flame}
          hint="total focus sessions"
        />
      </div>

      <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="bg-muted/40 min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Task Trend (6 weeks)</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] pt-0">
            <ChartContainer config={weeklyConfig} className="h-full w-full">
              <BarChart data={weeklyTrend}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="done" stackId="tasks" fill="var(--color-done)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="open" stackId="tasks" fill="var(--color-open)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            {!hasWeeklyTaskData && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                No activity for this week yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/40 min-h-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Open Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] pt-0">
            {!hasPriorityData ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                No open tasks.
              </div>
            ) : (
              <ChartContainer config={priorityConfig} className="h-full w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={priorityChartData}
                    dataKey="total"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={4}
                  >
                    {priorityChartData.map((item) => (
                      <Cell
                        key={item.priority}
                        fill={`var(--color-${item.priority})`}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/40 min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Focus Minutes (6 weeks)</CardTitle>
        </CardHeader>
        <CardContent className="h-[180px] pt-0">
          <ChartContainer config={focusConfig} className="h-full w-full">
            <LineChart data={weeklyFocusTrend}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="focusMinutes"
                stroke="var(--color-focusMinutes)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--color-focusMinutes)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
