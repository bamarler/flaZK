#!/bin/bash
set -e

mkdir -p build

circom src/modules/EligibilityCheck.circom --r1cs --wasm --sym -o build

echo "Compilation complete: build/CarRentalEligibility.r1cs, build/CarRentalEligibility.wasm, build/CarRentalEligibility.sym"
