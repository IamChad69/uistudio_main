// HighlightTabs.tsx
"use client";

import * as React from "react";
import { EyeIcon, CodeIcon } from "lucide-react";

export type TabOption = {
  label: string;
  icon: React.ReactNode;
  value: string;
};

const TABS: TabOption[] = [
  {
    label: "Demo",
    icon: <EyeIcon className="size-4" aria-hidden="true" />,
    value: "demo",
  },
  {
    label: "Code",
    icon: <CodeIcon className="size-4" aria-hidden="true" />,
    value: "code",
  },
];

export function HighlightTabs({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [active, setActive] = React.useState("demo");

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      tabIndex={0}
      data-slot="tabs-list"
      data-orientation="horizontal"
      className={[
        "bg-muted text-muted-foreground inline-flex w-fit items-center justify-center h-8 p-0 border rounded-full",
        "w-[155.531px] h-[32px] text-[oklch(0.708_0_0)] bg-[rgba(255,87,34,0.05)] text-base font-sans font-normal p-[0px] m-0 border flex relative rounded-[16777216px]",
        className,
      ].join(" ")}
      style={{ outline: "none", ...style }}
      {...props}
    >
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          aria-controls={`highlight-tab-content-${tab.value}`}
          data-state={active === tab.value ? "active" : "inactive"}
          id={`highlight-tab-trigger-${tab.value}`}
          data-slot="tabs-trigger"
          tabIndex={-1}
          data-orientation="horizontal"
          onClick={() => setActive(tab.value)}
          className={[
            "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring",
            "dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground",
            "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
            "disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-full",
            active === tab.value
              ? "bg-background text-foreground shadow-sm"
              : "",
          ].join(" ")}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
