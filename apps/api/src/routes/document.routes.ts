// apps/api/src/routes/document.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

export const documentRouter = Router();

// All document routes require authentication
documentRouter.use(authMiddleware.validateJWT);

// Now all routes are protected
documentRouter.get('/user/:userId', async (req, res) => {
  // Verify user can only access their own documents
  if (req.params.userId !== req.user?.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  return res.json({ documents: [] });
});

documentRouter.post('/scan', authMiddleware.validateSession, async (_req, res) => {
  // Additional session validation for verification flow
  res.json({ age: true, license_status: false, points: true });
});

// ... other routes

// Verify and save uploaded document
documentRouter.post('/verify', 
  uploadMiddleware.single('document'), 
  async (_req, res) => {
    // Verify with government API (mock)
    // Save to temporary storage
    res.json({ valid: true, documentId: 'doc-123' });
});

// Extract data from documents
documentRouter.post('/extract', async (req, res) => {
  const { documentIds } = req.body;
  documentIds
  // Extract and return data
  res.json({ 
    age: 26, 
    license_status: 1, 
    points: 3 
  });
});