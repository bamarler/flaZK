import type { UserDocument } from '../types';
import { getCurrentScenario } from '../mocks/scenarios';
import { config } from '../config';

export interface ScanResult {
  age: boolean;
  license_status: boolean;
  points: boolean;
}

export interface ExtractedData {
  age: number;
  license_status: number;
  points: number;
}

export interface DocumentScannerService {
  scanUserDocuments(userId: string, requirements: any): Promise<ScanResult>;
  extractDataFromDocuments(documents: UserDocument[]): Promise<ExtractedData>;
  analyzeUploadedDocument(file: File): Promise<Partial<ExtractedData>>;
}

class MockDocumentScannerService implements DocumentScannerService {
  async scanUserDocuments(userId: string, requirements: any): Promise<ScanResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenario = getCurrentScenario();
    
    switch (scenario) {
      case 'all-docs':
        return {
          age: true,
          license_status: true,
          points: true
        };
      
      case 'missing-one':
        return {
          age: true,
          license_status: true,
          points: false
        };
      
      case 'missing-two':
        return {
          age: true,
          license_status: false,
          points: false
        };
      
      default:
        return {
          age: true,
          license_status: true,
          points: false
        };
    }
  }

  async extractDataFromDocuments(documents: UserDocument[]): Promise<ExtractedData> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let age = 0;
    let license_status = 0;
    let points = 0;
    
    documents.forEach(doc => {
      if (doc.fields.birthdate) {
        const birthDate = new Date(doc.fields.birthdate);
        age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
      
      if (doc.fields.license_status === 'valid' && doc.fields.license_expiry) {
        const expiryDate = new Date(doc.fields.license_expiry);
        license_status = expiryDate > new Date() ? 1 : 0;
      }
      
      if (doc.fields.driving_points !== undefined) {
        points = doc.fields.driving_points;
      }
    });
    
    return { age, license_status, points };
  }

  async analyzeUploadedDocument(file: File): Promise<Partial<ExtractedData>> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenario = getCurrentScenario();
    const fileName = file.name.toLowerCase();
    const result: Partial<ExtractedData> = {};
    
    if (scenario === 'missing-one') {
      if (fileName.includes('record') || fileName.includes('dmv') || fileName.includes('driving')) {
        result.points = 3;
      }
    } else if (scenario === 'missing-two') {
      if (fileName.includes('license')) {
        result.license_status = 1;
      } else if (fileName.includes('record') || fileName.includes('dmv')) {
        result.points = 4;
      } else if (fileName.includes('combined') || fileName.includes('both')) {
        result.license_status = 1;
        result.points = 2;
      }
    }
    
    return result;
  }
}

class ApiDocumentScannerService implements DocumentScannerService {
  async scanUserDocuments(userId: string, requirements: any): Promise<ScanResult> {
    const token = localStorage.getItem('authToken');
    const sessionId = new URLSearchParams(window.location.search).get('session');
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
    const response = await fetch(`${config.API_URL}/api/documents/scan`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, requirements })
    });

    if (!response.ok) {
      throw new Error('Failed to scan documents');
    }

    return response.json();
  }

  async extractDataFromDocuments(documents: UserDocument[]): Promise<ExtractedData> {
    const token = localStorage.getItem('authToken');
    const sessionId = new URLSearchParams(window.location.search).get('session');
    
    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
    const response = await fetch(`${config.API_URL}/api/documents/extract`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ documents })
    });

    if (!response.ok) {
      throw new Error('Failed to extract data');
    }

    return response.json();
  }

  async analyzeUploadedDocument(file: File): Promise<Partial<ExtractedData>> {
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
    
    const response = await fetch(`${config.API_URL}/api/documents/analyze`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to analyze document');
    }

    return response.json();
  }
}

export const documentScannerService: DocumentScannerService = config.useMocks 
  ? new MockDocumentScannerService() 
  : new ApiDocumentScannerService();