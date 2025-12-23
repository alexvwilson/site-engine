"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { SystemMetrics, SystemHealth } from "@/lib/admin";

interface TodaysActivityCardProps {
  metrics: SystemMetrics;
  health: SystemHealth;
}

export function TodaysActivityCard({
  metrics,
  health,
}: TodaysActivityCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Today's Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Today&apos;s Activity
          </CardTitle>
          <CardDescription>
            Job processing summary for the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Jobs Today</p>
              <p className="text-2xl font-bold">{metrics.totalJobsToday}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{metrics.jobSuccessRate}%</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-1">
              Failure Rate (24h)
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold">{metrics.jobFailureRate}%</p>
              {health.errorSpike && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Spike Detected
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Hour Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Last Hour
          </CardTitle>
          <CardDescription>
            Real-time job processing in the last 60 minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <p className="text-2xl font-bold">{health.lastHourCompleted}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
              <p className="text-2xl font-bold">{health.lastHourFailed}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
              <p className="text-2xl font-bold">{health.lastHourProcessing}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">Total Jobs This Hour</p>
            <p className="text-xl font-semibold">{health.lastHourTotal}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
