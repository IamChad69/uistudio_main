"use client";

import { PricingTable } from "@clerk/nextjs";
import Image from "next/image";
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CrownIcon, CreditCard, Settings, CheckCircle } from "lucide-react";

export default function PricingPage() {
  const theme = useCurrentTheme();
  const currentMonth = format(new Date(), "MMMM yyyy");

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-8 pt-[16vh] 2xl:pt-48">
        {/* Header */}
        <div className="space-y-6 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/UiScraperLogo-dark.png"
              alt="logo"
              width={60}
              height={60}
              className="hidden md:block"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold md:text-4xl mb-3">
              {currentMonth} • Pricing Plans
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your development workflow. Scale
              up as your needs grow.
            </p>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Free Plan
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Perfect for getting started
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CrownIcon className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="text-center py-4">
                <div className="text-3xl font-bold text-foreground mb-1">
                  $0
                </div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>5 API credits per day</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Basic UI extraction</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Community support</span>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Current Plan
              </Button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-xl border-2 border-primary bg-card p-8 shadow-sm relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Pro Plan
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    For professional developers
                  </p>
                </div>
                <div className="p-2 bg-primary/20 rounded-lg">
                  <CrownIcon className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="text-center py-4">
                <div className="text-3xl font-bold text-foreground mb-1">
                  $19
                </div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>100 API credits per day</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Advanced UI extraction</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Custom integrations</span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <CrownIcon className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>

        {/* Features Table */}
        <div className="rounded-xl border bg-card p-8 shadow-sm max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Feature Comparison
              </h3>
              <p className="text-sm text-muted-foreground">
                See what's included in each plan
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>Feature</div>
                <div className="text-center">Free</div>
                <div className="text-center">Pro</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm items-center py-2">
                <div>Daily API Credits</div>
                <div className="text-center">5</div>
                <div className="text-center font-medium">100</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm items-center py-2">
                <div>UI Extraction</div>
                <div className="text-center">Basic</div>
                <div className="text-center font-medium">Advanced</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm items-center py-2">
                <div>Support</div>
                <div className="text-center">Community</div>
                <div className="text-center font-medium">Priority</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm items-center py-2">
                <div>Custom Integrations</div>
                <div className="text-center">-</div>
                <div className="text-center font-medium">✓</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="rounded-xl border bg-card p-8 shadow-sm max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Detailed Pricing
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete pricing information and billing details
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
      </section>
    </div>
  );
}
