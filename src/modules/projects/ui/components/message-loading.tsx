import Image from "next/image";
import { useEffect, useState } from "react";

const ShimmerMessages = () => {
  const messages = [
    "Thinking...",
    "Loading...",
    "Generating...",
    "Analysing your request...",
    "Generating a response...",
    "Thinking...",
    "Creating components...",
    "Crafting components...",
    "Optimizing layout...",
    "Almost ready...",
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex items-center gap-2">
      <div className="text-base text-muted-foreground  animate-pulse">
        {messages[currentMessageIndex]}
      </div>
    </div>
  );
};

export const MessageLoading = () => {
  return (
    <div className="flex flex-col group px-2 pb-4">
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src="/UiScraperLogo-dark.png"
          alt="loading"
          width={20}
          height={20}
        />
        <span className="text-sm font-medium italic">Ui Assistant.</span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
        <ShimmerMessages />
      </div>
    </div>
  );
};
