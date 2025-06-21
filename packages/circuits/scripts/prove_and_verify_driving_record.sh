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
if [ ! -f build/DrivingRecordCarRental_js/DrivingRecordCarRental.wasm ]; then
  err "Missing build/DrivingRecordCarRental_js/DrivingRecordCarRental.wasm. Please run scripts/compile_driving_record.sh first."
  exit 1
fi
if [ ! -f build/DrivingRecordCarRental.zkey ]; then
  err "Missing build/DrivingRecordCarRental.zkey. Please run scripts/setup_driving_record.sh first."
  exit 1
fi
if [ ! -f input_examples/driving_record_input.json ]; then
  err "Missing input_examples/driving_record_input.json. Please create your input file."
  exit 1
fi

status "Generating witness..."
node build/DrivingRecordCarRental_js/generate_witness.js build/DrivingRecordCarRental_js/DrivingRecordCarRental.wasm input_examples/driving_record_input.json build/driving_record_witness.wtns || { err "Witness generation failed"; exit 1; }

status "Generating proof..."
snarkjs groth16 prove build/DrivingRecordCarRental.zkey build/driving_record_witness.wtns build/driving_record_proof.json build/driving_record_public.json || { err "Proof generation failed"; exit 1; }

status "Verifying proof..."
if snarkjs groth16 verify build/driving_record_verification_key.json build/driving_record_public.json build/driving_record_proof.json; then
  ok "\nProof verified: OK!"
else
  err "\nProof verification failed!"
  exit 1
fi
