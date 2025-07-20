import { Card } from "@/components/ui/card";
import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
interface UserMessageProps {
  content: string;
}
const UserMessage = ({ content }: UserMessageProps) => {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted shadow-none border-none  p-3 max-w-[80%] break-words">
        {content}
      </Card>
    </div>
  );
};

interface AssistantMessageProps {
  content: string;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

const AssistantMessage = ({
  content,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: AssistantMessageProps) => {
  return (
    <div
      className={cn(
        "flex flex-col group px-2 pb-4",
        type === "ERROR" && "text-red-700 dark:text-red-500"
      )}
    >
      <div className="flex items-center gap-2 pl-2 mb-2 ">
        <Image
          src="/UiScraperLogo-dark.png"
          alt="UiScraper Logo"
          width={18}
          height={18}
          className="shrink-0 rotate-45"
        />
        <span className="text-sm font-medium italic">Ui Assistant..</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(createdAt, "HH:mm 'on' MMM dd ,yyyy")}
        </span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
        <span className="text-sm">{content}</span>

        {fragment && type === "RESULT" && (
          <FragmentCard
            fragment={fragment}
            isActiveFragment={isActiveFragment}
            onFragmentClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  );
};

interface FragmentCardProps {
  fragment: Fragment;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
}

const FragmentCard = ({
  fragment,
  isActiveFragment,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <div className="flex items-center px-2 py-1 w-full">
      <button
        className={cn(
          "flex items-center gap-2 border rounded-lg max-w-auto p-3 transition-all",
          "hover:shadow-md hover:border-primary/40",
          isActiveFragment
            ? "bg-primary/5 border-muted shadow-sm"
            : "bg-muted hover:bg-secondary/80"
        )}
        onClick={() => onFragmentClick(fragment)}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className={cn(" rounded-md", isActiveFragment ? "" : "")}>
            <Image
              src="/react.svg"
              alt="React Logo"
              width={20}
              height={20}
              className="w-4 h-4"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium line-clamp-1">
              {fragment.title}.tsx
            </span>
          </div>
        </div>
        <ChevronRightIcon
          size={16}
          className={cn(
            "text-muted-foreground transition-transform",
            isActiveFragment && "text-primary transform rotate-90"
          )}
        />
      </button>
    </div>
  );
};

interface MessageCardProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

const MessageCard = ({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: MessageCardProps) => {
  if (role === "ASSISTANT") {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        createdAt={createdAt}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
        type={type}
      />
    );
  }
  return <UserMessage content={content} />;
};

export default MessageCard;
