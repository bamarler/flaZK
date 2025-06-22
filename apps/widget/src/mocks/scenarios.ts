export type MockScenario = 'all-docs' | 'missing-one' | 'missing-two';

export interface MockUserDocuments {
  scenario: MockScenario;
  documents: Array<{
    id: string;
    type: string;
    name: string;
    uploadedAt: Date;
    fields: Record<string, any>;
  }>;
}

// Scenario 1: User has all required documents
export const allDocsScenario: MockUserDocuments = {
  scenario: 'all-docs',
  documents: [
    {
      id: 'doc-1',
      type: 'drivers_license',
      name: 'Driver\'s License',
      uploadedAt: new Date('2024-01-15'),
      fields: {
        birthdate: '1995-03-15',
        license_status: 'valid',
        license_expiry: '2028-03-15',
        state: 'NH'
      }
    },
    {
      id: 'doc-2',
      type: 'driving_record',
      name: 'DMV Driving Record',
      uploadedAt: new Date('2024-02-20'),
      fields: {
        driving_points: 3
      }
    }
  ]
};

// Scenario 2: Missing driving record (points)
export const missingOneScenario: MockUserDocuments = {
  scenario: 'missing-one',
  documents: [
    {
      id: 'doc-1',
      type: 'drivers_license',
      name: 'Driver\'s License',
      uploadedAt: new Date('2024-01-15'),
      fields: {
        birthdate: '1995-03-15',
        license_status: 'valid',
        license_expiry: '2028-03-15',
        state: 'NH'
      }
    }
  ]
};

// Scenario 3: Missing both license expiry and driving points
export const missingTwoScenario: MockUserDocuments = {
  scenario: 'missing-two',
  documents: [
    {
      id: 'doc-1',
      type: 'partial_license',
      name: 'Old License Copy',
      uploadedAt: new Date('2024-01-15'),
      fields: {
        birthdate: '1995-03-15',
        license_status: 'valid'
        // Missing: license_expiry
      }
    }
    // Missing: driving_points document
  ]
};

// Mock AI analysis results based on uploaded file
export const mockAIAnalysis = {
  // Analysis for driving record documents
  drivingRecord: {
    driving_points: 3
  },
  
  // Analysis for license with expiry
  licenseWithExpiry: {
    license_expiry: '2028-03-15'
  },
  
  // Analysis for combined document
  combinedDocument: {
    license_expiry: '2028-03-15',
    driving_points: 2
  }
};

// Get current scenario from URL params or localStorage
export function getCurrentScenario(): MockScenario {
  // Check URL params first
  const urlParams = new URLSearchParams(window.location.search);
  const urlScenario = urlParams.get('scenario') as MockScenario;
  if (urlScenario && ['all-docs', 'missing-one', 'missing-two'].includes(urlScenario)) {
    return urlScenario;
  }
  
  // Check localStorage
  const savedScenario = localStorage.getItem('mockScenario') as MockScenario;
  if (savedScenario && ['all-docs', 'missing-one', 'missing-two'].includes(savedScenario)) {
    return savedScenario;
  }
  
  // Default scenario
  return 'missing-one';
}

// Set scenario
export function setScenario(scenario: MockScenario) {
  localStorage.setItem('mockScenario', scenario);
}

// Get documents for current scenario
export function getScenarioDocuments(): MockUserDocuments['documents'] {
  const scenario = getCurrentScenario();
  
  switch (scenario) {
    case 'all-docs':
      return allDocsScenario.documents;
    case 'missing-one':
      return missingOneScenario.documents;
    case 'missing-two':
      return missingTwoScenario.documents;
    default:
      return missingOneScenario.documents;
  }
}

// Simulate AI analysis of uploaded document
export function analyzeUploadedDocument(fileName: string, scenario: MockScenario): Record<string, any> {
  const lowerName = fileName.toLowerCase();
  
  // Scenario-specific analysis
  if (scenario === 'missing-one') {
    // Only missing driving points
    if (lowerName.includes('record') || lowerName.includes('dmv') || lowerName.includes('driving')) {
      return mockAIAnalysis.drivingRecord;
    }
  } else if (scenario === 'missing-two') {
    // Missing both license expiry and driving points
    if (lowerName.includes('license')) {
      return mockAIAnalysis.licenseWithExpiry;
    } else if (lowerName.includes('record') || lowerName.includes('dmv')) {
      return mockAIAnalysis.drivingRecord;
    } else if (lowerName.includes('combined') || lowerName.includes('both')) {
      // Special case: one document with both pieces of info
      return mockAIAnalysis.combinedDocument;
    }
  }
  
  // Default: return empty fields
  return {};
}