import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storage.service';
import { ocrService } from './ocr.service';
import { queueService } from './queue.service';

export const uploadService = {
  async processDriversLicense(file: Express.Multer.File) {
    const fileId = uuidv4();
    
    // Upload to storage
    const storageUrl = await storageService.upload({
      key: `licenses/${fileId}`,
      buffer: file.buffer,
      mimetype: file.mimetype,
    });

    // Queue for OCR processing
    await queueService.addJob('process-license', {
      fileId,
      storageUrl,
    });

    return {
      id: fileId,
      filename: file.originalname,
      size: file.size,
      status: 'processing',
    };
  },

  async getStatus(fileId: string) {
    // Check processing status from database
    return {
      id: fileId,
      status: 'processing',
      // TODO: Get actual status from DB
    };
  },
};