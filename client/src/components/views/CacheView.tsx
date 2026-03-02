import { useEffect, useState } from 'react';
import { Database, Trash2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/api';

export function CacheView() {
  const { cacheStats, setCacheStats, clearCacheStats } = useAppStore();
  const [loading, setLoading] = useState(false);

  const loadCacheStats = async () => {
    try {
      setLoading(true);
      const stats = await apiService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cache?')) return;

    try {
      setLoading(true);
      await apiService.clearCache();
      clearCacheStats();
      await loadCacheStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cache Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage the analysis cache
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadCacheStats}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleClearCache}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cache
          </button>
        </div>
      </div>

      {cacheStats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Database className="h-4 w-4" />}
            label="Total Entries"
            value={cacheStats.entries}
          />
          <StatCard
            icon={<Database className="h-4 w-4" />}
            label="Cache Hits"
            value={cacheStats.hits}
          />
          <StatCard
            icon={<Database className="h-4 w-4" />}
            label="Cache Misses"
            value={cacheStats.misses}
          />
          <StatCard
            icon={<Database className="h-4 w-4" />}
            label="Hit Rate"
            value={`${(cacheStats.hitRate * 100).toFixed(1)}%`}
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              {loading ? 'Loading cache statistics...' : 'No cache data available'}
            </p>
          </div>
        </div>
      )}

      {cacheStats && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 font-semibold">Cache Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Current Size</span>
              <span className="text-sm font-medium">{cacheStats.size} bytes</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Max Size</span>
              <span className="text-sm font-medium">{cacheStats.maxSize} bytes</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-muted-foreground">Usage</span>
              <span className="text-sm font-medium">
                {((cacheStats.size / cacheStats.maxSize) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}