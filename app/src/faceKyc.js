// app/src/faceKyc.js
import fs from 'fs/promises';
import path from 'path';
import { uploadToIpfs } from './encryptUpload.js';
import { fetchAndDecrypt, authenticateUser } from './decryptFetch.js';

// Define the path for our user database
const DB_FILE = path.join(process.cwd(), 'data', 'user-database.json');

/**
 * Initialize the database file if it doesn't exist
 */
async function initDatabase() {
  try {
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
    
    try {
      // Check if file exists
      await fs.access(DB_FILE);
    } catch (err) {
      // Create empty database file
      await fs.writeFile(DB_FILE, JSON.stringify({ users: {} }));
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
    throw err;
  }
}

/**
 * Read the user database
 */
async function readDatabase() {
  await initDatabase();
  const data = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(data);
}

/**
 * Write to the user database
 */
async function writeDatabase(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

/**
 * Register a new user with their facial embedding
 * @param {String} userId - Unique identifier for the user
 * @param {Array} faceEmbedding - Vector embedding from ML model
 * @param {Object} userData - Additional user information
 */
export async function registerUser(userId, faceEmbedding, userData = {}) {
  try {
    // Read current database
    const db = await readDatabase();
    
    // Check if user already exists
    if (db.users[userId]) {
      return {
        success: false,
        error: `User ${userId} already exists`
      };
    }
    
    // Upload face embedding to IPFS
    const uploadResult = await uploadToIpfs(faceEmbedding, userId);
    
    if (!uploadResult.success) {
      return uploadResult;
    }
    
    // Add user to database
    db.users[userId] = {
      cid: uploadResult.cid,
      registeredAt: new Date().toISOString(),
      userData: userData
    };
    
    await writeDatabase(db);
    
    return {
      success: true,
      userId: userId,
      cid: uploadResult.cid
    };
  } catch (err) {
    console.error("Registration failed:", err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Verify a user's identity with their facial embedding
 * @param {String} userId - User's identifier
 * @param {Array} faceEmbedding - Current face embedding from ML model
 * @param {Number} threshold - Similarity threshold (0-1)
 */
export async function verifyUser(userId, faceEmbedding, threshold = 0.8) {
  try {
    // Get user from database
    const db = await readDatabase();
    const user = db.users[userId];
    
    if (!user) {
      return {
        success: false,
        verified: false,
        error: `User ${userId} not found`
      };
    }
    
    // Authenticate against stored face embedding
    const authResult = await authenticateUser(user.cid, faceEmbedding, threshold);
    
    return {
      success: true,
      verified: authResult.authenticated,
      similarity: authResult.similarity,
      userId: userId
    };
  } catch (err) {
    console.error("Verification failed:", err);
    return {
      success: false,
      verified: false,
      error: err.message
    };
  }
}

/**
 * Update a user's facial embedding
 * @param {String} userId - User's identifier
 * @param {Array} newFaceEmbedding - New face embedding from ML model
 */
export async function updateUserFace(userId, newFaceEmbedding) {
  try {
    // Get user from database
    const db = await readDatabase();
    
    if (!db.users[userId]) {
      return {
        success: false,
        error: `User ${userId} not found`
      };
    }
    
    // Upload new face embedding
    const uploadResult = await uploadToIpfs(newFaceEmbedding, userId);
    
    if (!uploadResult.success) {
      return uploadResult;
    }
    
    // Update user record
    db.users[userId].previousCid = db.users[userId].cid;
    db.users[userId].cid = uploadResult.cid;
    db.users[userId].updatedAt = new Date().toISOString();
    
    await writeDatabase(db);
    
    return {
      success: true,
      userId: userId,
      cid: uploadResult.cid
    };
  } catch (err) {
    console.error("Update failed:", err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Find a user by their facial embedding
 * @param {Array} faceEmbedding - Face embedding from ML model
 * @param {Number} threshold - Similarity threshold (0-1)
 */
export async function findUserByFace(faceEmbedding, threshold = 0.8) {
  try {
    const db = await readDatabase();
    const results = [];
    
    // Check each user
    for (const [userId, user] of Object.entries(db.users)) {
      try {
        const authResult = await authenticateUser(user.cid, faceEmbedding, threshold);
        
        if (authResult.authenticated) {
          results.push({
            userId: userId,
            similarity: authResult.similarity,
            userData: user.userData
          });
        }
      } catch (err) {
        console.warn(`Failed to check user ${userId}:`, err.message);
      }
    }
    
    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
    return {
      success: true,
      found: results.length > 0,
      matches: results,
      bestMatch: results.length > 0 ? results[0] : null
    };
  } catch (err) {
    console.error("Find user failed:", err);
    return {
      success: false,
      found: false,
      error: err.message
    };
  }
}