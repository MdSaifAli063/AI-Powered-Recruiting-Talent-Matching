import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, TrendingUp, Award, ChevronRight, Star, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { StatCard, LoadingSpinner, SectionHeader, ProgressBar } from '../components/ui/Cards';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const FUNNEL_COLORS = ['#00E5FF', '#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function RecruiterDashboard() {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/recruiter')
      .then(r => {
        setData(r.data.data);
        // Force a resize event to trigger Recharts re-measurement
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 300);
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load real-time analytics');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size={40} />;
  if (!data) return <div className="text-white/50 text-center py-20">Failed to load analytics.</div>;

  const { overview, scoreDistribution, topCandidates, jobPerformance, funnelData } = data;

  const funnelChartData = Object.entries(funnelData || {}).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  const scoreData = [
    { name: 'EXCELLENT', value: scoreDistribution?.excellent || 0, color: '#00E5FF' },
    { name: 'GOOD', value: scoreDistribution?.good || 0, color: '#6366f1' },
    { name: 'FAIR', value: scoreDistribution?.fair || 0, color: '#f59e0b' },
    { name: 'POOR', value: scoreDistribution?.poor || 0, color: '#ef4444' },
  ];

  const glassClass = theme === 'dark' 
    ? 'bg-white/5 border-white/5 shadow-2xl' 
    : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40';

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} label="Active Jobs" value={overview.totalJobs} color="#00E5FF" sub="Recruitment OS" delay={0} />
        <StatCard icon={Users} label="Total Applications" value={overview.totalApplications} color="#6366f1" sub="+12.5% this week" delay={0.05} />
        <StatCard icon={Target} label="Qualified Talent" value={overview.totalCandidates} color="#f59e0b" sub="AI Filtered" delay={0.1} />
        <StatCard icon={Award} label="Final Hires" value={overview.totalHired} color="#10b981" sub="Goal: 10/mo" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Hiring Funnel Visualization */}
        <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 lg:col-span-2 ${glassClass}`}>
          <SectionHeader title="Hiring Velocity" subtitle="Candidates through the pipeline" />
          <div className="h-[300px] w-full mt-4 relative">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} height={300}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: 9, fontWeight: 900 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,229,255,0.05)' }}
                  contentStyle={{ 
                    background: theme === 'dark' ? '#0a0a25' : '#fff', 
                    border: 'none', 
                    borderRadius: '1.5rem', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    padding: '1rem'
                  }}
                  itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
                  {funnelChartData.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
          <SectionHeader title="AI Match Index" subtitle="Talent quality distribution" />
          <div className="h-[220px] w-full relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart height={220}>
                <Pie 
                  data={scoreData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={85}
                  dataKey="value" 
                  paddingAngle={8}
                  stroke="none"
                >
                  {scoreData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{overview.totalApplications}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Total Apps</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {scoreData.map(d => (
              <div key={d.name} className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px]" style={{ background: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>{d.name}</span>
                </div>
                <span className={`text-sm font-black ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top Talent Spotlight */}
        <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
          <SectionHeader title="Talent Spotlight"
            subtitle="Top performing AI-matched candidates"
            action={<Link to="/dashboard/candidates" className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF] hover:underline flex items-center gap-1">Full Pool <ChevronRight size={12} /></Link>}
          />
          <div className="space-y-4">
            {(topCandidates || []).slice(0, 4).map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all hover:scale-[1.02] cursor-pointer
                  ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-100 hover:shadow-xl'}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#00E5FF,#6366f1)' }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{c.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{c.title || 'Senior Strategist'}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                    <Zap size={10} fill="#00E5FF" />
                    <span className="text-xs font-black">{c.profileScore}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Marketplace Performance */}
        <div className={`rounded-[2.5rem] p-8 border transition-all duration-300 ${glassClass}`}>
          <SectionHeader title="Market Index" subtitle="Job performance & match optimization" />
          <div className="space-y-8 mt-4">
            {(jobPerformance || []).slice(0, 4).map((j, i) => (
              <div key={j.id} className="group">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{j.title}</span>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{j.applications} Applications</span>
                      <span className="text-[9px] font-bold text-[#6366f1] uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <span className={`text-xs font-black ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>{j.avgMatchScore}% MATCH</span>
                </div>
                <ProgressBar value={j.avgMatchScore} color={j.avgMatchScore >= 80 ? '#00E5FF' : '#6366f1'} delay={i * 0.1} />
              </div>
            ))}
            {(!jobPerformance?.length) && (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2rem]">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">No active positions</p>
                <Link to="/dashboard/candidates" className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF] mt-4 inline-block hover:underline">Deploy New Job</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
