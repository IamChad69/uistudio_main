"use client";
import { Button } from "@/components/ui/button";
import CreateComponentButton from "@/components/CreateComponentButton";
import { ArrowLeft, MessageSquareMore } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-full px-4 py-2 pt-2 sticky top-0 z-10 flex justify-between items-center flex-wrap gap-4 ">
      {pathname.includes("sandbox") ||
      pathname.includes("settings") ||
      pathname.includes("projects") ||
      pathname.includes("bookmarks") ? (
        <Button
          className="rounded-md "
          variant={"outline"}
          onClick={() => router.push("/components")}
        >
          <ArrowLeft /> Go to Library
        </Button>
      ) : (
        <div className="px-4 py-2 flex justify-center text-bold items-center rounded-md bg-background border border-border text-primary capitalize">
          {pathname.split("/")[1]}
        </div>
      )}
      <div className="flex gap-4 items-center flex-wrap">
        <Button
          variant="outline"
          className="gap-2 bg-background/50 backdrop-blur-sm border hover:bg-accent/50 hover:border-solid transition-all duration-200"
          onClick={() => {
            window.open("https://insigh.to/b/uiscraper", "_blank");
          }}
        >
          <MessageSquareMore />
        </Button>

        <CreateComponentButton />
      </div>
    </div>
  );
};

export default Header;
