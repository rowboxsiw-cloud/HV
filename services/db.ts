import { ref, get, set, update, runTransaction, push, child, serverTimestamp } from "firebase/database";
import { db } from "../firebase";
import { UserProfile, Transaction } from "../types";

// Helper to generate a random UPI ID
const generateUpiId = (email: string) => {
  const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  return `${prefix}@swiftpay`;
};

// Initialize User or Get existing
export const initializeUser = async (user: any): Promise<UserProfile> => {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const userData = snapshot.val();
    // Check for daily interest
    return await checkAndApplyInterest(userData);
  } else {
    // New User - Give 30 RS Bonus
    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      balance: 30, // Bonus
      upiId: generateUpiId(user.email || 'user'),
      createdAt: Date.now(),
      lastInterestDate: Date.now(),
    };
    await set(userRef, newUser);
    
    // Log bonus transaction
    await logTransaction({
      senderId: 'SYSTEM',
      receiverId: user.uid,
      amount: 30,
      type: 'bonus',
      status: 'success',
      note: 'Welcome Bonus',
      senderName: 'SwiftPay',
      receiverName: user.displayName || 'User'
    });

    return newUser;
  }
};

// Apply Daily Interest (0.1% per day simulated)
const checkAndApplyInterest = async (userData: UserProfile): Promise<UserProfile> => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const daysPassed = Math.floor((now - userData.lastInterestDate) / oneDay);

  if (daysPassed > 0) {
    // Simple Interest: 0.1% per day
    const interestRate = 0.001; 
    const interestAmount = Math.floor(userData.balance * interestRate * daysPassed * 100) / 100;

    if (interestAmount > 0) {
      const newBalance = userData.balance + interestAmount;
      const updates: any = {};
      updates[`users/${userData.uid}/balance`] = newBalance;
      updates[`users/${userData.uid}/lastInterestDate`] = now;
      
      await update(ref(db), updates);
      
      await logTransaction({
        senderId: 'SYSTEM',
        receiverId: userData.uid,
        amount: interestAmount,
        type: 'interest',
        status: 'success',
        note: `Daily Interest for ${daysPassed} day(s)`,
        senderName: 'SwiftPay Interest',
        receiverName: userData.displayName || 'User'
      });

      return { ...userData, balance: newBalance, lastInterestDate: now };
    }
  }
  return userData;
};

// Find user by UPI ID
export const findUserByUpi = async (upiId: string): Promise<UserProfile | null> => {
  // In a real app, we would index UPI IDs. For this demo, we scan (inefficient but works for small scale)
  // Optimization: Create a lookup path `upi_mappings/{upiId}: uid`
  // We will assume a small DB for now or implement the scan.
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return null;

  let foundUser: UserProfile | null = null;
  snapshot.forEach((child) => {
    const val = child.val();
    if (val.upiId === upiId) {
      foundUser = val;
    }
  });
  return foundUser;
};

// Send Money Transaction
export const sendMoney = async (senderUid: string, receiverUpi: string, amount: number): Promise<{ success: boolean; message: string }> => {
  if (amount <= 0) return { success: false, message: "Invalid amount" };

  const receiver = await findUserByUpi(receiverUpi);
  if (!receiver) return { success: false, message: "Receiver UPI ID not found" };
  if (receiver.uid === senderUid) return { success: false, message: "Cannot send money to yourself" };

  const senderRef = ref(db, `users/${senderUid}/balance`);
  const receiverRef = ref(db, `users/${receiver.uid}/balance`);

  try {
    // Use transaction to ensure atomic updates
    await runTransaction(senderRef, (currentBalance) => {
      if (currentBalance === null) return -1; // Force abort if null
      if (currentBalance < amount) throw new Error("Insufficient balance");
      return currentBalance - amount;
    });

    await runTransaction(receiverRef, (currentBalance) => {
      if (currentBalance === null) return amount;
      return currentBalance + amount;
    });

    // Log for Sender
    await logTransaction({
      senderId: senderUid,
      receiverId: receiver.uid,
      amount,
      type: 'sent',
      status: 'success',
      note: 'Transfer',
      receiverName: receiver.displayName || receiver.upiId
    });

    // Log for Receiver (We store normalized transaction logs or duplicate for easy querying)
    // For this simple app, we can just query by senderId or receiverId
    
    return { success: true, message: "Transfer Successful!" };
  } catch (error: any) {
    return { success: false, message: error.message || "Transaction failed" };
  }
};

const logTransaction = async (data: Partial<Transaction>) => {
  const newTxKey = push(child(ref(db), 'transactions')).key;
  const txData = {
    ...data,
    id: newTxKey,
    timestamp: serverTimestamp(),
  };
  const updates: any = {};
  updates[`/transactions/${newTxKey}`] = txData;
  updates[`/user-transactions/${data.senderId}/${newTxKey}`] = txData;
  if (data.receiverId !== data.senderId) {
    updates[`/user-transactions/${data.receiverId}/${newTxKey}`] = { ...txData, type: 'received' };
  }
  
  await update(ref(db), updates);
};

export const getUserTransactions = async (uid: string): Promise<Transaction[]> => {
  const txRef = ref(db, `user-transactions/${uid}`);
  const snapshot = await get(txRef);
  if (!snapshot.exists()) return [];
  
  const txs: Transaction[] = [];
  snapshot.forEach((child) => {
    txs.push(child.val());
  });
  // Sort by timestamp desc
  return txs.sort((a, b) => b.timestamp - a.timestamp);
};

// Admin function to get all users
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) return [];
  const users: UserProfile[] = [];
  snapshot.forEach((child) => {
    users.push(child.val());
  });
  return users;
};

// Admin Update Balance
export const adminUpdateBalance = async (uid: string, newBalance: number) => {
   await update(ref(db, `users/${uid}`), { balance: newBalance });
};