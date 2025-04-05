// app/src/demo.js
import { registerUser, verifyUser, findUserByFace, updateUserFace } from './faceKyc.js';

// This function simulates receiving face embeddings from your ML model
function simulateMlEmbedding(length = 128) {
  return Array(length).fill(0).map(() => Math.random());
}

// Main demo function
async function runDemo() {
  try {
    console.log("==== DECENTRALIZED KYC SYSTEM DEMO ====");
    
    // Step 1: Register users with face embeddings
    console.log("\n1. REGISTERING USERS");
    console.log("------------------------");
    
    // Replace these with actual embeddings from your ML model
    const aliceEmbedding = simulateMlEmbedding();
    const bobEmbedding = simulateMlEmbedding();
    
    // Register Alice
    console.log("Registering Alice...");
    const aliceResult = await registerUser("alice123", aliceEmbedding, {
      name: "Alice Johnson",
      email: "alice@example.com"
    });
    console.log(aliceResult);
    
    // Register Bob
    console.log("\nRegistering Bob...");
    const bobResult = await registerUser("bob456", bobEmbedding, {
      name: "Bob Smith",
      email: "bob@example.com"
    });
    console.log(bobResult);
    
    // Step 2: Verify users
    console.log("\n2. VERIFYING IDENTITIES");
    console.log("------------------------");
    
    // Create a slightly modified embedding to simulate a new scan of the same person
    const aliceNewScan = aliceEmbedding.map(val => val * 0.95 + Math.random() * 0.1);
    
    // Verify Alice with her new scan
    console.log("Verifying Alice with new scan...");
    const aliceVerify = await verifyUser("alice123", aliceNewScan);
    console.log(aliceVerify);
    
    // Try to verify Alice with Bob's embedding (should fail)
    console.log("\nTrying to verify Alice with Bob's embedding (should fail)...");
    const failedVerify = await verifyUser("alice123", bobEmbedding);
    console.log(failedVerify);
    
    // Step 3: Find user by face
    console.log("\n3. FINDING USER BY FACE");
    console.log("------------------------");
    
    // Try to identify Alice by her face
    console.log("Searching for user by face...");
    const searchResult = await findUserByFace(aliceNewScan);
    console.log(searchResult);
    
    // Step 4: Update face data
    console.log("\n4. UPDATING FACE DATA");
    console.log("------------------------");
    
    // Generate completely new embedding for Alice
    const aliceUpdatedEmbedding = simulateMlEmbedding();
    
    // Update Alice's face data
    console.log("Updating Alice's face data...");
    const updateResult = await updateUserFace("alice123", aliceUpdatedEmbedding);
    console.log(updateResult);
    
    // Verify with updated face
    console.log("\nVerifying with updated face...");
    const updatedVerify = await verifyUser("alice123", aliceUpdatedEmbedding);
    console.log(updatedVerify);
    
  } catch (error) {
    console.error("Demo failed:", error);
  }
}

// Run the demo
runDemo();