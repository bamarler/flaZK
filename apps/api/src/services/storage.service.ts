// apps/api/src/services/storage.service.ts
import fs from 'fs/promises';
import path from 'path';

const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, '../../storage');

export const storageService = {
  async upload({ key, buffer, mimetype }: {
    key: string;
    buffer: Buffer;
    mimetype: string;
  }) {
    // Ensure storage directory exists
    await fs.mkdir(path.dirname(path.join(STORAGE_PATH, key)), { recursive: true });
    
    // Save file locally
    await fs.writeFile(path.join(STORAGE_PATH, key), buffer);
    
    return `/storage/${key}`;
  },
  
  async getFile(key: string) {
    return fs.readFile(path.join(STORAGE_PATH, key));
  }
};