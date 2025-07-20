import React from "react";
import Image from "next/image";
import ProjectForm from "./ui/project-form";
import ProjectList from "./ui/poject-list";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48 ">
        <div className="flex flex-col items-center ">
          <Image
            src="/UiScraperLogo-light.png"
            alt="Hero Image"
            width={50}
            height={50}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-center">
          Build your own AI-powered web scraper.
        </h1>
        <p className="text-muted-foreground text-center text-lg md:text-xl">
          UiScraper is a tool that allows you to build your own AI-powered web
          scraper.
        </p>
        <div>
          <ProjectForm />
        </div>
        <ProjectList />
      </section>
    </div>
  );
};

export default page;
