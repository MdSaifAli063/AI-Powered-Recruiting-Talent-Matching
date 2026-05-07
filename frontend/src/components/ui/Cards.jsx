import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
// Triggering re-load for export verification

export function StatCard({ icon: Icon, label, value, sub, color = '#6366f1', delay = 0 }) {
  const { theme } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-[2rem] p-6 transition-all duration-300 border
        ${theme === 'dark' 
          ? 'bg-white/5 border-white/5 shadow-2xl' 
          : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {Icon && <Icon size={20} style={{ color }} />}
        </div>
      </div>
      <p className={`text-3xl font-black mb-1 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{value}</p>
      <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>{label}</p>
      {sub && <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-[#00E5FF]' : 'text-[#6366f1]'}`}>{sub}</p>}
    </motion.div>
  );
}

export function ScoreCircle({ score, size = 80, label }) {
  const { theme } = useTheme();
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  const color = score >= 80 ? '#00E5FF' : score >= 60 ? '#6366f1' : score >= 40 ? '#f59e0b' : '#f87171';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} strokeWidth="6" />
          <motion.circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - filled }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      {label && <span className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{label}</span>}
    </div>
  );
}

export function ProgressBar({ value, label, color = '#6366f1', delay = 0 }) {
  const { theme } = useTheme();
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}>{label}</span>
        <span className={`text-[10px] font-black tracking-widest ${theme === 'dark' ? 'text-white/80' : 'text-[#05051a]'}`}>{value}%</span>
      </div>
      <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}dd)` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h2 className={`text-base font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`} style={{ fontFamily: 'Outfit' }}>{title}</h2>
        {subtitle && <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingSpinner({ size = 32 }) {
  return (
    <div className="flex items-center justify-center p-12">
      <div
        className="border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function Tag({ children, color }) {
  const { theme } = useTheme();
  return (
    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
      style={{
        background: color ? `${color}15` : theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
        color: color || (theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'),
        border: `1px solid ${color ? color + '25' : theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`
      }}>
      {children}
    </span>
  );
}

export function SkillTag({ skill, level }) {
  const { theme } = useTheme();
  const colors = {
    expert: '#00E5FF',
    proficient: '#6366f1',
    beginner: '#f59e0b',
    default: '#6366f1'
  };
  const color = colors[level] || colors.default;
  return (
    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
      style={{
        background: `${color}15`,
        color: color,
        border: `1px solid ${color}30`
      }}>
      {skill}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  const { theme } = useTheme();
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center rounded-[3rem] border transition-all
      ${theme === 'dark' ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/30'}`}>
      {Icon && (
        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg
          ${theme === 'dark' ? 'bg-white/5 border border-white/5 text-white/20' : 'bg-gray-50 border border-gray-100 text-gray-300'}`}>
          <Icon size={32} />
        </div>
      )}
      <h3 className={`text-lg font-black uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#05051a]'}`}>{title}</h3>
      {description && <p className={`text-xs font-medium max-w-xs leading-relaxed mb-8 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>{description}</p>}
      {action && <div className="animate-bounce-slow">{action}</div>}
    </div>
  );
}
