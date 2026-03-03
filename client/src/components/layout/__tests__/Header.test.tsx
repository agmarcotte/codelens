import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import { useAppStore } from '../../../store/useAppStore';

// Mock the store
vi.mock('../../../store/useAppStore');

describe('Header', () => {
  const mockSetTheme = vi.fn();
  const mockToggleSidebar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      toggleSidebar: mockToggleSidebar,
    });
  });

  it('should render the header with CodeLens title', () => {
    render(<Header />);
    expect(screen.getByText('CodeLens')).toBeInTheDocument();
  });

  it('should render the menu button', () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle sidebar');
    expect(menuButton).toBeInTheDocument();
  });

  it('should render the theme toggle button', () => {
    render(<Header />);
    const themeButton = screen.getByLabelText('Toggle theme');
    expect(themeButton).toBeInTheDocument();
  });

  it('should call toggleSidebar when menu button is clicked', () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(menuButton);
    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('should display Moon icon in light theme', () => {
    render(<Header />);
    const themeButton = screen.getByLabelText('Toggle theme');
    expect(themeButton.querySelector('svg')).toBeInTheDocument();
  });

  it('should display Sun icon in dark theme', () => {
    (useAppStore as any).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      toggleSidebar: mockToggleSidebar,
    });
    render(<Header />);
    const themeButton = screen.getByLabelText('Toggle theme');
    expect(themeButton.querySelector('svg')).toBeInTheDocument();
  });

  it('should toggle theme from light to dark when theme button is clicked', () => {
    render(<Header />);
    const themeButton = screen.getByLabelText('Toggle theme');
    fireEvent.click(themeButton);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should toggle theme from dark to light when theme button is clicked', () => {
    (useAppStore as any).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      toggleSidebar: mockToggleSidebar,
    });
    render(<Header />);
    const themeButton = screen.getByLabelText('Toggle theme');
    fireEvent.click(themeButton);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should have proper accessibility attributes', () => {
    render(<Header />);
    const menuButton = screen.getByLabelText('Toggle sidebar');
    const themeButton = screen.getByLabelText('Toggle theme');
    
    expect(menuButton).toHaveAttribute('aria-label', 'Toggle sidebar');
    expect(themeButton).toHaveAttribute('aria-label', 'Toggle theme');
  });

  it('should render the Code2 icon', () => {
    const { container } = render(<Header />);
    const codeIcon = container.querySelector('.text-primary');
    expect(codeIcon).toBeInTheDocument();
  });

  it('should have sticky positioning', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-0');
  });

  it('should have backdrop blur effect', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('backdrop-blur');
  });
});