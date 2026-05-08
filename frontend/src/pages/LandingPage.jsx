import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Target, Zap, Shield, TrendingUp, TrendingDown, MessageSquare, Star, Users } from 'lucide-react';

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


export default function LandingPage() {
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'features', 'stats', 'contact'];
      const scrollPosition = window.scrollY + 100; // Offset for navbar height

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveNav(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="min-h-screen bg-[#06061c] overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="h-[90px] bg-[#06061c] lg:bg-white flex items-center justify-between px-8 lg:px-16 fixed top-0 w-full z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
            <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF" />
            <path d="M12 4L20 20H12L12 4Z" className="fill-white lg:fill-[#1e1b4b]" />
          </svg>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white lg:text-[#05051a] tracking-tighter leading-none" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>HIREMIND</span>
            <span className="text-[8px] text-[#00E5FF] lg:text-gray-500 tracking-widest uppercase mt-0.5">Recruiting OS</span>
          </div>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white lg:text-[#05051a]">
          <a href="#home"
            onClick={() => setActiveNav('home')}
            className={`${activeNav === 'home' ? 'text-[#00E5FF]' : ''} hover:text-[#00E5FF] transition-all duration-300 relative py-1`}>
            Home
            {activeNav === 'home' && <motion.div layoutId="navUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E5FF]" />}
          </a>
          <a href="#about"
            onClick={() => setActiveNav('about')}
            className={`${activeNav === 'about' ? 'text-[#00E5FF]' : ''} hover:text-[#00E5FF] transition-all duration-300 relative py-1`}>
            About
            {activeNav === 'about' && <motion.div layoutId="navUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E5FF]" />}
          </a>
          <a href="#features"
            onClick={() => setActiveNav('features')}
            className={`${activeNav === 'features' ? 'text-[#00E5FF]' : ''} hover:text-[#00E5FF] transition-all duration-300 relative py-1`}>
            Features
            {activeNav === 'features' && <motion.div layoutId="navUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E5FF]" />}
          </a>
          <a href="#stats"
            onClick={() => setActiveNav('stats')}
            className={`${activeNav === 'stats' ? 'text-[#00E5FF]' : ''} hover:text-[#00E5FF] transition-all duration-300 relative py-1`}>
            Analytics
            {activeNav === 'stats' && <motion.div layoutId="navUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E5FF]" />}
          </a>
          <a href="#contact"
            onClick={() => setActiveNav('contact')}
            className={`${activeNav === 'contact' ? 'text-[#00E5FF]' : ''} hover:text-[#00E5FF] transition-all duration-300 relative py-1`}>
            Contact Us
            {activeNav === 'contact' && <motion.div layoutId="navUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E5FF]" />}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="bg-[#f59e0b] text-[#06061c] px-6 py-3 rounded text-[10px] font-bold tracking-widest uppercase hover:bg-[#d97706] transition-colors shadow-lg">
            Sign In
          </Link>
          <Link to="/register?role=recruiter" className="bg-[#00E5FF] lg:bg-[#1c165d] text-[#06061c] lg:text-white px-8 py-3 rounded text-[10px] font-bold tracking-widest uppercase hover:opacity-90 transition-colors shadow-lg">
            Start Hiring
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home" className="flex flex-col lg:flex-row min-h-screen pt-[90px]">
        {/* Left Side */}
        <div className="w-full lg:w-[45%] bg-[#06061c]/90 backdrop-blur-[2px] relative flex flex-col px-12 lg:px-20 z-10 pt-12 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 w-fit text-[10px] font-bold tracking-wider text-[#00E5FF] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            AI-Powered Talent Matching
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-5xl lg:text-[60px] font-bold text-white leading-[1.05] mb-10 tracking-tight"
            style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}
          >
            Intelligence will<br />always beat<br />intuition.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/60 text-sm max-w-md mb-12 leading-relaxed">
            HireMind is a complete AI Recruiting OS. Semantic matching, bias detection, AI interviews, and intelligent analytics for teams who hire with intention.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-4 mb-16">
            <Link to="/register?role=recruiter" className="bg-[#f59e0b] text-[#05051a] px-10 py-3.5 rounded-sm text-xs font-bold shadow-xl shadow-amber-500/20 hover:bg-[#d97706] transition-colors">
              I am a Recruiter
            </Link>
            <Link to="/register?role=candidate" className="bg-[#2a247a] text-white px-10 py-3.5 rounded-sm text-xs font-bold shadow-xl shadow-indigo-900/30 hover:bg-[#1c165d] transition-colors">
              I am a Candidate
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-4 mt-auto">
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
        <div className="w-full lg:w-[55%] bg-[#2a247a]/80 relative overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">

          {/* Base Image Area */}
          <div className="absolute top-0 right-0 w-[120%] h-full bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%)' }}>
            <img
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200"
              alt="Professional"
              className="w-full h-full object-cover object-top opacity-60"
            />
          </div>

          {/* Deep Purple Angular Shape overlaying the image */}
          <div className="absolute top-0 right-0 w-full h-full bg-[#1c165d]/85 backdrop-blur-[1px]"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 60% 0)' }}></div>

          {/* Cyan Ribbon */}
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} transition={{ duration: 1, type: 'spring' }}
            className="absolute top-[25%] left-[-15%] w-[120%] h-[40%] bg-[#00E5FF]/40 backdrop-blur-[2px] shadow-[0_20px_50px_rgba(0,229,255,0.2)]"
            style={{ clipPath: 'polygon(0 100%, 85% 15%, 100% 90%)' }}>
          </motion.div>

          {/* Stats Overlay on Ribbon */}
          <div className="absolute top-[59%] right-0 z-30 p-12 lg:pl-60 lg:pr-24 w-full max-w-4xl">
            <div className="flex justify-between items-end border-t border-white/10 pt-8">
              <div>
                <h3 className="text-white font-bold text-lg tracking-wide mb-1" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>Effective AI-Driven<br />Hiring Strategy</h3>
                <Link to="/register" className="text-[#f59e0b] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-4 hover:opacity-80 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]"></div>
                  GET STARTED NOW
                </Link>
              </div>
              <div className="text-right">
                <h2 className="text-[64px] font-light text-white leading-none tracking-tighter" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>60<sup className="text-xl font-bold tracking-normal ml-1">%</sup></h2>
                <p className="text-[8px] text-white/50 mt-3 max-w-[150px] leading-relaxed uppercase tracking-widest ml-auto text-right">Reduction in average time-to-hire</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated About Section */}
      <section id="about" className="py-20 px-6 relative overflow-hidden mesh-gradient-bg">
        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#f59e0b]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Content Side */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Our Mission</span>
              </motion.div>

              <h2 className="text-4xl lg:text-[42px] font-bold text-white mb-5 tracking-tight leading-[1.1]" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
                The Next Generation of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00B8D4]">Recruiting Intelligence.</span>
              </h2>

              <p className="text-white/60 leading-relaxed mb-8 text-base lg:text-lg font-light">
                HireMind is a complete <span className="text-white font-medium">Recruiting Operating System</span>. We've combined deep semantic intelligence with human-centric design to solve hiring.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00E5FF]/30 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] mb-3 group-hover:scale-110 transition-transform">
                    <Brain size={20} />
                  </div>
                  <h4 className="text-white font-bold text-base mb-1" style={{ fontFamily: '"Outfit", sans-serif' }}>Intelligent Core</h4>
                  <p className="text-[12px] text-white/40 leading-relaxed">AI models to understand potential, not keywords.</p>
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-[#f59e0b]/30 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] mb-3 group-hover:scale-110 transition-transform">
                    <Shield size={20} />
                  </div>
                  <h4 className="text-white font-bold text-base mb-1" style={{ fontFamily: '"Outfit", sans-serif' }}>Ethical AI</h4>
                  <p className="text-[12px] text-white/40 leading-relaxed">Fair, inclusive, and transparent hiring.</p>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="flex-1 relative lg:max-w-[450px]">
              <div className="relative z-20 aspect-square rounded-[2rem] overflow-hidden border border-white/10 glass p-2 group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#06061c] to-transparent opacity-40 z-10" />
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200"
                  alt="Team collaboration"
                  className="w-full h-full object-cover rounded-[1.5rem] grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                />
              </div>

              {/* Floating Stat Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl z-30 hidden md:block"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#00E5FF] flex items-center justify-center text-[#06061c]">
                    <TrendingUp size={16} />
                  </div>
                  <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>94%</p>
                </div>
                <p className="text-[9px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">Match Rate</p>
              </motion.div>
              {/* Decorative Background Grid for the image */}
              <div className="absolute -top-10 -right-10 w-full h-full border border-white/5 rounded-[2rem] z-0 hidden lg:block translate-x-4 translate-y-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section below hero */}
      <section id="features" className="py-24 px-6 relative mesh-gradient-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>The Complete Hiring Stack</h2>
            <p className="text-white/50 text-sm max-w-xl mx-auto">Six AI-powered tools working together to transform your entire hiring pipeline.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-xl hover:border-[#00E5FF]/50 transition-colors group">
                <f.icon size={32} color={f.color} className="mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>{f.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="stats" className="py-20 px-6 relative overflow-hidden mesh-gradient-bg">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left side: Stats Cards */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '10x', label: 'Faster Screening', color: '#00E5FF', icon: Zap },
                  { value: '94%', label: 'Match Accuracy', color: '#00E5FF', icon: Brain },
                  { value: '3.2x', label: 'Diverse Hires', color: '#f59e0b', icon: Users },
                  { value: '60%', label: 'Time Saved', color: '#f59e0b', icon: TrendingDown }
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center" style={{ color: s.color }}>
                        <s.icon size={18} />
                      </div>
                      <p className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side: Visual Graph Showcase */}
            <div className="flex-1 order-1 lg:order-2">
              <div className="mb-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Real-time Analytics</span>
                </motion.div>
                <h2 className="text-4xl lg:text-[42px] font-bold text-white mb-4 tracking-tight leading-[1.1]" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
                  Hiring Performance <br />
                  <span className="text-[#00E5FF]">Supercharged.</span>
                </h2>
                <p className="text-white/50 text-sm max-w-md">Track every stage of your recruitment funnel with AI-powered insights that optimize for speed and quality.</p>
              </div>

              {/* Simulated Graph Card */}
              <div className="bg-[#0a0a25] border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-4">
                    <div className="h-2 w-8 bg-white/10 rounded-full" />
                    <div className="h-2 w-12 bg-white/5 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  </div>
                </div>

                {/* SVG Graph */}
                <div className="h-40 w-full relative">
                  <svg className="w-full h-full overflow-visible">
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      d="M 0 140 C 50 130, 100 110, 150 70 S 250 10, 400 40"
                      fill="none"
                      stroke="#00E5FF"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.3 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                      d="M 0 150 C 60 140, 120 130, 180 110 S 300 80, 400 90"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Tooltip Dot */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-10 left-[60%] w-3 h-3 rounded-full bg-[#00E5FF] shadow-[0_0_15px_#00E5FF]"
                  />
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-white/5 flex gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Efficiency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Growth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 relative overflow-hidden mesh-gradient-bg">
        {/* Background Orbs */}
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Left side: Contact Info */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Connect</span>
              </motion.div>

              <h2 className="text-4xl lg:text-[42px] font-bold text-white mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>
                Let's Build the Future of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00B8D4]">Talent Acquisition.</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-md">Our team is ready to help you implement AI-powered recruiting that actually works.</p>

              <div className="space-y-6">
                {[
                  { icon: MessageSquare, title: 'Expert Support', desc: 'Real humans, backed by AI, available 24/7.', color: '#00E5FF' },
                  { icon: Target, title: 'Strategic Consulting', desc: 'Custom implementation for enterprise teams.', color: '#f59e0b' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center transition-colors" style={{ color: item.color }}>
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-white/40">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Contact Form */}
            <div className="flex-1 lg:max-w-[500px]">
              <form className="glass p-8 rounded-[2.5rem] relative overflow-hidden border border-white/10 shadow-2xl">
                <div className="space-y-5 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-2 ml-1">First Name</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#00E5FF] focus:bg-white/10 transition-all outline-none" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-2 ml-1">Last Name</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#00E5FF] focus:bg-white/10 transition-all outline-none" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-2 ml-1">Work Email</label>
                    <input type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#00E5FF] focus:bg-white/10 transition-all outline-none" placeholder="john@company.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-2 ml-1">Your Message</label>
                    <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-[#00E5FF] focus:bg-white/10 transition-all outline-none resize-none" placeholder="How can we help?"></textarea>
                  </div>
                  <button type="button" className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#06061c] py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-0.5">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
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
      <footer className="bg-white py-6 px-6 text-center relative z-20">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-12">
              <path d="M4 20L12 4L20 20H12L4 20Z" fill="#00E5FF" />
              <path d="M12 4L20 20H12L12 4Z" fill="#06061c" />
            </svg>
            <span className="text-2xl font-black text-[#06061c] tracking-tighter" style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}>HIREMIND</span>
          </div>

          <div className="flex gap-10">
            {['Product', 'Company', 'Resources', 'Legal'].map(item => (
              <a key={item} href="#" className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#06061c]/50 hover:text-[#00E5FF] transition-colors">{item}</a>
            ))}
          </div>

          <div className="w-full max-w-lg h-px bg-[#06061c]/5" />

          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-widest text-[#06061c]/30 font-medium">© 2026 HireMind. AI-Powered Recruiting OS.</p>
            <p className="text-[10px] text-[#06061c]/20">Designed for the future of talent acquisition.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
