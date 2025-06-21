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
if [ ! -f build/Age25CarRental_js/Age25CarRental.wasm ]; then
  err "Missing build/Age25CarRental_js/Age25CarRental.wasm. Please run scripts/compile_car_rental.sh first."
  exit 1
fi
if [ ! -f build/Age25CarRental.zkey ]; then
  err "Missing build/Age25CarRental.zkey. Please run scripts/setup_car_rental.sh first."
  exit 1
fi
if [ ! -f input_examples/car_rental_input.json ]; then
  err "Missing input_examples/car_rental_input.json. Please create your input file."
  exit 1
fi

status "Generating witness..."
node build/Age25CarRental_js/generate_witness.js build/Age25CarRental_js/Age25CarRental.wasm input_examples/car_rental_input.json build/car_rental_witness.wtns || { err "Witness generation failed"; exit 1; }

status "Generating proof..."
snarkjs groth16 prove build/Age25CarRental.zkey build/car_rental_witness.wtns build/car_rental_proof.json build/car_rental_public.json || { err "Proof generation failed"; exit 1; }

status "Verifying proof..."
if snarkjs groth16 verify build/car_rental_verification_key.json build/car_rental_public.json build/car_rental_proof.json; then
  ok "\nProof verified: OK!"
else
  err "\nProof verification failed!"
  exit 1
fi
