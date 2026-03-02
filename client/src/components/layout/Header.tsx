import { Menu, Moon, Sun, Code2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function Header() {
  const { theme, setTheme, toggleSidebar } = useAppStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <button
          onClick={toggleSidebar}
          className="mr-4 inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-2">
          <Code2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">CodeLens</h1>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}