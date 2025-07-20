"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import ProjectForm from "@/app/(publicRoutes)/ui/project-form";


const CreateComponentButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFormSubmit = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-background/50 backdrop-blur-sm border-dashed hover:bg-accent/50 hover:border-solid transition-all duration-200"
          onClick={() => setIsOpen(true)}
        >
          <PlusIcon className="h-4 w-4" />
          Create Component
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <div className="px-6 py-4">
          <DialogHeader className="px-6 py-4 ">
            <DialogTitle>Create New Component</DialogTitle>
          </DialogHeader>

          <div className="space-y-0">
            <ProjectForm onSubmit={handleFormSubmit} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateComponentButton;
