"use client";
import { Fragment } from "@/generated/prisma";

interface FragmentWebProps {
  data: Fragment;
  fragmentKey?: number;
}

const FragmentWeb = ({ data, fragmentKey = 0 }: FragmentWebProps) => {
  return (
    <div className="flex flex-col w-full flex-1 h-full">
      {/* iframe for preview */}
     
        <iframe
          key={fragmentKey}
          src={data?.sandboxUrl || ""}
          className="w-full h-full"
          loading="lazy"
          sandbox="allow-scripts allow-forms allow-same-origin"
        />
      
    </div>
  );
};

export default FragmentWeb;
