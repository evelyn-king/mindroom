import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, type Theme, useTheme } from "./ThemeContext";

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <span>{`${theme}:${resolvedTheme}`}</span>
      <button type="button" onClick={() => setTheme("nord-light")}>
        Use Nord Light
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        Use light
      </button>
    </>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("color-scheme");
    delete document.documentElement.dataset.theme;
  });

  it.each<Theme>([
    "gruvbox-light",
    "catppuccin-latte",
    "tokyo-night-day",
    "nord-light",
  ])("restores the %s palette as a light theme", async (theme) => {
    window.localStorage.setItem("theme", theme);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText(`${theme}:light`)).toBeInTheDocument();
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass("dark");
      expect(document.documentElement).toHaveAttribute("data-theme", theme);
      expect(document.documentElement).toHaveStyle({ colorScheme: "light" });
    });
  });

  it.each<Theme>(["gruvbox", "catppuccin", "tokyo-night", "nord"])(
    "restores the %s palette as a dark theme",
    async (theme) => {
      window.localStorage.setItem("theme", theme);

      render(
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>,
      );

      expect(screen.getByText(`${theme}:dark`)).toBeInTheDocument();
      await waitFor(() => {
        expect(document.documentElement).toHaveClass("dark");
        expect(document.documentElement).toHaveAttribute("data-theme", theme);
        expect(document.documentElement).toHaveStyle({ colorScheme: "dark" });
      });
    },
  );

  it("persists palette changes and removes palette state for standard themes", async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Use Nord Light" }));

    await waitFor(() => {
      expect(window.localStorage.getItem("theme")).toBe("nord-light");
      expect(document.documentElement).not.toHaveClass("dark");
      expect(document.documentElement).toHaveAttribute(
        "data-theme",
        "nord-light",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Use light" }));

    await waitFor(() => {
      expect(window.localStorage.getItem("theme")).toBe("light");
      expect(document.documentElement).not.toHaveClass("dark");
      expect(document.documentElement).not.toHaveAttribute("data-theme");
    });
  });

  it("ignores unknown stored theme values", () => {
    window.localStorage.setItem("theme", "unknown");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText("system:light")).toBeInTheDocument();
  });
});
