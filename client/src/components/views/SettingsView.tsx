import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function SettingsView() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your CodeLens preferences
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold">Appearance</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h3 className="font-semibold">About</h3>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-muted-foreground">API Endpoint</span>
            <span className="text-sm font-medium font-mono">
              {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">Build</span>
            <span className="text-sm font-medium">Production</span>
          </div>
        </div>
      </div>
    </div>
  );
}