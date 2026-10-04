import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme =
  | "light"
  | "dark"
  | "system"
  | "gruvbox-light"
  | "catppuccin-latte"
  | "tokyo-night-day"
  | "nord-light"
  | "gruvbox"
  | "catppuccin"
  | "tokyo-night"
  | "nord";

type ResolvedTheme = "light" | "dark";
type ThemeColorScheme = ResolvedTheme | "system";

export const THEME_OPTIONS: ReadonlyArray<{
  value: Theme;
  label: string;
  colorScheme: ThemeColorScheme;
  swatch?: string;
}> = [
  { value: "light", label: "Light", colorScheme: "light" },
  { value: "dark", label: "Dark", colorScheme: "dark" },
  { value: "system", label: "System", colorScheme: "system" },
  {
    value: "gruvbox-light",
    label: "Gruvbox Light",
    colorScheme: "light",
    swatch: "#b57614",
  },
  {
    value: "catppuccin-latte",
    label: "Catppuccin Latte",
    colorScheme: "light",
    swatch: "#8839ef",
  },
  {
    value: "tokyo-night-day",
    label: "Tokyo Night Day",
    colorScheme: "light",
    swatch: "#3760bf",
  },
  {
    value: "nord-light",
    label: "Nord Light",
    colorScheme: "light",
    swatch: "#5e81ac",
  },
  {
    value: "gruvbox",
    label: "Gruvbox Dark",
    colorScheme: "dark",
    swatch: "#fabd2f",
  },
  {
    value: "catppuccin",
    label: "Catppuccin Mocha",
    colorScheme: "dark",
    swatch: "#cba6f7",
  },
  {
    value: "tokyo-night",
    label: "Tokyo Night",
    colorScheme: "dark",
    swatch: "#7aa2f7",
  },
  {
    value: "nord",
    label: "Nord Dark",
    colorScheme: "dark",
    swatch: "#88c0d0",
  },
];

const THEME_VALUES = new Set(THEME_OPTIONS.map(({ value }) => value));
const THEME_OPTIONS_BY_VALUE = new Map(
  THEME_OPTIONS.map((option) => [option.value, option]),
);

export function isTheme(value: string | null): value is Theme {
  return value !== null && THEME_VALUES.has(value as Theme);
}

export function isPaletteTheme(theme: Theme): boolean {
  return THEME_OPTIONS_BY_VALUE.get(theme)?.swatch !== undefined;
}

function resolveTheme(theme: Theme): ResolvedTheme {
  const colorScheme = THEME_OPTIONS_BY_VALUE.get(theme)?.colorScheme;
  if (colorScheme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  if (colorScheme === undefined) {
    throw new Error(`Unknown theme: ${theme}`);
  }
  return colorScheme;
}

function getStoredTheme(): Theme {
  const storedTheme = localStorage.getItem("theme");
  return isTheme(storedTheme) ? storedTheme : "system";
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme),
  );

  useEffect(() => {
    const updateTheme = () => {
      const effectiveTheme = resolveTheme(theme);
      const root = document.documentElement;

      root.classList.toggle("dark", effectiveTheme === "dark");
      root.style.colorScheme = effectiveTheme;
      if (isPaletteTheme(theme)) {
        root.dataset.theme = theme;
      } else {
        delete root.dataset.theme;
      }
      setResolvedTheme(effectiveTheme);
    };

    updateTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: handleSetTheme, resolvedTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
