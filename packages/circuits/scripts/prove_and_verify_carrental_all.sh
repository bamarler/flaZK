#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

function status() { echo -e "${YELLOW}==> $1${NC}"; }
function ok() { echo -e "${GREEN}$1${NC}"; }
function err() { echo -e "${RED}$1${NC}"; }

if [ ! -f build/CarRentalEligibility_js/CarRentalEligibility.wasm ]; then
  err "Missing build/CarRentalEligibility_js/CarRentalEligibility.wasm. Please run scripts/compile_carrental_all.sh first."
  exit 1
fi
if [ ! -f build/CarRentalEligibility.zkey ]; then
  err "Missing build/CarRentalEligibility.zkey. Please run scripts/setup_carrental_all.sh first."
  exit 1
fi
if [ ! -f input_examples/carrental_all_input.json ]; then
  err "Missing input_examples/carrental_all_input.json. Please create your input file."
  exit 1
fi

status "Generating witness..."
node build/CarRentalEligibility_js/generate_witness.js build/CarRentalEligibility_js/CarRentalEligibility.wasm input_examples/carrental_all_input.json build/carrental_all_witness.wtns || { err "Witness generation failed"; exit 1; }

status "Generating proof..."
snarkjs groth16 prove build/CarRentalEligibility.zkey build/carrental_all_witness.wtns build/carrental_all_proof.json build/carrental_all_public.json || { err "Proof generation failed"; exit 1; }

status "Verifying proof..."
if snarkjs groth16 verify build/carrental_all_verification_key.json build/carrental_all_public.json build/carrental_all_proof.json; then
  ok "\nProof verified: OK!"
else
  err "\nProof verification failed!"
  exit 1
fi
