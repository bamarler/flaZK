pragma circom 2.0.0;

// --- 8-bit GreaterEq Comparator ---
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

// --- 8-bit LessThan Comparator (unsigned, robust overflow-based) ---
template LessThan8() {
    signal input a;
    signal input b;
    signal output out;

    signal diff;
    diff <== b - a;

    // Decompose diff into 9 bits (8 + overflow bit)
    signal bits[9];
    var i;
    var sum = 0;
    for (i = 0; i < 9; i++) {
        bits[i] <-- (diff >> i) & 1;
        sum += bits[i] * (1 << i);
    }
    diff === sum;

    // If b < a, diff overflows, so bits[8] is 1
    out <== bits[8];
}

// --- Main EligibilityCheck circuit ---
template EligibilityCheck() {
    signal input age;
    signal input license_status;
    signal input points;
    signal input age_min;
    signal input points_max;

    signal output age_ok;
    signal output license_ok;
    signal output points_ok;
    signal output isEligible;

    component agecheck = GreaterEq8();
    agecheck.a <== age;
    agecheck.b <== age_min;
    age_ok <== agecheck.out;

    component lic = IsOne();
    lic.in <== license_status;
    license_ok <== lic.out;

    component pointscheck = LessThan8();
    pointscheck.a <== points;
    pointscheck.b <== points_max;
    points_ok <== pointscheck.out;

    signal tmp;
    tmp <== age_ok * license_ok;
    isEligible <== tmp * points_ok;
}

component main = EligibilityCheck();
