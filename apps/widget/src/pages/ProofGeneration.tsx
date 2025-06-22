// pages/ProofGeneration.tsx
import { useState, useEffect } from 'react';
import { Shield, Cpu, CheckCircle } from 'lucide-react';
import { proofService, documentService, documentScannerService } from '../services';
import type { ProofInput, ProofResult } from '../services/proof.service';
import type { VerificationRequest } from '../services/verification.service';

interface ProofGenerationProps {
  request: VerificationRequest;
  onComplete: (proof: ProofResult) => void;
}

export function ProofGeneration({ request, onComplete }: ProofGenerationProps) {
  const [extracting, setExtracting] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  useEffect(() => {
    generateProof();
  }, []);

  const generateProof = async () => {
    // Step 1: Extract data from temporary documents
    const tempDocs = documentService.getTemporaryDocuments();
    const extracted = await documentScannerService.extractDataFromDocuments(tempDocs);
    setExtractedData(extracted);
    setExtracting(false);
    
    // Step 2: Clear temporary storage
    documentService.clearTemporary();
    
    // Step 3: Merge with requirements
    const proofInput: ProofInput = {
      age: extracted.age,
      license_status: extracted.license_status,
      points: extracted.points,
      age_min: request.requirements.age_min || 25,
      points_max: request.requirements.points_max || 6
    };
    
    // Step 4: Generate proof
    setGenerating(true);
    const proofResult = await proofService.generateProof(proofInput);
    
    // Step 5: Complete
    setTimeout(() => {
      onComplete(proofResult);
    }, 1000);
  };

  return (
    <div className="card-body">
      <h2 className="text-xl font-semibold mb-6 text-center">
        Generating Zero-Knowledge Proof
      </h2>

      <div className="space-y-4">
        {/* Extracting data step */}
        <div
          className={`p-4 rounded-lg border-2 transition-all ${
            extracting
              ? 'border-primary-500 bg-primary-50'
              : 'border-green-500 bg-green-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Extracting Information</p>
              <p className="text-sm text-gray-600">Reading document data securely</p>
            </div>
            <div className="flex items-center">
              {extracting ? (
                <Cpu className="w-5 h-5 text-primary-600 animate-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Generating proof step */}
        <div
          className={`p-4 rounded-lg border-2 transition-all ${
            !extracting && generating
              ? 'border-primary-500 bg-primary-50'
              : !extracting && !generating
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Creating Proof</p>
              <p className="text-sm text-gray-600">Generating cryptographic proof</p>
            </div>
            <div className="flex items-center">
              {!extracting && generating ? (
                <Shield className="w-5 h-5 text-primary-600 animate-pulse" />
              ) : !extracting && !generating ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      {extractedData && !generating && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Verification data:</p>
          <div className="space-y-1 text-xs font-mono text-gray-700">
            <div>Age: {extractedData.age} (min: {request.requirements.age_min})</div>
            <div>License: {extractedData.license_status === 1 ? 'Valid' : 'Invalid'}</div>
            <div>Points: {extractedData.points} (max: {request.requirements.points_max})</div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {extracting ? 'Extracting document information...' : 
           generating ? 'Creating zero-knowledge proof...' : 
           'Finalizing verification...'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your personal data remains private
        </p>
      </div>
    </div>
  );
}