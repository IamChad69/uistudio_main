"use client";
import { Button } from "@/components/ui/button";
import CreateComponentButton from "@/components/CreateComponentButton";
import { ArrowLeft, MessageSquareMore, CrownIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@clerk/nextjs";
import { UserControl } from "../user-control";
import Link from "next/link";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
const { has } = useAuth();
const hasProAccess = has?.({ plan: "pro" });
  return (
    <div className="w-full px-4 py-2 pt-2 sticky top-0 z-10 flex justify-between items-center flex-wrap gap-4 ">
      {pathname.includes("sandbox") ||
      pathname.includes("settings") ||
      pathname.includes("projects") ||
      pathname.includes("bookmarks") ? (
        <Button
          className=""
          variant={"ghost"}
          onClick={() => router.push("/components")}
        >
          <ArrowLeft /> Go to Library
        </Button>
      ) : (
        <div className="px-4 py-2 flex justify-center text-bold items-center rounded-md bg-background  text-primary capitalize" />
      )}
      <div className="flex gap-4 items-center flex-wrap">
        <Button
          variant="outline"
          className="gap-2 bg-background/50 backdrop-blur-sm border hover:bg-accent/50 hover:border-solid transition-all duration-200 text-muted-foreground"
          onClick={() => {
            window.open("https://insigh.to/b/uiscraper", "_blank");
          }}
        >
          <MessageSquareMore />
        </Button>

        <CreateComponentButton />
        {hasProAccess && (
          <div className="ml-auto flex items-center gap-x-2">
            {!hasProAccess && (
              <Button asChild variant={"tertiary"} size="sm">
                <Link href="/pricing">
                  <CrownIcon   />
                  <span>Upgrade</span>
                </Link>
              </Button>
            )}
            <UserControl showName={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
