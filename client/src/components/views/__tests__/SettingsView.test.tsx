import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from '../SettingsView';
import { useAppStore } from '../../../store/useAppStore';

// Mock the store
vi.mock('../../../store/useAppStore');

describe('SettingsView', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('should render the settings title', () => {
    render(<SettingsView />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Configure your CodeLens preferences')).toBeInTheDocument();
  });

  it('should render appearance section', () => {
    render(<SettingsView />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Choose your preferred color scheme')).toBeInTheDocument();
  });

  it('should render light and dark theme buttons', () => {
    render(<SettingsView />);
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('should highlight light theme button when theme is light', () => {
    render(<SettingsView />);
    const lightButton = screen.getByText('Light').closest('button');
    expect(lightButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should highlight dark theme button when theme is dark', () => {
    (useAppStore as any).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<SettingsView />);
    const darkButton = screen.getByText('Dark').closest('button');
    expect(darkButton).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should call setTheme with light when light button is clicked', () => {
    (useAppStore as any).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<SettingsView />);
    const lightButton = screen.getByText('Light');
    fireEvent.click(lightButton);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with dark when dark button is clicked', () => {
    render(<SettingsView />);
    const darkButton = screen.getByText('Dark');
    fireEvent.click(darkButton);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should render about section', () => {
    render(<SettingsView />);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('should display version information', () => {
    render(<SettingsView />);
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('should display API endpoint', () => {
    render(<SettingsView />);
    expect(screen.getByText('API Endpoint')).toBeInTheDocument();
  });

  it('should display build information', () => {
    render(<SettingsView />);
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('Production')).toBeInTheDocument();
  });

  it('should render Sun icon in light theme button', () => {
    render(<SettingsView />);
    const lightButton = screen.getByText('Light').closest('button');
    expect(lightButton?.querySelector('svg')).toBeInTheDocument();
  });

  it('should render Moon icon in dark theme button', () => {
    render(<SettingsView />);
    const darkButton = screen.getByText('Dark').closest('button');
    expect(darkButton?.querySelector('svg')).toBeInTheDocument();
  });

  it('should have proper card structure', () => {
    const { container } = render(<SettingsView />);
    const cards = container.querySelectorAll('.rounded-lg.border.bg-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should display default API endpoint when env var is not set', () => {
    render(<SettingsView />);
    const apiEndpoint = screen.getByText(/localhost:3000/);
    expect(apiEndpoint).toBeInTheDocument();
  });
});