// apps/api/src/controllers/verification.controller.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const verificationController = {
  async createVerificationRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        age_min, 
        license_status, 
        points_max,
        callback_url,
        client_id,
        client_name 
      } = req.body;

      // Validate required fields
      if (!callback_url || !client_id) {
        res.status(400).json({ 
          error: 'Missing required fields: callback_url and client_id' 
        });
      }

      // Generate session ID
      const sessionId = uuidv4();

      // Store verification request in database
      // await db.verificationRequests.create({ ... });

      // Generate widget URL
      const widgetUrl = new URL('http://localhost:5173');
      widgetUrl.searchParams.append('session', sessionId);
      widgetUrl.searchParams.append('client', client_id);
      widgetUrl.searchParams.append('name', client_name || client_id);
      widgetUrl.searchParams.append('callback', callback_url);
      
      // Add requirements
      if (age_min) widgetUrl.searchParams.append('age_min', age_min);
      if (license_status) widgetUrl.searchParams.append('license_status', license_status);
      if (points_max) widgetUrl.searchParams.append('points_max', points_max);

      res.json({
        sessionId,
        widgetUrl: widgetUrl.toString(),
        status: 'pending'
      });
    } catch (error) {
      next(error);
    }
  },

  async getVerificationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      
      // Get status from database
      // const status = await db.verificationRequests.findById(sessionId);
      
      res.json({
        sessionId,
        status: 'pending', // or 'completed', 'failed'
        proof: null // or the actual proof if completed
      });
    } catch (error) {
      next(error);
    }
  }
};