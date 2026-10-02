import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';
import { Toast } from './components/common/Toast';
import { apiService } from './services/api';
import { User } from './types';
import { LogOut } from 'lucide-react';

const AdminContent: React.FC = () => {
  const { setViewRole, setCurrentUser, showToast } = useStore();
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Ensure viewRole is set to 'admin' in StoreContext
    setViewRole('admin');

    async function checkAdminSession() {
      try {
        const user = await apiService.getAdminMe();
        if (user && user.role === 'admin') {
          setAdminUser(user);
          setCurrentUser(user);
        }
      } catch (err) {
        // Not authenticated as admin
        setAdminUser(null);
      } finally {
        setCheckingSession(false);
      }
    }

    checkAdminSession();
  }, [setViewRole, setCurrentUser]);

  const handleAdminLogout = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.warn(err);
    }
    setAdminUser(null);
    setCurrentUser(null);
    showToast('Admin logged out successfully', 'info');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-earth-950 text-white flex items-center justify-center font-sans text-xs">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-earth-400">Verifying Admin Credentials...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <AdminLogin
        onLoginSuccess={(u) => {
          setAdminUser(u);
          setCurrentUser(u);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-earth-950">
      {/* Top Floating Logout Admin Button */}
      <div className="fixed top-3 right-6 z-50">
        <button
          onClick={handleAdminLogout}
          className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout Admin</span>
        </button>
      </div>

      <AdminLayout />
      <Toast />
    </div>
  );
};

export default function AdminApp() {
  return (
    <StoreProvider>
      <AdminContent />
    </StoreProvider>
  );
}
