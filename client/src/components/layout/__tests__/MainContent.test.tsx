import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainContent } from '../MainContent';
import { useAppStore } from '../../../store/useAppStore';

// Mock the store
vi.mock('../../../store/useAppStore');

// Mock the view components
vi.mock('../../views/AnalyzeView', () => ({
  AnalyzeView: () => <div data-testid="analyze-view">Analyze View</div>,
}));

vi.mock('../../views/DocumentationView', () => ({
  DocumentationView: () => <div data-testid="documentation-view">Documentation View</div>,
}));

vi.mock('../../views/PlaygroundView', () => ({
  PlaygroundView: () => <div data-testid="playground-view">Playground View</div>,
}));

vi.mock('../../views/CacheView', () => ({
  CacheView: () => <div data-testid="cache-view">Cache View</div>,
}));

vi.mock('../../views/SettingsView', () => ({
  SettingsView: () => <div data-testid="settings-view">Settings View</div>,
}));

describe('MainContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render AnalyzeView when currentView is analyze', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'analyze' })
    );

    render(<MainContent />);
    expect(screen.getByTestId('analyze-view')).toBeInTheDocument();
    expect(screen.getByText('Analyze View')).toBeInTheDocument();
  });

  it('should render DocumentationView when currentView is documentation', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'documentation' })
    );

    render(<MainContent />);
    expect(screen.getByTestId('documentation-view')).toBeInTheDocument();
    expect(screen.getByText('Documentation View')).toBeInTheDocument();
  });

  it('should render PlaygroundView when currentView is playground', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'playground' })
    );

    render(<MainContent />);
    expect(screen.getByTestId('playground-view')).toBeInTheDocument();
    expect(screen.getByText('Playground View')).toBeInTheDocument();
  });

  it('should render CacheView when currentView is cache', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'cache' })
    );

    render(<MainContent />);
    expect(screen.getByTestId('cache-view')).toBeInTheDocument();
    expect(screen.getByText('Cache View')).toBeInTheDocument();
  });

  it('should render SettingsView when currentView is settings', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'settings' })
    );

    render(<MainContent />);
    expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    expect(screen.getByText('Settings View')).toBeInTheDocument();
  });

  it('should only render one view at a time', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'analyze' })
    );

    render(<MainContent />);
    
    expect(screen.getByTestId('analyze-view')).toBeInTheDocument();
    expect(screen.queryByTestId('documentation-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('playground-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cache-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('settings-view')).not.toBeInTheDocument();
  });

  it('should have proper main element structure', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'analyze' })
    );

    const { container } = render(<MainContent />);
    const main = container.querySelector('main');
    
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1', 'overflow-auto');
  });

  it('should have container with proper styling', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'analyze' })
    );

    const { container } = render(<MainContent />);
    const contentContainer = container.querySelector('.container');
    
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('mx-auto', 'p-6');
  });

  it('should switch views correctly', () => {
    const { rerender } = render(<MainContent />);
    
    // Start with analyze view
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'analyze' })
    );
    rerender(<MainContent />);
    expect(screen.getByTestId('analyze-view')).toBeInTheDocument();
    
    // Switch to documentation view
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'documentation' })
    );
    rerender(<MainContent />);
    expect(screen.getByTestId('documentation-view')).toBeInTheDocument();
    expect(screen.queryByTestId('analyze-view')).not.toBeInTheDocument();
    
    // Switch to playground view
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'playground' })
    );
    rerender(<MainContent />);
    expect(screen.getByTestId('playground-view')).toBeInTheDocument();
    expect(screen.queryByTestId('documentation-view')).not.toBeInTheDocument();
  });

  it('should render with overflow-auto for scrolling', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'analyze' })
    );

    const { container } = render(<MainContent />);
    const main = container.querySelector('main');
    
    expect(main).toHaveClass('overflow-auto');
  });

  it('should use flex-1 to fill available space', () => {
    (useAppStore as any).mockImplementation((selector: any) => 
      selector({ currentView: 'analyze' })
    );

    const { container } = render(<MainContent />);
    const main = container.querySelector('main');
    
    expect(main).toHaveClass('flex-1');
  });
});