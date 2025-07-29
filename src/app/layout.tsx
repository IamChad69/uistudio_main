import type { Metadata } from "next";

import { RootLayout } from "@/components/Layouts";

const defaultUrl = process.env.NEXT_PUBLIC_APP_URL!;

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  // Add a default title for your site, which will be used as a fallback for pages without their own title set
  title: {
    template: "%s | UiScraper",
    default: "UiScraper",
  },
};

export default RootLayout;
