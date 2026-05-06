import { Bell, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard/recruiter': 'Recruiter Dashboard',
  '/dashboard/candidate': 'My Dashboard',
  '/dashboard/resume': 'Resume Analyzer',
  '/dashboard/interview': 'AI Interview',
  '/dashboard/skill-gap': 'Skill Gap Analyzer',
  '/dashboard/bias-detector': 'Bias Detector',
  '/dashboard/candidates': 'Candidate Pool',
  '/jobs': 'Job Listings',
};

export default function TopBar() {
  const { user } = useAuth();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'HireMind';

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 glass-light flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-white/90">{title}</h1>
        <p className="text-xs text-white/35">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/40 hover:text-white/80 transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
        </button>
        <div className="h-7 w-px bg-white/8" />
        <div className="flex items-center gap-2.5 px-3 py-1.5 glass rounded-xl">
          <div className="w-6 h-6 rounded-full overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]}
            </span>
          </div>
          <span className="text-xs font-medium text-white/70">{user?.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
