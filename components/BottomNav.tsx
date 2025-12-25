import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Send, QrCode, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/pay', icon: Send, label: 'Pay' },
    { path: '/receive', icon: QrCode, label: 'Receive' },
    // Profile is just Home for now in this simple structure
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 max-w-md mx-auto">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          className={`flex flex-col items-center space-y-1 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <item.icon size={24} />
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;