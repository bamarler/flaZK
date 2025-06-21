# zkAge 25+ Verifier (Car Rentals) — Technical Specification & Development Plan

## Problem Statement

Car rental companies require users to be at least 25 years old to rent a vehicle. Traditional age verification exposes sensitive personal information and is prone to privacy risks and data leakage.

## Solution Overview

Develop a zero-knowledge proof (ZKP) module that allows a user to prove:

> "My age is at least 25"

without revealing their actual age or any other personal details. This module should integrate seamlessly into the existing zkAge POC system and follow the same workflow and standards.

---

## Inputs and Outputs

| Type     | Name        | Visibility | Description                                   |
| -------- | ----------- | ---------- | --------------------------------------------- |
| `signal` | `age`       | Private    | The user’s actual age (integer)               |
| `signal` | `threshold` | Public     | The age threshold (set to 25 for car rental)  |
| `signal` | `isOver`    | Public     | Output: 1 if `age >= threshold`, else 0       |

---

## Architecture

```
[User's App] --> [Input.json]
                      |
              [ZK Circuit: Age25CarRental.circom]
                      |
          [Witness Generation, ZK Proof]
                      |
          [Verifier checks: is age >= 25?]
                      |
               Output: TRUE or FALSE
```

---

## Cryptographic Security Model

- Uses **zk-SNARKs** (Groth16)
- Trusted setup via Powers of Tau
- Guarantees:
  - **Completeness**: valid ages pass
  - **Soundness**: fake ages fail
  - **Zero-Knowledge**: verifier learns nothing except if user is 25+

---

## Development Plan

### Phase 1: Circuit Design & Integration
- Create `Age25CarRental.circom` (or reuse generic threshold circuit with threshold=25)
- Ensure compatibility with existing scripts and workflow
- Add test input: `{ "age": 27, "threshold": 25 }`

### Phase 2: Compilation & Setup
- Compile circuit with `compile.sh`
- Run trusted setup with `setup.sh`

### Phase 3: Proof Generation
- Prepare appropriate `input.json`
- Use `prove_and_verify.sh` for witness/proof/verification

### Phase 4: Documentation & Demo
- Add usage instructions to README
- Prepare demo scenario for car rental verification

---

## File Structure

```
zk-age-threshold/
├── build/
├── Age25CarRental.circom
├── input.json
├── docs/
│   └── zkAge25_CarRental_TechSpec.md
```

---

## Future Upgrades
- Support for alternative thresholds (e.g., 21+, 18+)
- Use of birthdate instead of age
- Integration with digital credentials or signatures
- Export Solidity verifier for on-chain car rental checks

---

## Summary
This module enables privacy-preserving age verification for car rentals (25+) using zero-knowledge proofs. It fits into the existing zkAge POC system, reuses the established workflow, and is easily extensible for other age-based requirements.
