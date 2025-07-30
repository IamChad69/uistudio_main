import React from "react";
import SectionWithMockup from "./home/Context";
import { Metadata } from "next";
import { BasicLayout } from "@/components/Layouts/LandingLayout/LandingLayout";
import { Features } from "./home/FeatureGrid";
import PricingSection from "./home/PricingSection";
import { HeroSection } from "./home/HeroSections";
import { FAQSection } from "./home/FAQSection";
import { Header } from "./home/NavBar";
import AppFeatures from "./home/AppFeatures";
import ComponentLibrary from "./home/ComponentLibrary";
import FeatureSection from "./home/FeatureSection";
import UiSandbox from "./home/UiSandbox.tsx";
import { BrowserStores } from "./home/Webstores";
import { Browser } from "./home/Browser";

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
      {" "}
      <Header />
      <div className="min-h-screen mx-auto max-w-7xl px-2 lg:px-12">
        <HeroSection />
        <SectionWithMockup />
        <FeatureSection />
        <UiSandbox />
        <ComponentLibrary />
        <Browser />
        <AppFeatures />
        <Features />
        <PricingSection />
        <FAQSection />
      </div>
    </BasicLayout>
  );
}
