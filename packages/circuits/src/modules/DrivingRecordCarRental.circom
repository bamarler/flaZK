pragma circom 2.0.0;

// DrivingRecordCarRental: Proves points < 6 for car rental eligibility
// Inputs: points (private, 0-15)
// Output: isEligible (public, 1 if points < 6, else 0)

template LessThan6_4bit() {
    signal input in;
    signal output out;

    // Decompose in into 4 bits (0-15)
    signal bits[4];
    var i;
    var sum = 0;
    for (i = 0; i < 4; i++) {
        bits[i] <-- (in >> i) & 1;
        sum += bits[i] * (1 << i);
    }
    // Enforce correct decomposition
    in === sum;

    // For each value 0..5, check if bits match that value (quadratic equality checks)
    signal eq[6];
    // eq[0]: bits == 0000
    signal eq0_aux0; signal eq0_aux1;
    eq0_aux0 <== (1 - bits[3]) * (1 - bits[2]);
    eq0_aux1 <== eq0_aux0 * (1 - bits[1]);
    eq[0] <== eq0_aux1 * (1 - bits[0]);

    // eq[1]: bits == 0001
    signal eq1_aux0; signal eq1_aux1;
    eq1_aux0 <== (1 - bits[3]) * (1 - bits[2]);
    eq1_aux1 <== eq1_aux0 * (1 - bits[1]);
    eq[1] <== eq1_aux1 * bits[0];

    // eq[2]: bits == 0010
    signal eq2_aux0; signal eq2_aux1;
    eq2_aux0 <== (1 - bits[3]) * (1 - bits[2]);
    eq2_aux1 <== eq2_aux0 * bits[1];
    eq[2] <== eq2_aux1 * (1 - bits[0]);

    // eq[3]: bits == 0011
    signal eq3_aux0; signal eq3_aux1;
    eq3_aux0 <== (1 - bits[3]) * (1 - bits[2]);
    eq3_aux1 <== eq3_aux0 * bits[1];
    eq[3] <== eq3_aux1 * bits[0];

    // eq[4]: bits == 0100
    signal eq4_aux0; signal eq4_aux1;
    eq4_aux0 <== (1 - bits[3]) * bits[2];
    eq4_aux1 <== eq4_aux0 * (1 - bits[1]);
    eq[4] <== eq4_aux1 * (1 - bits[0]);

    // eq[5]: bits == 0101
    signal eq5_aux0; signal eq5_aux1;
    eq5_aux0 <== (1 - bits[3]) * bits[2];
    eq5_aux1 <== eq5_aux0 * (1 - bits[1]);
    eq[5] <== eq5_aux1 * bits[0];

    out <== eq[0] + eq[1] + eq[2] + eq[3] + eq[4] + eq[5];
}

template DrivingRecordCarRental() {
    signal input points;
    signal output isEligible;

    component lt6 = LessThan6_4bit();
    lt6.in <== points;
    isEligible <== lt6.out;
}

component main = DrivingRecordCarRental();
