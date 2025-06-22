// services/document.service.ts
import type { UserDocument } from '../types';
import { getScenarioDocuments } from '../mocks/scenarios';

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
    
    // Return documents based on current scenario
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
    // Create document object
    const document: UserDocument = {
      id: `doc-${Date.now()}`,
      type: 'uploaded_document',
      name: file.name,
      uploadedAt: new Date(),
      fields: {} // Fields will be populated by scanner service
    };

    // Add to temporary storage
    this.addToTemporary(document);

    // If saveToAccount is true, would also save to permanent storage
    if (saveToAccount) {
      console.log(`Mock: Saving document ${document.id} to user ${userId} permanent storage`);
    }

    return document;
  }
}

export const documentService: DocumentService = new MockDocumentService();