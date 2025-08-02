"use client";

import { BrowserStores } from "./Webstores";

export function Browser() {
  return (
    <>
      <section className=" py-24">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Works Anywhere You Browse
          </h2>
          <p className="text-white/60">
            Our UiScraper integrates directly into your browser. No separate app
            needed. Just add the extension and go.
          </p>
        </div>


        <div className="container mx-auto mt-12 max-w-6xl px-4">
          <BrowserStores />
        </div>
      </section>
    </>
  );
}
