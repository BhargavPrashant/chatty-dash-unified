
import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/services/api';

// Generic hook for API calls with loading, error, and data state
export function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// Polling hook for real-time data updates
export function usePolling<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 5000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        const response = await apiCall();
        if (response.success && response.data) {
          setData(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [apiCall, interval, enabled]);

  return { data, error };
}

// Hook for managing connection status with real-time updates
export function useConnectionStatus() {
  const { data: connectionData, error } = usePolling(
    () => import('@/services/api').then(({ connectionApi }) => connectionApi.getStatus()),
    3000 // Poll every 3 seconds
  );

  return {
    status: connectionData?.status || 'disconnected',
    sessionId: connectionData?.sessionId,
    lastConnected: connectionData?.lastConnected,
    error,
  };
}

// Hook for managing dashboard stats with real-time updates
export function useDashboardStats() {
  const { data: stats, error } = usePolling(
    () => import('@/services/api').then(({ dashboardApi }) => dashboardApi.getStats()),
    10000 // Poll every 10 seconds
  );

  return { stats, error };
}
