import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

export const proofRouter = Router();

// All proof routes require authentication
proofRouter.use(authMiddleware.validateJWT);

// Generate zero-knowledge proof
proofRouter.post('/generate', async (req, res) => {
  const { age, license_status, points, age_min, points_max } = req.body;
  
  console.log('Generating proof with:', { age, license_status, points, age_min, points_max });
  
  // Generate proof logic
  const meetsRequirements = 
    age >= age_min && 
    license_status === 1 && 
    points <= points_max;
    
  const proof = meetsRequirements 
    ? `0x${Math.random().toString(16).slice(2).padEnd(64, 'a')}`
    : `0x${'0'.repeat(64)}`;
    
  res.json({ proof });
});

// Submit proof to client (not used in current flow)
proofRouter.post('/submit', async (req, res) => {
  const { proof, callbackUrl, sessionId } = req.body;
  
  console.log('Submitting proof:', { proof, callbackUrl, sessionId });
  
  // In production, would submit to client's callback URL
  res.json({ success: true });
});