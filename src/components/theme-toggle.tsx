"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const initialTheme = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
    applyTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    window.localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  }

  return <button onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900">
    <Moon size={17} className="dark:hidden" />
    <Sun size={17} className="hidden dark:block" />
  </button>;
}
