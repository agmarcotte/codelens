import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { useAppStore } from '../../../store/useAppStore';

// Mock the store
vi.mock('../../../store/useAppStore');

describe('Sidebar', () => {
  const mockSetCurrentView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when sidebar is closed', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: false,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    const { container } = render(<Sidebar />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when sidebar is open', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    expect(screen.getByText('Analyze Code')).toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    
    expect(screen.getByText('Analyze Code')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Playground')).toBeInTheDocument();
    expect(screen.getByText('Cache')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should highlight the current view', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    const analyzeButton = screen.getByText('Analyze Code').closest('button');
    expect(analyzeButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should not highlight non-current views', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    const documentationButton = screen.getByText('Documentation').closest('button');
    expect(documentationButton).toHaveClass('text-muted-foreground');
    expect(documentationButton).not.toHaveClass('bg-primary');
  });

  it('should call setCurrentView when a nav item is clicked', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    const documentationButton = screen.getByText('Documentation');
    fireEvent.click(documentationButton);
    
    expect(mockSetCurrentView).toHaveBeenCalledWith('documentation');
  });

  it('should switch between different views', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    
    // Click on Playground
    fireEvent.click(screen.getByText('Playground'));
    expect(mockSetCurrentView).toHaveBeenCalledWith('playground');
    
    // Click on Cache
    fireEvent.click(screen.getByText('Cache'));
    expect(mockSetCurrentView).toHaveBeenCalledWith('cache');
    
    // Click on Settings
    fireEvent.click(screen.getByText('Settings'));
    expect(mockSetCurrentView).toHaveBeenCalledWith('settings');
  });

  it('should render icons for each navigation item', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    const { container } = render(<Sidebar />);
    const icons = container.querySelectorAll('svg');
    
    // Should have 5 icons (one for each nav item)
    expect(icons.length).toBe(5);
  });

  it('should have proper styling classes', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    const { container } = render(<Sidebar />);
    const aside = container.querySelector('aside');
    
    expect(aside).toHaveClass('w-64', 'border-r', 'bg-card');
  });

  it('should render navigation in a flex column layout', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'analyze',
      setCurrentView: mockSetCurrentView,
    });

    const { container } = render(<Sidebar />);
    const nav = container.querySelector('nav');
    
    expect(nav).toHaveClass('flex', 'flex-col', 'gap-2');
  });

  it('should highlight documentation view when selected', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'documentation',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    const documentationButton = screen.getByText('Documentation').closest('button');
    expect(documentationButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should highlight playground view when selected', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'playground',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    const playgroundButton = screen.getByText('Playground').closest('button');
    expect(playgroundButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should highlight cache view when selected', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'cache',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    const cacheButton = screen.getByText('Cache').closest('button');
    expect(cacheButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should highlight settings view when selected', () => {
    (useAppStore as any).mockReturnValue({
      sidebarOpen: true,
      currentView: 'settings',
      setCurrentView: mockSetCurrentView,
    });

    render(<Sidebar />);
    const settingsButton = screen.getByText('Settings').closest('button');
    expect(settingsButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });
});