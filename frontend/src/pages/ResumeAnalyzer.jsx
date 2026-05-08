import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { ScoreCircle, ProgressBar, SectionHeader, LoadingSpinner, SkillTag } from '../components/ui/Cards';
import { useAuth } from '../context/AuthContext';

export default function ResumeAnalyzer() {
  const { user, fetchMe } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [textInput, setTextInput] = useState('');

  const loadResume = useCallback(async () => {
    try {
      const { data } = await api.get('/resume/me');
      setResume(data.data);
    } catch (err) {
      if (err.response?.status !== 404) console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResume(); }, [loadResume]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(data.message);
      await loadResume();
      await fetchMe();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [loadResume, fetchMe]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  const handleTextUpload = async () => {
    if (!textInput.trim()) return toast.error('Please paste your resume text');
    setUploading(true);
    try {
      await api.post('/resume/upload', { resumeText: textInput });
      toast.success('Text saved successfully');
      setTextInput('');
      await loadResume();
      await fetchMe();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.post('/resume/analyze');
      toast.success('Analysis complete!');
      setResume(data.data);
      
      // Dispatch real-time notification
      window.dispatchEvent(new CustomEvent('add-notification', {
        detail: {
          title: 'Resume Analyzed',
          desc: `AI successfully analyzed your resume. Overall score: ${data.data.scores?.overall || 0}%`,
          color: '#00E5FF'
        }
      }));
      
      await fetchMe();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner size={40} />;

  const needsAnalysis = resume && !resume.isAnalyzed;
  const analysis = resume?.isAnalyzed ? resume : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <SectionHeader 
        title="Resume Analyzer" 
        subtitle="Upload your resume to extract skills and get AI feedback" 
      />

      {/* Upload Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div 
          {...getRootProps()} 
          className={`glass rounded-2xl p-8 text-center border-2 border-dashed cursor-pointer transition-all ${
            isDragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/10 hover:border-white/30'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud size={40} className={`mx-auto mb-4 ${isDragActive ? 'text-indigo-400' : 'text-white/40'}`} />
          <h3 className="text-sm font-semibold text-white mb-1">Upload File</h3>
          <p className="text-xs text-white/50 mb-4">Drag & drop PDF, DOCX, TXT. Max 10MB.</p>
          <button className="btn-secondary pointer-events-none text-xs py-2 px-4">Browse Files</button>
        </div>

        <div className="glass rounded-2xl p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-2">Or paste text</h3>
          <textarea 
            className="input-base flex-1 min-h-[100px] mb-3 resize-none text-xs" 
            placeholder="Paste your resume content here..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
          />
          <button 
            onClick={handleTextUpload} 
            disabled={uploading || !textInput.trim()}
            className="btn-primary w-full justify-center text-xs py-2.5"
          >
            {uploading ? <LoadingSpinner size={14} /> : 'Save Text'}
          </button>
        </div>
      </div>

      {resume && (
        <div className="glass rounded-2xl p-4 flex items-center justify-between border border-indigo-500/30">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-indigo-400" />
            <div>
              <p className="text-sm font-medium text-white">{resume.fileName || 'Pasted Text'}</p>
              <p className="text-xs text-white/40">
                {resume.isAnalyzed ? 'Analyzed' : 'Ready for analysis'} · {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button 
            onClick={handleAnalyze} 
            disabled={analyzing}
            className={`btn-primary px-6 ${!resume.isAnalyzed ? 'animate-pulse' : ''}`}
          >
            {analyzing ? <LoadingSpinner size={16} /> : <><Zap size={16}/> {resume.isAnalyzed ? 'Re-Analyze' : 'Analyze Now'}</>}
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center glow-sm">
              <ScoreCircle score={analysis.scores?.overall || 0} size={120} />
              <h3 className="text-lg font-bold text-white mt-4">Overall Score</h3>
              <p className="text-sm text-white/60 mt-1 max-w-[200px]">{analysis.feedback?.summary}</p>
            </div>
            
            <div className="md:col-span-2 glass rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white mb-4">Dimension Scores</h3>
              <ProgressBar label="Skill Depth" value={analysis.scores?.skillDepth || 0} color="#8b5cf6" />
              <ProgressBar label="Project Complexity" value={analysis.scores?.projectComplexity || 0} color="#6366f1" />
              <ProgressBar label="Career Growth" value={analysis.scores?.careerGrowth || 0} color="#a78bfa" />
              <ProgressBar label="Communication" value={analysis.scores?.communicationClarity || 0} color="#4ade80" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-green-400" />
                <h3 className="text-sm font-semibold text-white">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {analysis.feedback?.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                    <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Areas to Improve</h3>
              </div>
              <ul className="space-y-2">
                {analysis.feedback?.improvements?.map((s, i) => (
                  <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Extracted Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.parsedData?.technicalSkills?.map((s, i) => <SkillTag key={`tech-${i}`} skill={s} level="expert" />)}
              {analysis.parsedData?.softSkills?.map((s, i) => <SkillTag key={`soft-${i}`} skill={s} level="proficient" />)}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
