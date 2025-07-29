import React from "react";
import SectionWithMockup from "./home/Context";
import { Header } from "./home/Header";
import { Metadata } from "next";
import { BasicLayout } from "@/components/Layouts/LandingLayout/LandingLayout";
import { Features } from "./home/FeatureGrid";
import PricingSection from "./home/PricingSection";
import { Hero } from "./home/HeroSections";

export const metadata: Metadata = {
  title: "UiScraper",
  description: "UiScraper",
};

// Example data for the SectionWithMockup component
const exampleData1 = {
  title: "Easily Copy HTML & CSS Code from Any Website Element",
  description:
    "Instantly Extract and Copy Code from Any Webpage with One Click — Try It Now!",
  primaryImageSrc: "/hero.png",
  secondaryImageSrc: "/hero.png",
};

export default function HomePage() {
  return (
    <BasicLayout>
      <Header />
      <div className="min-h-screen mx-auto max-w-7xl px-2 lg:px-12">
        <Hero />
        <SectionWithMockup />

        <Features />
        <PricingSection />
      </div>
    </BasicLayout>
  );
}
