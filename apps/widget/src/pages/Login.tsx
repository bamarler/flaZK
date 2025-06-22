// pages/Login.tsx
import { useState } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { authService } from '../services';
import { config } from '../config';

interface LoginProps {
  onSuccess: (userId: string) => void;
  clientName: string;
  requirements: any;
}

export function Login({ onSuccess, clientName, requirements }: LoginProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.sendVerificationCode(phone);
      if (result.success) {
        setCodeSent(true);
      } else {
        setError(result.message || 'Failed to send code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.verifyCode(phone, code);
      if (result.success && result.userId) {
        onSuccess(result.userId);
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    const result = await authService.verifyCode('+15555551234', '123456');
    if (result.userId) {
      onSuccess(result.userId);
    }
  };

  return (
    <div className="card-body">
      <div className="text-center mb-6">
        <div className="icon-container icon-container-primary w-16 h-16 mb-4">
          <Phone className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Sign in to continue</h2>
        <p className="text-sm text-gray-600 mb-4">
          {clientName} requires identity verification
        </p>
        
        {/* Requirements list */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-2">This site is requesting to verify:</p>
          <ul className="space-y-1 text-xs text-gray-600">
            {requirements.age_min && (
              <li>• You are at least {requirements.age_min} years old</li>
            )}
            {requirements.license_status && (
              <li>• You have a valid driver's license</li>
            )}
            {requirements.points_max && (
              <li>• You have {requirements.points_max} or fewer driving record points</li>
            )}
          </ul>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!codeSent ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button 
            onClick={handleSendCode} 
            disabled={loading || !phone}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification code
            </label>
            <input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Code sent to {phone}
            </p>
          </div>
          <button 
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          
          <button 
            onClick={() => {
              setCodeSent(false);
              setCode('');
              setError('');
            }}
            className="btn-ghost w-full mt-3"
          >
            Use different number
          </button>
        </>
      )}

      {config.isDevelopment && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={handleDevLogin}
            className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
          >
            Skip login (dev mode)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}