import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import BottomNav from '../components/BottomNav';
import { RefreshCw, ArrowUpRight, ArrowDownLeft, Wallet, Bell, ScanLine, Send } from 'lucide-react';
import { getUserTransactions } from '../services/db';
import { Transaction } from '../types';
import { format } from 'date-fns';

const Home = () => {
  const { profile, refreshProfile, user } = useContext(AppContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setRefreshing(true);
    await refreshProfile();
    if (user) {
      const txs = await getUserTransactions(user.uid);
      setTransactions(txs);
    }
    setRefreshing(false);
  };

  if (!profile) return null;

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 pt-10 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet size={120} />
        </div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-3">
             <img src={profile.photoURL || 'https://picsum.photos/100'} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white/50" />
             <div>
               <h2 className="font-semibold text-lg leading-tight">Hello, {profile.displayName?.split(' ')[0]}</h2>
               <p className="text-xs text-blue-200">{profile.upiId}</p>
             </div>
          </div>
          <button onClick={loadData} className={`p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="relative z-10 mt-4">
          <p className="text-blue-200 text-sm mb-1">Total Balance</p>
          <h1 className="text-5xl font-bold tracking-tight">₹{profile.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
          <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-400/20 text-green-100 text-xs rounded-md">
             +0.1% daily interest active
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-8 relative z-20 grid grid-cols-2 gap-4">
        <a href="#/pay" className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform">
           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
             <Send size={24} />
           </div>
           <span className="font-semibold text-gray-700">Send Money</span>
        </a>
        <a href="#/receive" className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform">
           <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
             <ScanLine size={24} />
           </div>
           <span className="font-semibold text-gray-700">Receive</span>
        </a>
      </div>

      {/* Transactions */}
      <div className="px-6 mt-8">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Recent Transactions</h3>
        
        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'received' || tx.type === 'bonus' || tx.type === 'interest' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.type === 'received' || tx.type === 'bonus' || tx.type === 'interest' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {tx.type === 'sent' ? `To: ${tx.receiverName}` : 
                       tx.type === 'received' ? `From: ${tx.senderName}` : 
                       tx.type === 'interest' ? 'Daily Interest' : 
                       tx.type === 'bonus' ? 'Welcome Bonus' : 'Transaction'}
                    </p>
                    <p className="text-xs text-gray-400">{format(tx.timestamp, 'MMM d, h:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    tx.type === 'received' || tx.type === 'bonus' || tx.type === 'interest' ? 'text-green-600' : 'text-gray-800'
                  }`}>
                    {tx.type === 'sent' ? '-' : '+'}₹{tx.amount}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;