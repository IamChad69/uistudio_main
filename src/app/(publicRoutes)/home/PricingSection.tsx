"use client";
import React from "react";

import { Pricing } from "./PricingCard";

type Props = {};

const PricingSection = (props: Props) => {
  return (
    <section className="py-16 md:py-24">
      <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-8 mb-16">
        <h2 className="text-4xl font-medium lg:text-5xl tracking-tight">
          Start today for free.
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">No credit card required.</p>
      </div>
      <Pricing />
    </section>
  );
};

export default PricingSection;
