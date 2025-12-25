import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'root' && password === '117393993987') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
        <div className="flex flex-col items-center mb-6 text-white">
          <div className="bg-red-500 p-3 rounded-full mb-4">
             <Lock size={24} />
          </div>
          <h1 className="text-xl font-bold">Restricted Access</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
             <label className="block text-gray-400 text-sm mb-1">Username</label>
             <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 outline-none focus:border-red-500" />
          </div>
          <div>
             <label className="block text-gray-400 text-sm mb-1">Password</label>
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 outline-none focus:border-red-500" />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">
            Access Panel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;