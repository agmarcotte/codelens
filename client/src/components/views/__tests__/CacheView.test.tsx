import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CacheView } from '../CacheView';
import { useAppStore } from '../../../store/useAppStore';
import { apiService } from '../../../services/api';

// Mock the store
vi.mock('../../../store/useAppStore');

// Mock the API service
vi.mock('../../../services/api', () => ({
  apiService: {
    getCacheStats: vi.fn(),
    clearCache: vi.fn(),
  },
}));

// Mock window.confirm
window.confirm = vi.fn() as any;

describe('CacheView', () => {
  const mockSetCacheStats = vi.fn();
  const mockClearCacheStats = vi.fn();

  const mockCacheStats = {
    entries: 42,
    hits: 100,
    misses: 20,
    hitRate: 0.833,
    size: 1024000,
    maxSize: 10240000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue({
      cacheStats: null,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });
    (apiService.getCacheStats as any).mockResolvedValue(mockCacheStats);
    (apiService.clearCache as any).mockResolvedValue(undefined);
  });

  it('should render the cache management title', () => {
    render(<CacheView />);
    expect(screen.getByText('Cache Management')).toBeInTheDocument();
    expect(screen.getByText('Monitor and manage the analysis cache')).toBeInTheDocument();
  });

  it('should render refresh and clear cache buttons', () => {
    render(<CacheView />);
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Clear Cache')).toBeInTheDocument();
  });

  it('should load cache stats on mount', async () => {
    render(<CacheView />);
    await waitFor(() => {
      expect(apiService.getCacheStats).toHaveBeenCalled();
    });
  });

  it('should display cache stats when available', () => {
    (useAppStore as any).mockReturnValue({
      cacheStats: mockCacheStats,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });

    render(<CacheView />);
    
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Cache Hits')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Cache Misses')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Hit Rate')).toBeInTheDocument();
    expect(screen.getByText('83.3%')).toBeInTheDocument();
  });

  it('should display no cache data message when stats are null', async () => {
    render(<CacheView />);
    await waitFor(() => {
      expect(screen.queryByText('Loading cache statistics...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('No cache data available')).toBeInTheDocument();
  });

  it('should display loading message while loading', async () => {
    (apiService.getCacheStats as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCacheStats), 100))
    );

    render(<CacheView />);
    expect(screen.getByText('Loading cache statistics...')).toBeInTheDocument();
  });

  it('should call getCacheStats when refresh button is clicked', async () => {
    (useAppStore as any).mockReturnValue({
      cacheStats: mockCacheStats,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });

    render(<CacheView />);
    const refreshButton = screen.getByText('Refresh');
    
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(apiService.getCacheStats).toHaveBeenCalled();
    });
  });

  it('should show confirmation dialog when clear cache is clicked', async () => {
    (window.confirm as any).mockReturnValue(false);
    (useAppStore as any).mockReturnValue({
      cacheStats: mockCacheStats,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });

    render(<CacheView />);
    
    await waitFor(() => {
      expect(apiService.getCacheStats).toHaveBeenCalled();
    });
    
    const clearButton = screen.getByText('Clear Cache');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear all cache?');
    });
  });

  it('should clear cache when confirmed', async () => {
    (window.confirm as any).mockReturnValue(true);
    (useAppStore as any).mockReturnValue({
      cacheStats: mockCacheStats,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });

    render(<CacheView />);
    
    await waitFor(() => {
      expect(apiService.getCacheStats).toHaveBeenCalled();
    });
    
    const clearButton = screen.getByText('Clear Cache');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(apiService.clearCache).toHaveBeenCalled();
      expect(mockClearCacheStats).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should not clear cache when cancelled', async () => {
    (window.confirm as any).mockReturnValue(false);
    (useAppStore as any).mockReturnValue({
      cacheStats: mockCacheStats,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });

    render(<CacheView />);
    const clearButton = screen.getByText('Clear Cache');
    
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(apiService.clearCache).not.toHaveBeenCalled();
    });
  });

  it('should display cache details section', () => {
    (useAppStore as any).mockReturnValue({
      cacheStats: mockCacheStats,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });

    render(<CacheView />);
    
    expect(screen.getByText('Cache Details')).toBeInTheDocument();
    expect(screen.getByText('Current Size')).toBeInTheDocument();
    expect(screen.getByText('1024000 bytes')).toBeInTheDocument();
    expect(screen.getByText('Max Size')).toBeInTheDocument();
    expect(screen.getByText('10240000 bytes')).toBeInTheDocument();
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('10.0%')).toBeInTheDocument();
  });

  it('should disable buttons while loading', async () => {
    (apiService.getCacheStats as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCacheStats), 100))
    );

    render(<CacheView />);
    
    const refreshButton = screen.getByText('Refresh');
    const clearButton = screen.getByText('Clear Cache');
    
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(refreshButton).toBeDisabled();
      expect(clearButton).toBeDisabled();
    });
  });

  it('should show spinning icon when refreshing', async () => {
    (apiService.getCacheStats as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCacheStats), 100))
    );
    
    (useAppStore as any).mockReturnValue({
      cacheStats: mockCacheStats,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });

    render(<CacheView />);
    
    await waitFor(() => {
      expect(apiService.getCacheStats).toHaveBeenCalled();
    });
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    // Check that the icon inside the button has the animate-spin class
    const icon = refreshButton.querySelector('.animate-spin');
    expect(icon).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (apiService.getCacheStats as any).mockRejectedValue(new Error('API Error'));

    render(<CacheView />);
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to load cache stats:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should render stat cards with proper structure', () => {
    (useAppStore as any).mockReturnValue({
      cacheStats: mockCacheStats,
      setCacheStats: mockSetCacheStats,
      clearCacheStats: mockClearCacheStats,
    });

    const { container } = render(<CacheView />);
    const statCards = container.querySelectorAll('.rounded-lg.border.bg-card.p-4');
    
    expect(statCards.length).toBe(4);
  });
});