"use client";

import { BrowserStores } from "./Webstores";

export function Browser() {
  return (
    <>
      <section className=" py-24">
        <div className="text-center  ">
          <h2 className="font-aeonik font-medium text-center leading-tight text-3xl sm:text-4xl md:text-4xl lg:text-5xl">
            Works Anywhere You Browse
          </h2>
          <p className="font-aeonik text-center mt-8 font-normal text-md sm:text-lg lg:text-xl  whitespace-pre-line text-landing-textGray max-w-3xl w-[80%] text-muted-foreground md:max-w-2xl mx-auto">
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
