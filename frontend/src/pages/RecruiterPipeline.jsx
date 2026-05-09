import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MoreHorizontal, User, Star, MapPin, Zap, ChevronRight, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner, SectionHeader, Tag } from '../components/ui/Cards';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'applied', label: 'APPLIED', color: '#6366f1' },
  { id: 'screening', label: 'SCREENING', color: '#8b5cf6' },
  { id: 'interview', label: 'INTERVIEW', color: '#00E5FF' },
  { id: 'offer', label: 'OFFER', color: '#f59e0b' },
  { id: 'hired', label: 'HIRED', color: '#10b981' }
];

export default function RecruiterPipeline() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) {
      // If we are definitely not loading auth anymore but have no ID, stop loading
      setLoading(false);
      return;
    }
    
    api.get(`/jobs?postedBy=${userId}`)
      .then(res => {
        setJobs(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedJob(res.data.data[0]._id);
          fetchApplicants(res.data.data[0]._id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Pipeline jobs fetch failed:', err);
        setLoading(false);
      });
  }, [user?.id, user?._id]);

  const fetchApplicants = async (jobId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/jobs/${jobId}/applicants`);
      setApplicants(data.data);
    } catch (err) {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (e) => {
    const jobId = e.target.value;
    setSelectedJob(jobId);
    fetchApplicants(jobId);
  };

  const handleDragStart = (e, candidateId) => {
    e.dataTransfer.setData('candidateId', candidateId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    if (!candidateId) return;

    setApplicants(prev => prev.map(a => 
      a.candidate._id === candidateId ? { ...a, status: newStatus } : a
    ));

    try {
      await api.patch(`/jobs/${selectedJob}/applicants/${candidateId}/status`, { status: newStatus });
      
      if (newStatus === 'interview') {
        toast.success('Accepted! Message sent: "Get ready for the virtual interview"', { icon: '🤝', duration: 4000 });
      } else if (newStatus === 'rejected') {
        toast('Application rejected & candidate notified', { icon: '📁' });
      } else {
        toast.success('Talent moved successfully');
      }

      // Re-fetch to ensure we have the latest filtered view
      fetchApplicants(selectedJob);
    } catch (err) {
      toast.error('Failed to update stage');
      fetchApplicants(selectedJob);
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const glassClass = theme === 'dark' 
    ? 'bg-[#0a0a25]/60 border-white/5 shadow-2xl backdrop-blur-xl' 
    : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50 backdrop-blur-xl';

  if (loading && !jobs.length) return <LoadingSpinner size={40} />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 flex flex-col h-[calc(100vh-140px)] px-4 sm:px-0 pt-6">
      <div className="flex flex-col gap-6 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all w-fit px-4 py-2 rounded-xl
            ${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-[#05051a] hover:bg-gray-100'}`}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h1 className={`text-4xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1e1b4b]'}`} style={{ fontFamily: 'Outfit' }}>Talent Pipeline</h1>
            <p className={`text-[11px] font-bold uppercase tracking-[0.2em] mt-1.5 ${theme === 'dark' ? 'text-[#00E5FF]/60' : 'text-[#6366f1]'}`}>Visual hiring workflow optimization</p>
          </div>
          
          <div className="w-full md:w-80">
            <div className={`relative border transition-all rounded-2xl p-1
              ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50'}`}>
              <select 
                className={`w-full bg-transparent border-none outline-none px-4 py-3 text-[11px] font-black uppercase tracking-widest cursor-pointer
                  ${theme === 'dark' ? 'text-white' : 'text-[#1e1b4b]'}`}
                value={selectedJob || ''} 
                onChange={handleJobChange}
              >
                {jobs.map(j => <option key={j._id} value={j._id} className={theme === 'dark' ? 'bg-[#0a0a25]' : 'bg-white'}>{j.title}</option>)}
                {jobs.length === 0 && <option disabled>No active jobs</option>}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8 overflow-x-auto pb-12 custom-scrollbar flex-1 items-stretch">
        {STAGES.map(stage => {
          const columnApplicants = applicants.filter(a => a.status === stage.id);
          return (
            <div 
              key={stage.id} 
              className={`flex-1 min-w-[340px] flex flex-col rounded-[3rem] p-7 border transition-all duration-300 ${glassClass}
                ${theme === 'dark' ? 'hover:border-white/10' : 'hover:border-gray-200'}`}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={allowDrop}
            >
              <div className="flex items-center justify-between mb-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full relative z-10" style={{ background: stage.color }} />
                    <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-40" style={{ background: stage.color }} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[12px] font-black uppercase tracking-[0.25em] ${theme === 'dark' ? 'text-white' : 'text-[#1e1b4b]'}`}>
                      {stage.label}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
                      {columnApplicants.length} Candidates
                    </span>
                  </div>
                </div>
                <button className={`p-2.5 rounded-2xl transition-all ${theme === 'dark' ? 'hover:bg-white/5 text-white/20' : 'hover:bg-gray-50 text-gray-400'}`}>
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pr-3 min-h-[300px]">
                {columnApplicants.map(app => (
                  <motion.div
                    key={app.candidate._id}
                    layoutId={app.candidate._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.candidate._id)}
                    className={`rounded-[2.5rem] p-6 cursor-grab active:cursor-grabbing border transition-all hover:scale-[1.02] active:scale-[0.98]
                      ${theme === 'dark' 
                        ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-[#00E5FF]/30 shadow-2xl' 
                        : 'bg-white border-gray-100 hover:shadow-2xl shadow-gray-200/40 hover:border-[#6366f1]/30'}`}
                  >
                    <div className="flex gap-5 items-center mb-5">
                      <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white text-base font-black shadow-2xl overflow-hidden flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#00E5FF,#6366f1)' }}>
                        {app.candidate.avatar ? (
                          <img src={app.candidate.avatar} className="w-full h-full object-cover" />
                        ) : (
                          app.candidate.name[0]
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-black uppercase tracking-tight truncate mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-[#1e1b4b]'}`}>{app.candidate.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest truncate ${theme === 'dark' ? 'text-white/40' : 'text-[#6366f1]'}`}>{app.candidate.title || 'Strategist'}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button 
                          onClick={() => handleDrop({ preventDefault: () => {}, dataTransfer: { getData: () => app.candidate._id } }, 'interview')}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          title="Accept for Interview"
                        >
                          <Star size={12} fill="currentColor" />
                        </button>
                        <button 
                          onClick={() => handleDrop({ preventDefault: () => {}, dataTransfer: { getData: () => app.candidate._id } }, 'rejected')}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Reject Application"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between pt-5 border-t border-dashed ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${theme === 'dark' ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20' : 'bg-[#6366f1]/5 text-[#6366f1] border-[#6366f1]/20'}`}>
                        <Zap size={11} fill="currentColor" />
                        <span className="text-[11px] font-black">{app.matchScore}% Match</span>
                      </div>
                      <button className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors
                        ${theme === 'dark' ? 'text-white/30 hover:text-[#00E5FF]' : 'text-gray-400 hover:text-[#6366f1]'}`}>
                        Profile <ChevronRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {columnApplicants.length === 0 && (
                  <div className={`h-40 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-3 transition-all
                    ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/30'}`}>
                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                      <User size={16} className={theme === 'dark' ? 'text-white/20' : 'text-gray-300'} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/20' : 'text-gray-400'}`}>Drop Talent Here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
