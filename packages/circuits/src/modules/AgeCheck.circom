pragma circom 2.0.0;

// Returns 1 if a >= b, else 0 (for 8-bit unsigned ints)
template GreaterEq8() {
    signal input a;
    signal input b;
    signal output out;

    signal diff;
    diff <== a - b;

    // Decompose diff into bits
    signal bits[8];
    var i;
    var base = 1;
    for (i = 0; i < 8; i++) {
        bits[i] <-- (diff >> i) & 1;
    }
    // If diff >= 0, the highest (sign) bit is 0
    out <== 1 - bits[7];
}

template AgeCheck() {
    signal input age;
    signal input threshold;
    signal output isOver;

    component cmp = GreaterEq8();
    cmp.a <== age;
    cmp.b <== threshold;
    isOver <== cmp.out;
}

component main = AgeCheck();
