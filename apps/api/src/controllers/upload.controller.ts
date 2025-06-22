import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';

export const uploadController = {
  async uploadDriversLicense(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await uploadService.processDriversLicense(req.file);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getUploadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const status = await uploadService.getStatus(id);
      res.json(status);
    } catch (error) {
      next(error);
    }
  },
};