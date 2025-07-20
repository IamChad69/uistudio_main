"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Trash2Icon,
  Edit3,
  Copy,
  Share,
  Loader2,
  Check,
  X,
  History,
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Fragment } from "@/generated/prisma";
import { format } from "date-fns";

interface ProjectHeaderProps {
  projectId: string;
}

const ProjectHeader = ({ projectId }: ProjectHeaderProps) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  // Get all messages with fragments for this project
  const { data: messages = [] } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );

  // Filter messages to get only those with fragments
  const fragmentMessages = messages.filter((message) => message.fragment);

  // Delete project mutation
  const deleteProjectMutation = useMutation(
    trpc.projects.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Project deleted successfully");
        router.push("/");
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
      },
      onError: (error) => {
        toast.error("Failed to delete project");
        console.error("Error deleting project:", error);
      },
    })
  );

  // Update project name mutation
  const updateProjectMutation = useMutation(
    trpc.projects.updateName.mutationOptions({
      onSuccess: () => {
        toast.success("Project name updated successfully");
        setIsEditing(false);
        queryClient.invalidateQueries(
          trpc.projects.getOne.queryOptions({ id: projectId })
        );
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
      },
      onError: (error: any) => {
        toast.error("Failed to update project name");
        console.error("Error updating project:", error);
      },
    })
  );

  const handleDeleteProject = async () => {
    deleteProjectMutation.mutate({ id: projectId });
  };

  const handleEditStart = () => {
    setEditedName(project.name);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (!editedName.trim()) return;

    updateProjectMutation.mutate({
      id: projectId,
      name: editedName.trim(),
    });
  };

  const handleEditCancel = () => {
    setEditedName("");
    setIsEditing(false);
  };

  const handleDuplicateProject = () => {
    // Implement duplicate functionality
    toast.info("Duplicate functionality coming soon");
  };

  const handleShareProject = () => {
    // Copy project URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast.success("Project URL copied to clipboard");
  };

  const handleFragmentSelect = (fragment: Fragment) => {
    // Emit a custom event with the selected fragment
    const event = new CustomEvent("fragment-selected", {
      detail: { fragment },
    });
    document.dispatchEvent(event);
    toast.success(`Loaded version: ${fragment.title}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);

    // Toggle sidebar visibility by adding a class to the body or a parent element
    document.body.classList.toggle("sidebar-closed", !isSidebarOpen);

    // Dispatch a custom event that other components can listen for
    const event = new CustomEvent("toggle-sidebar", {
      detail: { isOpen: !isSidebarOpen },
    });
    document.dispatchEvent(event);
  };

  // Initialize sidebar state based on localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state");
    if (savedState) {
      const isOpen = savedState === "open";
      setIsSidebarOpen(isOpen);
      document.body.classList.toggle("sidebar-closed", !isOpen);
    }
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-state", isSidebarOpen ? "open" : "closed");
  }, [isSidebarOpen]);

  return (
    <header className="sticky top-0 z-10 px-4 py-1.5 border-b border-border">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left section - Sidebar toggle, project icon and name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/react.svg"
              alt="Project icon"
              width={20}
              height={20}
              className="flex-shrink-0"
            />

            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave();
                    if (e.key === "Escape") handleEditCancel();
                  }}
                  className="h-8 text-sm font-medium min-w-[200px]"
                  autoFocus
                  disabled={updateProjectMutation.isPending}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditSave}
                  disabled={
                    updateProjectMutation.isPending || !editedName.trim()
                  }
                  className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                >
                  {updateProjectMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Check className="size-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditCancel}
                  disabled={updateProjectMutation.isPending}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100 transition-colors px-2 py-1 h-auto flex items-center gap-1"
                  >
                    <span className="text-sm font-medium">{project.name}</span>
                    <ChevronDown className="size-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={handleEditStart}>
                    <Edit3 className="size-4 mr-2" />
                    Rename Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicateProject}>
                    <Copy className="size-4 mr-2" />
                    Duplicate Project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleShareProject}
                    className="sm:hidden"
                  >
                    <Share className="size-4 mr-2" />
                    Share Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2Icon className="size-4 mr-2 text-destructive" />
                        Delete Project
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.name}"? This
                          action cannot be undone and will permanently remove
                          all project data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteProject}
                          disabled={deleteProjectMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                          {deleteProjectMutation.isPending ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2Icon className="size-4 mr-2" />
                              Delete Project
                            </>
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <History className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 max-h-[400px] overflow-y-auto"
            >
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Version History ({fragmentMessages.length})
              </div>
              <DropdownMenuSeparator />
              {fragmentMessages.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No versions available
                </div>
              ) : (
                fragmentMessages.map((message) => (
                  <DropdownMenuItem
                    key={message.id}
                    onClick={() => handleFragmentSelect(message.fragment!)}
                    className="flex flex-col items-start py-2"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium truncate max-w-[180px]">
                        {message.fragment?.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>
                        {format(
                          new Date(message.fragment!.createdAt),
                          "MMM d, h:mm a"
                        )}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-1"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <PanelLeft className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
