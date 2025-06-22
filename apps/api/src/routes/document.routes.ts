import { Router } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware';

export const documentRouter = Router();

// Get user's saved documents
documentRouter.get('/user/:userId', async (_req, res) => {
  // Return user's saved documents
  res.json({ documents: [] });
});

// Scan documents for requirements
documentRouter.post('/scan', async (req, res) => {
  const { userId, requirements } = req.body;
  userId
  requirements
  // Return scan results
  res.json({ 
    age: true, 
    license_status: false, 
    points: true 
  });
});

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