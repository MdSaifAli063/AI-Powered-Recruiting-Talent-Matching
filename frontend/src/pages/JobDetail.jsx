import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Building, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
      setMatchData(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please analyze your resume first');
    }
  };

  if (loading) return <LoadingSpinner size={40} />;
  if (!job) return <div className="text-center py-20 text-white/50">Job not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all w-fit px-4 py-2 rounded-xl mb-4
          ${theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-[#05051a] hover:bg-gray-100'}`}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-3xl pointer-events-none">
          <div className="w-64 h-64 bg-indigo-500 rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex gap-5 items-start">
            <div className="w-16 h-16 rounded-2xl glass-light flex items-center justify-center flex-shrink-0">
              <Building size={32} className="text-white/70" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
              <p className="text-lg text-white/60 mb-4">{job.company}</p>
              <div className="flex flex-wrap gap-3">
                <Tag><MapPin size={14} className="inline mr-1.5"/>{job.location}</Tag>
                <Tag><Briefcase size={14} className="inline mr-1.5"/>{job.level}</Tag>
                <Tag><Clock size={14} className="inline mr-1.5"/>{job.type}</Tag>
              </div>
            </div>
          </div>

          {user?.role === 'candidate' && (
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button 
                onClick={handleApply}
                disabled={applied || applying}
                className={`btn-primary justify-center py-3 px-8 ${applied ? 'opacity-100 bg-green-500 hover:bg-green-500' : ''}`}
                style={applied ? { background: '#10b981' } : {}}
              >
                {applying ? <LoadingSpinner size={18} /> : applied ? <><CheckCircle2 size={18}/> Applied</> : 'Apply Now'}
              </button>
              {!applied && (
                <button onClick={checkMatch} className="btn-secondary justify-center py-3">
                  Check AI Match
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {matchData && (
        <div className="glass rounded-2xl p-6 border border-indigo-500/30 glow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-indigo-400">{matchData.matchScore}%</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Semantic Match</h3>
              <p className="text-sm text-white/50">{matchData.recommendation.toUpperCase()}</p>
            </div>
          </div>
          <p className="text-sm text-white/80 mb-4">{matchData.explanation}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-light p-4 rounded-xl">
              <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Strengths</h4>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                {matchData.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="glass-light p-4 rounded-xl">
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Gaps</h4>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                {matchData.gaps.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <SectionHeader title="About the Role" />
            <div className="prose prose-invert max-w-none text-white/70 text-sm whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {(job.responsibilities?.length > 0) && (
            <div className="glass rounded-2xl p-6">
              <SectionHeader title="Responsibilities" />
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                {job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <SectionHeader title="Required Skills" />
            <div className="flex flex-wrap gap-2">
              {job.skills?.map(s => <span key={s} className="badge badge-brand">{s}</span>)}
            </div>
          </div>

          {(job.requirements?.length > 0) && (
            <div className="glass rounded-2xl p-6">
              <SectionHeader title="Requirements" />
              <ul className="list-disc list-inside text-sm text-white/70 space-y-2">
                {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {(job.salary?.min || job.salary?.max) && (
            <div className="glass rounded-2xl p-6">
              <SectionHeader title="Compensation" />
              <p className="text-xl font-bold text-white">
                {job.salary.min ? `$${(job.salary.min/1000).toFixed(0)}k` : ''} 
                {job.salary.max ? ` - $${(job.salary.max/1000).toFixed(0)}k` : ''}
              </p>
              <p className="text-xs text-white/40">{job.salary.currency || 'USD'} / year</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
