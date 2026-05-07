import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/candidate');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans">
      {/* Left Side: Form */}
      <div className="flex-[1.2] bg-white flex flex-col items-center justify-center px-12 lg:px-24 relative">
        <Link to="/" className="absolute top-10 left-12 flex items-center gap-2 text-gray-400 hover:text-[#06061c] transition-all text-[10px] font-bold uppercase tracking-[0.2em]">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="w-full max-w-[400px]">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-10">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
                <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF"/>
                <path d="M12 4L20 20H12L12 4Z" fill="#1e1b4b"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-3xl font-black text-[#05051a] tracking-tighter leading-none" style={{fontFamily: 'Outfit'}}>HIREMIND</span>
                <span className="text-[10px] text-gray-400 tracking-[0.3em] uppercase mt-1 font-bold">Recruiting OS</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-[#05051a] mb-2 tracking-tight" style={{ fontFamily: 'Outfit' }}>Login</h1>
            <p className="text-gray-400 text-sm font-medium">How do I get started with AI recruiting?</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">Username / Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[#05051a] text-sm focus:border-[#00E5FF] focus:bg-white transition-all outline-none" 
                  placeholder="name@company.com"
                  value={form.email} 
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">Password</label>
                <button type="button" className="text-[10px] font-bold text-[#f59e0b] hover:underline uppercase tracking-widest">Forgot?</button>
              </div>
              <div className="relative">
                <input 
                  type={showPw ? 'text' : 'password'} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[#05051a] text-sm focus:border-[#00E5FF] focus:bg-white transition-all outline-none pr-12"
                  placeholder="••••••••" 
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#00E5FF] transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#6366f1] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_10px_20px_rgba(99,102,241,0.3)] transition-all transform hover:-translate-y-0.5 mt-4 flex items-center justify-center" 
              disabled={loading}
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Login Now'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-4">Login with Others</p>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-[11px] font-bold">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" /> Google
              </button>
              <button className="flex items-center justify-center gap-3 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-[11px] font-bold">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" alt="Facebook" /> Facebook
              </button>
            </div>
            <p className="mt-10 text-xs text-gray-400 font-medium">
              Don't have an account? <Link to="/register" className="text-[#6366f1] font-black hover:underline">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-[#06061c] relative items-center justify-center overflow-hidden mesh-gradient-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06061c] via-transparent to-[#06061c] opacity-60 z-10" />
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative z-20 w-4/5 h-4/5 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl p-8 flex flex-col items-center justify-center shadow-2xl"
        >
          <img 
            src="/auth_illustration.png" 
            alt="AI Recruiting" 
            className="w-full h-full object-cover rounded-[2rem] shadow-2xl"
          />
          {/* Floating UI Card Overlay */}
          <div className="absolute bottom-12 -left-8 bg-white p-6 rounded-3xl shadow-2xl z-30 flex items-center gap-4 animate-bounce-slow">
            <div className="w-12 h-12 bg-[#00E5FF]/10 rounded-full flex items-center justify-center">
              <Zap className="text-[#00E5FF]" size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Smart Match</p>
              <p className="text-sm font-black text-[#05051a]">94.2% Accuracy</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
