import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, Zap, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState, Tag } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function JobListings() {
  const { user } = useAuth();
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Explore Roles</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="input-base pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchJobs(search)}
            />
          </div>
          {user?.role === 'candidate' && (
            <button 
              onClick={handleSemanticMatch}
              disabled={matching}
              className="btn-primary flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {matching ? <LoadingSpinner size={16} /> : <Zap size={16} />}
              AI Match
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <EmptyState 
          icon={Briefcase} 
          title="No jobs found" 
          description="Try adjusting your search terms." 
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job, i) => (
            <motion.div 
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 card-hover flex flex-col h-full relative"
            >
              {job.semanticScore && (
                <div className="absolute top-4 right-4 badge badge-green shadow-lg shadow-green-500/20">
                  {job.semanticScore}% Match
                </div>
              )}
              
              <div className="flex gap-4 items-start mb-4">
                <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center flex-shrink-0">
                  <Building size={20} className="text-white/60" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white/90 leading-tight mb-1 pr-16">{job.title}</h3>
                  <p className="text-sm text-white/50">{job.company}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Tag><MapPin size={12} className="inline mr-1"/>{job.location.split(',')[0]}</Tag>
                <Tag><Clock size={12} className="inline mr-1"/>{job.type}</Tag>
              </div>

              <p className="text-sm text-white/40 line-clamp-3 mb-6 flex-1">
                {job.description}
              </p>

              <div className="mt-auto">
                <Link to={`/jobs/${job._id}`} className="btn-secondary w-full justify-center">
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
