import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Mail, Zap, Star, Filter, Send, X, Copy, Check } from 'lucide-react';
import api from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner, EmptyState, Tag, ScoreCircle } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function CandidatesPage() {
  const { theme } = useTheme();
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

  const glassClass = theme === 'dark' 
    ? 'bg-gradient-to-br from-white/[0.08] to-transparent border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all' 
    : 'bg-white border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>Talent Sourcing</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>Intelligent candidate exploration engine</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className={`relative flex-1 md:w-96 rounded-2xl border transition-all p-1
            ${theme === 'dark' ? 'bg-white/5 border-white/10 focus-within:border-[#00E5FF]/50' : 'bg-white border-gray-100 shadow-lg focus-within:border-[#00E5FF]'}`}>
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-white/20' : 'text-gray-300'}`} />
            <input 
              type="text" 
              placeholder="Search talent..." 
              className={`w-full bg-transparent border-none outline-none pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-widest
                ${theme === 'dark' ? 'text-white placeholder:text-white/10' : 'text-[#05051a] placeholder:text-gray-300'}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchCandidates(search)}
            />
          </div>
          <button className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40 hover:text-[#00E5FF]' : 'bg-white border-gray-100 text-gray-400 hover:text-[#05051a] shadow-lg'}`}>
            <Filter size={18}/>
          </button>
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
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedCandidate(c); setOutreachData(null); }}
                className={`rounded-[2.5rem] p-6 cursor-pointer border transition-all group relative overflow-hidden
                  ${selectedCandidate?._id === c._id 
                    ? (theme === 'dark' ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-[#00E5FF] bg-[#00E5FF]/5 shadow-xl shadow-[#00E5FF]/10') 
                    : glassClass + ' hover:scale-[1.01]'}`}
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-3xl overflow-hidden flex-shrink-0 shadow-2xl relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF] to-[#6366f1] opacity-20" />
                    {c.avatar ? (
                      <img src={c.avatar} alt="" className="w-full h-full object-cover relative z-10"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-black relative z-10" style={{ background: 'linear-gradient(135deg,#00E5FF,#6366f1)' }}>
                        {c.name[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className={`text-lg font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{c.name}</h3>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{c.title || 'Strategist'}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all
                        ${theme === 'dark' ? 'bg-white/5 border-white/10 text-[#00E5FF]' : 'bg-gray-50 border-gray-100 text-[#6366f1]'}`}>
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-black">{c.profileScore || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mb-4 text-[10px] font-black uppercase tracking-widest">
                      {c.location && (
                        <span className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white/20' : 'text-gray-400'}`}>
                          <MapPin size={14} className="text-[#00E5FF]" /> {c.location}
                        </span>
                      )}
                      {c.company && (
                        <span className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white/20' : 'text-gray-400'}`}>
                          <Briefcase size={14} className="text-[#6366f1]" /> {c.company}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {c.skills?.slice(0, 6).map(s => (
                        <span key={s} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all
                          ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/40 group-hover:text-white group-hover:border-white/10' : 'bg-gray-50 border-gray-100 text-gray-400 group-hover:text-[#05051a]'}`}>
                          {s}
                        </span>
                      ))}
                      {c.skills?.length > 6 && <span className="text-[9px] font-black text-gray-300 self-center opacity-30">+{c.skills.length - 6} More</span>}
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
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className={`rounded-[3rem] flex flex-col h-full overflow-hidden border ${glassClass}`}
            >
              <div className={`p-8 border-b flex justify-between items-start ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-gray-50 bg-gray-50/50'}`}>
                <div>
                  <h3 className={`text-xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{selectedCandidate.name}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{selectedCandidate.email}</p>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)} 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${theme === 'dark' ? 'hover:bg-white/5 text-white/20' : 'hover:bg-gray-100 text-gray-300'}`}
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>AI Outreach Engine</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`rounded-2xl border p-1 transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-[#00E5FF]/50' : 'bg-white border-gray-100 focus-within:border-[#00E5FF]'}`}>
                      <input 
                        className={`w-full bg-transparent border-none outline-none px-4 py-3 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}
                        placeholder="Target Role (e.g. Lead Dev)"
                        value={outreachRole} 
                        onChange={e => setOutreachRole(e.target.value)}
                      />
                    </div>
                    
                    <div className={`rounded-2xl border p-1 transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-[#00E5FF]/50' : 'bg-white border-gray-100 focus-within:border-[#00E5FF]'}`}>
                      <select 
                        className={`w-full bg-transparent border-none outline-none px-4 py-3 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}
                        value={outreachTone} 
                        onChange={e => setOutreachTone(e.target.value)}
                      >
                        <option value="professional" className={theme === 'dark' ? 'bg-[#0a0a25]' : 'bg-white'}>Professional Tone</option>
                        <option value="friendly" className={theme === 'dark' ? 'bg-[#0a0a25]' : 'bg-white'}>Friendly Tone</option>
                        <option value="persuasive" className={theme === 'dark' ? 'bg-[#0a0a25]' : 'bg-white'}>Persuasive Tone</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleGenerateOutreach} 
                      disabled={generating || !outreachRole} 
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3
                        ${generating || !outreachRole 
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                          : 'bg-[#00E5FF] text-[#06061c] shadow-[0_10px_20px_rgba(0,229,255,0.2)] hover:scale-[1.02]'}`}
                    >
                      {generating ? <LoadingSpinner size={14}/> : <><Mail size={16}/> Draft Intelligence</>}
                    </button>
                  </div>
                </div>

                {outreachData && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-10 border-t border-dashed border-white/10">
                    <div className="flex justify-between items-center">
                      <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>Generated Narrative</h4>
                      <button 
                        onClick={copyOutreach} 
                        className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF] flex items-center gap-2 hover:underline"
                      >
                        {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'Secured' : 'Clone text'}
                      </button>
                    </div>
                    
                    <div className={`rounded-3xl p-6 border text-xs leading-relaxed ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white/70' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                      <p className={`font-black uppercase tracking-widest mb-4 pb-4 border-b ${theme === 'dark' ? 'border-white/5 text-white' : 'border-gray-200 text-[#05051a]'}`}>
                        Subject: {outreachData.subject}
                      </p>
                      <div className="whitespace-pre-wrap">{outreachData.message}</div>
                    </div>
                  </motion.div>
                )}

                {!outreachData && (
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>Expertise Overview</h4>
                        <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>{selectedCandidate.bio || 'Strategic professional profile pending detailed summary.'}</p>
                     </div>
                     <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills?.map(s => (
                        <span key={s} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-[#6366f1]/10 text-[#6366f1]' : 'bg-indigo-50 text-[#6366f1]'}`}>
                          {s}
                        </span>
                      ))}
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className={`rounded-[3rem] h-full flex flex-col items-center justify-center text-center p-12 border border-dashed transition-all
              ${theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all
                ${theme === 'dark' ? 'bg-white/5 text-white/10' : 'bg-white text-gray-100 shadow-xl'}`}>
                <Send size={32} />
              </div>
              <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>Intelligence Selection</h3>
              <p className={`text-[11px] font-medium leading-relaxed max-w-[200px] ${theme === 'dark' ? 'text-white/20' : 'text-gray-400'}`}>
                Click on a candidate to initialize AI outreach protocols and analyze performance metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
