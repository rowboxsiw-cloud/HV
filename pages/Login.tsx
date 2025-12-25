import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { ShieldCheck, Wallet } from 'lucide-react';

const Login = () => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-6 text-white">
      <div className="w-full max-w-sm flex flex-col items-center space-y-8 animate-fade-in-up">
        <div className="bg-white/10 p-6 rounded-full backdrop-blur-lg shadow-xl border border-white/20">
          <Wallet size={64} className="text-white" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">SwiftPay</h1>
          <p className="text-blue-100 text-lg">Secure UPI Payments & Interest</p>
        </div>

        <div className="w-full bg-white rounded-2xl p-6 shadow-2xl text-gray-800 space-y-6">
          <div className="flex items-center space-x-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <ShieldCheck className="text-green-500 shrink-0" size={20} />
            <span>Bank-grade security with instant setup</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/30"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-6 h-6 bg-white rounded-full p-0.5" 
            />
            <span>Continue with Google</span>
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;