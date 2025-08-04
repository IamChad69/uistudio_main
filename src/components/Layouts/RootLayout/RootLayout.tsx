import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import { ClerkProvider } from "@clerk/nextjs";

import { Providers } from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UI Studio - Build Better UIs",
  description: "Create, extract, and manage UI components with AI assistance",
  icons: {
    icon: "https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXLIwwNIDuKqJaOBymfHniY8tXSRgd42seb9jP",
  },
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          rootBox: "bg-background",
        },
      }}
    >
      <html
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased dark`}
        lang="en"
      >
        <body suppressHydrationWarning className="min-h-screen bg-background">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
