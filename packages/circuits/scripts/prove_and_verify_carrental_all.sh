#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

function status() { echo -e "${YELLOW}==> $1${NC}"; }
function ok() { echo -e "${GREEN}$1${NC}"; }
function err() { echo -e "${RED}$1${NC}"; }

if [ ! -f build/EligibilityCheck_js/EligibilityCheck.wasm ]; then
  err "Missing build/EligibilityCheck_js/EligibilityCheck.wasm. Please run scripts/compile_carrental_all.sh first."
  exit 1
fi
if [ ! -f build/EligibilityCheck.zkey ]; then
  err "Missing build/EligibilityCheck.zkey. Please run scripts/setup_carrental_all.sh first."
  exit 1
fi
if [ ! -f input_examples/combined_input.json ]; then
  err "Missing input_examples/combined_input.json. Please create your input file."
  exit 1
fi

status "Generating witness..."
node build/EligibilityCheck_js/generate_witness.js build/EligibilityCheck_js/EligibilityCheck.wasm input_examples/combined_input.json build/eligibility_check_witness.wtns || { err "Witness generation failed"; exit 1; }

status "Generating proof..."
snarkjs groth16 prove build/EligibilityCheck.zkey build/eligibility_check_witness.wtns build/eligibility_check_proof.json build/eligibility_check_public.json || { err "Proof generation failed"; exit 1; }

status "Verifying proof..."
if snarkjs groth16 verify build/eligibility_check_verification_key.json build/eligibility_check_public.json build/eligibility_check_proof.json; then
  ok "\nProof verified: OK!"
else
  err "\nProof verification failed!"
  exit 1
fi
