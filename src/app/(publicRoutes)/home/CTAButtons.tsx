import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export function CtaButtons() {
  return (
    <div className="flex flex-col mt-12 gap-3 sm:flex-row sm:items-center">
      <Button
        asChild
        size="lg"
        className="h-12 rounded-full pl-5 pr-3 text-base"
      >
        <Link href="#link">
          <span className="text-nowrap">Start Building</span>
          <ChevronRight className="ml-1" />
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm hidden sm:block text-gray-400">
          Available on
        </span>
        {/* App Store Icons - using simple colored circles as placeholders */}
        <div className="flex items-center gap-1 ml-1">
          <Image
            src="/Chrome.svg"
            alt="Chrome"
            width={72}
            height={72}
            className="p-1 rounded-full hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors duration-200"
          />
          <span className="text-gray-400 mr-3">+</span>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Firefox_logo%2C_2019.svg"
            alt="Firefox"
            width={38}
            height={38}
            className="p-1 rounded-full hover:bg-zinc-950/5 dark:hover:bg-white/5 transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
}
