// API Service for communication with Fake News Detector Backend

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, headers, ...customConfig } = options;

    let queryString = '';
    if (params) {
      const searchParams = new URLSearchParams(params);
      queryString = `?${searchParams.toString()}`;
    }

    const config: RequestInit = {
      method: options.body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...headers,
      },
      ...customConfig,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}${queryString}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[API Error ${endpoint}]:`, error);
      throw error;
    }
  }

  get<T>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: ApiOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiService();
