"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import MessageContainer from "../components/message-container";
import { Suspense, useState, useEffect } from "react";
import { Fragment } from "@/generated/prisma";
import ProjectHeader from "../components/project-Header";
import FragmentWeb from "../components/fragment-web";
import { CodeIcon, EyeIcon, CopyCheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hint from "@/components/hint";
import { RefreshCcw, ArrowUpRight } from "lucide-react";
import FileExplorer from "@/components/file-explorer";
import { extractMainComponent } from "@/lib/utils";
import { toast } from "sonner";

import { ErrorBoundary } from "react-error-boundary";

interface ProjectViewsProps {
  projectId: string;
  data: Fragment;
}

const ProjectViews = ({ projectId, data }: ProjectViewsProps) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(data);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  // Set initial fragment on mount
  useEffect(() => {
    if (data && !activeFragment) {
      setActiveFragment(data);
    }
  }, [data, activeFragment]);

  // Listen for fragment selection from history dropdown
  useEffect(() => {
    const handleFragmentSelected = (event: Event) => {
      const customEvent = event as CustomEvent<{ fragment: Fragment }>;
      if (customEvent.detail && customEvent.detail.fragment) {
        setActiveFragment(customEvent.detail.fragment);
        // Reset the fragment key to force iframe refresh
        setFragmentKey((prev) => prev + 1);
        // Switch to preview tab when a fragment is selected
        setTabState("preview");
      }
    };

    document.addEventListener("fragment-selected", handleFragmentSelected);

    return () => {
      document.removeEventListener("fragment-selected", handleFragmentSelected);
    };
  }, []);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopyComponent = async () => {
    if (!activeFragment?.files) {
      toast.error("No component files available");
      return;
    }

    try {
      // Parse files if they're stored as a string
      const files =
        typeof activeFragment.files === "object"
          ? (activeFragment.files as { [path: string]: string })
          : (JSON.parse(String(activeFragment.files)) as {
              [path: string]: string;
            });

      const mainComponent = extractMainComponent(files);

      if (!mainComponent) {
        toast.error("No main component found");
        return;
      }

      // Copy the raw component code instead of formatted code
      await navigator.clipboard.writeText(mainComponent.componentCode);
      setCopied(true);
      toast.success(`Copied ${mainComponent.componentPath} to clipboard`);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying component:", error);
      toast.error("Failed to copy component");
    }
  };

  // Convert activeFragment.files to the correct format if it exists
  const fileCollection = activeFragment?.files
    ? typeof activeFragment.files === "object"
      ? (activeFragment.files as { [path: string]: string })
      : (JSON.parse(String(activeFragment.files)) as { [path: string]: string })
    : null;

  return (
    <div className="h-full flex flex-col ">
      <ResizablePanelGroup direction="horizontal" className="h-full gap-2">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col border border-border rounded-md"
        >
          <ErrorBoundary
            fallbackRender={() => <div>Project Header Error!</div>}
          >
            <Suspense fallback={<div>Loading ... Project...</div>}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary
            fallbackRender={() => <div>Project Header Error!</div>}
          >
            <Suspense fallback={<div>Loading ... Messages</div>}>
              <MessageContainer
                projectId={projectId}
                setActiveFragment={setActiveFragment}
                activeFragment={activeFragment}
                className="flex-1 overflow-auto"
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>
        <ResizableHandle
          className="hover:bg-primary transition-colors "
          withHandle={true}
        />
        <ResizablePanel
          defaultSize={65}
          minSize={50}
          className="flex flex-col border border-border rounded-md"
        >
          <Tabs
            className="h-full flex bg-transparent flex-col"
            value={tabState}
            defaultValue="preview"
            onValueChange={(value) => setTabState(value as "preview" | "code")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border border-border rounded-md">
                <TabsTrigger value="preview" className="rounded-md">
                  <EyeIcon />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <CodeIcon />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-x-2 ml-auto">
                {/* Copy Component Button */}
                <Hint text="Copy component code" side="bottom" align="start">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyComponent}
                    disabled={copied || !activeFragment?.files}
                    className="gap-2 "
                  >
                    {copied ? (
                      <>
                        <CopyCheckIcon className="w-4 h-4 text-green-500" />
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-4 h-4 " />
                      </>
                    )}
                  </Button>
                </Hint>

                {/* Refresh Button */}
                <Hint text="Refresh the fragment" side="bottom" align="start">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={!activeFragment?.sandboxUrl}
                  >
                    <RefreshCcw size={16} />
                  </Button>
                </Hint>

                {/* Open in New Tab Button */}
                <Hint text="Open in new tab" side="bottom" align="start">
                  <Button
                    disabled={!activeFragment?.sandboxUrl}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (!activeFragment?.sandboxUrl) return;
                      window.open(activeFragment.sandboxUrl, "_blank");
                    }}
                  >
                    <ArrowUpRight size={16} />
                  </Button>
                </Hint>
              </div>
            </div>
            <TabsContent value="preview" className="flex-1 overflow-hidden">
              {!!activeFragment && (
                <FragmentWeb data={activeFragment} fragmentKey={fragmentKey} />
              )}
            </TabsContent>
            <TabsContent value="code" className="flex-1 overflow-hidden">
              {!!fileCollection && <FileExplorer files={fileCollection} />}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectViews;
