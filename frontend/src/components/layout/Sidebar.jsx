import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, FileText, MessageSquare,
  TrendingUp, Shield, Users, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const navigate = useNavigate();
  const links = user?.role === 'recruiter' ? recruiterLinks : candidateLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-64 flex flex-col glass border-r border-white/5"
      style={{ minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
            <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF"/>
            <path d="M12 4L20 20H12L12 4Z" fill="#1e1b4b"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-[18px] font-black text-white tracking-tighter leading-none" style={{fontFamily: 'Outfit'}}>HIREMIND</span>
            <span className="text-[7px] text-[#00E5FF] tracking-[0.2em] uppercase mt-0.5">Recruiting OS</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-white/25">
          {user?.role === 'recruiter' ? 'Recruiter' : 'Candidate'}
        </p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.includes('dashboard')}
            className={({ isActive }) =>
              `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer
               ${isActive ? 'active text-indigo-400 bg-indigo-500/10' : 'text-white/55 hover:text-white/90'}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0] || 'U'}
                </span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/90 truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
