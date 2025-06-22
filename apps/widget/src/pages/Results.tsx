import { useEffect } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { proofService } from '../services';
import type { VerificationRequest } from '../services/verification.service';
import type { ProofResult } from '../services/proof.service';

interface ResultsProps {
  proof: ProofResult;
  request: VerificationRequest;
}

export function Results({ proof, request }: ResultsProps) {
  const isValid = proof.proof !== `0x${'0'.repeat(64)}`;

  useEffect(() => {
    // Submit proof to callback URL
    submitProof();
  }, []);

  const submitProof = async () => {
    await proofService.submitProof(proof, request.callbackUrl, request.sessionId);
  };

  return (
    <div className="card-body">
      <div className="text-center mb-6">
        <div className={`icon-container w-20 h-20 mb-4 ${
          isValid ? 'icon-container-success' : 'bg-red-100'
        }`}>
          {isValid ? (
            <CheckCircle className="w-12 h-12 text-green-600" />
          ) : (
            <Shield className="w-12 h-12 text-red-600" />
          )}
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {isValid ? 'Verification Complete!' : 'Verification Failed'}
        </h2>
        <p className="text-gray-600">
          {isValid 
            ? 'Your proof has been generated and sent'
            : 'Requirements were not met'
          }
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Proof Details</p>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500">Proof Hash:</p>
            <p className="text-xs font-mono break-all">{proof.proof}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Session ID:</p>
            <p className="text-xs font-mono">{request.sessionId}</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Results have been sent to {request.clientName}
        </p>
        {isValid && (
          <p className="text-sm text-green-600 font-medium">
            ✓ Verification complete
          </p>
        )}
      </div>
    </div>
  );
}