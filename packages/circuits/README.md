# zkAge Threshold Verifier — POC

A minimal proof-of-concept zero-knowledge circuit to prove `age >= threshold` without revealing the actual age.

## Quickstart

### 1. Install dependencies
- [Circom v2](https://docs.circom.io/getting-started/installation/)
- [SnarkJS v0.7+](https://github.com/iden3/snarkjs)

### 2. Compile the circuit
```bash
bash compile.sh
```

### 3. Trusted setup
```bash
bash setup.sh
```

### 4. Prepare input
Edit `input.json`:
```json
{
  "age": 23,
  "threshold": 18
}
```

### 5. Generate witness
```bash
node build/AgeCheck_js/generate_witness.js build/AgeCheck.wasm input.json build/witness.wtns
```

### 6. Generate proof
```bash
snarkjs groth16 prove build/AgeCheck.zkey build/witness.wtns build/proof.json build/public.json
```

### 7. Verify proof
```bash
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json
```

---

## Files
- `AgeCheck.circom` — Main circuit
- `input.json` — Example input
- `build/` — Compiled outputs

---

## Notes
- This is a minimal, hackathon-ready demo. Not for production use.
- For upgrades, see the project roadmap in the tech spec.
