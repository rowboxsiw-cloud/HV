import React, { useEffect, useState, PropsWithChildren } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { initializeUser } from './services/db';
import { UserProfile } from './types';
import Login from './pages/Login';
import Home from './pages/Home';
import Pay from './pages/Pay';
import Receive from './pages/Receive';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import { Loader2 } from 'lucide-react';

// Context for global state
export const AppContext = React.createContext<{
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => void;
}>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: () => {},
});

const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { user, loading } = React.useContext(AppContext);
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600 w-10 h-10"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const LayoutWrapper = ({ children }: PropsWithChildren) => {
  // A wrapper to handle persistent layouts if needed, or simple container
  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200">
      {children}
    </div>
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const userProfile = await initializeUser(currentUser);
      setProfile(userProfile);
    } catch (e) {
      console.error("Error fetching profile", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AppContext.Provider value={{ user, profile, loading, refreshProfile }}>
      <HashRouter>
        <LayoutWrapper>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/pay" element={<ProtectedRoute><Pay /></ProtectedRoute>} />
            <Route path="/receive" element={<ProtectedRoute><Receive /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminPanel />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </LayoutWrapper>
      </HashRouter>
    </AppContext.Provider>
  );
}

export default App;