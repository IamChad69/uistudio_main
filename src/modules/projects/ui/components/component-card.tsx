import React from "react";
import { Fragment } from "@/generated/prisma";
import Link from "next/link";
import { EyeIcon, CodeIcon } from "lucide-react";

interface ComponentCardProps {
  fragment: Fragment & {
    message: {
      projectId: string;
      project: {
        name: string;
      };
    };
  };
}

const ComponentCard: React.FC<ComponentCardProps> = ({ fragment }) => {
  return (
    <div className="group relative w-full">
      <div className="p-0 flex-1 relative h-[400px] rounded-md overflow-hidden bg-white border border-border">
        <div className="absolute inset-0 ">
          <iframe
            src={fragment.sandboxUrl}
            className="w-full h-full  "
            loading="lazy"
            sandbox="allow-scripts allow-forms allow-same-origin"
            style={{
              border: "none",
              overflow: "auto",
            }}
          />
        </div>
      </div>

      {/* Action Buttons Overlay - Only visible on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/sandbox/${fragment?.id}`}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-400
                transition-colors text-shadow"
          >
            <EyeIcon className="w-3 h-3" />
            View
          </Link>
          <Link
            href={`/projects/${fragment?.message?.projectId}`}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-400
                transition-colors text-shadow"
          >
            <CodeIcon className="w-3 h-3" />
            Get code
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;
