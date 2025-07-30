"use client";

import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/ui/ThemeProvider";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TRPCReactProvider>
      <ThemeProvider
        disableTransitionOnChange
        enableSystem
        attribute="class"
        defaultTheme="dark"
      >
        {children}
      </ThemeProvider>
      <Toaster />
    </TRPCReactProvider>
  );
}
