// services/proof.service.ts
export interface ProofInput {
    age: number;
    license_status: number;
    points: number;
    age_min: number;
    points_max: number;
  }
  
  export interface ProofResult {
    proof: string;
  }
  
  export interface ProofService {
    generateProof(input: ProofInput): Promise<ProofResult>;
    submitProof(proof: ProofResult, callbackUrl: string, sessionId: string): Promise<void>;
  }
  
  class MockProofService implements ProofService {
    async generateProof(input: ProofInput): Promise<ProofResult> {
      // Simulate proof generation time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if requirements are met
      const meetsRequirements = 
        input.age >= input.age_min &&
        input.license_status === 1 &&
        input.points <= input.points_max;
      
      // Generate mock proof hash
      const proof = meetsRequirements 
        ? `0x${Math.random().toString(16).slice(2, 66)}` // Valid proof
        : `0x${'0'.repeat(64)}`; // Invalid proof
      
      return { proof };
    }
  
    async submitProof(proof: ProofResult, callbackUrl: string, sessionId: string): Promise<void> {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Mock: Submitting proof to ${callbackUrl}`);
      console.log(`Session ID: ${sessionId}`);
      console.log(`Proof: ${proof.proof}`);
    }
  }
  
  export const proofService: ProofService = new MockProofService();