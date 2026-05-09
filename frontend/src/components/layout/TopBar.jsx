import { Bell, Sun, Moon, Search, User, LogOut, Settings, X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

const PAGE_TITLES = {
  '/dashboard/recruiter': 'Recruiter Dashboard',
  '/dashboard/candidate': 'Candidate Hub',
  '/dashboard/resume': 'Resume Intelligence',
  '/dashboard/interview': 'AI Interview Lab',
  '/dashboard/skill-gap': 'Skill Strategy',
  '/dashboard/bias-detector': 'DEI Audit',
  '/dashboard/candidates': 'Talent Sourcing',
  '/dashboard/pipeline': 'Talent Pipeline',
  '/jobs': 'Marketplace',
  '/dashboard/settings': 'OS Settings',
};

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data.map(n => ({
        id: n._id,
        title: n.title,
        desc: n.message,
        time: new Date(n.createdAt).toLocaleDateString(),
        read: n.isRead,
        type: n.type
      })));
      setUnreadCount(data.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleNewNotification = (e) => {
      setNotifications(prev => [{
        id: Date.now(),
        time: 'Just now',
        read: false,
        title: e.detail.title,
        desc: e.detail.desc,
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener('add-notification', handleNewNotification);
    return () => window.removeEventListener('add-notification', handleNewNotification);
  }, []);

  const clearAllNotifications = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications');
    }
  };

  const dismissNotification = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };
  
  const title = PAGE_TITLES[location.pathname] || 'HireMind';

  return (
    <header className={`h-[80px] lg:h-[90px] flex items-center justify-between px-4 lg:px-8 border-b transition-colors duration-300 flex-shrink-0 z-20 relative
      ${theme === 'dark' ? 'bg-[#06061c]/80 border-white/5 backdrop-blur-md' : 'bg-white/80 border-gray-100 backdrop-blur-md'}`}>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-xl transition-all ${theme === 'dark' ? 'text-white/40 hover:bg-white/5' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <Menu size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className={`text-sm lg:text-xl font-black tracking-tight uppercase ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>{title}</h1>
          <p className={`text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Mock */}
        <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all
          ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/30 focus-within:border-[#00E5FF]/50' : 'bg-gray-50 border-gray-100 text-gray-400 focus-within:border-[#00E5FF]'}`}>
          <Search size={16} />
          <input type="text" placeholder="Search talent..." className="bg-transparent border-none outline-none text-xs font-bold w-40" />
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500
            ${theme === 'dark' ? 'bg-white/5 text-[#00E5FF] hover:bg-white/10' : 'bg-gray-50 text-amber-500 hover:bg-gray-100'}`}
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all relative
                ${theme === 'dark' ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-gray-50 text-gray-400 hover:text-[#05051a]'}`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-[#00E5FF] text-[#06061c] text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[#06061c] shadow-[0_0_10px_#00E5FF]">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-4 w-80 rounded-[2rem] border p-6 shadow-2xl z-50
                      ${theme === 'dark' ? 'bg-[#0a0a25] border-white/10' : 'bg-white border-gray-100'}`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>Notifications</h3>
                      <div className="flex gap-4">
                        {unreadCount > 0 && (
                          <button 
                            onClick={clearAllNotifications}
                            className="text-[10px] font-bold text-[#00E5FF] uppercase hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            onClick={async () => {
                              try {
                                await api.delete('/notifications');
                                setNotifications([]);
                                setUnreadCount(0);
                              } catch (err) {
                                console.error('Failed to clear notifications');
                              }
                            }}
                            className="text-[10px] font-bold text-rose-500 uppercase hover:underline"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.read && dismissNotification(n.id)}
                            className={`p-4 rounded-2xl transition-all group relative cursor-pointer
                              ${n.read 
                                ? theme === 'dark' ? 'bg-transparent text-white/30' : 'bg-transparent text-gray-400' 
                                : theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-indigo-50/50 border border-indigo-100/50'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-[11px] font-black uppercase tracking-tight ${n.read ? 'opacity-50' : ''}`}>{n.title}</p>
                              {!n.read && <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />}
                            </div>
                            <p className={`text-[10px] leading-relaxed ${n.read ? 'opacity-40' : 'text-gray-500 dark:text-white/60'}`}>{n.desc}</p>
                            <p className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-30">{n.time}</p>
                          </div>
                        ))
                    ) : (
                      <div className="py-10 text-center">
                        <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/20' : 'text-gray-300'}`}>No new alerts</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-100 hidden md:block" />

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-3 p-1 rounded-2xl transition-all
              ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-black shadow-lg overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#00E5FF,#6366f1)' }}>
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                user?.name?.[0]
              )}
            </div>
            <span className={`text-xs font-black uppercase tracking-tighter hidden lg:block ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{user?.name?.split(' ')[0]}</span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute right-0 mt-4 w-60 rounded-[2rem] border p-3 shadow-2xl z-50
                  ${theme === 'dark' ? 'bg-[#0a0a25] border-white/10 text-white' : 'bg-white border-gray-100 text-[#05051a]'}`}
              >
                <div className="px-4 py-4 border-b border-gray-100 mb-2">
                  <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{user?.name}</p>
                  <p className="text-[9px] font-bold uppercase text-[#00E5FF] tracking-[0.2em]">{user?.role}</p>
                </div>
                <Link to="/dashboard/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <User size={14} /> Profile
                </Link>
                <Link to="/dashboard/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <Settings size={14} /> Settings
                </Link>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors mt-2`}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
