pragma circom 2.0.0;

// Circuit: LicenseStatusCarRental
// Proves that the user's license status is valid (1) for car rental eligibility, without revealing any other info.
template LicenseStatusCarRental() {
    signal input license_status; // Private: 1 if valid, 0 if not
    signal output isValid;       // Public: 1 if valid, 0 if not

    // Enforce that license_status is boolean
    license_status * (license_status - 1) === 0;

    // Output is 1 if license_status is 1, else 0
    isValid <== license_status;
}

component main = LicenseStatusCarRental();
