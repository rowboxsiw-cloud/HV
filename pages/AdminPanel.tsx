import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, adminUpdateBalance } from '../services/db';
import { UserProfile } from '../types';
import { LogOut, Save, User } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (isAuth !== 'true') {
      navigate('/admin');
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleBalanceChange = (uid: string, val: string) => {
    setEditValues(prev => ({ ...prev, [uid]: parseFloat(val) }));
  };

  const saveBalance = async (uid: string) => {
    const newBal = editValues[uid];
    if (newBal === undefined || isNaN(newBal)) return;
    
    await adminUpdateBalance(uid, newBal);
    alert('Balance updated!');
    loadUsers(); // Refresh
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-lg">Admin Control Panel</h1>
        <button onClick={handleLogout} className="text-gray-400 hover:text-white flex items-center space-x-1">
          <LogOut size={16} /> <span>Logout</span>
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">User Database ({users.length})</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">UPI ID</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Current Balance</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Edit Balance</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {u.photoURL ? <img src={u.photoURL} className="w-8 h-8 rounded-full"/> : <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User size={16}/></div>}
                          <div className="text-sm font-medium text-gray-900">{u.displayName || 'No Name'}</div>
                        </div>
                        <div className="text-xs text-gray-400 pl-11">{u.email}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-mono">{u.upiId}</td>
                      <td className="p-4 text-sm font-bold text-green-600">₹{u.balance}</td>
                      <td className="p-4">
                         <input 
                           type="number" 
                           defaultValue={u.balance} 
                           onChange={(e) => handleBalanceChange(u.uid, e.target.value)}
                           className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                         />
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => saveBalance(u.uid)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;