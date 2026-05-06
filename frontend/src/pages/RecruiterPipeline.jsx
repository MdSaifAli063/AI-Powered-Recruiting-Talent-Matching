import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MoreHorizontal, User, Star } from 'lucide-react';
import api from '../lib/api';
import { LoadingSpinner, SectionHeader } from '../components/ui/Cards';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'applied', label: 'Applied', color: 'bg-white/10 text-white/60' },
  { id: 'screening', label: 'Screening', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'offer', label: 'Offer', color: 'bg-amber-500/20 text-amber-400' },
  { id: 'hired', label: 'Hired', color: 'bg-green-500/20 text-green-400' }
];

export default function RecruiterPipeline() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs')
      .then(res => {
        setJobs(res.data.data);
        if (res.data.data.length > 0) {
          fetchApplicants(res.data.data[0]._id);
          setSelectedJob(res.data.data[0]._id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

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
    setSelectedJob(e.target.value);
    fetchApplicants(e.target.value);
  };

  const handleDragStart = (e, candidateId) => {
    e.dataTransfer.setData('candidateId', candidateId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    if (!candidateId) return;

    // Optimistic UI update
    setApplicants(prev => prev.map(a => 
      a.candidate._id === candidateId ? { ...a, status: newStatus } : a
    ));

    try {
      await api.patch(`/jobs/${selectedJob}/applicants/${candidateId}/status`, { status: newStatus });
      toast.success('Candidate moved successfully');
    } catch (err) {
      toast.error('Failed to update status');
      fetchApplicants(selectedJob); // Revert
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  if (loading && !jobs.length) return <LoadingSpinner size={40} />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <SectionHeader 
          title="Talent Pipeline" 
          subtitle="Drag and drop candidates to update their hiring stage."
        />
        <div className="w-full md:w-64">
          <select 
            className="input-base font-medium" 
            value={selectedJob || ''} 
            onChange={handleJobChange}
          >
            {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar flex-1">
        {STAGES.map(stage => {
          const columnApplicants = applicants.filter(a => a.status === stage.id);
          return (
            <div 
              key={stage.id} 
              className="flex-1 min-w-[280px] flex flex-col glass rounded-2xl p-4"
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={allowDrop}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-white/40 text-sm font-medium">{columnApplicants.length}</span>
                </div>
                <MoreHorizontal size={16} className="text-white/20" />
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {columnApplicants.map(app => (
                  <motion.div
                    key={app.candidate._id}
                    layoutId={app.candidate._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.candidate._id)}
                    className="glass-card p-4 cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                          {app.candidate.avatar ? (
                            <img src={app.candidate.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} className="text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{app.candidate.name}</p>
                          <p className="text-xs text-white/50 truncate max-w-[140px]">{app.candidate.title || 'Candidate'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <div className="flex gap-1 flex-wrap">
                        {app.candidate.skills?.slice(0, 2).map(s => (
                          <span key={s} className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/5">{s}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                        <Star size={10} className="text-indigo-400 fill-indigo-400" />
                        <span className="text-xs font-bold text-indigo-300">{app.matchScore}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
