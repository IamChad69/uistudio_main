import {
  BookmarkIcon,
  CodeSquareIcon,
  LibraryIcon,
  SettingsIcon,
} from "lucide-react";

export const SidebarData = [
  {
    id: 1,
    title: "Components",
    icon: LibraryIcon,
    link: "/components",
  },
  {
    id: 2,
    title: "Bookmarks",
    icon: BookmarkIcon,
    link: "/bookmarks",
  },
  {
    id: 3,
    title: "Projects",
    icon: CodeSquareIcon,
    link: "/projects",
  },
  {
    id: 4,
    title: "Settings",
    icon: SettingsIcon,
    link: "/settings",
  },
];

export const OnBoardingSteps = [
  { id: 1, title: "Create a component", complete: false, link: "" },
  { id: 2, title: "View bookmarks", complete: false, link: "" },
  { id: 3, title: "Live sandbox", complete: false, link: "" },
];

