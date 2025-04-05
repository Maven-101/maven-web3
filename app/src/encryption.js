import CryptoJS from "crypto-js";

export function encryptVector(vector, secretKey) {
  const json = JSON.stringify(vector);
  return CryptoJS.AES.encrypt(json, secretKey).toString();
}

export function decryptVector(encrypted, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// Added function to compare vector embeddings for face authentication
export function compareVectors(vector1, vector2, threshold = 0.8) {
  if (vector1.length !== vector2.length) {
    throw new Error("Vectors must have the same dimensions");
  }
  
  // Calculate cosine similarity
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += Math.pow(vector1[i], 2);
    magnitude2 += Math.pow(vector2[i], 2);
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  const similarity = dotProduct / (magnitude1 * magnitude2);
  
  return {
    match: similarity >= threshold,
    similarity: similarity,
    threshold: threshold
  };
}