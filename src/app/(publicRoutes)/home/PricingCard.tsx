"use client";
import React, { useState } from "react";
import { PlusIcon, ShieldCheckIcon, CheckIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { BorderTrail } from "./BorderTrail";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const monthlyPrice = 7.99;
  const yearlyPrice = 6.99;
  const yearlySavings = 22;

  return (
    <section className="w-full ">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center gap-x-4">
            <span
              className={cn(
                "text-sm",
                !isYearly && "text-foreground font-medium"
              )}
            >
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span
              className={cn(
                "text-sm",
                isYearly && "text-foreground font-medium"
              )}
            >
              Yearly
              {isYearly && (
                <Badge variant="secondary" className="ml-2">
                  Save {yearlySavings}%
                </Badge>
              )}
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="bg-background relative border p-6 rounded-lg h-[500px] flex flex-col">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Free</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Perfect for getting started
                  </p>
                </div>

                <div className="text-muted-foreground flex items-end gap-0.5 text-xl">
                  <span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter">
                    $0
                  </span>
                  <span>/month</span>
                </div>

                <ul className="space-y-2">
                  <li className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="size-4 text-green-500" />
                    <span>Basic UI scraping</span>
                  </li>
                  <li className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="size-4 text-green-500" />
                    <span>5 components per month</span>
                  </li>
                  <li className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="size-4 text-green-500" />
                    <span>Community support</span>
                  </li>
                </ul>

                <Button className="w-full mt-auto" variant="outline" asChild>
                  <a href="#">Get Started Free</a>
                </Button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-lg border p-6 bg-gradient-to-br from-primary/5 to-primary/10 h-[500px] flex flex-col">
              <PlusIcon className="absolute -top-3 -left-3 size-3" />
              <PlusIcon className="absolute -top-3 -right-3 size-3" />
              <PlusIcon className="absolute -bottom-3 -left-3 size-3" />
              <PlusIcon className="absolute -right-3 -bottom-3 size-3" />
              <BorderTrail
                style={{
                  boxShadow:
                    "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
                }}
                size={100}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Pro</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      For professionals and teams
                    </p>
                  </div>
                  {isYearly && (
                    <Badge variant="secondary" className="ml-2">
                      Save {yearlySavings}%
                    </Badge>
                  )}
                </div>

                <div className="text-muted-foreground flex items-end gap-0.5 text-xl">
                  <span>$</span>
                  <span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter">
                    {isYearly ? yearlyPrice : monthlyPrice}
                  </span>
                  <span>/month</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {isYearly
                    ? `Billed annually ($${(yearlyPrice * 12).toFixed(0)}/year)`
                    : `Billed monthly ($${monthlyPrice}/month)`}
                </p>

                <ul className="space-y-2">
                  <li className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="size-4 text-green-500" />
                    <span>Unlimited UI scraping</span>
                  </li>
                  <li className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="size-4 text-green-500" />
                    <span>Unlimited components</span>
                  </li>
                  <li className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="size-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="size-4 text-green-500" />
                    <span>Advanced features</span>
                  </li>
                  <li className="flex items-center gap-x-2 text-sm">
                    <CheckIcon className="size-4 text-green-500" />
                    <span>Export to multiple formats</span>
                  </li>
                </ul>

                <Button className="w-full mt-auto" asChild>
                  <a href="#">Start Pro Trial</a>
                </Button>
              </div>
            </div>
          </div>

          <div className="text-muted-foreground flex items-center justify-center gap-x-2 text-sm">
            <ShieldCheckIcon className="size-4" />
            <span>Access to all features with no hidden fees</span>
          </div>
        </div>
      </div>
    </section>
  );
}
