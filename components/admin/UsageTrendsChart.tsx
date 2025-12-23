"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { UsageTrend } from "@/lib/admin";

interface UsageTrendsChartProps {
  data: UsageTrend[];
}

export function UsageTrendsChart({ data }: UsageTrendsChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Format dates for display
  const formattedData = data.map((trend) => ({
    ...trend,
    displayDate: new Date(trend.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  // Calculate total minutes
  const totalMinutes = data.reduce(
    (sum, trend) => sum + trend.minutesTranscribed,
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Trends</CardTitle>
        <CardDescription>
          Minutes transcribed daily for the last {data.length} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(310 75% 58%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(310 75% 58%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient
                id="colorMinutesDark"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="hsl(310 70% 63%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(310 70% 63%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--foreground))" }}
              label={{
                value: "Minutes",
                angle: -90,
                position: "insideLeft",
                style: { fill: "hsl(var(--foreground))" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--foreground))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [`${value} min`, "Transcribed"]}
            />
            <Area
              type="monotone"
              dataKey="minutesTranscribed"
              stroke={isDarkMode ? "hsl(310 70% 63%)" : "hsl(310 75% 58%)"}
              strokeWidth={2}
              fillOpacity={1}
              fill={isDarkMode ? "url(#colorMinutesDark)" : "url(#colorMinutes)"}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Total minutes summary */}
        <div className="mt-4 text-center">
          <div className="text-sm font-semibold text-muted-foreground">
            Total Minutes Transcribed
          </div>
          <div className="text-3xl font-bold">
            {totalMinutes.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            ≈ {Math.round(totalMinutes / 60)} hours
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
