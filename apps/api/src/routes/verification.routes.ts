import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const verificationRouter = Router();

verificationRouter.post(
  '/request',
  authMiddleware.validateApiKey,
  verificationController.createVerificationRequest
);

verificationRouter.get(
  '/status/:sessionId',
  authMiddleware.validateApiKey,
  verificationController.getVerificationStatus
);

verificationRouter.post(
  '/complete/:sessionId',
  verificationController.completeVerification
);