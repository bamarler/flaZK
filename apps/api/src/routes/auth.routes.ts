// apps/api/src/routes/auth.routes.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.middleware';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Public endpoint - no auth required
authRouter.post('/send-code', async (req, res) => {
  const { phone } = req.body;
  phone
  // Send SMS logic
  res.json({ success: true });
});

// Public endpoint - returns JWT
authRouter.post('/verify-code', async (req, res) => {
  const { phone, code } = req.body;
  
  // Verify SMS code
  if (code !== '123456') {
    return res.status(401).json({ error: 'Invalid code' });
  }
  
  // Create JWT token
  const token = jwt.sign(
    { userId: 'user-123', phone },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return res.json({ 
    success: true, 
    userId: 'user-123', 
    token 
  });
});

// Protected endpoint - requires JWT
authRouter.get('/me', authMiddleware.validateJWT, async (req, res) => {
  res.json(req.user);
});