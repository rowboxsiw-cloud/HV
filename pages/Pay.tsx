import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { sendMoney } from '../services/db';
import { ArrowLeft, Loader2, Search, Camera } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Pay = () => {
  const { user, refreshProfile, profile } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we came from a scan intent (query params or state)
  const initialUpi = new URLSearchParams(location.search).get('upi') || '';

  const [upiId, setUpiId] = useState(initialUpi);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    // Validation
    if (!upiId.trim().endsWith('@swiftpay')) {
       setStatus({ type: 'error', msg: 'Invalid UPI ID. Must end with @swiftpay' });
       return;
    }

    if (parseFloat(amount) > profile.balance) {
       setStatus({ type: 'error', msg: 'Insufficient balance' });
       return;
    }

    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const result = await sendMoney(user.uid, upiId.trim(), parseFloat(amount));
      if (result.success) {
        setStatus({ type: 'success', msg: result.message });
        await refreshProfile();
        setAmount('');
        // Optional: Navigate home after delay
        setTimeout(() => navigate('/'), 2000);
      } else {
        setStatus({ type: 'error', msg: result.message });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Transaction failed unexpectedly' });
    } finally {
      setLoading(false);
    }
  };

  // Mock Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showScanner) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          // Simulate scanning success after 3 seconds for demo
          setTimeout(() => {
             // Mock found a user
             setUpiId('demo@swiftpay');
             setShowScanner(false);
             if (stream) stream.getTracks().forEach(t => t.stop());
          }, 3000);
        })
        .catch(err => {
          console.error("Camera error", err);
          alert("Could not access camera. Please enter ID manually.");
          setShowScanner(false);
        });
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [showScanner]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center space-x-4 shadow-md">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-xl font-semibold">Send Money</h1>
      </div>

      {showScanner ? (
         <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="absolute top-4 right-4 text-white z-50">
               <button onClick={() => setShowScanner(false)} className="bg-white/20 p-2 rounded-full">Close</button>
            </div>
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-green-400 rounded-lg opacity-50 relative">
                 <div className="absolute top-1/2 left-0 right-0 text-center text-white font-bold animate-pulse">Scanning...</div>
              </div>
            </div>
         </div>
      ) : (
        <div className="p-6 space-y-8">
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between cursor-pointer" onClick={() => setShowScanner(true)}>
             <div className="flex items-center space-x-3 text-blue-800">
               <div className="bg-blue-200 p-2 rounded-lg"><Camera size={24} /></div>
               <span className="font-semibold">Scan QR Code</span>
             </div>
             <ArrowLeft className="rotate-180 text-blue-400" size={20} />
          </div>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR ENTER DETAILS</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receiver UPI ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    if (status.msg.includes('Invalid UPI ID')) setStatus({ type: null, msg: '' });
                  }}
                  placeholder="username@swiftpay"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${status.msg.includes('Invalid UPI ID') ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                  required
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Must end with @swiftpay</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="any"
                className="w-full px-4 py-3 text-2xl font-bold text-gray-800 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-right">Balance: ₹{profile?.balance}</p>
            </div>

            {status.msg && (
              <div className={`p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {status.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <span>Pay Now</span>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Pay;