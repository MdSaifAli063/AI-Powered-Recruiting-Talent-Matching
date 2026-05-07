import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, Zap, Building, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner, EmptyState, Tag } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function JobListings() {
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
    ? 'bg-white/5 border-white/5 shadow-2xl' 
    : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col">
          <h1 className={`text-3xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>Opportunities</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>Explore high-growth roles matched for you</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className={`relative flex-1 md:w-80 group border transition-all rounded-2xl
            ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-[#00E5FF]/50' : 'bg-white border-gray-100 focus-within:border-[#00E5FF]'}`}>
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors
              ${theme === 'dark' ? 'text-white/20 group-focus-within:text-[#00E5FF]' : 'text-gray-300 group-focus-within:text-[#00E5FF]'}`} />
            <input 
              type="text" 
              placeholder="Search by role or keyword..." 
              className={`w-full bg-transparent border-none outline-none px-12 py-4 text-xs font-black uppercase tracking-widest
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
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                ${matching ? 'opacity-50' : 'hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(0,229,255,0.3)]'}
                text-[#06061c] bg-[#00E5FF]`}
            >
              {matching ? <span className="w-4 h-4 border-2 border-[#06061c]/20 border-t-[#06061c] rounded-full animate-spin" /> : <Zap size={14} fill="#06061c" />}
              AI Analysis
            </button>
          )}
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
              className={`rounded-[2.5rem] p-8 border transition-all duration-300 flex flex-col h-full relative group hover:scale-[1.02]
                ${glassClass}`}
            >
              {job.semanticScore && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 shadow-lg shadow-cyan-500/10">
                  <Zap size={10} fill="#00E5FF" /> {job.semanticScore}% MATCH
                </div>
              )}
              
              <div className="flex gap-4 items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
                  ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <Building size={24} className={theme === 'dark' ? 'text-white/20' : 'text-gray-300'} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className={`text-base font-black uppercase tracking-tight leading-tight mb-1 pr-24 ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{job.title}</h3>
                  <p className="text-[10px] font-bold text-[#6366f1] uppercase tracking-[0.1em]">{job.company}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Tag><MapPin size={12} className="inline mr-1 opacity-60"/>{job.location.split(',')[0]}</Tag>
                <Tag><Clock size={12} className="inline mr-1 opacity-60"/>{job.type}</Tag>
              </div>

              <p className={`text-xs font-medium leading-relaxed line-clamp-3 mb-8 flex-1
                ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                {job.description}
              </p>

              <div className="mt-auto">
                <Link to={`/jobs/${job._id}`} className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
                  ${theme === 'dark' 
                    ? 'bg-white/5 text-white hover:bg-white/10' 
                    : 'bg-gray-50 text-[#05051a] hover:bg-gray-100'}`}>
                  View Details <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
