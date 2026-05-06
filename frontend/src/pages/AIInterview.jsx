import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Award, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, ScoreCircle, SectionHeader } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function AIInterview() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadInterviews = async () => {
    try {
      const { data } = await api.get('/interview/my');
      setInterviews(data.data);
    } catch (err) {
      toast.error('Failed to load interviews');
    }
  };

  const startInterview = async () => {
    const jobTitle = prompt('What role are you interviewing for? (e.g. Frontend Engineer)');
    if (!jobTitle) return;

    setLoading(true);
    try {
      const { data } = await api.post('/interview/start', { jobTitle });
      setSession(data.data);
      setMessages([{ role: 'assistant', content: data.data.message }]);
      toast.success('Interview started!');
    } catch (err) {
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const resumeInterview = async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/interview/${id}`);
      setSession({ interviewId: data.data._id, jobTitle: data.data.jobTitle });
      setMessages(data.data.messages.filter(m => m.role !== 'system'));
    } catch (err) {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSending(true);

    try {
      const { data } = await api.post(`/interview/${session.interviewId}/respond`, { message: userMsg });
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.message }]);
      
      if (data.data.isComplete) {
        toast.success('Interview complete! Generating report...');
        if (data.data.report) {
          setSession(s => ({ ...s, report: data.data.report, isComplete: true }));
        } else {
          // fetch full session to get report
          await resumeInterview(session.interviewId);
          await loadInterviews();
        }
      }
    } catch (err) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1)); // remove failed message
    } finally {
      setSending(false);
    }
  };

  if (loading && !session) return <LoadingSpinner size={40} />;

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SectionHeader 
          title="AI Mock Interviews" 
          subtitle="Practice adaptive technical and behavioral interviews"
          action={<button onClick={startInterview} className="btn-primary"><Bot size={16}/> Start New Session</button>}
        />

        <div className="grid md:grid-cols-2 gap-4">
          {interviews.map(inv => (
            <div key={inv._id} className="glass rounded-2xl p-5 flex flex-col justify-between">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-white">{inv.jobTitle}</h3>
                  <span className={`badge ${inv.status === 'completed' ? 'badge-green' : 'badge-amber'}`}>
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-white/40">{new Date(inv.createdAt).toLocaleDateString()}</p>
              </div>
              
              {inv.status === 'completed' && inv.report ? (
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2">
                    <ScoreCircle score={inv.report.overallScore} size={36} />
                    <span className="text-xs text-white/60">Overall Score</span>
                  </div>
                  <button onClick={() => resumeInterview(inv._id)} className="btn-secondary text-xs px-3 py-1.5">View Report</button>
                </div>
              ) : (
                <button onClick={() => resumeInterview(inv._id)} className="btn-secondary text-xs px-3 py-1.5 mt-2 self-start">
                  Continue Interview
                </button>
              )}
            </div>
          ))}
          
          {interviews.length === 0 && (
            <div className="md:col-span-2 text-center py-12 glass-light rounded-2xl border border-white/5 border-dashed">
              <p className="text-sm text-white/40 mb-3">No previous interviews found.</p>
              <button onClick={startInterview} className="btn-primary text-sm px-6 py-2">Start your first interview</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between glass rounded-t-2xl p-4 border-b border-white/10 shrink-0">
        <div>
          <h2 className="font-semibold text-white">Interview: {session.jobTitle}</h2>
          <p className="text-xs text-white/50">{session.isComplete ? 'Completed' : 'In Progress'}</p>
        </div>
        <button onClick={() => setSession(null)} className="btn-ghost text-xs">Back to History</button>
      </div>

      <div className="flex-1 glass overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {session.isComplete && session.report && (
          <div className="mb-8 p-6 rounded-2xl glass-light border border-indigo-500/20 glow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-indigo-400" /> Final Evaluation
            </h3>
            <div className="flex gap-6 mb-6">
              <ScoreCircle score={session.report.overallScore} size={80} label="Overall" />
              <ScoreCircle score={session.report.technicalScore} size={80} label="Technical" />
              <ScoreCircle score={session.report.communicationScore} size={80} label="Communication" />
            </div>
            <p className="text-sm text-white/80 mb-4">{session.report.summary}</p>
            <p className="text-sm text-white/60">{session.report.detailedFeedback}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-indigo-500' : 'bg-indigo-500/20 border border-indigo-500/40'
            }`}>
              {msg.role === 'user' ? <User size={14} className="text-white"/> : <Bot size={16} className="text-indigo-400"/>}
            </div>
            <div className={`p-4 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-white/90'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-indigo-400"/>
            </div>
            <div className="chat-bubble-ai p-4 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}/>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}/>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}/>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!session.isComplete && (
        <div className="glass rounded-b-2xl p-4 shrink-0">
          <form onSubmit={sendMessage} className="relative">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type your answer... (Press Enter to send)"
              className="input-base w-full pr-12 min-h-[60px] resize-none"
              disabled={sending}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || sending}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
