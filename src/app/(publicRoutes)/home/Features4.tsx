import {
  Eye,
  Code2,
  Library,
  Save,
  Pipette,
  HelpCircle,
  PanelRightClose,
  Puzzle,
} from "lucide-react";

const features = [
  {
    title: "One-Click Extraction",
    description:
      "Select any element directly from a webpage to instantly extract its HTML and CSS. Our smart extraction tool ensures clean, accurate code extraction every time.",
    icon: <Eye />,
  },
  {
    title: "Code Optimization",
    description:
      "Get production-ready code with our code optimization. We automatically clean and optimize your extracted components for better performance.",
    icon: <Code2 />,
  },
  {
    title: "Component Library",
    description:
      "Build your own organized library of components. Customize your favorite components for quick access and reuse across projects.",
    icon: <Library />,
  },

  {
    title: "Color Picker",
    description:
      "Easily pick colors from any element on a webpage and use them in your components. Our color picker tool makes it simple to find and apply the perfect color.",
    icon: <Pipette />,
  },

  {
    title: "Component Playground",
    description:
      "Built in playground to customize your components before exporting. Live previews, editor, debugger and more.",
    icon: <PanelRightClose />,
  },
  {
    title: "Extension",
    description:
      "All tools you'll need for web development in one place. Our Quick access extension allows you to access all functionality without leaving the page",
    icon: <Puzzle />,
  },
];

export function FeatureTiles() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Works Anywhere You Browse
          </h2>
          <p className="text-white/60">
            Our UiScraper integrates directly into your browser. No separate
            app needed. Just add the extension and go.
          </p>
        </div>
        

        <div className="relative rounded-2xl mx-auto grid max-w-2xl lg:max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-2">
                {feature.icon}
                <h3 className="text-sm font-medium">{feature.title}</h3>
              </div>
              <p className="text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
