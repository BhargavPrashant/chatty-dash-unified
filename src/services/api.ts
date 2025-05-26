
// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected';
  sessionId?: string;
  lastConnected?: string;
}

export interface MessageLog {
  id: string;
  timestamp: string;
  type: 'sent' | 'received';
  phoneNumber: string;
  content: string;
  status: 'delivered' | 'pending' | 'failed';
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  source: string;
  payload: any;
  response: any;
}

export interface DashboardStats {
  messagesSent: number;
  messagesReceived: number;
  mediaFilesSent: number;
  webhookEvents: number;
  uptime: string;
  lastActivity: string;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Connection Management API
export const connectionApi = {
  async getStatus(): Promise<ApiResponse<ConnectionStatus>> {
    return apiRequest<ConnectionStatus>('/api/connection/status');
  },

  async connect(): Promise<ApiResponse<{ qrCode?: string }>> {
    return apiRequest<{ qrCode?: string }>('/api/connection/connect', {
      method: 'POST',
    });
  },

  async disconnect(): Promise<ApiResponse<void>> {
    return apiRequest<void>('/api/connection/disconnect', {
      method: 'POST',
    });
  },

  async generateQRCode(): Promise<ApiResponse<{ qrCode: string }>> {
    return apiRequest<{ qrCode: string }>('/api/connection/qr-code', {
      method: 'POST',
    });
  },
};

// Message API
export const messageApi = {
  async sendMessage(phoneNumber: string, message: string): Promise<ApiResponse<{ messageId: string }>> {
    return apiRequest<{ messageId: string }>('/api/send-message', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, message }),
    });
  },

  async sendMedia(phoneNumber: string, file: File, caption?: string): Promise<ApiResponse<{ messageId: string }>> {
    const formData = new FormData();
    formData.append('phoneNumber', phoneNumber);
    formData.append('media', file);
    if (caption) {
      formData.append('caption', caption);
    }

    return fetch(`${API_BASE_URL}/api/send-media`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .catch(error => ({
        success: false,
        error: error.message || 'Failed to send media',
      }));
  },

  async getLogs(limit = 50, offset = 0): Promise<ApiResponse<MessageLog[]>> {
    return apiRequest<MessageLog[]>(`/api/messages/logs?limit=${limit}&offset=${offset}`);
  },

  async clearLogs(): Promise<ApiResponse<void>> {
    return apiRequest<void>('/api/messages/logs', {
      method: 'DELETE',
    });
  },
};

// Webhook API
export const webhookApi = {
  async getLogs(limit = 50, offset = 0): Promise<ApiResponse<WebhookLog[]>> {
    return apiRequest<WebhookLog[]>(`/api/webhook/logs?limit=${limit}&offset=${offset}`);
  },

  async clearLogs(): Promise<ApiResponse<void>> {
    return apiRequest<void>('/api/webhook/logs', {
      method: 'DELETE',
    });
  },

  async getEndpointInfo(): Promise<ApiResponse<{ endpoint: string; status: 'active' | 'inactive' }>> {
    return apiRequest<{ endpoint: string; status: 'active' | 'inactive' }>('/api/webhook/info');
  },
};

// Dashboard API
export const dashboardApi = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return apiRequest<DashboardStats>('/api/dashboard/stats');
  },

  async getHealth(): Promise<ApiResponse<{ status: 'healthy' | 'unhealthy'; uptime: string }>> {
    return apiRequest<{ status: 'healthy' | 'unhealthy'; uptime: string }>('/api/health');
  },
};

// Export all APIs as a single object for easier importing
export const api = {
  connection: connectionApi,
  message: messageApi,
  webhook: webhookApi,
  dashboard: dashboardApi,
};

export default api;
