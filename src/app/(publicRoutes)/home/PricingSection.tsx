"use client";
import React from "react";
import { PricingTable } from "@clerk/nextjs";
import Image from "next/image";
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CrownIcon, CheckCircle } from "lucide-react";
type Props = {};

const PricingSection = (props: Props) => {
  const theme = useCurrentTheme();
  const currentMonth = format(new Date(), "MMMM yyyy");
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <h2 className="text-2xl font-semibold text-center mb-2">
        Start today for free.
      </h2>
      <p className="text-muted-foreground text-center text-base">
        No credit card required.
      </p>
      <div className="flex flex-col max-w-5xl mx-auto w-full">
        <section className="space-y-8 pt-[16vh] 2xl:pt-48">
          {/* Pricing Table */}

          <div className="space-y-6 max-w-4xl mx-auto">
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

          {/* Features Table */}
          <div className="rounded-xl  p-8  max-w-4xl mx-auto">
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
        </section>
      </div>
    </div>
  );
};

export default PricingSection;
