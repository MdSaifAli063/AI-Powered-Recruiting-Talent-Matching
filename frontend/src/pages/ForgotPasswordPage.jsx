import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans">
      {/* Left Side: Form */}
      <div className="flex-[1.2] bg-white flex flex-col items-center justify-center px-12 lg:px-24 relative">
        <Link to="/login" className="absolute top-10 left-12 flex items-center gap-2 text-gray-400 hover:text-[#06061c] transition-all text-[10px] font-bold uppercase tracking-[0.2em]">
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div className="w-full max-w-[400px]">
          {!submitted ? (
            <>
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
                <h1 className="text-4xl font-bold text-[#05051a] mb-2 tracking-tight" style={{ fontFamily: 'Outfit' }}>Forgot Password</h1>
                <p className="text-gray-400 text-sm font-medium">No worries! Enter your email and we'll send you reset instructions.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 ml-1">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[#05051a] text-sm focus:border-[#00E5FF] focus:bg-white transition-all outline-none" 
                      placeholder="name@company.com"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[#6366f1] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_10px_20px_rgba(99,102,241,0.3)] transition-all transform hover:-translate-y-0.5 mt-4 flex items-center justify-center" 
                  disabled={loading}
                >
                  {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="text-green-500" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-[#05051a] mb-4" style={{ fontFamily: 'Outfit' }}>Check your email</h2>
              <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                We've sent a password reset link to <br/><span className="text-[#05051a] font-bold">{email}</span>
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-xs font-black uppercase tracking-[0.2em] text-[#6366f1] hover:underline"
              >
                Didn't receive the email? Try again
              </button>
            </motion.div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Remember your password? <Link to="/login" className="text-[#6366f1] font-black hover:underline">Log in</Link>
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
          <div className="absolute top-12 -left-8 bg-white p-6 rounded-3xl shadow-2xl z-30 flex items-center gap-4 animate-bounce-slow">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
              <Mail className="text-[#6366f1]" size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Security First</p>
              <p className="text-sm font-black text-[#05051a]">2FA & Encryption</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
