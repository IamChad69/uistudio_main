"use client";

import { BrowserStores } from "./Webstores";

export function Browser() {
  return (
    <section className="py-16 md:py-24">
      <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:space-y-8 mb-16">
        <h2 className="text-4xl font-medium lg:text-5xl tracking-tight">
          Works Anywhere You Browse
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Our UiScraper integrates directly into your browser. No separate app
          needed. Just add the extension and go.
        </p>
      </div>

      <div className="w-full mt-12">
        <BrowserStores />
      </div>
    </section>
  );
}
