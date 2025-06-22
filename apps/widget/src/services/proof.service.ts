import { config } from '../config';

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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const meetsRequirements = 
      input.age >= input.age_min &&
      input.license_status === 1 &&
      input.points <= input.points_max;
    
    const proof = meetsRequirements 
      ? `0x${Math.random().toString(16).slice(2).padEnd(64, 'a')}` 
      : `0x${'0'.repeat(64)}`;
    
    return { proof };
  }

  async submitProof(proof: ProofResult, callbackUrl: string, sessionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Mock: Submitting proof to ${callbackUrl}`);
    console.log(`Session ID: ${sessionId}`);
    console.log(`Proof: ${proof.proof}`);
  }
}

class ApiProofService implements ProofService {
  async generateProof(input: ProofInput): Promise<ProofResult> {
    console.log('Generating proof with input:', input);
    
    const token = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!token);
    
    try {
      const response = await fetch(`${config.API_URL}/api/proofs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(input)
      });

      console.log('Proof generation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Proof generation failed:', errorText);
        throw new Error('Failed to generate proof');
      }

      const result = await response.json();
      console.log('Proof generation result:', result);
      return result;
    } catch (error) {
      console.error('Proof generation error:', error);
      throw error;
    }
  }

  async submitProof(proof: ProofResult, callbackUrl: string, sessionId: string): Promise<void> {
    try {
      const isValid = proof.proof !== `0x${'0'.repeat(64)}`;
      
      const response = await fetch(`${config.API_URL}/api/verification/complete/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: isValid,
          proof: proof.proof
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit proof');
      }

      const data = await response.json();
      console.log('Proof submitted successfully:', data);
      
      // Communicate back to the opener window using postMessage
      if (window.opener && !window.opener.closed) {
        console.log('Sending verification result to opener window via postMessage');
        
        // Use postMessage for cross-origin communication
        window.opener.postMessage({
          type: 'verification-complete',
          sessionId,
          success: isValid,
          proof: proof.proof
        }, 'http://localhost:8080'); // Specify the exact origin for security
        
        console.log('Verification complete message sent');
        // Don't close the window - let user close it manually
      } else {
        console.log('No opener window found, using redirect fallback');
        // Fallback: if no opener, redirect as before
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
    }
  }
}

export const proofService: ProofService = config.useMocks 
  ? new MockProofService() 
  : new ApiProofService();