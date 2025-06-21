#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

function status() { echo -e "${YELLOW}==> $1${NC}"; }
function ok() { echo -e "${GREEN}$1${NC}"; }
function err() { echo -e "${RED}$1${NC}"; }

# Check files
if [ ! -f build/AgeCheck_js/AgeCheck.wasm ]; then
  err "Missing build/AgeCheck_js/AgeCheck.wasm. Please run compile.sh first."
  exit 1
fi
if [ ! -f build/AgeCheck.zkey ]; then
  err "Missing build/AgeCheck.zkey. Please run setup.sh first."
  exit 1
fi
if [ ! -f input_examples/age_check_input.json ]; then
  err "Missing input_examples/age_check_input.json. Please create your input file."
  exit 1
fi

status "Generating witness..."
node build/AgeCheck_js/generate_witness.js build/AgeCheck_js/AgeCheck.wasm input_examples/age_check_input.json build/witness.wtns || { err "Witness generation failed"; exit 1; }

status "Generating proof..."
snarkjs groth16 prove build/AgeCheck.zkey build/witness.wtns build/proof.json build/public.json || { err "Proof generation failed"; exit 1; }

status "Verifying proof..."
if snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json; then
  ok "\nProof verified: OK!"
else
  err "\nProof verification failed!"
  exit 1
fi
