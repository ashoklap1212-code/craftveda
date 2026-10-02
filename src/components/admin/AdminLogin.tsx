import React, { useState } from 'react';
import { apiService } from '../../services/api';
import { User } from '../../types';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in both admin email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.adminLogin(email, password);
      if (res && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid admin email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-950 text-earth-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-earth-900 border border-earth-800 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-terracotta-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center font-serif text-3xl font-bold mx-auto shadow-warm">
            🏺
          </div>
          <div>
            <h1 className="font-serif text-2xl font-extrabold text-white">CraftVeda Admin Portal</h1>
            <p className="text-xs text-earth-400 mt-1">Separate Store Operations & Control Center</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/80 border border-rose-800/80 text-rose-300 p-3.5 rounded-2xl text-xs font-semibold text-center animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-earth-300 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="e.g. ashoklap1212@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-earth-800 border border-earth-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-earth-500 focus:outline-none focus:border-terracotta-500 font-medium"
              />
              <Mail className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-earth-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-earth-800 border border-earth-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-earth-500 focus:outline-none focus:border-terracotta-500 font-medium"
              />
              <Lock className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold py-3.5 rounded-xl text-xs shadow-warm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating Admin Access...' : 'Sign In to Admin Website'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-4 border-t border-earth-800 text-center text-[11px] text-earth-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Session • Role-Based Admin Auth</span>
          </p>
        </div>
      </div>
    </div>
  );
};
