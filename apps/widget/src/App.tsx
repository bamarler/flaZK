// App.tsx
import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { Login } from './pages/Login';
import { DocumentScan } from './pages/DocumentScan';
import { ProofGeneration } from './pages/ProofGeneration';
import { Results } from './pages/Results';
import { ScenarioSelector } from './components/ScenarioSelector';
import { verificationService, authService } from './services';
import type { VerificationRequest } from './services/verification.service';
import type { ProofResult } from './services/proof.service';

export type Step = 'login' | 'scan' | 'generate' | 'results';

export function App() {
  const [currentStep, setCurrentStep] = useState<Step>('login');
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);

  useEffect(() => {
    // Parse verification request from URL
    const params = new URLSearchParams(window.location.search);
    const request = verificationService.parseVerificationRequest(params);
    setVerificationRequest(request);
    
    // Check if user is already logged in
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const user = await authService.getCurrentUser();
    if (user) {
      setUserId(user.userId);
      setCurrentStep('scan');
    }
  };

  const handleLogin = async (loggedInUserId: string) => {
    setUserId(loggedInUserId);
    setCurrentStep('scan');
  };

  const handleScanComplete = () => {
    setCurrentStep('generate');
  };

  const handleProofGenerated = (proof: ProofResult) => {
    setProofResult(proof);
    setCurrentStep('results');
  };

  if (!verificationRequest) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const steps = ['login', 'scan', 'generate', 'results'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      {/* Scenario Selector for Development */}
      <ScenarioSelector />
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">flaZK Verify</h1>
          </div>
          <p className="text-sm text-gray-600">
            Verification for {verificationRequest.clientName}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentStepIndex >= index
                      ? 'bg-primary-600'
                      : 'bg-gray-300'
                  }`}
                />
                {index < steps.length - 1 && (
                  <div 
                    className={`w-8 h-0.5 transition-colors ${
                      currentStepIndex > index 
                        ? 'bg-primary-600' 
                        : 'bg-gray-300'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="card">
          {currentStep === 'login' && (
            <Login 
              onSuccess={handleLogin}
              clientName={verificationRequest.clientName}
              requirements={verificationRequest.requirements}
            />
          )}

          {currentStep === 'scan' && (
            <DocumentScan
              userId={userId}
              requirements={verificationRequest.requirements}
              onComplete={handleScanComplete}
            />
          )}

          {currentStep === 'generate' && (
            <ProofGeneration
              request={verificationRequest}
              onComplete={handleProofGenerated}
            />
          )}

          {currentStep === 'results' && proofResult && (
            <Results
              proof={proofResult}
              request={verificationRequest}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secured by zero-knowledge proofs
          </p>
        </div>
      </div>
    </div>
  );
}