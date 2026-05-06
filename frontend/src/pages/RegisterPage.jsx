import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: params.get('role') || 'candidate',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to HireMind, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/candidate');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-gradient relative">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-[#00E5FF] transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to home
      </Link>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mt-12 mb-12">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
              <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF"/>
              <path d="M12 4L20 20H12L12 4Z" fill="#1e1b4b"/>
            </svg>
            <span className="text-2xl font-black text-white tracking-tighter" style={{fontFamily: 'Outfit'}}>HIREMIND</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/45 text-sm mt-1">Free forever. No credit card required.</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-[0_0_40px_rgba(0,229,255,0.05)]">
          {/* Role Toggle */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
            {['candidate', 'recruiter'].map(r => (
              <button key={r} onClick={() => setForm(p => ({ ...p, role: r }))}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all capitalize
                  ${form.role === r ? 'bg-[#00E5FF] text-[#06061c] shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'text-white/50 hover:text-white/80'}`}>
                {r === 'candidate' ? '🎯 Job Seeker' : '🔍 Recruiter'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">Full Name</label>
              <input className="input-base" placeholder="Alex Rivera" required
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">Email</label>
              <input type="email" className="input-base" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            {form.role === 'recruiter' && (
              <div>
                <label className="block text-xs font-medium text-white/55 mb-1.5">Company</label>
                <input className="input-base" placeholder="Your Company"
                  value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-base pr-10"
                  placeholder="Min 6 characters" minLength={6} required
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#00E5FF]">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3 mt-4" disabled={loading}>
              {loading
                ? <span className="w-4 h-4 border-2 border-[#06061c]/20 border-t-[#06061c] rounded-full animate-spin" />
                : `Create ${form.role === 'recruiter' ? 'Recruiter' : 'Candidate'} Account`}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00E5FF] hover:text-[#4ee1ff] font-bold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
