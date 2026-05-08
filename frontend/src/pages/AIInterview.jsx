import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Award, ArrowRight, Mic, MicOff } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoadingSpinner, ScoreCircle, SectionHeader } from '../components/ui/Cards';
import toast from 'react-hot-toast';

export default function AIInterview() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [interviews, setInterviews] = useState([]);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadInterviews();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      // Optional: configure voice, rate, pitch
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Attempt to pick a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Siri')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            setInput(prev => prev + event.results[i][0].transcript + ' ');
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening... Speak your response.', { icon: '🎙️' });
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

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
      speakText(data.data.message);
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
      
      const filteredMessages = data.data.messages.filter(m => m.role !== 'system');
      setMessages(filteredMessages);
      
      if (filteredMessages.length > 0) {
        const lastMsg = filteredMessages[filteredMessages.length - 1];
        if (lastMsg.role === 'assistant') {
          speakText(lastMsg.content);
        }
      }
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
      
      const aiMessage = data.data.message;
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
      speakText(aiMessage);
      
      if (data.data.isComplete) {
        toast.success('Interview complete! Generating report...');
        
        // Dispatch real-time notification
        window.dispatchEvent(new CustomEvent('add-notification', {
          detail: {
            title: 'Interview Completed',
            desc: `Your AI Interview for ${session.jobTitle} has been completed and scored.`,
            color: '#f59e0b'
          }
        }));

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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <div className="glass rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2 text-white">AI Mock Interviews</h1>
            <p className="text-sm text-white/60">Practice adaptive technical and behavioral interviews</p>
          </div>
          <button 
            onClick={startInterview} 
            className="flex items-center gap-2 justify-center py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-[#00E5FF] text-[#05051a] hover:bg-[#00E5FF]/90 shadow-lg shadow-cyan-500/20"
          >
            <Bot size={16}/> Start New Session
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((inv, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={inv._id} 
              className="glass rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="mb-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg mb-2 bg-white/[0.05] border border-white/5 text-white/50">
                    <Bot size={20} />
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${inv.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {inv.status}
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight leading-tight mb-1 text-white">{inv.jobTitle}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{new Date(inv.createdAt).toLocaleDateString()}</p>
              </div>
              
              {inv.status === 'completed' && inv.report ? (
                <div className="flex items-center justify-between border-t pt-4 border-white/10">
                  <div className="flex items-center gap-3">
                    <ScoreCircle score={inv.report.overallScore} size={40} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Score</span>
                  </div>
                  <button 
                    onClick={() => resumeInterview(inv._id)} 
                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors bg-white/5 hover:bg-white/10 text-white/80"
                  >
                    View Report
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => resumeInterview(inv._id)} 
                  className="w-full text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all border bg-transparent border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                >
                  Continue Interview
                </button>
              )}
            </motion.div>
          ))}
          
          {interviews.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 rounded-3xl border-2 border-dashed glass border-white/10">
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-white/5 text-white/30">
                <Bot size={32} />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2 text-white">No Interviews Yet</h3>
              <p className="text-sm mb-6 text-white/50">Start a new mock interview to practice your skills.</p>
              <button 
                onClick={startInterview} 
                className="flex items-center gap-2 justify-center py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all mx-auto bg-[#00E5FF] text-[#05051a] hover:bg-[#00E5FF]/90 shadow-lg shadow-cyan-500/20"
              >
                <Bot size={16}/> Start First Session
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between glass rounded-t-3xl p-6 border-b shrink-0 border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-white/[0.05] border border-white/5 text-[#00E5FF]">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight leading-tight mb-1 text-white">{session.jobTitle}</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${session.isComplete ? 'bg-emerald-500' : 'bg-[#00E5FF] animate-pulse'}`} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                {session.isComplete ? 'Completed Evaluation' : 'Active Session'}
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setSession(null)} 
          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
        >
          Exit
        </button>
      </div>

      <div className="flex-1 glass overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {session.isComplete && session.report && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl border glow-sm mb-8 bg-white/[0.02] border-indigo-500/30"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">
                Final Evaluation
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-8 justify-center md:justify-start mb-8">
              <ScoreCircle score={session.report.overallScore} size={90} label="Overall Match" />
              <div className="w-[1px] h-20 bg-white/10 hidden md:block" />
              <ScoreCircle score={session.report.technicalScore} size={90} label="Technical" />
              <ScoreCircle score={session.report.communicationScore} size={90} label="Communication" />
            </div>
            
            <div className="p-6 rounded-2xl mb-6 bg-black/40 border border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-white/40">Executive Summary</h4>
              <p className="text-sm leading-relaxed text-white/80">{session.report.summary}</p>
            </div>
            
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-white/40">Detailed Feedback</h4>
              <p className="text-sm leading-relaxed text-white/60">{session.report.detailedFeedback}</p>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white/[0.05] border border-white/5 text-[#00E5FF]'
                }`}
              >
                {msg.role === 'user' ? <User size={18} /> : <Bot size={20} />}
              </div>
              <div className={`p-5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-500 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white/[0.03] border border-white/5 text-white/90 rounded-2xl rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {sending && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white/[0.05] border border-white/5 text-[#00E5FF]">
                <Bot size={20} />
              </div>
              <div className="p-5 flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white/[0.03] border border-white/5">
                <span className="w-2 h-2 rounded-full animate-bounce bg-[#00E5FF]" style={{ animationDelay: '0ms' }}/>
                <span className="w-2 h-2 rounded-full animate-bounce bg-[#00E5FF]" style={{ animationDelay: '150ms' }}/>
                <span className="w-2 h-2 rounded-full animate-bounce bg-[#00E5FF]" style={{ animationDelay: '300ms' }}/>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {!session.isComplete && (
        <div className="glass rounded-b-3xl p-6 shrink-0 border-t border-white/10">
          <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto">
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
              placeholder={isListening ? "Listening... (Speak now)" : "Type your response... (Press Enter to send)"}
              className={`w-full pr-28 min-h-[64px] max-h-[160px] resize-none rounded-2xl p-4 text-sm transition-all border outline-none custom-scrollbar bg-black/40 text-white placeholder:text-white/20
                ${isListening ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]' : 'border-white/10 focus:border-[#00E5FF]/50'}`}
              disabled={sending}
            />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <button 
                type="button" 
                onClick={toggleListening}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border
                  ${isListening 
                    ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse hover:bg-red-500/30' 
                    : 'bg-white/5 text-white/50 border-white/10 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10'}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button 
                type="submit" 
                disabled={!input.trim() || sending}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${!input.trim() || sending 
                    ? 'opacity-50 cursor-not-allowed bg-gray-500 text-white' 
                    : 'bg-[#00E5FF] text-[#05051a] hover:bg-[#00E5FF]/90 shadow-lg shadow-cyan-500/20 hover:scale-105'
                  }`}
              >
                <Send size={16} className={!input.trim() || sending ? '' : 'translate-x-[-1px] translate-y-[1px]'} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
