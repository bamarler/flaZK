import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

export const documentRouter = Router();

// All document routes require authentication
documentRouter.use(authMiddleware.validateJWT);

// Get user's documents
documentRouter.get('/user/:userId', async (req, res) => {
  if (req.params.userId !== req.user?.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // In production, fetch from database
  return res.json([
    {
      id: 'doc-1',
      type: 'drivers_license',
      name: 'Driver License',
      uploadedAt: new Date(),
      fields: {
        birthdate: '1998-05-15',
        license_status: 'valid',
        license_expiry: '2026-05-15'
      }
    }
  ]);
});

// Scan documents for verification
documentRouter.post('/scan', async (req, res) => {
  const { userId, requirements } = req.body;
  
  console.log(`Scanning documents for user ${userId} with requirements:`, requirements);
  
  // In production, scan actual documents
  res.json({ 
    age: false, 
    license_status: false, 
    points: false
  });
});

// Upload a new document
documentRouter.post('/upload', 
  uploadMiddleware.single('file'), 
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const { userId, saveToAccount } = req.body;
    
    console.log(`Uploading document for user ${userId}, save to account: ${saveToAccount}`);
    
    // In production, save file and extract data
    const document = {
      id: `doc-${Date.now()}`,
      type: 'uploaded_document',
      name: req.file.originalname,
      uploadedAt: new Date(),
      fields: {}
    };
    
    return res.json(document);
});

// Verify document authenticity
documentRouter.post('/verify', 
  uploadMiddleware.single('file'), 
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // In production, verify with government API
    return res.json({ 
      valid: true,
      documentId: `doc-${Date.now()}`
    });
});

// Analyze uploaded document
documentRouter.post('/analyze',
  uploadMiddleware.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // In production, use AI/OCR to extract data
    const fileName = req.file.originalname.toLowerCase();
    const result: any = {};
    
    if (fileName.includes('license')) {
      result.license_status = 1;
    } else if (fileName.includes('record') || fileName.includes('dmv')) {
      result.points = 3;
    }
    
    return res.json(result);
});

// Extract data from multiple documents
documentRouter.post('/extract', async (req, res) => {
  const { documents } = req.body;
  
  // In production, extract data from provided documents
  let age = 0;
  let license_status = 0;
  let points = 0;
  
  documents.forEach((doc: any) => {
    if (doc.fields.birthdate) {
      const birthDate = new Date(doc.fields.birthdate);
      age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }
    
    if (doc.fields.license_status === 'valid') {
      license_status = 1;
    }
    
    if (doc.fields.driving_points !== undefined) {
      points = doc.fields.driving_points;
    }
  });
  
  return res.json({ age, license_status, points });
});