import { motion } from 'framer-motion';

export function StatCard({ icon: Icon, label, value, sub, color = '#6366f1', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-5 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          {Icon && <Icon size={18} style={{ color }} />}
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-white/70">{label}</p>
      {sub && <p className="text-xs text-white/35 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export function ScoreCircle({ score, size = 80, label }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#818cf8' : score >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
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
          <span className="text-sm font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      {label && <span className="text-xs text-white/50">{label}</span>}
    </div>
  );
}

export function ProgressBar({ value, label, color = '#6366f1', delay = 0 }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs font-semibold text-white/80">{value}%</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function SkillTag({ skill, level }) {
  const colors = {
    expert: 'badge-green',
    proficient: 'badge-brand',
    beginner: 'badge-amber',
    default: 'badge-brand'
  };
  return (
    <span className={`badge ${colors[level] || colors.default}`}>{skill}</span>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-white/45 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4">
          <Icon size={24} className="text-white/25" />
        </div>
      )}
      <p className="text-white/70 font-medium mb-1">{title}</p>
      {description && <p className="text-sm text-white/35 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className="border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function Tag({ children, color }) {
  return (
    <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
      style={{
        background: color ? `${color}18` : 'rgba(255,255,255,0.06)',
        color: color || 'rgba(226,226,240,0.6)',
        border: `1px solid ${color ? color + '25' : 'rgba(255,255,255,0.08)'}`
      }}>
      {children}
    </span>
  );
}
