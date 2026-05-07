import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, Zap, Building, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner, EmptyState, Tag } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function JobListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [search, setSearch] = useState('');

  const fetchJobs = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs?search=${searchQuery}`);
      setJobs(data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSemanticMatch = async () => {
    if (user?.role !== 'candidate') return;
    setMatching(true);
    try {
      const { data } = await api.get('/jobs/semantic-match');
      setJobs(data.data.map(m => ({ ...m.job, semanticScore: m.score })));
      toast.success('Jobs sorted by AI match!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Matching failed');
    } finally {
      setMatching(false);
    }
  };

  const glassClass = theme === 'dark' 
    ? 'bg-gradient-to-br from-white/[0.08] to-transparent border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md hover:from-white/[0.12] transition-all' 
    : 'bg-white border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 lg:px-0 pt-10">
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all w-fit px-4 py-2 rounded-xl
            ${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-[#05051a] hover:bg-gray-100'}`}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col">
            <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>
              Opportunities
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-2 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
              Explore high-growth roles matched for you
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`relative flex-1 md:w-96 group border transition-all rounded-[1.5rem]
              ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-[#00E5FF]/50' : 'bg-white border-gray-100 focus-within:border-[#00E5FF]'}`}>
              <Search size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors
                ${theme === 'dark' ? 'text-white/20 group-focus-within:text-[#00E5FF]' : 'text-gray-300 group-focus-within:text-[#00E5FF]'}`} />
              <input 
                type="text" 
                placeholder="SEARCH BY ROLE OR KEYWORD..." 
                className={`w-full bg-transparent border-none outline-none pl-14 pr-6 py-5 text-[11px] font-black uppercase tracking-widest
                  ${theme === 'dark' ? 'text-white placeholder:text-white/10' : 'text-[#05051a] placeholder:text-gray-300'}`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchJobs(search)}
              />
            </div>
            
            {user?.role === 'candidate' && (
              <button 
                onClick={handleSemanticMatch}
                disabled={matching}
                className={`flex items-center gap-3 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl
                  ${matching ? 'opacity-50' : 'hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,229,255,0.3)]'}
                  text-[#06061c] bg-[#00E5FF]`}
              >
                {matching ? <span className="w-4 h-4 border-2 border-[#06061c]/20 border-t-[#06061c] rounded-full animate-spin" /> : <Zap size={14} fill="#06061c" />}
                AI Analysis
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <EmptyState 
          icon={Briefcase} 
          title="No opportunities found" 
          description="We couldn't find any roles matching your current search criteria. Try broadening your terms." 
          action={<button onClick={() => fetchJobs('')} className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF] hover:underline">Reset Search</button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job, i) => (
            <motion.div 
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-[3rem] p-10 border transition-all duration-500 flex flex-col h-full relative group hover:scale-[1.02]
                ${theme === 'dark' 
                  ? 'bg-gradient-to-br from-white/10 to-white/[0.02] border-white/5 hover:border-white/20' 
                  : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50 hover:border-[#00E5FF]/30'}`}
            >
              {job.semanticScore && (
                <div className="absolute top-8 right-8 px-4 py-1.5 bg-[#00E5FF] text-[#06061c] rounded-full text-[9px] font-black tracking-widest flex items-center gap-2 shadow-2xl shadow-cyan-500/40 transform group-hover:-translate-y-1 transition-transform">
                  <Zap size={10} fill="#06061c" /> {job.semanticScore}% MATCH
                </div>
              )}
              
              <div className="flex gap-6 items-start mb-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl transition-transform group-hover:rotate-6
                  ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                  <Building size={28} className={theme === 'dark' ? 'text-[#00E5FF]/60' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className={`text-lg font-black uppercase tracking-tight leading-[1.1] mb-2 pr-20 group-hover:text-[#00E5FF] transition-colors ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{job.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-[#6366f1]" />
                    <p className="text-[10px] font-black text-[#6366f1] uppercase tracking-[0.2em]">{job.company}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest
                  ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/60' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                  <MapPin size={10} /> {job.location.split(',')[0]}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest
                  ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/60' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                  <Clock size={10} /> {job.type}
                </div>
              </div>

              <p className={`text-xs font-medium leading-relaxed line-clamp-3 mb-10 flex-1 opacity-80
                ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                {job.description}
              </p>

              <div className="mt-auto">
                <Link to={`/jobs/${job._id}`} className={`w-full flex items-center justify-center gap-2 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg
                  ${theme === 'dark' 
                    ? 'bg-white/10 text-white hover:bg-[#00E5FF] hover:text-[#06061c]' 
                    : 'bg-[#05051a] text-white hover:bg-[#6366f1]'}`}>
                  View Career Path <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
