#!/bin/bash
set -e

# Create build directory if not exists
mkdir -p build

# Compile Age25CarRental circuit
circom src/modules/Age25CarRental.circom --r1cs --wasm --sym -o build

echo "Compilation complete: build/Age25CarRental.r1cs, build/Age25CarRental.wasm, build/Age25CarRental.sym"
