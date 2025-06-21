#!/bin/bash
set -e

# Create build directory if not exists
mkdir -p build

# Compile DrivingRecordCarRental circuit
circom src/modules/DrivingRecordCarRental.circom --r1cs --wasm --sym -o build

echo "Compilation complete: build/DrivingRecordCarRental.r1cs, build/DrivingRecordCarRental.wasm, build/DrivingRecordCarRental.sym"
