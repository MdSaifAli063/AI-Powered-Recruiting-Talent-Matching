import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, FileText, MessageSquare,
  TrendingUp, Shield, Users, LogOut, Settings, Bell, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const recruiterLinks = [
  { to: '/dashboard/recruiter', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/candidates', icon: Users, label: 'Candidates' },
  { to: '/dashboard/pipeline', icon: Briefcase, label: 'Talent Pipeline' },
  { to: '/jobs', icon: Briefcase, label: 'Job Listings' },
  { to: '/dashboard/bias-detector', icon: Shield, label: 'Bias Detector' },
];

const candidateLinks = [
  { to: '/dashboard/candidate', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Browse Jobs' },
  { to: '/dashboard/resume', icon: FileText, label: 'Resume Analyzer' },
  { to: '/dashboard/interview', icon: MessageSquare, label: 'AI Interview' },
  { to: '/dashboard/skill-gap', icon: TrendingUp, label: 'Skill Gap' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const links = user?.role === 'recruiter' ? recruiterLinks : candidateLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`w-64 flex flex-col border-r transition-colors duration-300 relative z-30
        ${theme === 'dark' 
          ? 'bg-[#0a0a25] border-white/5 shadow-[20px_0_40px_rgba(0,0,0,0.4)]' 
          : 'bg-white border-gray-100 shadow-[20px_0_40px_rgba(0,0,0,0.02)]'}`}
    >
      {/* Branding */}
      <div className={`px-8 py-8 ${theme === 'dark' ? 'border-b border-white/5' : 'border-b border-gray-50'}`}>
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
            <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF"/>
            <path d="M12 4L20 20H12L12 4Z" fill={theme === 'dark' ? 'white' : '#05051a'}/>
          </svg>
          <div className="flex flex-col">
            <span className={`text-[19px] font-black tracking-tighter leading-none 
              ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} 
              style={{fontFamily: 'Outfit'}}>HIREMIND</span>
            <span className="text-[7px] text-[#00E5FF] tracking-[0.3em] uppercase mt-1 font-bold">Recruiting OS</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        <p className={`px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] 
          ${theme === 'dark' ? 'text-white/20' : 'text-gray-400'}`}>
          {user?.role === 'recruiter' ? 'Recruiter' : 'Candidate'} OS
        </p>
        
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.includes('dashboard')}
            className={({ isActive }) => `
              group flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300
              ${isActive 
                ? 'bg-[#00E5FF] text-[#06061c] shadow-[0_10px_20px_rgba(0,229,255,0.25)]' 
                : theme === 'dark' 
                  ? 'text-white/40 hover:text-white hover:bg-white/5' 
                  : 'text-gray-400 hover:text-[#05051a] hover:bg-gray-50'
              }
            `}
          >
            {(linkState) => (
              <>
                <Icon size={16} strokeWidth={linkState.isActive ? 3 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        <div className={`mt-10 pt-10 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-50'}`}>
          <NavLink to="/dashboard/settings" className={({ isActive }) => `
            group flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all
            ${isActive ? 'bg-[#00E5FF] text-[#06061c]' : theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-[#05051a]'}
          `}>
            <Settings size={16} /> Settings
          </NavLink>
        </div>
      </nav>

      {/* Footer Profile */}
      <div className={`p-6 ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-50/50'}`}>
        <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all
          ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-white border border-gray-100 hover:shadow-md'}`}>
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#00E5FF,#6366f1)' }}>
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="w-full h-full flex items-center justify-center text-[#06061c] text-sm font-black">
                  {user?.name?.[0] || 'U'}
                </span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-black truncate uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{user?.name}</p>
            <p className="text-[9px] text-[#00E5FF] font-bold truncate uppercase tracking-widest">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className={`p-2 rounded-xl transition-all
            ${theme === 'dark' ? 'text-white/20 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
