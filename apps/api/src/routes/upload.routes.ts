import { Router } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { uploadController } from '../controllers/upload.controller';

export const uploadRouter = Router();

uploadRouter.post(
  '/drivers-license',
  uploadMiddleware.single('license'),
  uploadController.uploadDriversLicense
);

uploadRouter.get('/status/:id', uploadController.getUploadStatus);