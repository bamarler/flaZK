# Frontend Handoff Guide: zkAge ZK Proof Verification

This document provides everything a frontend developer needs to integrate, test, and verify zkAge zero-knowledge proofs using the current codebase.

---

## 📦 Directory & Artifacts Overview

**Key directories:**
- `build/` — Contains all generated circuit artifacts, proofs, public signals, and verification keys.
- `src/modules/` — Circom source code for all circuits, including the unified `CarRentalEligibility.circom`.
- `input_examples/` — Example input JSONs for each module.

**Frontend will need these files (from `build/`):**
- `carrental_all_proof.json` — ZK proof
- `carrental_all_public.json` — Public inputs/signals
- `carrental_all_verification_key.json` — Verification key

---

## 🔗 How to Access Proof Artifacts

1. **After a proof is generated,** the backend/pipeline will output the above files to `build/`.
2. **Copy or move** these files to a directory accessible by your frontend (e.g., `public/`, `static/`, or serve directly from `build/`).
3. **Example copy command:**
   ```bash
   cp build/carrental_all_proof.json public/
   cp build/carrental_all_public.json public/
   cp build/carrental_all_verification_key.json public/
   ```

---

## 🟦 Minimal Browser Verification Example (SnarkJS)

Use [SnarkJS](https://github.com/iden3/snarkjs) in your frontend to verify the proof:

```js
import { groth16 } from "snarkjs";

const vkey = await fetch("/public/carrental_all_verification_key.json").then(r => r.json());
const proof = await fetch("/public/carrental_all_proof.json").then(r => r.json());
const publicSignals = await fetch("/public/carrental_all_public.json").then(r => r.json());

const res = await groth16.verify(vkey, publicSignals, proof);
if (res === true) {
  console.log("Proof is valid!");
} else {
  console.log("Proof is invalid!");
}
```

---

## 🧪 Testing & Validation

- Always test with the latest proof/public/key files after any backend change.
- If verification fails, ensure the files are up-to-date and not stale.
- Use sample files for regression testing after updates.
- Coordinate with the backend to confirm input/output formats if changes are made.

---

## 📝 Troubleshooting

- **File not found?** Check that the files are copied to the correct directory and are accessible by the frontend server.
- **Verification fails?** Ensure the proof, public, and verification key are from the same pipeline run and circuit version.
- **Need more info?** See `docs/frontend_integration_plan.md` or contact the backend developer.

---

## ✅ Handoff Checklist

- [ ] Files are present and accessible to the frontend
- [ ] File formats and locations are documented
- [ ] Example verification code is provided
- [ ] Frontend can verify a sample proof in the browser

---

Happy hacking!
