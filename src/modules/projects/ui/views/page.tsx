"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, MessageSquareMoreIcon } from "lucide-react";
import { useState } from "react";

export function ComponentsToolbar({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="w-full px-4 py-2 pt-2 sticky top-0 z-10 flex justify-between items-center flex-wrap gap-4 uiscraper-highlight">
      <div className="px-4 py-2 flex justify-center font-bold items-center rounded-md bg-background border border-border text-primary capitalize">
        components
      </div>
      <div className="flex gap-4 items-center flex-wrap">
        <Button
          variant="outline"
          size="default"
          className="bg-background/50 backdrop-blur-sm border hover:bg-accent/50 hover:border-solid transition-all duration-200"
        >
          <MessageSquareMoreIcon />
        </Button>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="bg-background/50 backdrop-blur-sm border-dashed hover:bg-accent/50 hover:border-solid transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4" />
            Create Component
          </Button>
        </DialogTrigger>
      </div>
    </div>
  );
}

export default function ComponentsHeader() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <ComponentsToolbar onCreate={() => setOpen(true)} />
      <DialogContent showCloseButton onInteractOutside={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Create Component</DialogTitle>
        </DialogHeader>
        {/* Add your form or content here */}
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
