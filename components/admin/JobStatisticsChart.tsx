"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { JobStatistic } from "@/lib/admin";

interface JobStatisticsChartProps {
  data: JobStatistic[];
}

interface LegendPayloadItem {
  value?: string;
  color?: string;
}

interface LegendProps {
  payload?: readonly LegendPayloadItem[];
}

export function JobStatisticsChart({ data }: JobStatisticsChartProps) {
  // Format dates for display (e.g., "Jan 1" instead of "2025-01-01")
  const formattedData = data.map((stat) => ({
    ...stat,
    displayDate: new Date(stat.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Custom legend renderer for proper dark mode support
  const renderLegend = (props: LegendProps) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-6 pt-4">
        {payload?.map((entry, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Processing Trends</CardTitle>
        <CardDescription>
          Daily job statistics for the last {data.length} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend content={renderLegend} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Total Jobs"
              dot={{ fill: "hsl(var(--primary))" }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(142 76% 36%)"
              strokeWidth={2}
              name="Completed"
              dot={{ fill: "hsl(142 76% 36%)" }}
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke="hsl(0 84% 60%)"
              strokeWidth={2}
              name="Failed"
              dot={{ fill: "hsl(0 84% 60%)" }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary stats below chart */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-semibold text-muted-foreground">
              Total Jobs
            </div>
            <div className="text-2xl font-bold">
              {data.reduce((sum, stat) => sum + stat.total, 0)}
            </div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">
              Completion Rate
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.reduce((sum, stat) => sum + stat.total, 0) > 0
                ? Math.round(
                    (data.reduce((sum, stat) => sum + stat.completed, 0) /
                      data.reduce((sum, stat) => sum + stat.total, 0)) *
                      100,
                  )
                : 0}
              %
            </div>
          </div>
          <div>
            <div className="font-semibold text-muted-foreground">
              Failure Rate
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {data.reduce((sum, stat) => sum + stat.total, 0) > 0
                ? Math.round(
                    (data.reduce((sum, stat) => sum + stat.failed, 0) /
                      data.reduce((sum, stat) => sum + stat.total, 0)) *
                      100,
                  )
                : 0}
              %
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
