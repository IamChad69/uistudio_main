"use client";
import React from "react";

import { Pricing } from "./PricingCard";

type Props = {};

const PricingSection = (props: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24">
      <div className="relative z-10 mx-auto  mb-16 space-y-4 text-center md:space-y-8">
        <h2 className="text-balance text-4xl font-medium lg:text-5xl">
          Start today for free.
        </h2>
        <p className="text-white/60">No credit card required.</p>
      </div>
      <Pricing />
    </div>
  );
};

export default PricingSection;
