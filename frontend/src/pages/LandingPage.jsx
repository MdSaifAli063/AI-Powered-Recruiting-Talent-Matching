import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Target, Zap, Shield, TrendingUp, MessageSquare, Star } from 'lucide-react';

const features = [
  { icon: Brain, title: 'Smart Resume Analyzer', desc: 'AI extracts skills, scores experience depth, and gives actionable feedback in seconds.', color: '#00E5FF' },
  { icon: Target, title: 'Semantic Job Matching', desc: 'Embeddings-based matching that understands context, not just keywords.', color: '#f59e0b' },
  { icon: TrendingUp, title: 'Skill Gap Analyzer', desc: 'Identify exactly what skills to learn and get a prioritized learning path.', color: '#00E5FF' },
  { icon: MessageSquare, title: 'AI Interviewer', desc: 'Adaptive conversational interviews with real-time evaluation and scoring.', color: '#00b8d4' },
  { icon: Shield, title: 'Bias Detector', desc: 'Detect gendered, ageist, or exclusionary language in job descriptions.', color: '#f59e0b' },
  { icon: Zap, title: 'Outreach Generator', desc: 'Personalized recruiter messages tailored to each candidate automatically.', color: '#00E5FF' },
];

const stats = [
  { value: '10x', label: 'Faster Screening' },
  { value: '94%', label: 'Match Accuracy' },
  { value: '3.2x', label: 'More Diverse Hires' },
  { value: '60%', label: 'Less Time-to-Hire' },
];

const testimonials = [
  { name: 'Priya S.', role: 'Engineering Manager @ Stripe', text: 'HireMind cut our screening time by 70%. The semantic matching is genuinely impressive.', stars: 5 },
  { name: 'James L.', role: 'Talent Lead @ Linear', text: 'The bias detector alone is worth it. Our JDs are now inclusive and we see it in applicant diversity.', stars: 5 },
  { name: 'Anika R.', role: 'Senior Candidate', text: 'The AI interview prep gave me real confidence. Got 3 offers in 2 weeks.', stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#06061c] overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="h-[90px] bg-[#06061c] lg:bg-white flex items-center justify-between px-8 lg:px-16 fixed top-0 w-full z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
            <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF"/>
            <path d="M12 4L20 20H12L12 4Z" className="fill-white lg:fill-[#1e1b4b]"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white lg:text-[#05051a] tracking-tighter leading-none" style={{fontFamily: '"Outfit", system-ui, sans-serif'}}>HIREMIND</span>
            <span className="text-[8px] text-[#00E5FF] lg:text-gray-500 tracking-widest uppercase mt-0.5">Recruiting OS</span>
          </div>
        </div>
        <div className="hidden md:flex gap-10 text-[11px] font-bold uppercase tracking-[0.15em] text-white lg:text-[#05051a]">
          <Link to="/" className="text-[#00E5FF]">Home</Link>
          <a href="#features" className="hover:text-[#00E5FF] transition-colors">Features</a>
          <a href="#platform" className="hover:text-[#00E5FF] transition-colors">Platform</a>
          <Link to="/login" className="hover:text-[#00E5FF] transition-colors">Sign In</Link>
        </div>
        <div>
          <Link to="/register?role=recruiter" className="bg-[#00E5FF] lg:bg-[#1c165d] text-[#06061c] lg:text-white px-8 py-3 rounded text-[10px] font-bold tracking-widest uppercase hover:opacity-90 transition-colors shadow-lg">
            Start Hiring
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-[90px]">
        {/* Left Side */}
        <div className="w-full lg:w-[45%] bg-[#06061c] relative flex flex-col justify-center px-12 lg:px-20 z-10 py-20 lg:py-0">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 w-fit text-[10px] font-bold tracking-wider text-[#00E5FF] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            AI-Powered Talent Matching
          </motion.div>

          <motion.h1 
            initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}} transition={{duration: 0.8}}
            className="text-5xl lg:text-[60px] font-bold text-white leading-[1.05] mb-10 tracking-tight"
            style={{fontFamily: '"Outfit", system-ui, sans-serif'}}
          >
            Intelligence will<br/>always beat<br/>intuition.
          </motion.h1>
          
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="text-white/60 text-sm max-w-md mb-12 leading-relaxed">
            HireMind is a complete AI Recruiting OS. Semantic matching, bias detection, AI interviews, and intelligent analytics for teams who hire with intention.
          </motion.p>

          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.4}} className="flex flex-wrap gap-4 mb-16">
            <Link to="/register?role=recruiter" className="bg-[#f59e0b] text-[#05051a] px-10 py-3.5 rounded-sm text-xs font-bold shadow-xl shadow-amber-500/20 hover:bg-[#d97706] transition-colors">
              I am a Recruiter
            </Link>
            <Link to="/register?role=candidate" className="bg-[#2a247a] text-white px-10 py-3.5 rounded-sm text-xs font-bold shadow-xl shadow-indigo-900/30 hover:bg-[#1c165d] transition-colors">
              I am a Candidate
            </Link>
          </motion.div>

          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.6}} className="space-y-4 mt-auto">
            <div className="flex items-center gap-4 text-[10px] font-medium tracking-widest text-[#00E5FF]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"></div>
              10X FASTER SCREENING PROCESS
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium tracking-widest text-[#00E5FF]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"></div>
              94% SEMANTIC MATCH ACCURACY
            </div>
            <div className="flex items-center gap-4 text-[10px] font-medium tracking-widest text-[#00E5FF]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"></div>
              REDUCE UNCONSCIOUS BIAS
            </div>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[55%] bg-[#2a247a] relative overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">
          
          {/* Base Image Area */}
          <div className="absolute top-0 right-0 w-[120%] h-[75%] bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%)' }}>
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200" 
              alt="Professional" 
              className="w-full h-full object-cover object-top opacity-60"
            />
          </div>

          {/* Deep Purple Angular Shape overlaying the image */}
          <div className="absolute top-0 right-0 w-full h-full bg-[#1c165d]" 
               style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 60% 0)' }}></div>

          {/* Cyan Ribbon */}
          <motion.div 
               initial={{x: '-100%'}} animate={{x: 0}} transition={{duration: 1, type: 'spring'}}
               className="absolute top-[40%] left-[-15%] w-[120%] h-[40%] bg-[#00E5FF] shadow-[0_20px_50px_rgba(0,229,255,0.3)]"
               style={{ clipPath: 'polygon(0 100%, 85% 15%, 100% 90%)' }}>
          </motion.div>

          <div className="relative z-30 p-12 lg:p-24 mt-auto mb-6 w-full max-w-3xl ml-auto">
             <div className="flex justify-between items-end border-t border-white/20 pt-8">
               <div>
                 <h3 className="text-white font-bold text-lg tracking-wide mb-1" style={{fontFamily: '"Outfit", system-ui, sans-serif'}}>Effective AI-Driven<br/>Hiring Strategy</h3>
                 <Link to="/register" className="text-[#f59e0b] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-4 hover:opacity-80 transition-opacity">
                   <div className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]"></div>
                   GET STARTED NOW
                 </Link>
               </div>
               <div className="text-right">
                 <h2 className="text-[64px] font-light text-white leading-none tracking-tighter" style={{fontFamily: '"Outfit", system-ui, sans-serif'}}>60<sup className="text-xl font-bold tracking-normal ml-1">%</sup></h2>
                 <p className="text-[8px] text-white/50 mt-3 max-w-[150px] leading-relaxed uppercase tracking-widest ml-auto text-right">Reduction in average time-to-hire</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Features Section below hero */}
      <section id="features" className="py-24 px-6 bg-[#06061c]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4" style={{fontFamily: '"Outfit", system-ui, sans-serif'}}>The Complete Hiring Stack</h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto">Six AI-powered tools working together to transform your entire hiring pipeline.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-xl hover:border-[#00E5FF]/50 transition-colors group">
                <f.icon size={32} color={f.color} className="mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-3" style={{fontFamily: '"Outfit", system-ui, sans-serif'}}>{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 px-6 bg-[#06061c] border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00b8d4] mb-2">{value}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#f59e0b]">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-[#06061c]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Outfit' }}>
              Loved by Recruiters & Candidates
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array(stars).fill(0).map((_, j) => <Star key={j} size={14} className="fill-[#f59e0b] text-[#f59e0b]" />)}
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-6">"{text}"</p>
                <div>
                  <p className="text-sm font-bold text-[#00E5FF]">{name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#06061c]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#2a247a] to-[#06061c] border border-[#00E5FF]/20 rounded-3xl p-12 relative overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.1)]">
            <div className="absolute inset-0 opacity-10"
              style={{ background: 'radial-gradient(ellipse at center,#00E5FF,transparent 70%)' }} />
            <h2 className="text-4xl font-extrabold text-white mb-4 relative z-10"
              style={{ fontFamily: 'Outfit' }}>
              Ready to hire smarter?
            </h2>
            <p className="text-white/60 mb-10 relative z-10 max-w-lg mx-auto">
              Join thousands of teams using HireMind to find better talent, faster, without bias.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link to="/register?role=recruiter" className="bg-[#f59e0b] text-[#06061c] px-10 py-4 rounded text-sm font-bold tracking-widest uppercase hover:bg-[#d97706] transition-colors shadow-lg">
                Start as Recruiter
              </Link>
              <Link to="/register?role=candidate" className="bg-white/10 text-white px-10 py-4 rounded text-sm font-bold tracking-widest uppercase border border-white/20 hover:bg-white/20 transition-colors">
                Start as Candidate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05051a] border-t border-white/5 py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
            <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF"/>
            <path d="M12 4L20 20H12L12 4Z" fill="#1e1b4b"/>
          </svg>
          <span className="text-lg font-black text-white tracking-tighter" style={{fontFamily: '"Outfit", system-ui, sans-serif'}}>HIREMIND</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-white/30">© 2026 HireMind. AI-Powered Recruiting OS.</p>
      </footer>
    </div>
  );
}
