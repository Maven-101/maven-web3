/* decryptFetch.js -> Takes the CID of previously encrypted data, fetches it from IPFS, and decrypts it using the secret key.
*/
// app/src/decryptFetch.js
// app/src/decryptFetch.js
import { create } from "ipfs-http-client";
import { decryptVector, compareVectors } from "./encryption.js";
import dotenv from "dotenv";
dotenv.config();

const auth =
  "Basic " +
  Buffer.from(
    process.env.INFURA_PROJECT_ID + ":" + process.env.INFURA_PROJECT_SECRET
  ).toString("base64");

const ipfs = create({
  host: "ipfs.infura.io", // Fixed the extra space here
  port: 5001,
  protocol: "https",
  headers: { authorization: auth },
});

// Get secret key from environment variables
const secretKey = process.env.SECRET_KEY;

/**
 * Fetch and decrypt a vector embedding from IPFS
 * @param {String} cid - The content identifier from IPFS
 * @returns {Object} - Decrypted data containing vector and metadata
 */
export async function fetchAndDecrypt(cid) {
  try {
    let encrypted = "";

    for await (const chunk of ipfs.cat(cid)) {
      encrypted += chunk.toString();
    }

    const decrypted = decryptVector(encrypted, secretKey);
    console.log("🔓 Decrypted Vector:", {
      dimensions: decrypted.vector.length,
      userId: decrypted.metadata?.userId || "unknown",
      timestamp: decrypted.metadata?.timestamp || "unknown"
    });
    
    return decrypted;
  } catch (err) {
    console.error("❌ Decryption failed:", err.message);
    throw err;
  }
}

/**
 * Authenticate a user by comparing their current face embedding with stored one
 * @param {String} cid - The content identifier of the stored embedding in IPFS
 * @param {Array} currentEmbedding - Current face embedding from ML model
 * @param {Number} threshold - Similarity threshold (0-1)
 * @returns {Object} - Authentication result
 */
export async function authenticateUser(cid, currentEmbedding, threshold = 0.8) {
  try {
    // Fetch stored data
    const storedData = await fetchAndDecrypt(cid);
    const storedEmbedding = storedData.vector;
    
    // Compare embeddings
    const comparisonResult = compareVectors(currentEmbedding, storedEmbedding, threshold);
    
    return {
      authenticated: comparisonResult.match,
      similarity: comparisonResult.similarity,
      threshold: comparisonResult.threshold,
      userId: storedData.metadata?.userId || "unknown",
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("❌ Authentication failed:", err.message);
    return {
      authenticated: false,
      error: err.message
    };
  }
}

// For direct command line usage
if (import.meta.url.endsWith(process.argv[1])) {
  const cid = process.argv[2] || "REPLACE_WITH_YOUR_CID";
  // Sample vector for testing - replace with your ML vector
  const currentEmbedding = Array(128).fill(0).map(() => Math.random());
  
  authenticateUser(cid, currentEmbedding)
    .then(result => console.log("Authentication result:", result))
    .catch(err => console.error("Error:", err));
}