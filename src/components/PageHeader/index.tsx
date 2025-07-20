import React from "react";
import { Search } from "lucide-react";

type Props = {
  heading?: string;
  description?: string;
  children?: React.ReactNode;
  placeholder?: string;
};

const PageHeader = ({ heading, description, children, placeholder }: Props) => {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full flex justify-start sm:justify-between items-center gap-8 flex-wrap">
        <div className="flex flex-col gap-2">
          <p className="text-primary text-4xl font-semibold">{heading}</p>

          <div className="text-muted-foreground text-sm">{description}</div>
        </div>
      </div>
      {placeholder && (
        <div className="w-full md:max-w-3/4 relative rou flex-1">
          <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-background/50 border border-border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>
      )}
      {children}
    </div>
  );
};

export default PageHeader;
