#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function status() { echo -e "${YELLOW}==> $1${NC}"; }
function ok() { echo -e "${GREEN}$1${NC}"; }
function err() { echo -e "${RED}$1${NC}"; }

status "Cleaning up old setup files..."
rm -f pot12_0000.ptau pot12_final.ptau pot12_final_phase2.ptau build/CarRentalEligibility.zkey build/carrental_all_verification_key.json

if [ ! -f build/CarRentalEligibility.r1cs ]; then
  err "Missing build/CarRentalEligibility.r1cs. Please run scripts/compile_carrental_all.sh first."
  exit 1
fi

status "Running Powers of Tau (phase 1)..."
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v || { err "Failed at powersoftau new"; exit 1; }
status "Contributing to Powers of Tau..."
snarkjs powersoftau contribute pot12_0000.ptau pot12_final.ptau --name="First contributor" -v || { err "Failed at powersoftau contribute"; exit 1; }

status "Preparing Phase 2 Powers of Tau file..."
snarkjs powersoftau prepare phase2 pot12_final.ptau pot12_final_phase2.ptau -v || { err "Failed at powersoftau prepare phase2"; exit 1; }

status "Generating proving and verifying keys..."
snarkjs groth16 setup build/CarRentalEligibility.r1cs pot12_final_phase2.ptau build/CarRentalEligibility.zkey || { err "Failed at groth16 setup"; exit 1; }
status "Exporting verification key..."
snarkjs zkey export verificationkey build/CarRentalEligibility.zkey build/carrental_all_verification_key.json || { err "Failed at zkey export verificationkey"; exit 1; }

ok "\nTrusted setup complete! Files created:"
ls -lh build/CarRentalEligibility.zkey build/carrental_all_verification_key.json
