pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
 
template cosineSimilarity(n) { 
    signal input threshold; 
    signal input similarityIndex;

    signal output isSimilar; 

    component comparator = GreaterEqThan(21);
    comparator.in[0] <== similarityIndex;
    comparator.in[1] <== threshold;

    isSimilar <== comparator.out;
}

component main {public [threshold]} = cosineSimilarity(256);