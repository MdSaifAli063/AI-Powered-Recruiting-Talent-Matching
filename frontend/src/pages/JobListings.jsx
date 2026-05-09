import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, Zap, Building, ChevronRight, ArrowLeft, Plus, X, Globe, DollarSign, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner, EmptyState } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function JobListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [search, setSearch] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    company: user?.company || '',
    location: '',
    type: 'full-time',
    level: 'mid',
    salary: { min: '', max: '', currency: 'USD' },
    description: '',
    requirements: '',
    skills: ''
  });

  const fetchJobs = async (searchQuery = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs?search=${searchQuery}${user?.role === 'recruiter' ? `&postedBy=${user._id}` : ''}`);
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

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedData = {
        ...jobForm,
        requirements: jobForm.requirements.split(',').map(s => s.trim()),
        skills: jobForm.skills.split(',').map(s => s.trim())
      };
      await api.post('/jobs', formattedData);
      toast.success('Job deployed successfully!');
      setShowPostModal(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

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
    ? 'bg-[#0a0a25]/90 border-white/10 shadow-2xl backdrop-blur-2xl text-white' 
    : 'bg-white border-gray-200 shadow-2xl backdrop-blur-2xl text-[#05051a]';

  const inputClass = theme === 'dark'
    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20'
    : 'bg-gray-50 border-gray-200 text-[#05051a] placeholder:text-gray-400';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-6 lg:px-0 pt-10">
      <div className="flex flex-col gap-6">
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all w-fit px-4 py-2 rounded-xl
            ${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-[#05051a] hover:bg-gray-100'}`}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col">
            <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>
              {user?.role === 'recruiter' ? 'My Positions' : 'Opportunities'}
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-2 ${theme === 'dark' ? 'text-[#00E5FF]/60' : 'text-[#6366f1]'}`}>
              {user?.role === 'recruiter' ? 'Visual talent search & management' : 'Explore high-growth roles matched for you'}
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`relative flex-1 md:w-80 group border transition-all rounded-[1.5rem]
              ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-[#00E5FF]/50' : 'bg-white border-gray-200 focus-within:border-[#6366f1]'}`}>
              <Search size={16} className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors
                ${theme === 'dark' ? 'text-white/20 group-focus-within:text-[#00E5FF]' : 'text-gray-300 group-focus-within:text-[#6366f1]'}`} />
              <input 
                type="text" 
                placeholder="SEARCH POSITIONS..." 
                className={`w-full bg-transparent border-none outline-none pl-14 pr-6 py-5 text-[11px] font-black uppercase tracking-widest
                  ${theme === 'dark' ? 'text-white placeholder:text-white/10' : 'text-[#05051a] placeholder:text-gray-400'}`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchJobs(search)}
              />
            </div>
            
            {user?.role === 'candidate' && (
              <button 
                onClick={handleSemanticMatch}
                disabled={matching}
                className="flex items-center gap-3 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl text-[#06061c] bg-[#00E5FF] hover:scale-[1.02]"
              >
                {matching ? <span className="w-4 h-4 border-2 border-[#06061c]/20 border-t-[#06061c] rounded-full animate-spin" /> : <Zap size={14} fill="#06061c" />}
                AI Match
              </button>
            )}

            {user?.role === 'recruiter' && (
              <button 
                onClick={() => setShowPostModal(true)}
                className="flex items-center gap-3 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl text-white bg-[#6366f1] hover:scale-[1.02] hover:shadow-indigo-500/20"
              >
                <Plus size={14} /> Post Job
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
          title="No positions found" 
          description={user?.role === 'recruiter' ? "You haven't posted any jobs yet. Start by creating your first talent search." : "No matching opportunities found."} 
          action={user?.role === 'recruiter' && <button onClick={() => setShowPostModal(true)} className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF] hover:underline">Deploy Job Now</button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job, i) => (
            <motion.div 
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-[3rem] p-10 border transition-all duration-500 flex flex-col h-full relative group
                ${theme === 'dark' 
                  ? 'bg-gradient-to-br from-white/10 to-white/[0.02] border-white/5 hover:border-white/20' 
                  : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50 hover:border-[#00E5FF]/30'}`}
            >
              {job.semanticScore && (
                <div className="absolute top-8 right-8 px-4 py-1.5 bg-[#00E5FF] text-[#06061c] rounded-full text-[9px] font-black tracking-widest flex items-center gap-2 shadow-2xl shadow-cyan-500/40">
                  <Zap size={10} fill="#06061c" /> {job.semanticScore}% MATCH
                </div>
              )}
              
              <div className="flex gap-6 items-start mb-8">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl
                  ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
                  <Building size={28} className={theme === 'dark' ? 'text-[#00E5FF]/60' : 'text-gray-400'} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className={`text-lg font-black uppercase tracking-tight leading-[1.1] mb-2 pr-10 ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{job.title}</h3>
                  <p className="text-[10px] font-black text-[#6366f1] uppercase tracking-[0.2em]">{job.company}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest
                  ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/60' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                  <MapPin size={10} /> {job.location}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest
                  ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/60' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                  <Clock size={10} /> {job.type}
                </div>
              </div>

              <div className="mt-auto">
                <button 
                  onClick={() => navigate(user?.role === 'recruiter' ? `/dashboard/pipeline?job=${job._id}` : `/jobs/${job._id}`)}
                  className={`w-full flex items-center justify-center gap-2 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg
                  ${theme === 'dark' 
                    ? 'bg-white/10 text-white hover:bg-[#00E5FF] hover:text-[#06061c]' 
                    : 'bg-[#05051a] text-white hover:bg-[#6366f1]'}`}>
                  {user?.role === 'recruiter' ? 'Manage Pipeline' : 'View Details'} <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPostModal(false)} className="absolute inset-0 bg-[#06061c]/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-10 border ${glassClass}`}
            >
              <button onClick={() => setShowPostModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
              
              <div className="mb-8">
                <h2 className={`text-3xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>Deploy New Job</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configure your talent search parameters</p>
              </div>

              <form onSubmit={handlePostJob} className="space-y-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Company Name</label>
                  <div className="relative">
                    <Building size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required className={`w-full py-4 pl-12 pr-6 rounded-2xl border outline-none transition-all focus:ring-2 ring-[#6366f1]/20 ${inputClass}`} placeholder="e.g. Acme Corp" value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Job Title</label>
                    <input required className={`w-full py-4 px-6 rounded-2xl border outline-none transition-all focus:ring-2 ring-[#6366f1]/20 ${inputClass}`} placeholder="Senior Product Designer" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Location</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required className={`w-full py-4 pl-12 pr-6 rounded-2xl border outline-none transition-all focus:ring-2 ring-[#6366f1]/20 ${inputClass}`} placeholder="Remote / New York, NY" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Job Type</label>
                    <select className={`w-full py-4 px-6 rounded-2xl border outline-none transition-all ${inputClass}`} value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                      <option value="full-time">Full-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Experience</label>
                    <select className={`w-full py-4 px-6 rounded-2xl border outline-none transition-all ${inputClass}`} value={jobForm.level} onChange={e => setJobForm({...jobForm, level: e.target.value})}>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="lead">Lead / Principal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Min Salary (K)</label>
                    <div className="relative">
                      <DollarSign size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="number" className={`w-full py-4 pl-12 pr-6 rounded-2xl border outline-none transition-all ${inputClass}`} placeholder="120" value={jobForm.salary.min} onChange={e => setJobForm({...jobForm, salary: {...jobForm.salary, min: e.target.value}})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Job Description</label>
                  <textarea required rows="4" className={`w-full p-6 rounded-2xl border outline-none transition-all resize-none ${inputClass}`} placeholder="Explain the role and mission..." value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Key Skills (Comma separated)</label>
                  <div className="relative">
                    <Zap size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required className={`w-full py-4 pl-12 pr-6 rounded-2xl border outline-none transition-all ${inputClass}`} placeholder="React, Node.js, AI, UX Design" value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>Requirements (Comma separated)</label>
                  <div className="relative">
                    <ListChecks size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required className={`w-full py-4 pl-12 pr-6 rounded-2xl border outline-none transition-all ${inputClass}`} placeholder="5+ years exp, Portfolio, Communication" value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[#6366f1] text-white py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] hover:shadow-[0_20px_50px_rgba(99,102,241,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  {submitting ? <LoadingSpinner size={16} /> : <><Plus size={16} /> Deploy Position</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
