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
    <div className="w-full flex flex-col justify-center relative py-16 md:py-24">
      <div className="w-full">
        <div className="grid grid-cols-1 gap-8 md:gap-12 items-center lg:grid-cols-5">
          <div className="flex gap-6 flex-col md:mx-auto md:max-w-xl md:text-center lg:text-left lg:mx-0 lg:max-w-none lg:col-span-2">
            <div className="md:flex md:justify-center lg:justify-start">
              <Badge variant="outline">We&apos;re live!</Badge>
            </div>
            <div className="flex gap-4 flex-col">
              <h1 className="text-4xl md:text-5xl lg:text-6xl lg:text-left tracking-tight font-medium">
                Context aware React-code extraction & Generative AI
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground lg:text-left">
                Extract and generate beautiful, accessible React + Tailwind CSS
                components from any website. Build your custom UI library
                without writing code.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:justify-center lg:justify-start gap-4">
              <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2">
                <span>Start Building</span>
                <MoveRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <span>Add to Chrome</span>
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg"
                  alt="Chrome"
                  width={20}
                  height={20}
                  className="ml-2"
                />
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row md:justify-center lg:justify-start gap-6">
              <div className="flex flex-col gap-2 md:items-center lg:items-start">
                 <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-500 border border-background"></div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">200+ developers</span>
              </div>
              <div className="flex flex-col gap-2 md:items-center lg:items-start">
               <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">from 200+ reviews</span>
              </div>
            </div>
          </div>
          <div className="bg-muted aspect-video w-full h-full rounded-3xl lg:col-span-3">
            <VideoPlayer
              className="rounded-3xl w-full h-full object-cover"
              src="https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXuuKXk5BO3qEX8zmS5D6YGluptwTFgoeNhHbK"
            />
          </div>
        </div>
        <div className="mt-16">
          <LogoCloud />
        </div>
      </div>
    </div>
  );
}

export { HeroSection };
