import { Monitor, Moon, Palette, Sun } from "lucide-react";
import {
  isPaletteTheme,
  isTheme,
  THEME_OPTIONS,
  useTheme,
} from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ThemeToggleProps {
  className?: string;
}

const standardThemes = THEME_OPTIONS.filter(
  ({ swatch }) => swatch === undefined,
);
const lightPaletteThemes = THEME_OPTIONS.filter(
  ({ colorScheme, swatch }) => colorScheme === "light" && swatch !== undefined,
);
const darkPaletteThemes = THEME_OPTIONS.filter(
  ({ colorScheme, swatch }) => colorScheme === "dark" && swatch !== undefined,
);

function PaletteThemeItems({ themes }: { themes: typeof THEME_OPTIONS }) {
  return themes.map((option) => (
    <DropdownMenuRadioItem key={option.value} value={option.value}>
      <span
        aria-hidden="true"
        className="mr-2 h-3.5 w-3.5 rounded-full border border-foreground/20"
        style={{ backgroundColor: option.swatch }}
      />
      {option.label}
    </DropdownMenuRadioItem>
  ));
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    if (isTheme(value)) {
      setTheme(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-9 w-9", className)}
        >
          {isPaletteTheme(theme) ? (
            <Palette className="h-4 w-4" />
          ) : resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          {standardThemes.map((option) => {
            const Icon =
              option.value === "light"
                ? Sun
                : option.value === "dark"
                  ? Moon
                  : Monitor;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon className="mr-2 h-4 w-4" />
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Light palettes
          </DropdownMenuLabel>
          <PaletteThemeItems themes={lightPaletteThemes} />
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Dark palettes
          </DropdownMenuLabel>
          <PaletteThemeItems themes={darkPaletteThemes} />
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
