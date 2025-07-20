"use client";

import PageHeader from "@/components/PageHeader";
import React from "react";
import { Button } from "@/components/ui/button";
import { CrownIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { formatDuration, intervalToDuration } from "date-fns";
import { PricingTable, useAuth } from "@clerk/nextjs";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { dark } from "@clerk/themes";

const SettingsPage = () => {
  const theme = useCurrentTheme();
  const trpc = useTRPC();
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });

  const { data: usage } = useQuery(trpc.usage.status.queryOptions());

  const resetTime = React.useMemo(() => {
    if (!usage?.msBeforeNext) return "unknown";

    try {
      return formatDuration(
        intervalToDuration({
          start: new Date(),
          end: new Date(Date.now() + usage.msBeforeNext),
        }),
        { format: ["months", "days", "hours"] }
      );
    } catch (error) {
      return "unknown";
    }
  }, [usage?.msBeforeNext]);

  return (
    <div className="w-full flex flex-col gap-8 min-h-0">
      <PageHeader
        heading="Settings"
        description="Manage your account settings"
      />

      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        <div className="rounded-lg border bg-background p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan</span>
              <div className="flex gap-4">
                <span className="text-sm">
                  {usage
                    ? `${usage.remainingPoints}/${hasProAccess ? "100" : "5"}`
                    : "0/5"}
                </span>
                <span className="text-sm">{resetTime}</span>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{
                  width: usage
                    ? `${Math.min(
                        100,
                        (usage.remainingPoints / (hasProAccess ? 100 : 5)) * 100
                      )}%`
                    : "0%",
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {usage ? usage.remainingPoints : 0} of your daily credits used
              </span>
              <InfoIcon className="h-4 w-4 text-muted-foreground" />
            </div>

            {!hasProAccess && (
              <Button className="w-full mt-4" asChild>
                <Link href="/pricing">
                  <CrownIcon className="mr-2 h-4 w-4" />
                  Upgrade
                </Link>
              </Button>
            )}
          </div>
        </div>

        <PricingTable
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
            elements: {
              pricingTableCard: "border! shadow-none! rounded-lg!",
            },
          }}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
