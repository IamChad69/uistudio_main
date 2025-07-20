"use client";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";

export default function Page() {
  const currentTheme = useCurrentTheme();
  return (
    <div className="flex  w-full max-w-md mx-auto flex-col ">
      <section className="pt-[16vh] 2xl:pt-48 gap-y-6">
        <div className="flex flex-col items-center ">
          <SignIn
            appearance={{
              baseTheme: currentTheme === "dark" ? dark : undefined,
              elements: {
                cardBox: "border! shadow-none! rounded-lg!",
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}
