import { config } from '../config';

export interface VerificationRequest {
  clientId: string;
  clientName: string;
  requirements: {
    age_min?: number;
    license_status?: number;
    points_max?: number;
  };
  callbackUrl: string;
  sessionId: string;
}

export interface VerificationService {
  parseVerificationRequest(params: URLSearchParams): VerificationRequest;
  saveVerificationSession(sessionId: string, data: any): Promise<void>;
  getVerificationSession(sessionId: string): Promise<any>;
}

class MockVerificationService implements VerificationService {
  parseVerificationRequest(params: URLSearchParams): VerificationRequest {
    const requirements = {
      age_min: parseInt(params.get('age_min') || '25'),
      license_status: parseInt(params.get('license_status') || '1'),
      points_max: parseInt(params.get('points_max') || '6')
    };

    return {
      clientId: params.get('client') || 'acme-car-rental',
      clientName: params.get('name') || 'ACME Car Rentals',
      requirements,
      callbackUrl: params.get('return') || params.get('callback') || 'https://acme-rentals.com/verify/callback',
      sessionId: params.get('session') || `session-${Date.now()}`
    };
  }

  async saveVerificationSession(sessionId: string, data: any) {
    localStorage.setItem(`session-${sessionId}`, JSON.stringify(data));
  }

  async getVerificationSession(sessionId: string) {
    const data = localStorage.getItem(`session-${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
}

class ApiVerificationService implements VerificationService {
  parseVerificationRequest(params: URLSearchParams): VerificationRequest {
    const requirements = {
      age_min: parseInt(params.get('age_min') || '25'),
      license_status: parseInt(params.get('license_status') || '1'),
      points_max: parseInt(params.get('points_max') || '6')
    };

    return {
      clientId: params.get('client') || 'acme-car-rental',
      clientName: params.get('name') || 'ACME Car Rentals',
      requirements,
      callbackUrl: params.get('return') || params.get('callback') || 'https://acme-rentals.com/verify/callback',
      sessionId: params.get('session') || `session-${Date.now()}`
    };
  }

  async saveVerificationSession(sessionId: string, data: any): Promise<void> {
    // In API mode, this would be handled server-side
    // The session is already created when the request is made
  }

  async getVerificationSession(sessionId: string): Promise<any> {
    const response = await fetch(`${config.API_URL}/api/verification/status/${sessionId}`, {
      headers: {
        'X-Session-ID': sessionId
      }
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  }
}

export const verificationService: VerificationService = config.useMocks 
  ? new MockVerificationService() 
  : new ApiVerificationService();