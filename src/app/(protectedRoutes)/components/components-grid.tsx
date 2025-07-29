"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import ComponentCard from "@/modules/projects/ui/components/component-card";
import { useState, useMemo, useCallback, useEffect } from "react"; // Added useEffect
import { Dialog, DialogContent } from "@/components/ui/dialog";
import FragmentWeb from "@/modules/projects/ui/components/fragment-web";
import { Fragment } from "@/generated/prisma";
import FileExplorer from "@/components/file-explorer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ComponentsGridProps {
  activeTab?: string;
  searchQuery?: string;
}

// Define the FragmentWithProject type clearly
type FragmentWithProject = Fragment & {
  message: {
    projectId: string;
    project: {
      name: string;
    };
  };
};

// Skeleton component for loading state
const ComponentCardSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-[400px] w-full rounded-md" />
      {/* Component Name Below Card with Favorite Button */}
      <div className="mt-2 flex items-center justify-between">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
};

// Grid of skeleton cards
const ComponentsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Render enough skeletons to fill the initial view */}
      {Array(8)
        .fill(0)
        .map((_, index) => (
          <ComponentCardSkeleton key={index} />
        ))}
    </div>
  );
};

const ComponentsGrid = ({
  activeTab = "all",
  searchQuery = "",
}: ComponentsGridProps) => {
  const trpc = useTRPC();
  const [selectedFragment, setSelectedFragment] =
    useState<FragmentWithProject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogActiveTab, setDialogActiveTab] = useState<"preview" | "code">(
    "preview"
  );
  // Add state for favorites and loading state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Fetch all fragments using the correct TRPC pattern
  // 'data' defaults to an empty array to avoid undefined issues during initial load
  const { data: fragments = [], isLoading: isFragmentsLoading } = useQuery(
    trpc.messages.getAllFragments.queryOptions()
  );

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteComponents");
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(new Set(parsedFavorites));
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (favorites.size > 0) {
      localStorage.setItem(
        "favoriteComponents",
        JSON.stringify(Array.from(favorites))
      );
    }
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((fragmentId: string) => {
    setToggleLoading(fragmentId);

    // Simulate a small delay to show loading state
    setTimeout(() => {
      setFavorites((prevFavorites) => {
        const newFavorites = new Set(prevFavorites);
        if (newFavorites.has(fragmentId)) {
          newFavorites.delete(fragmentId);
        } else {
          newFavorites.add(fragmentId);
        }
        return newFavorites;
      });
      setToggleLoading(null);
    }, 300);
  }, []);

  // Check if a fragment is favorited
  const isFavorited = useCallback(
    (fragmentId: string) => favorites.has(fragmentId),
    [favorites]
  );

  // Filter fragments based on activeTab and searchQuery
  const filteredFragments = useMemo(() => {
    // If data hasn't loaded yet, return an empty array to avoid errors
    if (!fragments.length && isFragmentsLoading) {
      return [];
    }

    let currentFiltered = fragments as FragmentWithProject[]; // Cast for type safety in filtering

    // First filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      currentFiltered = currentFiltered.filter((fragment) =>
        fragment.title.toLowerCase().includes(query)
      );
    }

    // Then filter and sort by tab
    switch (activeTab) {
      case "newest":
        // Using `slice()` to create a shallow copy before sorting to avoid mutating the original array
        return [...currentFiltered].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return [...currentFiltered].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "favorites":
        // Filter by favorites using our client-side favorites state
        return currentFiltered.filter((fragment) => favorites.has(fragment.id));
      case "all":
      default:
        return currentFiltered;
    }
  }, [fragments, activeTab, searchQuery, isFragmentsLoading, favorites]); // Added favorites to dependencies

  // Memoized callback for opening component dialog
  const handleOpenComponent = useCallback(
    (fragment: FragmentWithProject) => {
      setSelectedFragment(fragment);
      setIsDialogOpen(true);
      setDialogActiveTab("preview"); // Reset dialog tab to preview on open
    },
    [] // No dependencies, as it only uses state setters
  );

  // Memoized parsing of fileCollection for selectedFragment
  const fileCollection = useMemo(() => {
    const filesData = selectedFragment?.files;
    if (!filesData) return null;

    try {
      // Check if it's already an object (e.g., if Prisma/TRPC deserialized it)
      if (typeof filesData === "object" && !Array.isArray(filesData)) {
        return filesData as { [path: string]: string };
      }
      // Otherwise, try to parse it from a string
      return JSON.parse(String(filesData)) as { [path: string]: string };
    } catch (error) {
      console.error("Error parsing fileCollection:", error);
      return null; // Return null on parsing error
    }
  }, [selectedFragment?.files]);

  // Component content to be wrapped in Suspense (if Suspension were truly needed for *other* async ops)
  // For `useQuery` which provides `isLoading`, the internal handling is more direct.
  const ComponentContent = () => {
    if (isFragmentsLoading) {
      // Show skeleton while data is fetching
      return <ComponentsGridSkeleton />;
    }

    if (!fragments.length && !isFragmentsLoading) {
      // No fragments exist at all in the database
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No components found. Create components in your projects first.
          </p>
        </div>
      );
    }

    if (filteredFragments.length === 0) {
      // No components match the current filters/search
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No components match your search.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFragments.map((fragment: FragmentWithProject) => {
          // Use our client-side favorites system
          const isFavorite = isFavorited(fragment.id);
          const isLoading = toggleLoading === fragment.id;

          return (
            <div key={fragment.id}>
              <ComponentCard fragment={fragment} />
              {/* Component Name Below Card with Favorite Button */}
              <div className="mt-2 flex items-center justify-between">
                <h2 className="text-sm text-muted-foreground truncate">
                  {fragment.title}
                </h2>
                <button
                  // Toggle favorite status when clicked
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(fragment.id);
                  }}
                  disabled={isLoading}
                  className="ml-2 focus:outline-none"
                  aria-label={
                    isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isLoading
                        ? "text-zinc-300"
                        : isFavorite
                        ? "fill-rose-500 text-rose-500"
                        : "text-zinc-400 hover:text-zinc-300"
                    )}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Removed outer Suspense. `ComponentContent` now fully handles its loading state */}
      <ComponentContent />

      {/* Component Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedFragment?.title || "Component Details"}
            </h2>{" "}
            {/* Added fallback title */}
            <Tabs
              value={dialogActiveTab}
              onValueChange={(value) =>
                setDialogActiveTab(value as "preview" | "code")
              }
            >
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Render preview or code based on dialogActiveTab */}
            {dialogActiveTab === "preview" && selectedFragment && (
              <div className="h-full">
                <FragmentWeb data={selectedFragment} />
              </div>
            )}

            {dialogActiveTab === "code" && fileCollection && (
              <div className="h-full overflow-auto">
                <FileExplorer files={fileCollection} />
              </div>
            )}

            {/* Handle cases where no fragment is selected or files are missing */}
            {dialogActiveTab === "code" && !fileCollection && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No code files available for this component.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComponentsGrid;
