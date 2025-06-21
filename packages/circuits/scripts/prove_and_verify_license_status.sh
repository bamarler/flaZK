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
if [ ! -f build/LicenseStatusCarRental_js/LicenseStatusCarRental.wasm ]; then
  err "Missing build/LicenseStatusCarRental_js/LicenseStatusCarRental.wasm. Please run scripts/compile_license_status.sh first."
  exit 1
fi
if [ ! -f build/LicenseStatusCarRental.zkey ]; then
  err "Missing build/LicenseStatusCarRental.zkey. Please run scripts/setup_license_status.sh first."
  exit 1
fi
if [ ! -f input_examples/license_status_input.json ]; then
  err "Missing input_examples/license_status_input.json. Please create your input file."
  exit 1
fi

status "Generating witness..."
node build/LicenseStatusCarRental_js/generate_witness.js build/LicenseStatusCarRental_js/LicenseStatusCarRental.wasm input_examples/license_status_input.json build/license_status_witness.wtns || { err "Witness generation failed"; exit 1; }

status "Generating proof..."
snarkjs groth16 prove build/LicenseStatusCarRental.zkey build/license_status_witness.wtns build/license_status_proof.json build/license_status_public.json || { err "Proof generation failed"; exit 1; }

status "Verifying proof..."
if snarkjs groth16 verify build/license_status_verification_key.json build/license_status_public.json build/license_status_proof.json; then
  ok "\nProof verified: OK!"
else
  err "\nProof verification failed!"
  exit 1
fi
