// services/document-scanner.service.ts
import type { UserDocument } from '../types';
import { getCurrentScenario } from '../mocks/scenarios';

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
    // Simulate scanning time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenario = getCurrentScenario();
    
    // Return results based on scenario
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
          points: false  // Missing driving points
        };
      
      case 'missing-two':
        return {
          age: true,
          license_status: false,  // Missing license status/expiry
          points: false  // Missing driving points
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
    // Simulate extraction time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract data from all documents
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
    // Simulate AI analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scenario = getCurrentScenario();
    const fileName = file.name.toLowerCase();
    const result: Partial<ExtractedData> = {};
    
    // Analyze based on file name and scenario
    if (scenario === 'missing-one') {
      // Only missing driving points
      if (fileName.includes('record') || fileName.includes('dmv') || fileName.includes('driving')) {
        result.points = 3;
      }
    } else if (scenario === 'missing-two') {
      // Missing both license status and driving points
      if (fileName.includes('license')) {
        result.license_status = 1;
      } else if (fileName.includes('record') || fileName.includes('dmv')) {
        result.points = 4;
      } else if (fileName.includes('combined') || fileName.includes('both')) {
        // Document contains both
        result.license_status = 1;
        result.points = 2;
      }
    }
    
    return result;
  }
}

export const documentScannerService: DocumentScannerService = new MockDocumentScannerService();