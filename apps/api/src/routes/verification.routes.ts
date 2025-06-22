// apps/api/src/routes/verification.routes.ts
import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const verificationRouter = Router();

// Public endpoint for clients to request verification
verificationRouter.post(
  '/request',
  authMiddleware.validateApiKey, // Validate client API key
  verificationController.createVerificationRequest
);

// Check verification status
verificationRouter.get(
  '/status/:sessionId',
  authMiddleware.validateApiKey,
  verificationController.getVerificationStatus
);