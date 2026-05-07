import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, Eye, Sun, Moon, Shield, Trash2, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SectionHeader, LoadingSpinner } from '../components/ui/Cards';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const glassClass = theme === 'dark' 
    ? 'bg-white/5 border-white/5 shadow-2xl' 
    : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40';

  const inputClass = `w-full bg-transparent border-b-2 py-3 text-xs font-bold uppercase tracking-widest outline-none transition-all
    ${theme === 'dark' 
      ? 'border-white/10 text-white focus:border-[#00E5FF]' 
      : 'border-gray-100 text-[#05051a] focus:border-[#00E5FF]'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col">
        <h1 className={`text-3xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>Control Center</h1>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>Manage your account security and preferences</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Security Section */}
        <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <SectionHeader title="Access Security" subtitle="Update your account credentials" />
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Password</p>
              <input 
                type="password" 
                className={inputClass}
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">New Secure Password</p>
              <input 
                type="password" 
                className={inputClass}
                value={passwordData.newPassword}
                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Confirm Identity</p>
              <input 
                type="password" 
                className={inputClass}
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#00E5FF] text-[#06061c] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all"
            >
              {loading ? <LoadingSpinner size={14} /> : <Shield size={14} fill="#06061c" />}
              Update Credentials
            </button>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="space-y-8">
          {/* Theme & Display */}
          <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center">
                <Eye size={18} />
              </div>
              <SectionHeader title="Display Preferences" subtitle="Personalize your workspace aesthetic" />
            </div>

            <div className="space-y-4">
              <button 
                onClick={toggleTheme}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all
                  ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                    {theme === 'dark' ? <Moon size={14} className="text-[#00E5FF]" /> : <Sun size={14} className="text-amber-500" />}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>
                    {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                  </span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[#00E5FF]' : 'bg-gray-300'}`}>
                  <motion.div 
                    animate={{ x: theme === 'dark' ? 20 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-md"
                  />
                </div>
              </button>

              <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all
                ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                    <Bell size={14} className="text-[#6366f1]" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>Notifications</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-[#10b981] relative">
                  <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 border-red-500/20 ${theme === 'dark' ? 'bg-red-500/5' : 'bg-red-50/50'}`}>
            <SectionHeader title="Security Hazard" subtitle="Irreversible account actions" />
            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">
              <Trash2 size={14} />
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
