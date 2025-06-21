# zkDrivingRecord Car Rental Verifier — Technical Specification

## Problem
Car rental providers want to ensure that a customer’s driving record is sufficiently clean, specifically that they have fewer than 6 points on their driving record, without learning the user’s exact number of points.

## Solution
A zero-knowledge circuit that allows a user to prove their driving record points are less than 6, without revealing the actual value. This enables privacy-preserving eligibility checks for car rentals.

---

## Inputs & Outputs
- **Private Input:**
  - `points` (integer, 0–15): User’s current driving record points
- **Public Output:**
  - `isEligible` (1 if `points < 6`, else 0)

---

## Circuit Logic
- Use a bit-decomposition-based unsigned integer comparator to check if `points < 6` (threshold is hardcoded for this use case).
- Output `isEligible = 1` if the user’s points are less than 6, else 0.
- All logic is quadratic constraint friendly for Circom.

---

## Example Input
```json
{
  "points": 3
}
```

---

## File Structure
```
src/modules/DrivingRecordCarRental.circom
input_examples/driving_record_input.json
scripts/compile_driving_record.sh
scripts/setup_driving_record.sh
scripts/prove_and_verify_driving_record.sh
```

---

## Automation Scripts
- **compile_driving_record.sh:** Compile the circuit.
- **setup_driving_record.sh:** Trusted setup for the circuit.
- **prove_and_verify_driving_record.sh:** Generate and verify proof.

---

## Extensibility & Notes
- Comparator logic can be placed in `src/lib/` for reuse.
- Threshold can be made a public input if policy flexibility is desired in the future.
- README and docs should be updated to describe this module and its usage.

---

## Roadmap
- [ ] Implement and test the circuit
- [ ] Add input example and scripts
- [ ] Document usage in README
- [ ] (Optional) Generalize comparator as a library component
