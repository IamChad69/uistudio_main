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
import { CodeIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hint from "@/components/hint";
import { RefreshCcw, ExternalLink } from "lucide-react";
import FileExplorer from "@/components/file-explorer";

import { ErrorBoundary } from "react-error-boundary";

interface ProjectViewsProps {
  projectId: string;
  data: Fragment;
}

const ProjectViews = ({ projectId, data }: ProjectViewsProps) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(data);
  const [tabState, setTabState] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);

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

  const handleCopy = () => {
    if (!activeFragment?.sandboxUrl) return;
    navigator.clipboard.writeText(activeFragment.sandboxUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
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
            className="h-full flex flex-col"
            value={tabState}
            defaultValue="preview"
            onValueChange={(value) => setTabState(value as "preview" | "code")}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-full">
                <TabsTrigger value="preview" className="rounded-full">
                  <EyeIcon />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-full">
                  <CodeIcon />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-x-2 ml-auto">
                <Hint text="Refresh the fragment" side="bottom" align="start">
                  <Button
                    variant={"ghost"}
                    size="sm"
                    onClick={onRefresh}
                    disabled={!activeFragment?.sandboxUrl}
                  >
                    <RefreshCcw size={16} className="text-muted-foreground" />
                  </Button>
                </Hint>
                <Hint text="Copy URL" side="bottom">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!activeFragment?.sandboxUrl || copied}
                    onClick={handleCopy}
                    className="justify-start text-start font-normal max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap bg-muted"
                    style={{ minWidth: 0 }}
                  >
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">
                      {activeFragment?.sandboxUrl || "No URL available"}
                    </span>
                  </Button>
                </Hint>
                <Hint text="Open in new tab" side="bottom" align="start">
                  <Button
                    disabled={!activeFragment?.sandboxUrl}
                    variant={"ghost"}
                    size="sm"
                    onClick={() => {
                      if (!activeFragment?.sandboxUrl) return;
                      window.open(activeFragment.sandboxUrl, "_blank");
                    }}
                  >
                    <ExternalLink size={16} className="text-muted-foreground" />
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
