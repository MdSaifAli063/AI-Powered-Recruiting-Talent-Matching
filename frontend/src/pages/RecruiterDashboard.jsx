import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, TrendingUp, Award, Target, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { StatCard, LoadingSpinner, SectionHeader, ProgressBar } from '../components/ui/Cards';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const FUNNEL_COLORS = ['#6366f1','#8b5cf6','#a78bfa','#fbbf24','#4ade80','#f87171'];

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/recruiter')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size={32} />;
  if (!data) return <div className="text-white/50 text-center py-20">Failed to load analytics.</div>;

  const { overview, scoreDistribution, topCandidates, jobPerformance, funnelData } = data;

  const funnelChartData = Object.entries(funnelData || {}).map(([name, value]) => ({ name, value }));
  const scoreData = [
    { name: 'Excellent (80+)', value: scoreDistribution?.excellent || 0, color: '#4ade80' },
    { name: 'Good (60-79)', value: scoreDistribution?.good || 0, color: '#818cf8' },
    { name: 'Fair (40-59)', value: scoreDistribution?.fair || 0, color: '#fbbf24' },
    { name: 'Poor (<40)', value: scoreDistribution?.poor || 0, color: '#f87171' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Jobs" value={overview.totalJobs} color="#6366f1" delay={0} />
        <StatCard icon={Users} label="Total Applications" value={overview.totalApplications} color="#8b5cf6" delay={0.05} />
        <StatCard icon={TrendingUp} label="Candidates" value={overview.totalCandidates} color="#a78bfa" delay={0.1} />
        <StatCard icon={Award} label="Total Hired" value={overview.totalHired} sub="This cycle" color="#4ade80" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Hiring Funnel */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <SectionHeader title="Hiring Funnel" subtitle="Applicants by stage" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelChartData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill: 'rgba(226,226,240,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(226,226,240,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#e2e2f0', fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {funnelChartData.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader title="Match Score" subtitle="Candidate distribution" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={scoreData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" paddingAngle={3}>
                {scoreData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#16161e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {scoreData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-white/50 flex-1">{d.name}</span>
                <span className="text-white/70 font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Candidates */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader title="Top Candidates"
            action={<Link to="/dashboard/candidates" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View all <ChevronRight size={12} /></Link>}
          />
          <div className="space-y-3">
            {(topCandidates || []).slice(0, 5).map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">{c.name}</p>
                  <p className="text-xs text-white/40 truncate">{c.title || 'Candidate'}</p>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                  style={{ background: c.profileScore >= 80 ? 'rgba(74,222,128,0.1)' : 'rgba(99,102,241,0.1)' }}>
                  <Star size={10} className={c.profileScore >= 80 ? 'text-green-400' : 'text-indigo-400'} />
                  <span className="text-xs font-bold" style={{ color: c.profileScore >= 80 ? '#4ade80' : '#818cf8' }}>
                    {c.profileScore}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Job Performance */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader title="Job Performance" subtitle="Applications & match rate" />
          <div className="space-y-4">
            {(jobPerformance || []).slice(0, 5).map((j, i) => (
              <div key={j.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-white/80 truncate max-w-[60%]">{j.title}</span>
                  <span className="text-xs text-white/45">{j.applications} apps · {j.avgMatchScore}% avg</span>
                </div>
                <ProgressBar value={j.avgMatchScore} delay={i * 0.1} />
              </div>
            ))}
            {(!jobPerformance?.length) && (
              <p className="text-sm text-white/35 text-center py-8">No jobs posted yet. <Link to="/dashboard/candidates" className="text-indigo-400">Post a job</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
