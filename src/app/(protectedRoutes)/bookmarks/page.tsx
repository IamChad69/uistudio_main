"use client";

import { useState } from "react";

import PageHeader from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Bookmark, Clock, Star } from "lucide-react";
import BookmarksGrid from "./bookmarks-grid";

const BookmarksPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="w-full flex flex-col gap-8 min-h-0 py-2">
      <PageHeader
        heading="Bookmarks"
        description="Your saved websites for inspiration"
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex-grow"
        >
          <TabsList className="bg-transparent space-x-3">
            <TabsTrigger
              value="all"
              className={`bg-secondary opacity-50 ${
                activeTab === "all" ? "opacity-100" : ""
              } px-8 py-4`}
            >
              <Bookmark className="size-4 mr-2" />
              All
            </TabsTrigger>
            <TabsTrigger
              value="newest"
              className={`bg-secondary opacity-50 ${
                activeTab === "newest" ? "opacity-100" : ""
              } px-8 py-4`}
            >
              <Clock className="size-4 mr-2" />
              Newest
            </TabsTrigger>
            <TabsTrigger
              value="oldest"
              className={`bg-secondary opacity-50 ${
                activeTab === "oldest" ? "opacity-100" : ""
              } px-8 py-4`}
            >
              <Clock className="size-4 mr-2" />
              Oldest
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className={`bg-secondary opacity-50 ${
                activeTab === "favorites" ? "opacity-100" : ""
              } px-8 py-4`}
            >
              <Star className="size-4 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full relative gap-2 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background/50 border border-border rounded-md px-4 py-2 focus:outline-none truncate"
            placeholder="Search bookmarks..."
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 " />
        </div>
      </div>

      <div className="w-full">
        <BookmarksGrid activeTab={activeTab} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default BookmarksPage;
