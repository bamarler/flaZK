import { config } from '../config';

// Clear any existing session when the widget loads
if (typeof window !== 'undefined') {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('mockUser');
}

export interface AuthService {
  sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message?: string }>;
  verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; userId?: string; token?: string }>;
  getCurrentUser(): Promise<{ userId: string; phone: string } | null>;
  logout(): Promise<void>;
}

class MockAuthService implements AuthService {
  async sendVerificationCode(phoneNumber: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Mock: Sending code to ${phoneNumber}`);
    return { success: true };
  }

  async verifyCode(phoneNumber: string, code: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Mock: Verifying code ${code} for ${phoneNumber}`);
    
    if (phoneNumber === '+15555551234' && code === '123456') {
      const mockUser = { userId: 'user-123', phone: phoneNumber };
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      return { 
        success: true, 
        userId: 'user-123',
        token: 'mock-jwt-token'
      };
    }
    
    return { success: false };
  }

  async getCurrentUser() {
    const mockUser = localStorage.getItem('mockUser');
    return mockUser ? JSON.parse(mockUser) : null;
  }

  async logout() {
    localStorage.removeItem('mockUser');
  }
}

class ApiAuthService implements AuthService {
  async sendVerificationCode(phoneNumber: string) {
    const response = await fetch(`${config.API_URL}/api/auth/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: phoneNumber })
    });

    if (!response.ok) {
      return { success: false, message: 'Failed to send code' };
    }

    return response.json();
  }

  async verifyCode(phoneNumber: string, code: string) {
    const response = await fetch(`${config.API_URL}/api/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: phoneNumber, code })
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        userId: data.userId,
        phone: phoneNumber
      }));
    }

    return data;
  }

  async getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }
}

export const authService: AuthService = config.useMocks 
  ? new MockAuthService() 
  : new ApiAuthService();