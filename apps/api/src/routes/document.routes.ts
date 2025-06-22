import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { db } from '../services/database.service';
import { uploadService } from '../services/upload.service';

export const documentRouter = Router();

documentRouter.use(authMiddleware.validateJWT);

documentRouter.get('/user/:userId', async (req, res): Promise<void> => {
  const phone = req.params.userId;
  
  if (phone !== req.user?.phone) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  
  const documents = await db.getUserDocuments(phone);
  res.json(documents);
});

documentRouter.post('/scan', async (req, res): Promise<void> => {
  const { userId, requirements } = req.body;
  
  const userData = await db.extractUserData(userId);
  
  const results = {
    age: requirements.age_min ? userData.age >= requirements.age_min : true,
    license_status: requirements.license_status ? userData.license_status === requirements.license_status : true,
    points: requirements.points_max !== undefined ? userData.points <= requirements.points_max : true
  };
  
  res.json(results);
});

documentRouter.post('/upload', 
  uploadMiddleware.single('file'), 
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }
    
    const { userId } = req.body;
    const phone = userId || req.user?.phone;
    
    if (!phone) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }
    
    const document = await uploadService.processAndSaveDocument(phone, req.file);
    
    res.json(document);
});

documentRouter.post('/verify', 
  uploadMiddleware.single('file'), 
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }
    
    res.json({ 
      valid: true,
      documentId: `doc-${Date.now()}`
    });
});

documentRouter.post('/analyze',
  uploadMiddleware.single('file'),
  async (req, res): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }
    
    const extractedData = await uploadService.extractDataFromFile(req.file);
    res.json(extractedData);
});

documentRouter.post('/extract', async (req, res): Promise<void> => {
  const { documents } = req.body;
  
  if (!documents || !Array.isArray(documents)) {
    res.status(400).json({ error: 'Documents array required' });
    return;
  }
  
  const phone = req.user?.phone;
  if (!phone) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  
  const userData = await db.extractUserData(phone);
  
  res.json(userData);
});