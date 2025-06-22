import { useEffect } from 'react';
import { CheckCircle, X, Shield } from 'lucide-react';
import { proofService } from '../services';
import type { VerificationRequest } from '../services/verification.service';
import type { ProofResult } from '../services/proof.service';
import type { ExtractedData } from '../services/document-scanner.service';

interface ResultsProps {
  proof: ProofResult;
  request: VerificationRequest;
  extractedData: ExtractedData;
}

export function Results({ proof, request, extractedData }: ResultsProps) {
  const isValid = proof.proof !== `0x${'0'.repeat(64)}`;

  const meetsAgeRequirement = extractedData.age >= (request.requirements.age_min || 0);
  const hasValidLicense = extractedData.license_status === 1;
  const meetsPointsRequirement = extractedData.points <= (request.requirements.points_max || 999);

  useEffect(() => {
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
            <X className="w-12 h-12 text-red-600" />
          )}
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {isValid ? 'Verification Complete!' : 'Verification Failed'}
        </h2>
        <p className="text-gray-600">
          {isValid 
            ? 'All requirements have been met'
            : 'One or more requirements were not met'
          }
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Requirements Check</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                meetsAgeRequirement ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {meetsAgeRequirement ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-red-600" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">Age Requirement</span>
            </div>
            <span className={`text-xs font-medium ${meetsAgeRequirement ? 'text-green-600' : 'text-red-600'}`}>
              {meetsAgeRequirement ? 'Pass' : 'Fail'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                hasValidLicense ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {hasValidLicense ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-red-600" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">License Status</span>
            </div>
            <span className={`text-xs font-medium ${hasValidLicense ? 'text-green-600' : 'text-red-600'}`}>
              {hasValidLicense ? 'Pass' : 'Fail'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                meetsPointsRequirement ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {meetsPointsRequirement ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <X className="w-3 h-3 text-red-600" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">Driving Points</span>
            </div>
            <span className={`text-xs font-medium ${meetsPointsRequirement ? 'text-green-600' : 'text-red-600'}`}>
              {meetsPointsRequirement ? 'Pass' : 'Fail'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Results have been sent to {request.clientName}
        </p>
        {isValid && (
          <p className="text-sm text-green-600 font-medium">
            ✓ Verification successful
          </p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Your actual data values remain private and are not shared
        </p>
      </div>
    </div>
  );
}