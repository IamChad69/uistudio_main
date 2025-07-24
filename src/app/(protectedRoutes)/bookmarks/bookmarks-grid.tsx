"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ExternalLink,
  Trash2,
  Star,
  Bookmark,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface BookmarksGridProps {
  activeTab?: string;
  searchQuery?: string;
}

// Skeleton component for loading state
const BookmarkCardSkeleton = () => {
  return (
    <div className="break-inside-avoid mb-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

// Grid of skeleton cards
const BookmarksGridSkeleton = () => {
  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
      {Array(8)
        .fill(0)
        .map((_, index) => (
          <BookmarkCardSkeleton key={index} />
        ))}
    </div>
  );
};

const BookmarksGrid = ({
  activeTab = "all",
  searchQuery = "",
}: BookmarksGridProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Fetch all bookmarks using the same pattern as other components
  const { data: bookmarks = [], isLoading: isBookmarksLoading } = useQuery(
    trpc.bookmarks.getMany.queryOptions()
  );

  // Delete bookmark mutation
  const deleteBookmarkMutation = useMutation(
    trpc.bookmarks.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Bookmark deleted successfully");
        queryClient.invalidateQueries(trpc.bookmarks.getMany.queryOptions());
      },
      onError: (error) => {
        toast.error("Failed to delete bookmark");
        console.error("Error deleting bookmark:", error);
      },
    })
  );

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favoriteBookmarks");
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
        "favoriteBookmarks",
        JSON.stringify(Array.from(favorites))
      );
    }
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((bookmarkId: string) => {
    setToggleLoading(bookmarkId);

    setTimeout(() => {
      setFavorites((prevFavorites) => {
        const newFavorites = new Set(prevFavorites);
        if (newFavorites.has(bookmarkId)) {
          newFavorites.delete(bookmarkId);
        } else {
          newFavorites.add(bookmarkId);
        }
        return newFavorites;
      });
      setToggleLoading(null);
    }, 300);
  }, []);

  // Check if a bookmark is favorited
  const isFavorited = useCallback(
    (bookmarkId: string) => favorites.has(bookmarkId),
    [favorites]
  );

  // Filter bookmarks based on activeTab and searchQuery
  const filteredBookmarks = useMemo(() => {
    if (!bookmarks.length && isBookmarksLoading) {
      return [];
    }

    let currentFiltered = bookmarks;

    // First filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (bookmark) =>
          bookmark.title?.toLowerCase().includes(query) ||
          bookmark.url.toLowerCase().includes(query)
      );
    }

    // Then filter and sort by tab
    switch (activeTab) {
      case "newest":
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
        return currentFiltered.filter((bookmark) => favorites.has(bookmark.id));
      case "all":
      default:
        return currentFiltered;
    }
  }, [bookmarks, activeTab, searchQuery, isBookmarksLoading, favorites]);

  // Memoized callback for opening bookmark dialog
  const handleOpenBookmark = useCallback((bookmark: any) => {
    setSelectedBookmark(bookmark);
    setIsDialogOpen(true);
  }, []);

  // Handle delete bookmark
  const handleDeleteBookmark = useCallback(
    (bookmarkId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      deleteBookmarkMutation.mutate({ id: bookmarkId });
    },
    [deleteBookmarkMutation]
  );

  // Generate website preview image URL
  const getWebsitePreview = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://api.microlink.io?url=${encodeURIComponent(
        url
      )}&screenshot=true&meta=false&embed=screenshot.url`;
    } catch {
      return null;
    }
  };

  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const ComponentContent = () => {
    if (isBookmarksLoading) {
      return <BookmarksGridSkeleton />;
    }

    if (!bookmarks.length && !isBookmarksLoading) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground">
            Start saving websites for inspiration using the browser extension.
          </p>
        </div>
      );
    }

    if (filteredBookmarks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No bookmarks match your search.
          </p>
        </div>
      );
    }

    return (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {filteredBookmarks.map((bookmark) => {
          const isFavorite = isFavorited(bookmark.id);
          const isLoading = toggleLoading === bookmark.id;
          const previewUrl = getWebsitePreview(bookmark.url);
          const domain = getDomain(bookmark.url);

          return (
            <div key={bookmark.id} className="break-inside-avoid mb-4">
              <div
                className="group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-200"
                onClick={() => handleOpenBookmark(bookmark)}
              >
                {/* Website Preview */}
                <div className="relative aspect-video bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={bookmark.title || domain}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                        const nextElement =
                          target.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
                    style={{ display: previewUrl ? "none" : "flex" }}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white text-sm font-medium">{domain}</p>
                    </div>
                  </div>

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(bookmark.url, "_blank");
                        }}
                      >
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Bookmark Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {bookmark.title || domain}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {domain}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(bookmark.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(bookmark.id);
                        }}
                        disabled={isLoading}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        aria-label={
                          isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Star
                          className={cn(
                            "w-4 h-4 transition-colors",
                            isLoading
                              ? "text-muted-foreground"
                              : isFavorite
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground hover:text-yellow-400"
                          )}
                        />
                      </button>

                      <button
                        onClick={(e) => handleDeleteBookmark(bookmark.id, e)}
                        disabled={deleteBookmarkMutation.isPending}
                        className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                        aria-label="Delete bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <ComponentContent />

      {/* Bookmark Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedBookmark && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">
                    {selectedBookmark.title || getDomain(selectedBookmark.url)}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedBookmark.url}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedBookmark.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Site
                </Button>
              </div>

              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={getWebsitePreview(selectedBookmark.url) || ""}
                  alt={
                    selectedBookmark.title || getDomain(selectedBookmark.url)
                  }
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    const nextElement =
                      target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = "flex";
                    }
                  }}
                />
                <div
                  className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
                  style={{ display: "none" }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white font-medium">
                      {getDomain(selectedBookmark.url)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Saved{" "}
                  {formatDistanceToNow(new Date(selectedBookmark.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(selectedBookmark.id)}
                    className="flex items-center gap-1 hover:text-yellow-400 transition-colors"
                  >
                    <Star
                      className={cn(
                        "w-4 h-4",
                        isFavorited(selectedBookmark.id)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                    {isFavorited(selectedBookmark.id)
                      ? "Favorited"
                      : "Favorite"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookmarksGrid;
