#!/bin/bash
set -e

# Create build directory if not exists
mkdir -p build

# Compile AgeCheck circuit from new location
circom src/modules/AgeCheck.circom --r1cs --wasm --sym -o build

echo "Compilation complete: build/AgeCheck.r1cs, build/AgeCheck.wasm, build/AgeCheck.sym"
