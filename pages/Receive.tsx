import React, { useContext } from 'react';
import QRCode from 'react-qr-code';
import { AppContext } from '../App';
import BottomNav from '../components/BottomNav';
import { Copy, Share2 } from 'lucide-react';

const Receive = () => {
  const { profile } = useContext(AppContext);

  if (!profile) return null;

  // Simple copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profile.upiId);
    alert('UPI ID copied!');
  };

  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-6 pb-24">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center space-y-6 animate-fade-in-up">
        
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-800">Receive Money</h2>
          <p className="text-gray-500 text-sm">Scan this QR code to pay me</p>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mx-auto w-fit">
          <QRCode
            value={`upi://pay?pa=${profile.upiId}&pn=${encodeURIComponent(profile.displayName || 'User')}`}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your UPI ID</p>
          <div className="flex items-center justify-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
             <span className="font-mono text-gray-800 text-lg font-medium">{profile.upiId}</span>
             <button onClick={copyToClipboard} className="text-blue-600 hover:text-blue-700">
               <Copy size={18} />
             </button>
          </div>
        </div>

        <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold flex items-center justify-center space-x-2 hover:bg-black transition-colors">
          <Share2 size={20} />
          <span>Share QR Code</span>
        </button>

      </div>
      <BottomNav />
    </div>
  );
};

export default Receive;