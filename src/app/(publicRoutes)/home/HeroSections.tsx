import { MoveRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoCloud } from "./LogoCloud";
import Image from "next/image";
import { Hero7 } from "./SocialProof";
import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer";

const demoData = {
  heading: "A Collection of Components Built With Shadcn & Tailwind",
  description:
    "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  button: {
    text: "Discover all components",
    url: "https://www.shadcnblocks.com",
  },
  reviews: {
    count: 200,
    avatars: [
      {
        src: "https://www.shadcnblocks.com/images/block/avatar-1.webp",
        alt: "Avatar 1",
      },
      {
        src: "https://www.shadcnblocks.com/images/block/avatar-2.webp",
        alt: "Avatar 2",
      },
      {
        src: "https://www.shadcnblocks.com/images/block/avatar-3.webp",
        alt: "Avatar 3",
      },
      {
        src: "https://www.shadcnblocks.com/images/block/avatar-4.webp",
        alt: "Avatar 4",
      },
      {
        src: "https://www.shadcnblocks.com/images/block/avatar-5.webp",
        alt: "Avatar 5",
      },
    ],
  },
};

function HeroSection() {
  return (
    <div className="w-full max-w-7xl mx-auto   flex flex-col justify-center relative h-full min-h-[90vh] sm:pb-[160px] sm:h-full py-20">
      <div className="container mx-auto mt-8">
        <div className="grid grid-cols-1 gap-6 items-center lg:grid-cols-2  leading-loose text-left">
          <div className="flex gap-6 flex-col">
            <div>
              <Badge variant="outline">We&apos;re live!</Badge>
            </div>
            <div className="flex gap-4 flex-col">
              <h1 className="text-5xl md:text-7xl max-w-lg tracking-tighter text-left font-regular">
                Context aware React-code extraction & Generative AI
              </h1>
              <p className="text-xl leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
                Extract and generate beautiful, accessible React + Tailwind CSS
                components from any website. Build your custom UI library
                without writing code.
              </p>
            </div>
            <div className="flex flex-row gap-4">
              <Button size="lg" className="gap-4">
                Start Building
                <MoveRight className="w-4 h-4" />
              </Button>

              <Link
                href="/"
                className="flex items-center gap-2 border border-border border-light-10 p-0.5   rounded-md hover:bg-accent  group"
              >
                {" "}
                <span className="text-sm px-2 text-muted-foreground ">
                  Add to Chrome
                </span>
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg"
                  alt="Chrome"
                  width={38}
                  height={38}
                  className="p-1 rounded-full hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors duration-200"
                />
              </Link>
            </div>
            <div className="mt-10">
              <Hero7 {...demoData} />
            </div>
          </div>
          <div className="bg-muted aspect-video w-full h-full rounded-3xl">
            <VideoPlayer
              className="rounded-3xl"
              src="https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXuuKXk5BO3qEX8zmS5D6YGluptwTFgoeNhHbK"
            />
          </div>
          <LogoCloud />
        </div>
      </div>
    </div>
  );
}

export { HeroSection };
