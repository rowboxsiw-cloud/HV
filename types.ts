export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  balance: number;
  upiId: string;
  createdAt: number;
  lastInterestDate: number;
  phoneNumber?: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  timestamp: number;
  type: 'sent' | 'received' | 'bonus' | 'interest' | 'admin_adjustment';
  status: 'success' | 'failed' | 'pending';
  note?: string;
  senderName?: string;
  receiverName?: string;
}

export interface AdminCredentials {
  username: string;
  password?: string;
  isAuthenticated: boolean;
}