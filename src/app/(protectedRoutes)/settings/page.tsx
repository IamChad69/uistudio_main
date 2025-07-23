"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CrownIcon,
  InfoIcon,
  Settings,
  CreditCard,
  Calendar,
  ExternalLink,
  Box,
  Cloud,
  CheckCircle,
  BarChart3,
  User,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { formatDuration, intervalToDuration, format } from "date-fns";
import { PricingTable, useAuth } from "@clerk/nextjs";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { dark } from "@clerk/themes";
import PageHeader from "@/components/PageHeader";

type SettingsSection = "profile" | "usage" | "integrations" | "billing";

const SettingsPage = () => {
  const theme = useCurrentTheme();
  const trpc = useTRPC();
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });
  const [activeSection, setActiveSection] =
    React.useState<SettingsSection>("integrations");

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

  const currentMonth = format(new Date(), "MMMM yyyy");
  const usedPoints = hasProAccess
    ? 100 - (usage?.remainingPoints || 0)
    : 5 - (usage?.remainingPoints || 0);
  const totalPoints = hasProAccess ? 100 : 5;

  const navigationItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "integrations", label: "Integrations", icon: Box },
    { id: "usage", label: "Usage", icon: BarChart3 },
    { id: "billing", label: "Billing & Invoices", icon: CreditCard },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Profile
              </h2>
              <p className="text-muted-foreground">
                Manage your profile settings
              </p>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Integrations
              </h2>
              <p className="text-muted-foreground">
                Connect your tools and services to enhance your workflow
              </p>
            </div>

            <div className="space-y-4">
              {/* GitHub Integration */}
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">GitHub</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect GitHub for Background Agents, Bugbot and
                        enhanced codebase context
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    Connect
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Slack Integration */}
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6.194 14.644c0 1.16-.943 2.107-2.107 2.107-1.164 0-2.107-.947-2.107-2.107 0-1.16.943-2.106 2.107-2.106 1.164 0 2.107.946 2.107 2.106zm5.778-2.106c-1.164 0-2.107.946-2.107 2.106 0 1.16.943 2.107 2.107 2.107 1.164 0 2.107-.947 2.107-2.107 0-1.16-.943-2.106-2.107-2.106zm5.778 0c-1.164 0-2.107.946-2.107 2.106 0 1.16.943 2.107 2.107 2.107 1.164 0 2.107-.947 2.107-2.107 0-1.16-.943-2.106-2.107-2.106zm-5.778-5.778c-1.164 0-2.107.943-2.107 2.107 0 1.164.943 2.107 2.107 2.107 1.164 0 2.107-.943 2.107-2.107 0-1.164-.943-2.107-2.107-2.107zm0 5.778c-1.164 0-2.107.946-2.107 2.106 0 1.16.943 2.107 2.107 2.107 1.164 0 2.107-.947 2.107-2.107 0-1.16-.943-2.106-2.107-2.106z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Slack</h3>
                      <p className="text-sm text-muted-foreground">
                        Work with Background Agents from Slack
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    Connect
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "usage":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Usage</h2>
              <p className="text-muted-foreground">
                Monitor your API usage and credits
              </p>
            </div>

            {/* Usage Summary Card */}
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {currentMonth} • Usage Summary
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track your API usage and credits
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Usage Settings
                  </Button>
                </div>

                {/* Current Usage Display */}
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {usage?.remainingPoints || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Credits Remaining
                  </div>
                </div>

                {/* Usage Table */}
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div>Type</div>
                    <div>Used</div>
                    <div>Limit</div>
                    <div className="text-right">Remaining</div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm items-center py-2">
                    <div className="font-medium">API Credits</div>
                    <div>{usedPoints}</div>
                    <div>{totalPoints}</div>
                    <div className="text-right font-medium">
                      {usage?.remainingPoints || 0}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm items-center py-2 border-t pt-4">
                    <div className="font-medium">Subtotal:</div>
                    <div></div>
                    <div></div>
                    <div className="text-right font-medium">
                      {usage?.remainingPoints || 0}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Usage Progress
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(
                        ((totalPoints - (usage?.remainingPoints || 0)) /
                          totalPoints) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          ((totalPoints - (usage?.remainingPoints || 0)) /
                            totalPoints) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Reset Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Resets in {resetTime}</span>
                  </div>
                  <InfoIcon className="h-4 w-4" />
                </div>

                {/* Upgrade Button */}
                {!hasProAccess && (
                  <Button className="w-full mt-4" size="lg" asChild>
                    <Link href="/pricing">
                      <CrownIcon className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Billing & Invoices
              </h2>
              <p className="text-muted-foreground">
                Manage your subscription and billing information
              </p>
            </div>

            {/* Billing Management */}
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Billing & Subscription
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage your subscription and billing information
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {hasProAccess ? "Pro Plan" : "Free Plan"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {hasProAccess
                          ? "Unlimited credits"
                          : "5 credits per day"}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="rounded-xl border bg-card p-8 shadow-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Available Plans
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the plan that's right for you
                  </p>
                </div>
                <PricingTable
                  appearance={{
                    baseTheme: theme === "dark" ? dark : undefined,
                    elements: {
                      pricingTableCard:
                        "border! shadow-none! rounded-lg! bg-transparent!",
                    },
                  }}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 min-h-0">
      <PageHeader
        heading="Settings"
        description="Manage your account settings and billing"
      />
      <div className="w-full flex min-h-0">
        {/* Sidebar Navigation */}
        <div className="w-64  bg-background p-6">
          <div className="space-y-6">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as SettingsSection)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary "
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SettingsPage;
