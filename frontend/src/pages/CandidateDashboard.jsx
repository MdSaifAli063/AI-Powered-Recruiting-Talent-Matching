import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, TrendingUp, Briefcase, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { StatCard, ScoreCircle, LoadingSpinner, ProgressBar, SectionHeader } from '../components/ui/Cards';
import { useAuth } from '../context/AuthContext';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/candidate')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size={32} />;

  const scoreColor = (s) => s >= 80 ? '#4ade80' : s >= 60 ? '#818cf8' : s >= 40 ? '#fbbf24' : '#f87171';
  const recLabel = { 'strong-hire': 'Strong Hire', hire: 'Hire', maybe: 'Maybe', 'no-hire': 'No Hire' };
  const recColor = { 'strong-hire': '#4ade80', hire: '#818cf8', maybe: '#fbbf24', 'no-hire': '#f87171' };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 flex items-center gap-6"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          {user?.name?.[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-sm text-white/50 mt-0.5">{user?.title || 'Complete your profile to unlock full AI insights'}</p>
        </div>
        <div className="flex items-center gap-4">
          <ScoreCircle score={data?.profileScore || 0} size={72} label="Profile" />
          {data?.resumeAnalyzed && <ScoreCircle score={data?.resumeScore || 0} size={72} label="Resume" />}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Jobs Applied" value={data?.totalApplications || 0} color="#6366f1" delay={0} />
        <StatCard icon={MessageSquare} label="Interviews" value={data?.totalInterviews || 0} color="#8b5cf6" delay={0.05} />
        <StatCard icon={FileText} label="Resume Score" value={data?.resumeScore ? `${data.resumeScore}%` : '—'} color="#a78bfa" delay={0.1} />
        <StatCard icon={TrendingUp} label="Avg Interview" value={data?.avgInterviewScore ? `${data.avgInterviewScore}%` : '—'} color="#4ade80" delay={0.15} />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/resume', icon: FileText, label: 'Analyze Resume', desc: 'Get AI-powered feedback', color: '#6366f1' },
          { to: '/dashboard/interview', icon: MessageSquare, label: 'Practice Interview', desc: 'AI adaptive interview', color: '#8b5cf6' },
          { to: '/dashboard/skill-gap', icon: TrendingUp, label: 'Skill Gap Analysis', desc: 'Find what to learn next', color: '#a78bfa' },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to}>
            <motion.div whileHover={{ y: -3 }} className="glass rounded-2xl p-5 card-hover h-full">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-sm font-semibold text-white mb-1">{label}</p>
              <p className="text-xs text-white/45">{desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader title="My Skills"
            action={<Link to="/dashboard/resume" className="text-xs text-indigo-400 flex items-center gap-1">Update <ChevronRight size={12} /></Link>}
          />
          {data?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.map(s => (
                <span key={s} className="badge badge-brand">{s}</span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-white/40">No skills added yet.</p>
              <Link to="/dashboard/resume" className="btn-primary mt-3 text-xs px-4 py-2">
                <Zap size={12} /> Analyze Resume
              </Link>
            </div>
          )}
        </div>

        {/* Interview History */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader title="Interview History" />
          {data?.interviewHistory?.length ? (
            <div className="space-y-3">
              {data.interviewHistory.slice(0, 4).map((iv) => (
                <div key={iv.id} className="flex items-center gap-3 p-3 rounded-xl glass-light">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{iv.jobTitle}</p>
                    <p className="text-xs text-white/35">{new Date(iv.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: scoreColor(iv.score) }}>{iv.score}%</p>
                    {iv.recommendation && (
                      <span className="text-xs font-medium" style={{ color: recColor[iv.recommendation] }}>
                        {recLabel[iv.recommendation]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-white/40">No interviews yet.</p>
              <Link to="/dashboard/interview" className="btn-primary mt-3 text-xs px-4 py-2">
                <MessageSquare size={12} /> Start Practice Interview
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Applied Jobs */}
      {data?.appliedJobs?.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <SectionHeader title="Applied Jobs"
            action={<Link to="/jobs" className="text-xs text-indigo-400 flex items-center gap-1">Browse more <ChevronRight size={12} /></Link>}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            {data.appliedJobs.slice(0, 4).map(job => (
              <div key={job._id} className="glass-light rounded-xl p-4">
                <p className="text-sm font-semibold text-white/90">{job.title}</p>
                <p className="text-xs text-white/45 mt-0.5">{job.company} · {job.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
