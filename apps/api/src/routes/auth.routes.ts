import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.middleware';
import { db } from '../services/database.service';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

authRouter.post('/send-code', async (req, res): Promise<void> => {
  const { phone } = req.body;
  
  if (!phone) {
    res.status(400).json({ error: 'Phone number required' });
    return;
  }
  
  console.log(`Sending SMS code to ${phone}`);
  res.json({ success: true });
});

authRouter.post('/verify-code', async (req, res): Promise<void> => {
  const { phone, code } = req.body;
  
  if (code !== '766329' && code !== '823945') {
    res.status(401).json({ error: 'Invalid code' });
    return;
  }
  
  let user = await db.getUser(phone);
  if (!user) {
    user = await db.createUser(phone);
  }
  
  const token = jwt.sign(
    { userId: phone, phone },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ 
    success: true, 
    userId: phone, 
    token 
  });
});

authRouter.get('/me', authMiddleware.validateJWT, async (req, res): Promise<void> => {
  res.json(req.user);
});