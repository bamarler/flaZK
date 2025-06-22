// apps/widget/src/services/api.service.ts
export class ApiService {
    protected apiUrl: string;
    protected token: string | null = null;
  
    constructor() {
      this.apiUrl = config.API_URL;
      this.token = localStorage.getItem('authToken');
    }
  
    protected async request<T>(
      endpoint: string, 
      options: RequestInit = {}
    ): Promise<T> {
      const url = `${this.apiUrl}${endpoint}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
  
      // Always include JWT token if available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
  
      // Include session ID if in verification flow
      const sessionId = new URLSearchParams(window.location.search).get('session');
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }
  
      const response = await fetch(url, {
        ...options,
        headers,
      });
  
      if (response.status === 401) {
        // Token expired or invalid
        this.clearToken();
        window.location.href = '/'; // Redirect to login
      }
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
  
      return response.json();
    }
  }