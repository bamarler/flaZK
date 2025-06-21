#!/bin/bash
set -e

# Create build directory if not exists
mkdir -p build

# Compile LicenseStatusCarRental circuit
circom src/modules/LicenseStatusCarRental.circom --r1cs --wasm --sym -o build

echo "Compilation complete: build/LicenseStatusCarRental.r1cs, build/LicenseStatusCarRental.wasm, build/LicenseStatusCarRental.sym"
