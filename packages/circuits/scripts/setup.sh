#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper: print status
function status() { echo -e "${YELLOW}==> $1${NC}"; }
function ok() { echo -e "${GREEN}$1${NC}"; }
function err() { echo -e "${RED}$1${NC}"; }

# Clean up old files
status "Cleaning up old setup files..."
rm -f pot12_0000.ptau pot12_final.ptau pot12_final_phase2.ptau build/AgeCheck.zkey build/verification_key.json

# Check for circuit
if [ ! -f build/AgeCheck.r1cs ]; then
  err "Missing build/AgeCheck.r1cs. Please run scripts/compile.sh first."
  exit 1
fi

# Phase 1: Powers of Tau
status "Running Powers of Tau (phase 1)..."
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v || { err "Failed at powersoftau new"; exit 1; }
status "Contributing to Powers of Tau..."
snarkjs powersoftau contribute pot12_0000.ptau pot12_final.ptau --name="First contributor" -v || { err "Failed at powersoftau contribute"; exit 1; }

# Prepare Phase 2 file
status "Preparing Phase 2 Powers of Tau file..."
snarkjs powersoftau prepare phase2 pot12_final.ptau pot12_final_phase2.ptau -v || { err "Failed at powersoftau prepare phase2"; exit 1; }

# Phase 2: Groth16 Setup
status "Generating proving and verifying keys..."
snarkjs groth16 setup build/AgeCheck.r1cs pot12_final_phase2.ptau build/AgeCheck.zkey || { err "Failed at groth16 setup"; exit 1; }
status "Exporting verification key..."
snarkjs zkey export verificationkey build/AgeCheck.zkey build/verification_key.json || { err "Failed at zkey export verificationkey"; exit 1; }

ok "\nTrusted setup complete! Files created:"
ls -lh build/AgeCheck.zkey build/verification_key.json

