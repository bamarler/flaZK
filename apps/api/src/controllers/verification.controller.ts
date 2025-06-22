import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/database.service';

export const verificationController = {
  async createVerificationRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        client_id,
        callback_url,
        requirements = {}
      } = req.body;

      if (!callback_url || !client_id) {
        res.status(400).json({ 
          error: 'Missing required fields: callback_url and client_id' 
        });
        return;
      }

      const sessionId = uuidv4();

      await db.createSession({
        sessionId,
        phone: '',
        clientId: client_id,
        clientName: req.client?.name,
        callbackUrl: callback_url,
        requirements: {
          age_min: requirements.age_min,
          license_status: requirements.license_status,
          points_max: requirements.points_max
        },
        createdAt: new Date(),
        status: 'pending'
      });

      const widgetUrl = new URL(process.env.WIDGET_URL || 'http://localhost:8081');
      widgetUrl.searchParams.append('session', sessionId);
      widgetUrl.searchParams.append('client', client_id);
      widgetUrl.searchParams.append('return', callback_url);
      
      if (requirements.age_min) {
        widgetUrl.searchParams.append('age_min', requirements.age_min.toString());
      }
      if (requirements.license_status) {
        widgetUrl.searchParams.append('license_status', requirements.license_status.toString());
      }
      if (requirements.points_max) {
        widgetUrl.searchParams.append('points_max', requirements.points_max.toString());
      }

      const acceptHeader = req.headers.accept || '';
      const contentType = req.headers['content-type'] || '';
      const wantsJson = acceptHeader.includes('application/json') || 
                       contentType.includes('application/json') ||
                       req.xhr || 
                       req.headers['x-requested-with'] === 'XMLHttpRequest';

      if (wantsJson) {
        res.json({
          sessionId,
          widgetUrl: widgetUrl.toString(),
          status: 'pending'
        });
      } else {
        res.redirect(widgetUrl.toString());
      }
    } catch (error) {
      next(error);
    }
  },

  async getVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const session = await db.getSession(sessionId);
      
      if (!session) {
        res.status(404).json({
          error: 'Session not found'
        });
        return;
      }
      
      res.json({
        sessionId,
        status: session.status,
        proof: session.status === 'completed' ? '0x' + 'a'.repeat(64) : null
      });
    } catch (error) {
      next(error);
    }
  },

  async completeVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { success, proof } = req.body;
      
      const session = await db.getSession(sessionId);
      
      if (!session) {
        res.status(404).json({
          error: 'Session not found'
        });
        return;
      }
      
      await db.updateSession(sessionId, {
        status: success ? 'completed' : 'failed'
      });
      
      const callbackUrl = new URL(session.callbackUrl);
      callbackUrl.searchParams.append('session', sessionId);
      callbackUrl.searchParams.append('status', success ? 'success' : 'failed');
      if (proof) {
        callbackUrl.searchParams.append('proof', proof);
      }
      
      res.json({
        redirectUrl: callbackUrl.toString()
      });
    } catch (error) {
      next(error);
    }
  }
};