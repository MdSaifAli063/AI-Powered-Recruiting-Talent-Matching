import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, CheckCircle, RefreshCw, Copy, Check } from 'lucide-react';
import api from '../lib/api';
import { LoadingSpinner, SectionHeader, ScoreCircle } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function BiasDetector() {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return toast.error('Please enter a job description');
    
    setLoading(true);
    try {
      const { data } = await api.post('/ai/bias-detect', { jobDescription });
      setAnalysis(data.data);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(analysis.rewrittenDescription);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityColor = (sev) => {
    if (sev === 'high') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (sev === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <SectionHeader 
        title="Job Description Bias Detector" 
        subtitle="Identify and remove exclusionary language from your job postings to attract diverse talent."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="glass rounded-2xl p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-white">Original Description</h3>
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !jobDescription}
              className="btn-primary text-xs py-1.5 px-4"
            >
              {loading ? <LoadingSpinner size={14} /> : <><Shield size={14}/> Analyze</>}
            </button>
          </div>
          <textarea 
            className="input-base flex-1 min-h-[400px] resize-none font-mono text-xs leading-relaxed"
            placeholder="Paste your job description here..."
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col h-full">
          {!analysis && !loading && (
            <div className="glass rounded-2xl p-12 flex-1 flex flex-col items-center justify-center text-center border border-white/5 border-dashed">
              <ShieldAlert size={48} className="text-indigo-400/30 mb-4" />
              <p className="text-white/60 font-medium">Ready to scan</p>
              <p className="text-sm text-white/40 mt-2 max-w-xs">Paste a JD and click Analyze to detect gendered, ageist, or culturally biased language.</p>
            </div>
          )}

          {loading && (
            <div className="glass rounded-2xl p-12 flex-1 flex flex-col items-center justify-center">
              <LoadingSpinner size={40} />
              <p className="text-sm text-white/60 mt-4 animate-pulse">Scanning for biased language patterns...</p>
            </div>
          )}

          {analysis && !loading && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full flex flex-col">
              <div className="glass rounded-2xl p-6 flex items-center gap-6 shrink-0 border border-indigo-500/20">
                <ScoreCircle score={analysis.biasScore} size={80} />
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Inclusivity Score</h3>
                  <p className="text-sm text-white/60">{analysis.overallAssessment}</p>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 shrink-0 max-h-[300px] overflow-y-auto custom-scrollbar">
                <h3 className="text-sm font-semibold text-white mb-4">Detected Issues</h3>
                {analysis.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                    <CheckCircle size={16}/> No significant bias detected!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysis.issues.map((issue, i) => (
                      <div key={i} className="glass-light rounded-xl p-4 border border-white/5">
                        <div className="flex items-start justify-between mb-2 gap-4">
                          <p className="text-sm font-medium text-red-400 line-through">"{issue.phrase}"</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getSeverityColor(issue.severity)}`}>
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mb-2">{issue.explanation}</p>
                        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                          <RefreshCw size={12}/> Suggestion: <span className="font-medium text-white">{issue.suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-6 flex flex-col flex-1 min-h-[250px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-white">Rewritten Neutral Description</h3>
                  <button onClick={copyToClipboard} className="btn-secondary text-xs py-1 px-3">
                    {copied ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy</>}
                  </button>
                </div>
                <div className="flex-1 glass-light rounded-xl p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                  {analysis.rewrittenDescription}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
