import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Mail, Zap, Star, Filter, Send, X, Copy, Check } from 'lucide-react';
import api from '../lib/api';
import { LoadingSpinner, EmptyState, Tag, ScoreCircle } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [outreachRole, setOutreachRole] = useState('');
  const [outreachTone, setOutreachTone] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [outreachData, setOutreachData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/candidates?search=${query}`);
      setCandidates(data.data);
    } catch (err) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutreach = async () => {
    if (!outreachRole.trim()) return toast.error('Please enter a target role');
    setGenerating(true);
    try {
      const { data } = await api.post('/ai/outreach', {
        candidateId: selectedCandidate._id,
        jobTitle: outreachRole,
        tone: outreachTone
      });
      setOutreachData(data.data);
    } catch (err) {
      toast.error('Failed to generate outreach');
    } finally {
      setGenerating(false);
    }
  };

  const copyOutreach = () => {
    navigator.clipboard.writeText(`${outreachData.subject}\n\n${outreachData.message}`);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Candidate Pool</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search by name, skill, or title..." 
              className="input-base pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchCandidates(search)}
            />
          </div>
          <button className="btn-secondary px-3"><Filter size={16}/></button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-2">
          {loading ? <LoadingSpinner size={32} /> : candidates.length === 0 ? (
            <EmptyState title="No candidates found" description="Try adjusting your search filters" />
          ) : (
            candidates.map((c, i) => (
              <motion.div 
                key={c._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedCandidate(c); setOutreachData(null); }}
                className={`glass rounded-2xl p-5 card-hover cursor-pointer border ${selectedCandidate?._id === c._id ? 'border-indigo-500 bg-indigo-500/5' : 'border-transparent'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover"/> : <span className="w-full h-full flex items-center justify-center text-white font-bold">{c.name[0]}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-base font-bold text-white truncate">{c.name}</h3>
                        <p className="text-sm text-white/60 truncate">{c.title || 'Candidate'}</p>
                      </div>
                      <div className="flex items-center gap-1.5 glass-light px-2.5 py-1 rounded-lg">
                        <Star size={12} className={c.profileScore >= 80 ? 'text-green-400 fill-green-400' : 'text-indigo-400 fill-indigo-400'}/>
                        <span className="text-sm font-bold" style={{ color: c.profileScore >= 80 ? '#4ade80' : '#818cf8' }}>{c.profileScore || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                      {c.location && <span className="flex items-center gap-1"><MapPin size={12}/>{c.location}</span>}
                      {c.company && <span className="flex items-center gap-1"><Briefcase size={12}/>{c.company}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
                      {c.skills?.slice(0, 5).map(s => <Tag key={s}>{s}</Tag>)}
                      {c.skills?.length > 5 && <span className="text-xs text-white/30 self-center">+{c.skills.length - 5}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Action Panel */}
        <div className="h-[calc(100vh-140px)] sticky top-6">
          {selectedCandidate ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl flex flex-col h-full overflow-hidden border border-indigo-500/20">
              <div className="p-5 border-b border-white/10 flex justify-between items-start glass-light">
                <div>
                  <h3 className="font-bold text-white">{selectedCandidate.name}</h3>
                  <p className="text-xs text-white/50">{selectedCandidate.email}</p>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="text-white/30 hover:text-white"><X size={16}/></button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-indigo-400"/> AI Outreach Generator
                  </h4>
                  <div className="space-y-3">
                    <input 
                      className="input-base" placeholder="Target Role (e.g. Frontend Dev)"
                      value={outreachRole} onChange={e => setOutreachRole(e.target.value)}
                    />
                    <select className="input-base appearance-none" value={outreachTone} onChange={e => setOutreachTone(e.target.value)}>
                      <option value="professional">Professional Tone</option>
                      <option value="friendly">Friendly & Warm Tone</option>
                      <option value="persuasive">Persuasive Tone</option>
                    </select>
                    <button onClick={handleGenerateOutreach} disabled={generating || !outreachRole} className="btn-primary w-full justify-center py-2.5 text-sm">
                      {generating ? <LoadingSpinner size={14}/> : <><Mail size={14}/> Generate Message</>}
                    </button>
                  </div>
                </div>

                {outreachData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Generated Draft</h4>
                      <button onClick={copyOutreach} className="text-xs text-indigo-400 flex items-center gap-1 hover:text-indigo-300">
                        {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="glass-light p-4 rounded-xl border border-white/5 text-sm">
                      <p className="font-semibold text-white mb-2 pb-2 border-b border-white/10">Subject: {outreachData.subject}</p>
                      <div className="text-white/70 whitespace-pre-wrap">{outreachData.message}</div>
                    </div>
                    
                    {outreachData.linkedinVersion && (
                      <div className="glass-light p-4 rounded-xl border border-white/5 text-sm">
                        <p className="font-semibold text-blue-400 mb-2 pb-2 border-b border-white/10">LinkedIn InMail Version</p>
                        <div className="text-white/70 whitespace-pre-wrap">{outreachData.linkedinVersion}</div>
                      </div>
                    )}
                  </motion.div>
                )}

                {!outreachData && (
                  <div>
                     <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Profile Info</h4>
                     <p className="text-sm text-white/70 mb-4">{selectedCandidate.bio || 'No bio provided.'}</p>
                     <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills?.map(s => <span key={s} className="badge badge-brand">{s}</span>)}
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="glass rounded-2xl h-full flex flex-col items-center justify-center text-center p-8 border border-white/5 border-dashed">
              <div className="w-16 h-16 rounded-2xl glass-light flex items-center justify-center mb-4">
                <Send size={24} className="text-white/20"/>
              </div>
              <p className="text-white/60 font-medium">Select a candidate</p>
              <p className="text-sm text-white/35 mt-2">Click on any candidate card to view their profile and generate personalized AI outreach messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
