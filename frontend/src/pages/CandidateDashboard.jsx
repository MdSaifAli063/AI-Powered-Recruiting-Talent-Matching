import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, TrendingUp, Briefcase, ChevronRight, Zap, X } from 'lucide-react';
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
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-white/5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.05), rgba(99,102,241,0.05))' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-black text-[#06061c] shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#00E5FF,#6366f1)' }}>
            {user?.name?.[0]}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic" style={{ fontFamily: 'Outfit' }}>Welcome back, {user?.name?.split(' ')[0]}!</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E5FF] mt-1">Recruiting OS • AI Optimized Profile</p>
          </div>
        </div>

        <div className="flex items-center gap-8 px-8 py-4 bg-white/5 rounded-[2rem] border border-white/5 relative z-10 backdrop-blur-sm">
          <ScoreCircle score={data?.profileScore || 0} size={80} label="PROFILE" />
          <div className="h-10 w-px bg-white/10" />
          <ScoreCircle score={data?.resumeScore || 0} size={80} label="RESUME" />
        </div>
      </motion.div>

      <div className="grid xl:grid-cols-4 gap-8 items-start">
        {/* Main Feed */}
        <div className="xl:col-span-3 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Briefcase} label="Jobs Applied" value={data?.totalApplications || 0} color="#00E5FF" sub="Active Tracking" delay={0} />
            <StatCard icon={Zap} label="Accepted" value={data?.totalAccepted || 0} color="#10b981" sub="Interview Prep" delay={0.05} />
            <StatCard icon={X} label="Rejected" value={data?.totalRejected || 0} color="#f87171" sub="Archived" delay={0.1} />
            <StatCard icon={FileText} label="Resume Rank" value={data?.resumeScore ? `${data.resumeScore}%` : '—'} color="#8b5cf6" sub="Market Ready" delay={0.15} />
          </div>

          {/* Quick Actions Panel */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { to: '/dashboard/resume', icon: FileText, label: 'Resume Intelligence', desc: 'Scan and optimize for ATS visibility', color: '#00E5FF' },
              { to: '/dashboard/interview', icon: MessageSquare, label: 'AI Interview Lab', desc: 'Practice with real-time feedback', color: '#6366f1' },
              { to: '/dashboard/skill-gap', icon: TrendingUp, label: 'Skill Strategy', desc: 'Identify missing core competencies', color: '#8b5cf6' },
            ].map(({ to, icon: Icon, label, desc, color }, i) => (
              <Link key={to} to={to}>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="glass rounded-[2rem] p-7 border-white/5 hover:border-[#00E5FF]/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all group-hover:scale-110"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon size={24} style={{ color }} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2" style={{ fontFamily: 'Outfit' }}>{label}</h3>
                  <p className="text-[11px] font-medium leading-relaxed text-white/40">{desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skills & History */}
            <div className="glass rounded-[2.5rem] p-8 border-white/5">
              <SectionHeader title="Verified Skills" 
                action={<Link to="/dashboard/profile" className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF] hover:underline">Manage</Link>}
              />
              {data?.skills?.length ? (
                <div className="flex flex-wrap gap-3">
                  {data.skills.map(s => (
                    <span key={s} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-[#00E5FF] hover:border-[#00E5FF]/20 transition-all cursor-default">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No data points detected</p>
                  <Link to="/dashboard/resume" className="btn-primary mt-6 text-[10px] uppercase tracking-[0.2em] px-8">
                    <Zap size={14} /> Scan Resume
                  </Link>
                </div>
              )}
            </div>

            <div className="glass rounded-[2.5rem] p-8 border-white/5">
              <SectionHeader title="Activity Log" />
              {data?.interviewHistory?.length ? (
                <div className="space-y-4">
                  {data.interviewHistory.slice(0, 4).map((iv) => (
                    <div key={iv.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF]">
                        <MessageSquare size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-tight text-white truncate">{iv.jobTitle}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{new Date(iv.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black" style={{ color: scoreColor(iv.score) }}>{iv.score}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Awaiting first session</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Jobs For You */}
          <div className="glass rounded-[2.5rem] p-8 border-white/5">
            <SectionHeader title="Top Opportunities for You"
              subtitle="AI-matched roles based on your verified skills"
              action={<Link to="/jobs" className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF] hover:underline flex items-center gap-1">View All <ChevronRight size={10} /></Link>}
            />
            <div className="grid md:grid-cols-2 gap-6">
              {(data?.topJobs || []).length > 0 ? (
                data.topJobs.map(job => (
                  <Link key={job._id} to={`/jobs/${job._id}`}>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-[#6366f1]/30 hover:bg-white/[0.08] transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform">
                          <Briefcase size={18} className="text-[#00E5FF]" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-[#6366f1]/10 text-[#6366f1] text-[8px] font-black tracking-widest">
                          {job.type.toUpperCase()}
                        </div>
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-white mb-1 group-hover:text-[#00E5FF] transition-colors">{job.title}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">{job.company} • {job.location}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#00E5FF] to-[#6366f1]" style={{ width: '85%' }} />
                        </div>
                        <span className="text-[9px] font-black text-[#00E5FF]">85% MATCH</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-10 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Analyzing market for matches...</p>
                </div>
              )}
            </div>
          </div>

          {/* Applied Jobs Section */}
          {data?.appliedJobs?.length > 0 && (
            <div className="glass rounded-[2.5rem] p-8 border-white/5">
              <SectionHeader title="Active Applications"
                subtitle="Track your current hiring status"
              />
              <div className="grid md:grid-cols-2 gap-4">
                {data.appliedJobs.slice(0, 4).map(job => (
                  <div key={job._id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00E5FF]/20 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[#00E5FF] transition-colors">{job.title}</p>
                      <span className="px-2 py-1 rounded-lg bg-green-500/10 text-[8px] font-black text-green-400 uppercase tracking-widest">Active</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{job.company} • {job.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Insights Sidebar - Fills the empty space */}
        <div className="xl:col-span-1 space-y-8">
          <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-gradient-to-br from-[#00E5FF]/5 to-transparent">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#00E5FF] mb-6">AI Strategy Insights</h3>
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Market Sentiment</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">High Demand</span>
                  <span className="text-[10px] font-black text-green-400">+12%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 w-[75%]" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Profile Authority</p>
                <p className="text-xs font-medium leading-relaxed text-white/60">Your profile is in the <span className="text-[#00E5FF] font-black">top 15%</span> of developers in your region.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Zap size={14} className="text-[#6366f1]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Next Step</span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/70">Complete your **AI Interview Lab** to increase your visibility to top recruiters by <span className="text-white font-black">40%</span>.</p>
                <Link to="/dashboard/interview" className="mt-4 flex items-center justify-center py-2 bg-[#6366f1] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#5558e3] transition-all">
                  Boost Profile
                </Link>
              </div>
            </div>
          </div>

          <div className="glass rounded-[2.5rem] p-8 border-white/5">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-6">Upcoming Events</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center text-[10px] font-black border border-white/5">
                  <span className="text-[#00E5FF]">MAY</span>
                  <span>12</span>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-tight text-white">Tech Career Expo</p>
                  <p className="text-[9px] text-white/20 uppercase font-bold">Virtual Event</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
