// apps/api/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        phone: string;
      };
      client?: {
        id: string;
        name: string;
      };
    }
  }
}

export const authMiddleware = {
  // For client API endpoints
  validateApiKey(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      res.status(401).json({ error: 'Missing API key' });
      return;
    }
    
    // Validate against database
    const validClients: Record<string, any> = {
      'test-api-key-123': {
        id: 'acme-car-rental',
        name: 'ACME Car Rentals'
      }
    };
    
    const client = validClients[apiKey];
    if (!client) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    
    req.client = client;
    next();
  },

  // For widget endpoints
  validateJWT(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        userId: decoded.userId,
        phone: decoded.phone
      };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
  },

  // For session-specific endpoints
  validateSession(req: Request, res: Response, next: NextFunction): void {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!sessionId) {
      res.status(401).json({ error: 'Missing session ID' });
      return;
    }
    
    // Validate session exists and is active
    // const session = await db.sessions.findById(sessionId);
    // if (!session || session.status !== 'active') {
    //   res.status(401).json({ error: 'Invalid session' });
    //   return;
    // }
    
    next();
  }
};