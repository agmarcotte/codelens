import { FileSearch, FileText, Database, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { AppState } from '../../types';

interface NavItem {
  id: AppState['currentView'];
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: 'analyze',
    label: 'Analyze Code',
    icon: <FileSearch className="h-5 w-5" />,
  },
  {
    id: 'documentation',
    label: 'Documentation',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'cache',
    label: 'Cache',
    icon: <Database className="h-5 w-5" />,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const { sidebarOpen, currentView, setCurrentView } = useAppStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r bg-card">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentView === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}