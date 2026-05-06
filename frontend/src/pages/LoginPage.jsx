import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

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

  const fillDemo = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-gradient relative">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-[#00E5FF] transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to home
      </Link>
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
              <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF"/>
              <path d="M12 4L20 20H12L12 4Z" fill="#1e1b4b"/>
            </svg>
            <span className="text-2xl font-black text-white tracking-tighter" style={{fontFamily: 'Outfit'}}>HIREMIND</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/45 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-[0_0_40px_rgba(0,229,255,0.05)]">
          {/* Demo shortcuts */}
          <div className="mb-6 space-y-2">
            <p className="text-xs text-[#00E5FF] uppercase tracking-widest font-bold">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Recruiter', 'sarah@techcorp.com', 'password123'],
                ['Candidate', 'alex@candidate.com', 'password123'],
              ].map(([role, email, pw]) => (
                <button key={role} onClick={() => fillDemo(email, pw)}
                  className="text-xs py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:border-[#00E5FF]/30 transition-all text-left">
                  <span className="font-bold text-[#f59e0b]">{role}</span>
                  <br />{email}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">Email</label>
              <input type="email" className="input-base" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-base pr-10"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#00E5FF]">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? <span className="w-4 h-4 border-2 border-[#06061c]/20 border-t-[#06061c] rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            No account?{' '}
            <Link to="/register" className="text-[#00E5FF] hover:text-[#4ee1ff] font-bold">Create one free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
