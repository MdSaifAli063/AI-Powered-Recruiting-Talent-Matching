import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock, Building, ArrowLeft, CheckCircle2, Cpu } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner, Tag, SectionHeader } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.data);
        if (user?.role === 'candidate') {
          const isApplied = user.appliedJobs?.some(j => j._id === id || j === id);
          setApplied(isApplied);
        }
      } catch (err) {
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const { data } = await api.post(`/jobs/${id}/apply`);
      setApplied(true);
      toast.success('Application submitted successfully!');
      
      // Dispatch real-time notification
      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          title: 'Application Submitted',
          desc: `You successfully applied for ${job.title} at ${job.company}`,
          color: '#00E5FF'
        }
      }));

      if (data.matchScore) {
        toast(`AI Match Score: ${data.matchScore}%`, { icon: '🤖' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const checkMatch = async () => {
    try {
      const { data } = await api.post('/resume/match-job', { jobId: id });
      
      if (!data.success) {
        return toast.error(data.message || 'Please analyze your resume first');
      }

      setMatchData(data.data);
      
      // Dispatch real-time notification
      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          title: 'AI Match Complete',
          desc: `Your resume matched ${data.data.matchScore}% for ${job.title}`,
          color: '#f59e0b'
        }
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please analyze your resume first');
    }
  };

  if (loading) return <LoadingSpinner size={40} />;
  if (!job) return <div className="text-center py-20 text-white/50">Job not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all w-fit px-4 py-2 rounded-xl mb-4
          ${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-[#05051a] hover:bg-gray-100'}`}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-8 relative overflow-hidden ${theme === 'dark' ? 'glass' : 'bg-white shadow-xl border border-gray-100'}`}
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex gap-6 items-start">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg
              ${theme === 'dark' ? 'bg-white/[0.03] border border-white/5 text-white/50' : 'bg-indigo-50 border border-indigo-100 text-[#6366f1]'}`}
            >
              <Building size={28} />
            </div>
            <div>
              <h1 className={`text-3xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{job.title}</h1>
              <p className={`text-base font-medium mb-5 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>{job.company}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                  <MapPin size={14} /> {job.location}
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                  <Briefcase size={14} /> {job.level}
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                  <Clock size={14} /> {job.type}
                </div>
              </div>
            </div>
          </div>

          {user?.role === 'candidate' && (
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
              <button 
                onClick={handleApply}
                disabled={applied || applying}
                className={`flex items-center gap-2 justify-center py-3 px-8 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${applied 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                    : theme === 'dark' 
                      ? 'bg-[#00E5FF] text-[#05051a] hover:bg-[#00E5FF]/90 shadow-lg shadow-cyan-500/20' 
                      : 'bg-[#6366f1] text-white hover:bg-[#6366f1]/90 shadow-lg shadow-indigo-500/20'}`}
              >
                {applying ? <LoadingSpinner size={16} /> : applied ? <><CheckCircle2 size={16}/> Applied</> : 'Apply Now'}
              </button>
              {!applied && (
                <button 
                  onClick={checkMatch} 
                  className={`flex items-center gap-2 justify-center py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all border
                    ${theme === 'dark' ? 'bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white' : 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#05051a]'}`}
                >
                  <Cpu size={16} /> Check AI Match
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {matchData && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`rounded-3xl p-6 border glow-sm
            ${theme === 'dark' ? 'glass border-indigo-500/30' : 'bg-white shadow-xl border-indigo-100 shadow-indigo-100'}`}
        >
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center flex-shrink-0
              ${theme === 'dark' ? 'border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]' : 'border-indigo-200 bg-indigo-50 text-[#6366f1]'}`}
            >
              <span className="font-black">{matchData.matchScore}%</span>
            </div>
            <div>
              <h3 className={`font-black uppercase tracking-widest text-sm ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>AI Semantic Match</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>{matchData.recommendation}</p>
            </div>
          </div>
          <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>{matchData.explanation}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Strengths</h4>
              <ul className="space-y-2">
                {matchData.strengths.map((s, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    <span className="text-emerald-500 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Gap Areas</h4>
              <ul className="space-y-2">
                {matchData.gaps.map((g, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    <span className="text-amber-500 mt-0.5">•</span> {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            className={`rounded-3xl p-8 ${theme === 'dark' ? 'glass' : 'bg-white shadow-lg border border-gray-100'}`}
          >
            <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>About the Role</h3>
            <div className={`prose max-w-none text-sm whitespace-pre-wrap leading-relaxed ${theme === 'dark' ? 'prose-invert text-white/60' : 'text-gray-600'}`}>
              {job.description}
            </div>
          </motion.div>

          {(job.responsibilities?.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
              className={`rounded-3xl p-8 ${theme === 'dark' ? 'glass' : 'bg-white shadow-lg border border-gray-100'}`}
            >
              <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>Responsibilities</h3>
              <ul className="space-y-3 mt-4">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    <span className={`mt-0.5 text-lg leading-none ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>•</span> {r}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} 
            className={`rounded-3xl p-8 ${theme === 'dark' ? 'glass' : 'bg-white shadow-lg border border-gray-100'}`}
          >
            <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>Required Skills</h3>
            <div className="flex flex-wrap gap-2 mt-4">
              {job.skills?.map(s => (
                <span key={s} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border
                  ${theme === 'dark' ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}
                >
                  {s}
                </span>
              ))}
            </div>
          </motion.div>

          {(job.requirements?.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} 
              className={`rounded-3xl p-8 ${theme === 'dark' ? 'glass' : 'bg-white shadow-lg border border-gray-100'}`}
            >
              <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>Requirements</h3>
              <ul className="space-y-3 mt-4">
                {job.requirements.map((r, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                    <span className={`mt-0.5 text-lg leading-none ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>•</span> {r}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {(job.salary?.min || job.salary?.max) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
              className={`rounded-3xl p-8 ${theme === 'dark' ? 'glass' : 'bg-white shadow-lg border border-gray-100'}`}
            >
              <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>Compensation</h3>
              <div className="mt-4">
                <p className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>
                  {job.salary.min ? `$${(job.salary.min/1000).toFixed(0)}k` : ''} 
                  {job.salary.max ? ` - $${(job.salary.max/1000).toFixed(0)}k` : ''}
                </p>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                  {job.salary.currency || 'USD'} / year
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
