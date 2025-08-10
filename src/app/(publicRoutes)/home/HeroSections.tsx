import { Copy, SquareDashedMousePointer } from "lucide-react"
import { LogoCloud } from "./LogoCloud"
import { VideoPlayer } from "@/components/VideoPlayer/VideoPlayer"
import { WaitlistForm } from "./WaitListButton"

function HeroSection() {
  return (
    <div className="w-full flex flex-col justify-center relative px-4 sm:px-6 lg:px-8 py-24  md:py-32">
      <div className="mx-auto w-full max-w-7xl space-y-12 sm:space-y-14 md:space-y-16">
        <div className="flex flex-col gap-10 sm:gap-12 md:gap-14 items-center">
          <div className="flex gap-6 sm:gap-8 flex-col items-center max-w-5xl">
            {/* Main Heading */}
            <div className="flex flex-col items-center gap-6">
              <h1 className="text-6xl  md:text-8xl tracking-tight text-center leading-[0.9] max-w-4xl">
                <span className="font-gambarino tracking-tight capitalize block">Turn any site into</span>
                <span className="block">
                  Your{" "}
                  <span className="font-instrument-serif italic text-[#E8083E] tracking-[-0.06em] capitalize">
                    UI-Library
                  </span>
                  <span className="font-gambarino tracking-[-0.08em] capitalize">.</span>
                </span>
              </h1>

              {/* Description */}
              <div className="max-w-2xl text-center">
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-[#1C42FF]/20 text-[#573CFA] font-medium mx-1">
                    <SquareDashedMousePointer className="w-4 h-4" />
                    Extract
                  </span>
                  beautiful headless production-ready UI components. Skip the boilerplate and ship only what you need. Simply
                  <span className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-[#02864A]/20 text-[#02864A] font-medium mx-1">
                    <Copy className="w-4 h-4" />
                    Copy and paste
                  </span>
                  what inspires you, —no code required.
                </p>
              </div>
            </div>

            {/* Waitlist Form */}
          <WaitlistForm />
              
           

            {/* Logo Cloud */}
        <div className="w-full">
          <LogoCloud />
        </div>
        {/* Social Proof */}
            {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
              <div className="flex flex-col items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-background shadow-sm"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">20+ developers</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">from 20+ reviews</span>
              </div>
            </div> */}
          </div>

          {/* Video Section */}
          <div className="w-full max-w-6xl">
            <div className="bg-muted aspect-video w-full rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
              <VideoPlayer
                className="w-full h-full object-cover"
                src="https://myhhjl9xib.ufs.sh/f/ueACguBO3qEXuuKXk5BO3qEX8zmS5D6YGluptwTFgoeNhHbK"
              />
            </div>
          </div>
        </div>

        
      </div>
    </div>
  )
}

export { HeroSection }
