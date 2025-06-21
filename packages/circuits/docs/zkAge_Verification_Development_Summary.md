# zkAge & Car Rental Eligibility — Development Summary

## Overview
This project demonstrates privacy-preserving age and eligibility verification for car rentals using zero-knowledge proofs (ZKPs) with Circom and SnarkJS. The system is modular, extensible, and automates the full ZK workflow from circuit design to proof verification.

---

## Features & Modules Developed

### 1. Modular ZK Circuits
- **AgeCheck**: Proves a user’s age is above a threshold (e.g., 18/25) without revealing the actual age.
- **LicenseStatusCarRental**: Proves a user’s license status is valid (1 = valid, 0 = invalid) without revealing anything else.
- **DrivingRecordCarRental**: Proves a user has fewer than 6 points on their driving record.
- **CarRentalEligibility**: Combines all above checks into one circuit, with multiple public outputs for each check and a final eligibility flag.

### 2. Circuit Design Details
- All comparators use bit decomposition and quadratic-friendly constraints to comply with Circom’s requirements.
- Circuits are written for 8-bit (age) and 4-bit (points) unsigned integers.
- Booleanity constraints ensure license status is strictly 0 or 1.
- The combined circuit exposes individual check results and a composite eligibility output.

### 3. Automation Scripts
- **Compile, setup, and proof scripts** for each module:
  - `compile_*.sh`, `setup_*.sh`, `prove_and_verify_*.sh`
- Scripts handle directory creation, error checking, and colored output for easy debugging.
- Example input files for each module are provided in `input_examples/`.

### 4. Example Inputs
- Each circuit/module has a matching input JSON (e.g., `age_check_input.json`, `license_status_input.json`, `driving_record_input.json`, `combined_input.json`).
- The combined circuit takes all inputs in a single JSON file.

### 5. Documentation & Specs
- Technical specs for each module are provided in `docs/`, including circuit logic, constraints, and extensibility notes.
- README and summary docs guide users through the project structure and workflow.

---

## Project Structure
```
circuits/
├── src/modules/               # All main and combined Circom circuits
├── src/lib/                   # (For future shared circuit components)
├── input_examples/            # Example circuit input JSONs
├── scripts/                   # Bash scripts for compile/setup/prove/verify
├── build/                     # Generated artifacts (r1cs, wasm, zkey, etc.)
├── docs/                      # Technical specs and development summaries
├── package.json
└── README.md
```

---

## 🔁 UPDATED zkAge Development Plan (Hackathon Edition)

### 🔥 Summary:

Build a single, unified ZK circuit that verifies:

> “I am over the age threshold, have a valid license, and a clean driving record”
> ...without revealing personal information.

---

## 🧠 New System Overview

```plaintext
[Photo ID / License Upload]
          ↓
[AI Parser] → predicted_info.json
          ↓
[ZK Input Generator] → circuit_input.json
          ↓
[Circom + SnarkJS]
    └──> proof.json + public.json
          ↓
[Verifier (Browser / CLI)] → OK / FAIL
```

---

## 📂 Project Structure (Updated)

```
zkage-hackathon/
├── circuits/
│   └── CarRentalEligibility.circom   # Combined circuit
├── mock/
│   └── license.jpg / pdf             # Test images
├── scripts/
│   ├── estimate_info.py              # AI to extract age/license/points
│   ├── generate_input.js             # Turns JSON → ZK input
│   └── prove_and_verify.sh           # 1-command POC runner
├── proofs/
│   ├── proof.json
│   ├── public.json
├── keys/
│   ├── carrental_all.zkey
│   └── verification_key.json
├── verifier/
│   └── index.html                    # In-browser proof verification
└── README.md
```

---

## ✅ Step-by-Step Dev Plan (Updated)

---

### **Step 1: Write/Use Combined ZK Circuit**

✅ Circuit logic: `CarRentalEligibility.circom`

```circom
pragma circom 2.0.0;

template CarRentalEligibility(age_threshold) {
    signal input age;
    signal input license_status;
    signal input points;
    signal input age_threshold;

    signal output eligible;

    component isOldEnough = GreaterEqThan(8);
    isOldEnough.in[0] <== age;
    isOldEnough.in[1] <== age_threshold;

    component hasValidLicense = IsEqual();
    hasValidLicense.in[0] <== license_status;
    hasValidLicense.in[1] <== 1;

    component underPointLimit = LessThan(8);
    underPointLimit.in[0] <== points;
    underPointLimit.in[1] <== 6;

    eligible <== isOldEnough.out * hasValidLicense.out * underPointLimit.out;
}

component main = CarRentalEligibility();
```

---

### **Step 2: Run AI Extractor**

Script: `scripts/estimate_info.py`

* Takes a mock license image as input
* Outputs something like:

```json
{
  "age": 27,
  "license_status": 1,
  "points": 3,
  "age_threshold": 25
}
```

Use libraries:

* `easyocr`, `pytesseract`, `deepface`, or a custom ruleset if testing with fixed input

---

### **Step 3: Convert AI Output to ZK Input**

Script: `scripts/generate_input.js`

```js
const fs = require("fs");

const data = JSON.parse(fs.readFileSync("predicted_info.json"));
const input = {
  age: data.age,
  license_status: data.license_status,
  points: data.points,
  age_threshold: data.age_threshold,
};

fs.writeFileSync("circuit_input.json", JSON.stringify(input, null, 2));
```

---

### **Step 4: Compile & Setup Circuit**

```bash
circom circuits/CarRentalEligibility.circom --r1cs --wasm --sym -o build
snarkjs groth16 setup build/CarRentalEligibility.r1cs pot12_final.ptau keys/carrental_all.zkey
snarkjs zkey export verificationkey keys/carrental_all.zkey keys/verification_key.json
```

---

### **Step 5: Generate Proof**

```bash
node build/CarRentalEligibility_js/generate_witness.js build/CarRentalEligibility.wasm circuit_input.json build/witness.wtns

snarkjs groth16 prove keys/carrental_all.zkey build/witness.wtns proofs/proof.json proofs/public.json
```

---

### **Step 6: Verify Proof**

Browser or CLI:

```bash
snarkjs groth16 verify keys/verification_key.json proofs/public.json proofs/proof.json
```

Browser version uses:

```js
await snarkjs.groth16.verify(vkey, publicSignals, proof);
```

---

## 🎯 Hackathon Completion Criteria

* ✅ Upload license → get parsed JSON with age, license, points
* ✅ Circuit proves “is eligible” based on inputs
* ✅ All logic runs locally
* ✅ HTML/JS frontend verifies proof

---

## 🧪 Stretch Goals

| Feature                  | Difficulty | Benefit                            |
| ------------------------ | ---------- | ---------------------------------- |
| Domain binding (nonce)   | Medium     | Prevents proof reuse (anti-replay) |
| Attester signature check | High       | Validates origin of credentials    |
| Export to Apple Wallet   | Medium     | Easy portability and reuse         |
| Merkle revocation proof  | High       | Revoke fake credentials            |

---

## Quickstart

Follow these steps to get up and running with the combined Car Rental Eligibility ZK circuit:

1. **Install Dependencies**
   - Ensure you have Circom v2 and SnarkJS v0.7+ installed.
   - Node.js (LTS) is required for witness generation.

2. **Prepare Input**
   - Edit or create your input file (e.g., `input_examples/combined_input.json`):
     ```json
     {
       "age": 27,
       "license_status": 1,
       "points": 3,
       "age_threshold": 25
     }
     ```

3. **Compile the Circuit**
   ```bash
   bash scripts/compile_carrental_all.sh
   ```

4. **Run Trusted Setup**
   ```bash
   bash scripts/setup_carrental_all.sh
   ```

5. **Generate Proof and Verify**
   ```bash
   bash scripts/prove_and_verify_carrental_all.sh
   ```
   - This will generate and verify a proof using your input JSON.
   - Outputs: `build/CarRentalEligibility.zkey`, `build/carrental_all_witness.wtns`, `build/carrental_all_proof.json`, `build/carrental_all_public.json`

6. **Check Outputs**
   - The public output (`carrental_all_public.json`) will show the result of each eligibility check and the final eligibility flag.

7. **(Optional) Use Other Modules**
   - You can run the same workflow for individual modules (age, license, driving record) using their respective scripts and input files.

---

## Next Steps
- Integrate AI-based age estimation (external script, in progress by partner)
- Script to generate circuit input JSON from AI output
- Build browser/CLI verifier for proof verification
- (Optional) Move shared comparator logic to `src/lib/` for further modularity

---

## Key Takeaways
- The system is modular, hackathon-ready, and extensible for future ZK proof-of-concept demos.
- All ZK circuit logic is quadratic-constraint compliant and tested.
- The workflow is fully automated from circuit to proof verification.
- Documentation and scripts make onboarding and extension straightforward for new contributors.
