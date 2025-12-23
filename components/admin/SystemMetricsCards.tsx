"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  FileText,
  HardDrive,
  Clock,
} from "lucide-react";
import type { SystemMetrics } from "@/lib/admin";

interface SystemMetricsCardsProps {
  metrics: SystemMetrics;
}

export function SystemMetricsCards({ metrics }: SystemMetricsCardsProps) {
  // Format storage bytes to GB
  const storageGB = (metrics.totalStorageBytes / (1024 * 1024 * 1024)).toFixed(
    2,
  );

  const metricCards = [
    {
      title: "Total Users",
      value: metrics.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Jobs Today",
      value: metrics.totalJobsToday.toLocaleString(),
      icon: Clock,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "Minutes This Month",
      value: metrics.totalMinutesThisMonth.toLocaleString(),
      icon: FileText,
      color: "text-indigo-600 dark:text-indigo-400",
      subtitle: `≈ ${Math.round(metrics.totalMinutesThisMonth / 60)} hours`,
    },
    {
      title: "Storage Used",
      value: `${storageGB} GB`,
      icon: HardDrive,
      color: "text-pink-600 dark:text-pink-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.subtitle && (
              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
