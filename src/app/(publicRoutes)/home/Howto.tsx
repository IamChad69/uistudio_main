import Image from "next/image"

const howToSteps = [
  {
    id: 1,
    label: "Browse",
    title: "Browse live websites, not static boilerplate",
    description:
      "Explore real, production websites and trending UI components with animations, responsive layouts, and polished styling — then make them your own.",
    imageSrc: "/context2.png",
    imageAlt: "Browse live websites interface",
  },
  {
    id: 2,
    label: "Extract",
    title: "Give the AI the right context or simply copy and paste",
    description: "Give the AI the context of the website component you want to extract and let it do the work for you. From there, you can customise and deploy instantly. ",
    imageSrc: "/context2.png",
    imageAlt: "AI extraction interface",
  },
  {
    id: 3,
    label: "Deploy",
    title: "Ship custom components and reuse across projects",
    description:
      "Once you've extracted the component, you can simply copy and paste it to your project or save it to your personal library.",
    imageSrc: "/hero.png",
    imageAlt: "Component deployment interface",
  },
]

const Howto = () => {
  return (
    <div className="w-full py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Save hours of work in minutes</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-xl">
            Ship your first component in seconds. Copy, paste, and ship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howToSteps.map((step) => (
            <div key={step.id} className="flex flex-col">
              {/* Image container */}
              <div className="relative h-96 rounded-t-lg border border-border overflow-hidden">
                <Image
                  src={step.imageSrc || "/placeholder.svg"}
                  alt={step.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
              
              {/* Text content below the image */}
              <div className="p-6 bg-card border border-t-0 border-border rounded-b-lg">
                <p className="text-sm font-medium mb-2 text-[#E8083E]">{step.label}</p>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Howto