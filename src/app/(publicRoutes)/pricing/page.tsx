"use client";

import { PricingTable } from "@clerk/nextjs";
import Image from "next/image";
import { dark } from "@clerk/themes";

import { useCurrentTheme } from "@/hooks/use-current-theme";

export default function PricingPage() {
  const theme = useCurrentTheme();
  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full">
      <section className="space-y-6 pt-[16vh] 2xl:pt-48">
        <div className="space-y-2 flex flex-col items-center mb-10">
          <Image
            src="/UiScraperLogo-dark.png"
            alt="logo"
            width={50}
            height={50}
            className="hidden md:block"
          />
          <h1 className="text-xl font-bold md:text-3xl">Pricing</h1>
          <p className="text-sm text-muted-foreground text-center md:text-base">
            Choose the plan that's right for you.
          </p>
        </div>
      </section>
      <PricingTable
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            pricingTableCard: "border! shadow-none! rounded-lg!",
          },
        }}
      />
    </div>
  );
}
