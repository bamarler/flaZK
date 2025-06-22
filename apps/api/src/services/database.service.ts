import fs from 'fs/promises';
import path from 'path';

export interface UserDocument {
  id: string;
  type: string;
  name: string;
  uploadedAt: Date;
  fields: Record<string, any>;
}

export interface User {
  phone: string;
  documentIds: string[];
}

export interface Session {
  sessionId: string;
  phone: string;
  clientId: string;
  clientName?: string;
  callbackUrl: string;
  requirements: {
    age_min?: number;
    license_status?: number;
    points_max?: number;
  };
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

interface Database {
  users: User[];
  documents: UserDocument[];
  sessions: Session[];
}

class DatabaseService {
  private dbPath: string;
  private data: Database = {
    users: [],
    documents: [],
    sessions: []
  };

  constructor() {
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/db.json');
  }

  async init(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      
      try {
        const content = await fs.readFile(this.dbPath, 'utf-8');
        this.data = JSON.parse(content);
      } catch (error) {
        const seedPath = path.join(__dirname, '../../data/seed.json');
        try {
          const seedContent = await fs.readFile(seedPath, 'utf-8');
          this.data = JSON.parse(seedContent);
          await this.save();
        } catch (seedError) {
          await this.save();
        }
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  private async save(): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  async getUser(phone: string): Promise<User | undefined> {
    return this.data.users.find(u => u.phone === phone);
  }

  async createUser(phone: string): Promise<User> {
    const user: User = {
      phone,
      documentIds: []
    };
    this.data.users.push(user);
    await this.save();
    return user;
  }

  async getUserDocuments(phone: string): Promise<UserDocument[]> {
    const user = await this.getUser(phone);
    if (!user) return [];
    
    return this.data.documents.filter(doc => 
      user.documentIds.includes(doc.id)
    );
  }

  async addDocument(phone: string, document: UserDocument): Promise<UserDocument> {
    let user = await this.getUser(phone);
    if (!user) {
      user = await this.createUser(phone);
    }
    
    this.data.documents.push(document);
    user.documentIds.push(document.id);
    await this.save();
    return document;
  }

  async getDocument(documentId: string): Promise<UserDocument | undefined> {
    return this.data.documents.find(doc => doc.id === documentId);
  }

  async createSession(session: Session): Promise<Session> {
    this.data.sessions.push(session);
    await this.save();
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.data.sessions.find(s => s.sessionId === sessionId);
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = await this.getSession(sessionId);
    if (!session) return undefined;
    
    Object.assign(session, updates);
    await this.save();
    return session;
  }

  async extractUserData(phone: string): Promise<{ age: number; license_status: number; points: number }> {
    const documents = await this.getUserDocuments(phone);
    
    let age = 0;
    let license_status = 0;
    let points = 0;
    
    documents.forEach(doc => {
      if (doc.fields.birthdate) {
        const birthDate = new Date(doc.fields.birthdate);
        age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
      
      if (doc.fields.license_status !== undefined) {
        license_status = doc.fields.license_status === 'valid' ? 1 : 0;
      }
      
      if (doc.fields.driving_points !== undefined) {
        points = doc.fields.driving_points;
      }
    });
    
    return { age, license_status, points };
  }
}

export const db = new DatabaseService();