import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import api from '../lib/api';
import { LoadingSpinner, SectionHeader, ScoreCircle, ProgressBar, Tag } from '../components/ui/Cards';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function SkillGapAnalyzer() {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) return toast.error('Please fill in both fields');
    if (!user?.skills?.length) return toast.error('Please add skills to your profile or analyze your resume first');

    setLoading(true);
    try {
      const { data } = await api.post('/ai/skill-gap', { jobTitle, jobDescription });
      setAnalysis(data.data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader 
        title="Skill Gap Analyzer" 
        subtitle="Compare your current skills with a target job description to get a personalized learning path."
      />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 glass rounded-2xl p-6 h-fit">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">Target Job Title</label>
              <input 
                type="text" 
                placeholder="e.g. Senior Frontend Engineer" 
                className="input-base"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">Job Description</label>
              <textarea 
                placeholder="Paste the full job description here..." 
                className="input-base min-h-[250px] resize-none"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !jobTitle || !jobDescription}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <LoadingSpinner size={16} /> : <><Search size={16}/> Analyze Gap</>}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-xs font-medium text-white/50 mb-3">Your Current Skills (from Profile)</h4>
            <div className="flex flex-wrap gap-2">
              {user?.skills?.length ? (
                user.skills.map(s => <Tag key={s}>{s}</Tag>)
              ) : (
                <span className="text-xs text-amber-400">No skills found. Please analyze your resume first.</span>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7">
          {!analysis && !loading && (
            <div className="glass rounded-2xl p-12 h-full flex flex-col items-center justify-center text-center border border-white/5 border-dashed">
              <TrendingUp size={48} className="text-indigo-400/30 mb-4" />
              <p className="text-white/60 font-medium">Ready to analyze</p>
              <p className="text-sm text-white/40 mt-2 max-w-sm">Enter a job title and description to see how your skills align and what you need to learn next.</p>
            </div>
          )}

          {loading && (
            <div className="glass rounded-2xl p-12 h-full flex flex-col items-center justify-center">
              <LoadingSpinner size={40} />
              <p className="text-sm text-white/60 mt-4 animate-pulse">Analyzing skill overlap and generating learning path...</p>
            </div>
          )}

          {analysis && !loading && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border border-indigo-500/20 glow-sm">
                <ScoreCircle score={analysis.overallReadiness} size={100} />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Readiness Score</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={18} className="text-green-400" />
                    <h3 className="text-sm font-semibold text-white">Matching Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchingSkills.map(s => <span key={s} className="badge badge-green">{s}</span>)}
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle size={18} className="text-red-400" />
                    <h3 className="text-sm font-semibold text-white">Missing Skills</h3>
                  </div>
                  <div className="space-y-3">
                    {analysis.missingSkills.map((s, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 text-sm">
                        <span className="text-white/80">{s.skill}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          s.priority === 'critical' ? 'bg-red-500/20 text-red-400' : 
                          s.priority === 'important' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/50'
                        }`}>{s.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <SectionHeader title="Recommended Learning Path" subtitle="Prioritized steps to bridge the gap" />
                <div className="space-y-4">
                  {analysis.learningPath.map((path, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl glass-light">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white">{path.skill}</h4>
                          <span className="text-xs text-white/40 border border-white/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <BookOpen size={10}/> {path.estimatedTime}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mb-3">{path.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {path.resources.map((res, j) => (
                            <span key={j} className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md">
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
