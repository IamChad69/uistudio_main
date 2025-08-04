import React from 'react'
import { ScanSearch, MousePointerClick, Rocket } from 'lucide-react';
interface Props {
    
}

const Howto = (props: Props) => {
    return (
       <div className="w-full py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h3 className="mt-3 text-3xl font-bold tracking-tight">
            Ship your next UI in 3 simple steps.
          </h3>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg mb-12">
            Get inspired, find what works, and start building faster. Extract what inspires you, and instantly generate editable UI components.
          </p>

          <div className="grid grid-cols-1 mt-12 md:grid-cols-3 gap-6 ">
            <div className="p-8 border-r border-zinc-800 border-dashed flex flex-col items-center text-center">
              <div className="bg-zinc-900 rounded-full p-4 mb-6">
                <ScanSearch className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Browse </h3>
              <p className="text-zinc-400 text-sm">
                Stop scrolling through static design shots. Explore live
                websites and extract actual UI components.
              </p>
            </div>

            <div className="p-8 border-r border-zinc-800 border-dashed flex flex-col items-center text-center">
              <div className="bg-zinc-900 rounded-full p-4 mb-6">
                <MousePointerClick className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Extract </h3>
              <p className="text-zinc-400 text-sm">
                Select any UI element and copy it in seconds—no need to rebuild
                or inspect code manually.
              </p>
            </div>

            <div className="p-8 flex flex-col items-center text-center">
              <div className="bg-zinc-900 rounded-full p-4 mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Deploy</h3>
              <p className="text-zinc-400 text-sm">
                Tweak them to match your brand, reuse across pages, and launch
                faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
}

export default Howto; 