import { Moon, Sun } from "lucide-react";
import { useTheme } from "~/components/themeProvider";
import { Button } from "~/components/ui/button";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setTheme("light")}
        className="relative h-8 w-8 rounded-full"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}