"use client";

import { useEffect, useState } from "react";

type TTheme = "light" | "dark";

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<TTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme after component mounts to avoid hydration mismatch
  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as TTheme) || "light";
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      root.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  return (
    <fieldset className="flex flex-col h-16 w-8 p-0 m-0 transition-colors duration-300">
      <legend className="sr-only">Select a display theme:</legend>

      {/* Light Theme */}
      <div className="mt-[-1px]">
        <input
          aria-label="light"
          id="theme-switch-light"
          type="radio"
          value="light"
          checked={theme === "light"}
          onChange={() => setTheme("light")}
          className="appearance-none absolute m-0 p-0"
        />
        <label
          htmlFor="theme-switch-light"
          className={
            "flex items-center justify-center h-8 w-8 cursor-pointer group transition-all duration-300" +
            (theme === "light"
              ? " dark:bg-background"
              : " hover:bg-accent dark:hover:bg-accent dark:hover:border-border rounded-md")
          }
        >
          <span className="sr-only">light</span>
          <svg
            height="16"
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width="16"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.75 0.75V0H7.25V0.75V2V2.75H8.75V2V0.75ZM11.182 3.75732L11.7123 3.22699L12.0659 2.87344L12.5962 2.34311L13.6569 3.40377L13.1265 3.9341L12.773 4.28765L12.2426 4.81798L11.182 3.75732ZM8 10.5C9.38071 10.5 10.5 9.38071 10.5 8C10.5 6.61929 9.38071 5.5 8 5.5C6.61929 5.5 5.5 6.61929 5.5 8C5.5 9.38071 6.61929 10.5 8 10.5ZM8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12ZM13.25 7.25H14H15.25H16V8.75H15.25H14H13.25V7.25ZM0.75 7.25H0V8.75H0.75H2H2.75V7.25H2H0.75ZM2.87348 12.0659L2.34315 12.5962L3.40381 13.6569L3.93414 13.1265L4.28769 12.773L4.81802 12.2426L3.75736 11.182L3.22703 11.7123L2.87348 12.0659ZM3.75735 4.81798L3.22702 4.28765L2.87347 3.9341L2.34314 3.40377L3.4038 2.34311L3.93413 2.87344L4.28768 3.22699L4.81802 3.75732L3.75735 4.81798ZM12.0659 13.1265L12.5962 13.6569L13.6569 12.5962L13.1265 12.0659L12.773 11.7123L12.2426 11.182L11.182 12.2426L11.7123 12.773L12.0659 13.1265ZM8.75 13.25V14V15.25V16H7.25V15.25V14V13.25H8.75Z"
              className={`transition-all duration-300 ${
                theme === "light"
                  ? "fill-gray-900 dark:fill-gray-100"
                  : "fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-200"
              }`}
            />
          </svg>
        </label>
      </div>

      {/* Dark Theme */}
      <div className="mb-[-1px]">
        <input
          aria-label="dark"
          id="theme-switch-dark"
          type="radio"
          value="dark"
          checked={theme === "dark"}
          onChange={() => setTheme("dark")}
          className="appearance-none absolute m-0 p-0"
        />
        <label
          htmlFor="theme-switch-dark"
          className={
            "flex items-center justify-center h-8 w-8 cursor-pointer group transition-all duration-300" +
            (theme === "dark"
              ? " dark:bg-background"
              : " hover:bg-accent dark:hover:bg-accent dark:hover:border-border rounded-md")
          }
        >
          <span className="sr-only">dark</span>
          <svg
            height="16"
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width="16"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.5 8.00005C1.5 5.53089 2.99198 3.40932 5.12349 2.48889C4.88136 3.19858 4.75 3.95936 4.75 4.7501C4.75 8.61609 7.88401 11.7501 11.75 11.7501C11.8995 11.7501 12.048 11.7454 12.1953 11.7361C11.0955 13.1164 9.40047 14.0001 7.5 14.0001C4.18629 14.0001 1.5 11.3138 1.5 8.00005ZM6.41706 0.577759C2.78784 1.1031 0 4.22536 0 8.00005C0 12.1422 3.35786 15.5001 7.5 15.5001C10.5798 15.5001 13.2244 13.6438 14.3792 10.9921L13.4588 9.9797C12.9218 10.155 12.3478 10.2501 11.75 10.2501C8.71243 10.2501 6.25 7.78767 6.25 4.7501C6.25 3.63431 6.58146 2.59823 7.15111 1.73217L6.41706 0.577759ZM13.25 1V1.75V2.75L14.25 2.75H15V4.25H14.25H13.25V5.25V6H11.75V5.25V4.25H10.75L10 4.25V2.75H10.75L11.75 2.75V1.75V1H13.25Z"
              className={`transition-all duration-300 ${
                theme === "dark"
                  ? "fill-gray-900 dark:fill-gray-100"
                  : "fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-200"
              }`}
            />
          </svg>
        </label>
      </div>
    </fieldset>
  );
};
