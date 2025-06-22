import { config } from '../config';

export interface DocumentVerifierService {
  verifyDocument(file: File): Promise<{ valid: boolean; reason?: string }>;
}

class MockDocumentVerifierService implements DocumentVerifierService {
  async verifyDocument(file: File): Promise<{ valid: boolean; reason?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      valid: true
    };
  }
}

class ApiDocumentVerifierService implements DocumentVerifierService {
  async verifyDocument(file: File): Promise<{ valid: boolean; reason?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('authToken');
    const sessionId = new URLSearchParams(window.location.search).get('session');
    
    const headers: any = {
      'Authorization': `Bearer ${token}`
    };
    
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
    const response = await fetch(`${config.API_URL}/api/documents/verify`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      return { valid: false, reason: 'Verification service unavailable' };
    }

    return response.json();
  }
}

export const documentVerifierService: DocumentVerifierService = config.useMocks 
  ? new MockDocumentVerifierService() 
  : new ApiDocumentVerifierService();