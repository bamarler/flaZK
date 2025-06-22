import { config } from '../config';

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

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const sessionId = new URLSearchParams(window.location.search).get('session');
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/';
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  protected setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  protected clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}