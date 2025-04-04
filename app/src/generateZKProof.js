import "snarkjs";

const generateProof = async (A, B) => {
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < A.length; i++) {
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  let dotproduct = 0;
  for (let i = 0; i < A.length; i++) {
    dotproduct += A[i] * B[i];
  }
  const similarityIndex = Math.floor((dotproduct * 1000000) / (normA * normB));

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      similarityIndex: similarityIndex,
      threshold: 800000,
    },
    "zk/circuits/circuit.wasm",
    "zk/circuits/circuit_final.zkey"
  );

  return { proof, publicSignals };
};
