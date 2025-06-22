import { Router } from 'express';
export const authRouter = Router();

// Mock auth endpoints
authRouter.post('/send-code', async (_req, res) => {
  // Send SMS code logic
  res.json({ success: true });
});

authRouter.post('/verify-code', async (_req, res) => {
  // Verify SMS code logic
  res.json({ success: true, userId: 'user-123', token: 'jwt-token' });
});