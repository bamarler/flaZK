export interface VerificationRequirement {
    field: string;
    label: string;
    operator: 'min' | 'max' | 'equals' | 'boolean';
    value: number | string | boolean;
    unit?: string;
  }
  
  export interface Document {
    id: string;
    type: 'drivers_license' | 'passport' | 'proof_of_insurance' | 'other';
    name: string;
    uploadedAt: Date;
    expiresAt?: Date;
    metadata: Record<string, any>;
    isPersisted: boolean;
  }