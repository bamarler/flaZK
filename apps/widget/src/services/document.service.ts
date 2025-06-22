import type { UserDocument } from '../types';
import { getScenarioDocuments } from '../mocks/scenarios';
import { config } from '../config';

export interface DocumentService {
  getUserDocuments(userId: string): Promise<UserDocument[]>;
  getTemporaryDocuments(): UserDocument[];
  addToTemporary(document: UserDocument): void;
  clearTemporary(): void;
  saveDocument(file: File, userId: string, saveToAccount: boolean): Promise<UserDocument>;
}

class MockDocumentService implements DocumentService {
  private temporaryStorage: UserDocument[] = [];

  async getUserDocuments(userId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return getScenarioDocuments();
  }

  getTemporaryDocuments(): UserDocument[] {
    return this.temporaryStorage;
  }

  addToTemporary(document: UserDocument): void {
    this.temporaryStorage.push(document);
  }

  clearTemporary(): void {
    this.temporaryStorage = [];
  }

  async saveDocument(file: File, userId: string, saveToAccount: boolean): Promise<UserDocument> {
    const document: UserDocument = {
      id: `doc-${Date.now()}`,
      type: 'uploaded_document',
      name: file.name,
      uploadedAt: new Date(),
      fields: {}
    };

    this.addToTemporary(document);

    if (saveToAccount) {
      console.log(`Mock: Saving document ${document.id} to user ${userId} permanent storage`);
    }

    return document;
  }
}

class ApiDocumentService implements DocumentService {
  private temporaryStorage: UserDocument[] = [];

  async getUserDocuments(userId: string): Promise<UserDocument[]> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${config.API_URL}/api/documents/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  }

  getTemporaryDocuments(): UserDocument[] {
    return this.temporaryStorage;
  }

  addToTemporary(document: UserDocument): void {
    this.temporaryStorage.push(document);
  }

  clearTemporary(): void {
    this.temporaryStorage = [];
  }

  async saveDocument(file: File, userId: string, saveToAccount: boolean): Promise<UserDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('saveToAccount', saveToAccount.toString());

    const token = localStorage.getItem('authToken');
    const sessionId = new URLSearchParams(window.location.search).get('session');
    
    const headers: any = {
      'Authorization': `Bearer ${token}`
    };
    
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
    const response = await fetch(`${config.API_URL}/api/documents/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    const document = await response.json();
    this.addToTemporary(document);
    
    return document;
  }
}

export const documentService: DocumentService = config.useMocks 
  ? new MockDocumentService() 
  : new ApiDocumentService();