import { useAppStore } from '../../store/useAppStore';
import { AnalyzeView } from '../views/AnalyzeView';
import { DocumentationView } from '../views/DocumentationView';
import { CacheView } from '../views/CacheView';
import { SettingsView } from '../views/SettingsView';

export function MainContent() {
  const currentView = useAppStore((state) => state.currentView);

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6">
        {currentView === 'analyze' && <AnalyzeView />}
        {currentView === 'documentation' && <DocumentationView />}
        {currentView === 'cache' && <CacheView />}
        {currentView === 'settings' && <SettingsView />}
      </div>
    </main>
  );
}