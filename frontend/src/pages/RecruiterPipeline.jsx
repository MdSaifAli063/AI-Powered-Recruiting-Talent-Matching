import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MoreHorizontal, User, Star, MapPin, Zap, ChevronRight } from 'lucide-react';
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
  const { user } = useAuth();
  const { theme } = useTheme();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    
    api.get(`/jobs?postedBy=${user._id}`)
      .then(res => {
        setJobs(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedJob(res.data.data[0]._id);
          fetchApplicants(res.data.data[0]._id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [user?._id]);

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
      toast.success('Talent moved successfully');
    } catch (err) {
      toast.error('Failed to update stage');
      fetchApplicants(selectedJob);
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const glassClass = theme === 'dark' 
    ? 'bg-white/5 border-white/5 shadow-2xl' 
    : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40';

  if (loading && !jobs.length) return <LoadingSpinner size={40} />;

  return (
    <div className="max-w-7xl mx-auto space-y-10 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between shrink-0">
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>Talent Pipeline</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>Visual hiring workflow optimization</p>
        </div>
        
        <div className="w-full md:w-80">
          <div className={`relative border transition-all rounded-2xl p-1
            ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/20'}`}>
            <select 
              className={`w-full bg-transparent border-none outline-none px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer
                ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}
              value={selectedJob || ''} 
              onChange={handleJobChange}
            >
              {jobs.map(j => <option key={j._id} value={j._id} className={theme === 'dark' ? 'bg-[#0a0a25]' : 'bg-white'}>{j.title}</option>)}
              {jobs.length === 0 && <option disabled>No active jobs</option>}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-10 custom-scrollbar flex-1 items-stretch">
        {STAGES.map(stage => {
          const columnApplicants = applicants.filter(a => a.status === stage.id);
          return (
            <div 
              key={stage.id} 
              className={`flex-1 min-w-[320px] flex flex-col rounded-[2.5rem] p-6 border transition-all duration-300 ${glassClass}`}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={allowDrop}
            >
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: stage.color, boxShadow: `0 0 12px ${stage.color}` }} />
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>
                    {stage.label}
                  </span>
                  <span className={`text-[10px] font-black ${theme === 'dark' ? 'text-white/20' : 'text-gray-300'}`}>{columnApplicants.length}</span>
                </div>
                <button className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'hover:bg-white/5 text-white/20' : 'hover:bg-gray-50 text-gray-300'}`}>
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 min-h-[200px]">
                {columnApplicants.map(app => (
                  <motion.div
                    key={app.candidate._id}
                    layoutId={app.candidate._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.candidate._id)}
                    className={`rounded-[2rem] p-5 cursor-grab active:cursor-grabbing border transition-all hover:scale-[1.02]
                      ${theme === 'dark' 
                        ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-[#00E5FF]/20' 
                        : 'bg-white border-gray-100 hover:shadow-xl hover:border-[#00E5FF]'}`}
                  >
                    <div className="flex gap-4 items-center mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg overflow-hidden flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#00E5FF,#6366f1)' }}>
                        {app.candidate.avatar ? (
                          <img src={app.candidate.avatar} className="w-full h-full object-cover" />
                        ) : (
                          app.candidate.name[0]
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black uppercase tracking-tight truncate ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{app.candidate.name}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest truncate ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{app.candidate.title || 'Strategist'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-dashed border-white/10">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 rounded-full">
                        <Zap size={10} fill="#00E5FF" />
                        <span className="text-[10px] font-black">{app.matchScore}%</span>
                      </div>
                      <button className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1
                        ${theme === 'dark' ? 'text-white/20 hover:text-white' : 'text-gray-400 hover:text-[#05051a]'}`}>
                        Full Profile <ChevronRight size={10} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {columnApplicants.length === 0 && (
                  <div className={`h-24 border-2 border-dashed rounded-[2rem] flex items-center justify-center
                    ${theme === 'dark' ? 'border-white/5' : 'border-gray-50'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 opacity-20">Drop Talent Here</span>
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
