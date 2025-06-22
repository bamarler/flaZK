// pages/DocumentScan.tsx
import { useState, useEffect } from 'react';
import { FileSearch, Upload, CheckCircle, AlertCircle, X, FileText } from 'lucide-react';
import { documentService, documentScannerService, documentVerifierService } from '../services';
import type { ScanResult } from '../services/document-scanner.service';
import type { UserDocument } from '../types';
import { config } from '../config';

interface DocumentScanProps {
  userId: string;
  requirements: any;
  onComplete: () => void;
}

export function DocumentScan({ userId, requirements, onComplete }: DocumentScanProps) {
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [saveToAccount, setSaveToAccount] = useState(true);

  useEffect(() => {
    performInitialScan();
  }, []);

  const performInitialScan = async () => {
    setScanning(true);
    
    // Copy user documents to temporary storage
    const userDocs = await documentService.getUserDocuments(userId);
    documentService.clearTemporary();
    userDocs.forEach(doc => documentService.addToTemporary(doc));
    
    // Scan documents
    const result = await documentScannerService.scanUserDocuments(userId, requirements);
    setScanResult(result);
    setScanning(false);
    
    // Check if all requirements are met
    if (result.age && result.license_status && result.points) {
      // All good, proceed to next step
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      // Show upload interface
      setUploadMode(true);
    }
  };

  const rescanDocuments = async () => {
    setScanning(true);
    setUploadMode(false);
    
    // Get all documents from temporary storage
    const tempDocs = documentService.getTemporaryDocuments();
    
    // Extract data from ALL documents together
    const extracted = await documentScannerService.extractDataFromDocuments(tempDocs);
    
    // Create scan result based on extracted data
    const newScanResult: ScanResult = {
      age: extracted.age > 0,
      license_status: extracted.license_status > 0,
      points: extracted.points >= 0
    };
    
    setScanResult(newScanResult);
    setScanning(false);
    
    // Check if all requirements are met now
    if (newScanResult.age && newScanResult.license_status && newScanResult.points) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setUploadMode(true);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!config.SUPPORTED_FILE_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, or PDF file');
      return;
    }
    
    if (file.size > config.MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setError('');
    setSelectedFile(file);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError('');
    
    try {
      // Step 1: Verify document with government agency
      setVerifying(true);
      const verification = await documentVerifierService.verifyDocument(selectedFile);
      
      if (!verification.valid) {
        setError(verification.reason || 'Document verification failed');
        setUploading(false);
        setVerifying(false);
        return;
      }
      
      setVerifying(false);
      
      // Step 2: Save document
      const savedDoc = await documentService.saveDocument(selectedFile, userId, saveToAccount);
      
      // Step 3: Analyze document
      const analysis = await documentScannerService.analyzeUploadedDocument(selectedFile);
      savedDoc.fields = analysis;
      
      // Clear upload state
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploading(false);
      
      // Rescan all documents
      await rescanDocuments();
    } catch (err) {
      setError('Failed to process document. Please try again.');
      setUploading(false);
      setVerifying(false);
    }
  };

  const getMissingItems = () => {
    if (!scanResult) return [];
    const missing = [];
    if (!scanResult.age) missing.push('Date of Birth');
    if (!scanResult.license_status) missing.push('Valid License Status');
    if (!scanResult.points) missing.push('Driving Record Points');
    return missing;
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
  };

  if (scanning) {
    return (
      <div className="card-body">
        <h2 className="text-xl font-semibold mb-6 text-center">
          Scanning Your Documents
        </h2>
        <div className="py-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
            <div className="absolute inset-0 spinner spinner-primary" />
            <div className="absolute inset-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
              <FileSearch className="w-8 h-8 text-primary-700" />
            </div>
          </div>
          <p className="text-center text-gray-600">
            Checking your documents for required information...
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="dot-pulse" />
            <div className="dot-pulse" />
            <div className="dot-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!uploadMode && scanResult && scanResult.age && scanResult.license_status && scanResult.points) {
    return (
      <div className="card-body">
        <div className="text-center">
          <div className="icon-container icon-container-success mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">All Information Available</h2>
          <p className="text-gray-600">
            Your documents contain all required information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-body">
      <h2 className="text-xl font-semibold mb-2 text-center">
        Additional Information Needed
      </h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Please provide documents for the following:
      </p>

      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm font-medium text-yellow-800 mb-2">Missing information:</p>
        <ul className="space-y-1">
          {getMissingItems().map(item => (
            <li key={item} className="text-sm text-yellow-700">
              • {item}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!selectedFile ? (
        <div className="w-full">
          <label className="upload-zone border-gray-300 hover:border-primary-400 group cursor-pointer block">
            <input
              type="file"
              className="hidden"
              accept={config.SUPPORTED_FILE_TYPES.join(',')}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <div className="icon-container icon-container-primary group-hover:bg-primary-200 transition-colors mb-4 mx-auto">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-gray-900 font-medium mb-1">
              Upload Document
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, PDF (max 10MB)
            </p>
          </label>
        </div>
      ) : (
        <div className="relative">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Preview</h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {previewUrl ? (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Document preview"
                  className="max-w-full h-auto max-h-64 mx-auto"
                />
              </div>
            ) : (
              <div className="border-2 border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-900 font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <input 
              type="checkbox" 
              id="save-doc" 
              checked={saveToAccount}
              onChange={(e) => setSaveToAccount(e.target.checked)}
              className="rounded text-primary-600"
              disabled={uploading}
            />
            <label htmlFor="save-doc" className="text-sm text-gray-600">
              Save this document to my account for future use
            </label>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload} 
              className="flex-1 btn-primary"
              disabled={uploading}
            >
              {verifying ? 'Verifying...' : uploading ? 'Processing...' : 'Submit Document'}
            </button>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
                <p className="text-sm text-gray-600">
                  {verifying ? 'Verifying document authenticity...' : 'Analyzing document...'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}