import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Section: Problem framing tailored to UiScraper
 * - Highlights the manual, error‑prone way teams currently rebuild UI
 * - Quantifies the impact at a high level without unverifiable claims
 * - Connects to UiScraper’s core promise from the home page: turn any site into your UI library
 */
export default function RealCostSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          The Real Cost of Rebuilding UI From Scratch
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-3">
        {/* Current Process */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            ✎ The current process
          </p>
          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            Before UiScraper, teams rebuilt components by hand
          </h3>
          <p className="mt-3 text-gray-700">
            Designers share screenshots; developers guess spacing, tokens and
            interactions, re‑creating the same buttons, cards and sections over and
            over.
          </p>
          <p className="mt-6 text-sm text-gray-600">
            Manual screenshots, DevTools copy, Figma inspect—one‑offs that aren’t
            reusable across projects.
          </p>
        </div>

        {/* What's at stake */}
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
            📅 What's at stake
          </p>
          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            Manual extraction burns cycles on rework instead of features
          </h3>
          <p className="mt-3 text-gray-700">
            Recreating patterns from scratch leads to drift from the intended
            design, inconsistent components and missed deadlines.
          </p>
          <p className="mt-6 text-sm font-semibold text-red-600">
            Hours per component are lost to rebuilding and fixes that UiScraper
            makes unnecessary.
          </p>
        </div>

        {/* We get it */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            ◎ We get it
          </p>
          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            You need speed and consistency
          </h3>
          <p className="mt-3 text-gray-700">
            UiScraper turns any site into your UI library: pick an element,
            extract clean HTML/JSX with Tailwind and shadcn‑ready classes, and
            reuse it across pages without losing polish.
          </p>
          <p className="mt-6 text-sm text-blue-700">
            Ship faster without sacrificing design quality.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-5xl">
        <p className="mt-16 text-center text-2xl md:text-3xl font-semibold tracking-tight">
          Stop losing sprints to design rework. See how UiScraper eliminates the
          guesswork
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="#how-it-works">
            <Button size="lg" className="rounded-full px-6">
              How it works
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}


