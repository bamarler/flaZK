export interface AuthService {
    sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message?: string }>;
    verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; userId?: string; token?: string }>;
    getCurrentUser(): Promise<{ userId: string; phone: string } | null>;
    logout(): Promise<void>;
  }
  
  // Mock implementation for development
  class MockAuthService implements AuthService {
    async sendVerificationCode(phoneNumber: string) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Mock: Sending code to ${phoneNumber}`);
      return { success: true };
    }
  
    async verifyCode(phoneNumber: string, code: string) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Mock: Verifying code ${code} for ${phoneNumber}`);
      return { 
        success: true, 
        userId: 'user-123',
        token: 'mock-jwt-token'
      };
    }
  
    async getCurrentUser() {
      const mockUser = localStorage.getItem('mockUser');
      return mockUser ? JSON.parse(mockUser) : null;
    }
  
    async logout() {
      localStorage.removeItem('mockUser');
    }
  }
  
  // Export the service - just change this line when implementing real backend
  export const authService: AuthService = new MockAuthService();