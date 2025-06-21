pragma circom 2.0.0;

// --- 8-bit GreaterEq Comparator (for age check) ---
template GreaterEq8() {
    signal input a;
    signal input b;
    signal output out;

    signal diff;
    diff <== a - b;

    // Bit decomposition (8 bits)
    signal bits[8];
    var i;
    var sum = 0;
    for (i = 0; i < 8; i++) {
        bits[i] <-- (diff >> i) & 1;
        sum += bits[i] * (1 << i);
    }
    diff === sum;
    // If diff >= 0, the sign bit (bits[7]) is 0
    out <== 1 - bits[7];
}

// --- Booleanity check for license status ---
template IsOne() {
    signal input in;
    signal output out;
    in * (in - 1) === 0;
    out <== in;
}

// --- LessThan Comparator for points (threshold < 16) ---
template LessThan6_4bit() {
    signal input in;            // points
    signal output out;

    // Decompose in into 4 bits
    signal bits[4];
    var i; var sum = 0;
    for (i = 0; i < 4; i++) {
        bits[i] <-- (in >> i) & 1;
        sum += bits[i] * (1 << i);
    }
    in === sum;

    // For each value 0..5, check equality (quadratic, chained aux signals)
    signal eq[6];
    // eq[0]: 0000
    signal eq0_aux0; signal eq0_aux1;
    eq0_aux0 <== (1 - bits[3]) * (1 - bits[2]);
    eq0_aux1 <== eq0_aux0 * (1 - bits[1]);
    eq[0] <== eq0_aux1 * (1 - bits[0]);
    // eq[1]: 0001
    signal eq1_aux0; signal eq1_aux1;
    eq1_aux0 <== (1 - bits[3]) * (1 - bits[2]);
    eq1_aux1 <== eq1_aux0 * (1 - bits[1]);
    eq[1] <== eq1_aux1 * bits[0];
    // eq[2]: 0010
    signal eq2_aux0; signal eq2_aux1;
    eq2_aux0 <== (1 - bits[3]) * (1 - bits[2]);
    eq2_aux1 <== eq2_aux0 * bits[1];
    eq[2] <== eq2_aux1 * (1 - bits[0]);
    // eq[3]: 0011
    signal eq3_aux0; signal eq3_aux1;
    eq3_aux0 <== (1 - bits[3]) * (1 - bits[2]);
    eq3_aux1 <== eq3_aux0 * bits[1];
    eq[3] <== eq3_aux1 * bits[0];
    // eq[4]: 0100
    signal eq4_aux0; signal eq4_aux1;
    eq4_aux0 <== (1 - bits[3]) * bits[2];
    eq4_aux1 <== eq4_aux0 * (1 - bits[1]);
    eq[4] <== eq4_aux1 * (1 - bits[0]);
    // eq[5]: 0101
    signal eq5_aux0; signal eq5_aux1;
    eq5_aux0 <== (1 - bits[3]) * bits[2];
    eq5_aux1 <== eq5_aux0 * (1 - bits[1]);
    eq[5] <== eq5_aux1 * bits[0];

    out <== eq[0] + eq[1] + eq[2] + eq[3] + eq[4] + eq[5];
}

// --- Main CarRentalEligibility circuit ---
template CarRentalEligibility() {
    signal input age;
    signal input license_status;
    signal input points;
    signal input age_threshold;

    signal output age_ok;
    signal output license_ok;
    signal output points_ok;
    signal output isEligible;

    component agecheck = GreaterEq8();
    agecheck.a <== age;
    agecheck.b <== age_threshold;
    age_ok <== agecheck.out;

    component lic = IsOne();
    lic.in <== license_status;
    license_ok <== lic.out;

    component pointscheck = LessThan6_4bit();
    pointscheck.in <== points;
    points_ok <== pointscheck.out;

    signal tmp;
    tmp <== age_ok * license_ok;
    isEligible <== tmp * points_ok;
}

component main = CarRentalEligibility();
