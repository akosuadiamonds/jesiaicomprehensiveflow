import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';

// ─── Period Pill Selector ───────────────────────
const PeriodSelector: React.FC<{ options: string[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
          value === opt
            ? 'bg-foreground text-background border-foreground'
            : 'bg-card text-muted-foreground border-border hover:border-foreground/20'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// ─── Category Tab Selector ──────────────────────
const CategoryTabs: React.FC<{ options: string[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
          value === opt
            ? 'bg-primary/10 text-primary border-primary/20'
            : 'bg-card text-muted-foreground border-border'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// ─── Progress Ring SVG ──────────────────────────
const ProgressRing: React.FC<{ percent: number; size?: number; strokeWidth?: number; color?: string; label?: string }> = ({
  percent, size = 72, strokeWidth = 6, color = 'hsl(var(--primary))', label
}) => {
  const r = (size / 2) - strokeWidth;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted) / 0.15)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      {label && <text x={size/2} y={size/2 + 6} textAnchor="middle" className="fill-foreground font-bold text-lg">{label}</text>}
    </svg>
  );
};

// ─── Metric Row ─────────────────────────────────
const MetricRow: React.FC<{
  icon: string; iconBg: string; name: string; desc: string;
  value: string; valueColor?: string; change?: string; changeColor?: string;
  barPercent?: number; barColor?: string; barLabel?: string;
  badge?: { label: string; variant: 'mastered' | 'strong' | 'improving' | 'weak' };
}> = ({ icon, iconBg, name, desc, value, valueColor, change, changeColor, barPercent, barColor, badge }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0">
    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-base flex-shrink-0 ${iconBg}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[13.5px] font-semibold text-foreground">{name}</p>
      <p className="text-[11.5px] text-muted-foreground">{desc}</p>
      {barPercent !== undefined && (
        <div className="h-[5px] rounded bg-muted/30 mt-1.5">
          <div className="h-[5px] rounded transition-all" style={{ width: `${barPercent}%`, backgroundColor: barColor || 'hsl(var(--primary))' }} />
        </div>
      )}
    </div>
    <div className="text-right flex-shrink-0">
      <p className="font-bold text-lg tracking-tight" style={{ color: valueColor }}>{value}</p>
      {change && <p className="text-[11px] font-medium" style={{ color: changeColor || 'hsl(var(--muted))' }}>{change}</p>}
      {badge && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
          badge.variant === 'mastered' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
          badge.variant === 'strong' ? 'bg-primary/10 text-primary' :
          badge.variant === 'improving' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
          'bg-destructive/10 text-destructive'
        }`}>{badge.label}</span>
      )}
    </div>
  </div>
);

// ─── Trend Bars ─────────────────────────────────
const TrendBars: React.FC<{ data: number[]; color: string; startLabel: string; endLabel: string; title: string }> = ({ data, color, startLabel, endLabel, title }) => {
  const max = Math.max(...data);
  return (
    <div className="bg-card rounded-[14px] border border-border p-4 shadow-sm">
      <p className="font-bold text-[13px] mb-3.5">{title}</p>
      <div className="flex items-end gap-1.5 h-[72px]">
        {data.map((v, i) => {
          const h = Math.max(8, Math.round((v / max) * 66));
          const isLast = i === data.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-[5px]" style={{
                height: `${h}px`,
                backgroundColor: isLast ? color : 'hsl(var(--muted) / 0.15)'
              }} />
              <span className="text-[9.5px] text-muted-foreground">{v}%</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground">{startLabel}</span>
        <span className="text-[10px] font-semibold" style={{ color }}>{endLabel}</span>
      </div>
    </div>
  );
};

// ─── Topic Mastery Card ─────────────────────────
const TopicCard: React.FC<{ name: string; percent: number; status: 'mastered' | 'strong' | 'improving' | 'weak' }> = ({ name, percent, status }) => {
  const color = status === 'mastered' ? '#0E8F64' : status === 'strong' ? 'hsl(var(--primary))' : status === 'improving' ? '#C4730A' : '#C23B3B';
  const badgeClass = status === 'mastered' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
    status === 'strong' ? 'bg-primary/10 text-primary' :
    status === 'improving' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
    'bg-destructive/10 text-destructive';
  return (
    <div className="bg-card rounded-[14px] border border-border p-3 shadow-sm">
      <p className="text-[12.5px] font-semibold mb-2 leading-tight">{name}</p>
      <p className="font-bold text-lg tracking-tight mb-1.5" style={{ color }}>{percent}%</p>
      <div className="h-1 rounded bg-muted/30 mb-1.5">
        <div className="h-1 rounded transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

// ─── Streak Dot Grid ────────────────────────────
const StreakDots: React.FC = () => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const data = [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, -1, 2, 2, 2];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {data.map((v, i) => (
        <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold relative ${
          v === 1 ? 'bg-foreground text-background' :
          v === -1 ? 'bg-primary text-primary-foreground' :
          v === 2 ? 'bg-border/50 text-muted-foreground opacity-50' :
          'bg-muted text-muted-foreground'
        }`}>
          {days[i % 7]}
          {v === -1 && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
        </div>
      ))}
    </div>
  );
};

// ─── Attendance Grid ────────────────────────────
const AttendanceGrid: React.FC = () => {
  const data = [1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, -1, -1, -1];
  return (
    <div>
      <div className="flex gap-1.5 flex-wrap">
        {data.map((v, i) => (
          <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
            v === 1 ? 'bg-emerald-500 text-white' :
            v === 0 ? 'bg-destructive/10 text-destructive' :
            'bg-muted text-muted-foreground border border-dashed border-border'
          }`}>
            {v === -1 ? `S${i - 11}` : `S${i + 1}`}
          </div>
        ))}
      </div>
      <div className="flex gap-3.5 mt-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Attended</div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-destructive/30 border border-destructive" />Missed</div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-muted border border-dashed border-border" />Upcoming</div>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────
const StudentInsightZone: React.FC = () => {
  const { profile } = useAuth();
  const { navigateToPractice } = useStudent();

  const [period, setPeriod] = useState('This Week');
  const [category, setCategory] = useState('Self Learning');
  const [privateClass, setPrivateClass] = useState('BECE Exam Prep');

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [parentEmail, setParentEmail] = useState('');

  const studentName = profile?.first_name || 'Student';
  const classGrade = 'JHS 2';

  const handleSendToParent = () => {
    if (!parentEmail.trim()) { toast.error('Please enter a parent email address.'); return; }
    const summary = `📊 ${studentName}'s Learning Progress\nClass: ${classGrade}\nLearning Progress Score: 72\nPowered by Jesi AI`;
    if (navigator.share) {
      navigator.share({ title: `${studentName}'s Progress`, text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
    }
    toast.success(`Progress summary ready to share with ${parentEmail}!`);
    setShowShareModal(false);
    setParentEmail('');
  };

  return (
    <div className="space-y-4 animate-fade-in pb-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Progress</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{studentName} · {classGrade}</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowShareModal(true)}>
          <Send className="w-3.5 h-3.5" /> Share
        </Button>
      </div>

      {/* Period Selector */}
      <PeriodSelector options={['This Week', 'This Month', 'This Term', 'All Time']} value={period} onChange={setPeriod} />

      {/* LPS Hero Card */}
      <div className="relative bg-foreground rounded-[20px] p-5 sm:p-6 overflow-hidden shadow-lg" role="region" aria-label="Learning Progress Score">
        {/* Glow effects */}
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-primary/25 blur-2xl pointer-events-none" />
        <div className="absolute -left-5 -bottom-8 w-40 h-40 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <p className="text-[11px] font-semibold uppercase tracking-wider text-background/50 mb-1.5 relative z-10">Learning Progress Score</p>
        <div className="flex items-end gap-3 mb-2 relative z-10">
          <span className="text-5xl sm:text-6xl font-extrabold text-background tracking-tighter leading-none">72</span>
          <ProgressRing percent={72} size={72} strokeWidth={6} color="hsl(var(--primary))" />
        </div>
        <div className="inline-flex items-center gap-1 bg-emerald-400/15 text-emerald-300 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold mb-3 relative z-10">
          ↑ +8 points this month
        </div>

        {/* LPS Breakdown Factors */}
        <div className="grid grid-cols-5 gap-2 border-t border-background/10 pt-3 relative z-10">
          {[
            { val: '78%', label: 'Quiz' },
            { val: '74%', label: 'HW' },
            { val: '68%', label: 'Learn' },
            { val: '71%', label: 'Practice' },
            { val: '75%', label: 'Understand' },
          ].map(f => (
            <div key={f.label} className="text-center">
              <p className="font-bold text-sm text-background">{f.val}</p>
              <p className="text-[9.5px] text-background/45 mt-0.5 leading-tight">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Study Habit */}
      <div>
        <h2 className="font-bold text-[15px] mb-2.5">Study Habit</h2>
        <div className="bg-card rounded-[14px] border border-border p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Current Streak</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tighter">7</span>
                <span className="text-[13px] font-semibold text-muted-foreground">days 🔥</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground font-medium mb-1">Active Days</p>
              <span className="text-2xl font-extrabold tracking-tight">18<span className="text-[13px] font-medium text-muted-foreground">/30</span></span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium mb-2">Last 30 days</p>
          <StreakDots />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-card rounded-[14px] border border-border p-3.5 shadow-sm">
          <p className="text-[11px] text-muted-foreground font-medium mb-1.5">Learning Time</p>
          <p className="text-2xl font-extrabold tracking-tight leading-none mb-1">4.2h</p>
          <p className="text-[11.5px] text-emerald-500 font-medium">↑ 40 min vs last week</p>
        </div>
        <div className="bg-card rounded-[14px] border border-border p-3.5 shadow-sm">
          <p className="text-[11px] text-muted-foreground font-medium mb-1.5">Subjects Studied</p>
          <p className="text-2xl font-extrabold tracking-tight leading-none mb-1">5</p>
          <p className="text-[11.5px] text-muted-foreground">of 6 subjects</p>
        </div>
      </div>

      {/* Breakdown Section */}
      <div>
        <h2 className="font-bold text-[15px] mb-2">Breakdown</h2>
        <CategoryTabs options={['Self Learning', 'Class Work', 'Private Class']} value={category} onChange={setCategory} />
      </div>

      {/* ══ Self Learning Panel ══ */}
      {category === 'Self Learning' && (
        <div className="space-y-3 animate-fade-in">
          {/* Understanding Score Ring Card */}
          <div className="bg-card rounded-[20px] border border-border p-5 shadow-sm flex items-center gap-5">
            <ProgressRing percent={75} size={80} strokeWidth={7} color="hsl(var(--primary))" label="75%" />
            <div className="flex-1">
              <p className="font-bold text-[13px] mb-1">Understanding Score</p>
              <p className="text-[12px] text-muted-foreground mb-2.5">Avg of post-study concept checks</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11.5px]"><span className="text-muted-foreground">Learning Gain</span><span className="font-bold text-emerald-500">+19pts</span></div>
                <div className="flex justify-between text-[11.5px]"><span className="text-muted-foreground">AI Questions asked</span><span className="font-bold">24</span></div>
                <div className="flex justify-between text-[11.5px]"><span className="text-muted-foreground">Sessions</span><span className="font-bold">11</span></div>
              </div>
            </div>
          </div>

          {/* Self-learn metrics */}
          <div className="bg-card rounded-[14px] border border-border overflow-hidden shadow-sm">
            <MetricRow icon="📚" iconBg="bg-primary/10" name="Self Learning Sessions" desc="Opened topics, notes & videos" value="11" change="↑ +3 sessions" changeColor="#0E8F64" />
            <MetricRow icon="✅" iconBg="bg-emerald-100 dark:bg-emerald-950" name="Content Completion" desc="Notes read · Videos watched" value="68%" valueColor="#0E8F64" change="17/25 items" barPercent={68} barColor="#0E8F64" />
            <MetricRow icon="🤖" iconBg="bg-purple-100 dark:bg-purple-950" name="Jesi AI Engagement" desc="Explanation requests to AI" value="24" change="↑ active learner" changeColor="#0E8F64" />
            <MetricRow icon="🎯" iconBg="bg-amber-100 dark:bg-amber-950" name="Understanding Check Score" desc="Post-study concept check avg" value="75%" valueColor="#C4730A" change="↑ +19pts growth" changeColor="#0E8F64" barPercent={75} barColor="#C4730A" />
          </div>

          {/* Understanding Trend */}
          <TrendBars data={[52, 54, 56, 60, 58, 65, 70, 75]} color="hsl(var(--primary))" startLabel="8 wks ago" endLabel="Now: 75%" title="Understanding Growth — 8 Weeks" />

          {/* Topic Mastery */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="font-bold text-[15px]">Topic Mastery</h2>
              <span className="text-[12px] text-primary font-semibold cursor-pointer">12 mastered →</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TopicCard name="Cell Biology" percent={92} status="mastered" />
              <TopicCard name="Linear Equations" percent={88} status="strong" />
              <TopicCard name="Quadratic Eq." percent={65} status="improving" />
              <TopicCard name="Surds & Indices" percent={41} status="weak" />
              <TopicCard name="Photosynthesis" percent={58} status="improving" />
              <TopicCard name="Trigonometry" percent={38} status="weak" />
            </div>
          </div>
        </div>
      )}

      {/* ══ Class Work Panel ══ */}
      {category === 'Class Work' && (
        <div className="space-y-3 animate-fade-in">
          {/* Participation Score */}
          <div className="bg-card rounded-[20px] border border-border p-5 shadow-sm flex items-center gap-5">
            <ProgressRing percent={77} size={80} strokeWidth={7} color="#0E8F64" label="77" />
            <div className="flex-1">
              <p className="font-bold text-[13px] mb-1">Class Participation</p>
              <p className="text-[12px] text-muted-foreground mb-2.5">Notes + homework + AI usage</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11.5px]"><span className="text-muted-foreground">Notes opened</span><span className="font-bold">14</span></div>
                <div className="flex justify-between text-[11.5px]"><span className="text-muted-foreground">Resources opened</span><span className="font-bold">9</span></div>
                <div className="flex justify-between text-[11.5px]"><span className="text-muted-foreground">Homework attempted</span><span className="font-bold">6/7</span></div>
              </div>
            </div>
          </div>

          {/* Class metrics */}
          <div className="bg-card rounded-[14px] border border-border overflow-hidden shadow-sm">
            <MetricRow icon="📋" iconBg="bg-emerald-100 dark:bg-emerald-950" name="Homework Completion" desc="Submitted vs assigned" value="86%" valueColor="#0E8F64" change="6/7 submitted" barPercent={86} barColor="#0E8F64" />
            <MetricRow icon="📊" iconBg="bg-primary/10" name="Homework Avg Score" desc="Average across submissions" value="74%" change="↑ +18pts growth" changeColor="#0E8F64" />
            <MetricRow icon="📈" iconBg="bg-amber-100 dark:bg-amber-950" name="Homework Improvement" desc="Previous: 49% · Current: 67%" value="+18" valueColor="#0E8F64" change="pts gained" changeColor="#0E8F64" />
          </div>

          {/* Class Subject Mastery */}
          <div>
            <h2 className="font-bold text-[15px] mb-2.5">Class Subject Mastery</h2>
            <div className="bg-card rounded-[14px] border border-border overflow-hidden shadow-sm">
              <MetricRow icon="📐" iconBg="bg-primary/10" name="Mathematics" desc="HW 45% + Understanding 25% + Quiz 20% + Content 10%" value="74%" barPercent={74} barColor="hsl(var(--primary))" badge={{ label: 'Strong', variant: 'strong' }} />
              <MetricRow icon="🔬" iconBg="bg-teal-100 dark:bg-teal-950" name="Integrated Science" desc="Combined mastery score" value="62%" barPercent={62} barColor="#0C7A7A" badge={{ label: 'Improving', variant: 'improving' }} />
              <MetricRow icon="✍️" iconBg="bg-purple-100 dark:bg-purple-950" name="English Language" desc="Combined mastery score" value="81%" barPercent={81} barColor="#6936B8" badge={{ label: 'Mastered', variant: 'mastered' }} />
              <MetricRow icon="🌍" iconBg="bg-amber-100 dark:bg-amber-950" name="Social Studies" desc="Combined mastery score" value="68%" barPercent={68} barColor="#C4730A" badge={{ label: 'Improving', variant: 'improving' }} />
            </div>
          </div>

          {/* HW Score Trend */}
          <TrendBars data={[49, 52, 55, 58, 62, 65, 69, 74]} color="#0E8F64" startLabel="Wk 1" endLabel="Now: 74%" title="Homework Score Trend" />
        </div>
      )}

      {/* ══ Private Class Panel ══ */}
      {category === 'Private Class' && (
        <div className="space-y-3 animate-fade-in">
          {/* Class selector */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {['BECE Exam Prep', 'Math Masterclass'].map(cls => (
              <button key={cls} onClick={() => setPrivateClass(cls)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[12px] font-semibold whitespace-nowrap border shadow-sm flex-shrink-0 transition-all ${
                  privateClass === cls
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-foreground border-border'
                }`}>
                <span className={`w-2 h-2 rounded-full ${cls === 'BECE Exam Prep' ? 'bg-yellow-400' : 'bg-emerald-500'}`} />
                {cls}
              </button>
            ))}
          </div>

          {/* Private Class Hero */}
          <div className="relative bg-gradient-to-br from-[#0C1A5E] to-[#1A2E8A] rounded-[20px] p-5 text-white overflow-hidden shadow-lg">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
            <p className="text-[12px] text-white/55 mb-1">BECE Exam Prep Masterclass · Mr. Kofi Owusu</p>
            <p className="font-extrabold text-base mb-3.5">Private Class Progress Score</p>
            <div className="flex items-center gap-4 mb-3.5">
              <span className="text-5xl font-extrabold tracking-tighter leading-none">78</span>
              <ProgressRing percent={78} size={72} strokeWidth={6} color="#F5C518" />
            </div>
            <p className="text-[12px] text-white/50 mb-3.5">"You're getting good value from this class."</p>
            <div className="grid grid-cols-4 gap-2 border-t border-white/10 pt-3">
              {[
                { val: '89%', label: 'Attendance Rate' },
                { val: '92%', label: 'Assignment Completion' },
                { val: '71%', label: 'Assignment Avg' },
                { val: '75%', label: 'Understanding' },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="font-extrabold text-[15px]">{item.val}</p>
                  <p className="text-[9.5px] text-white/45 mt-0.5 leading-tight">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Heatmap */}
          <div className="bg-card rounded-[14px] border border-border p-4 shadow-sm">
            <p className="font-bold text-[13px] mb-1">Live Class Attendance — Last 12 Sessions</p>
            <p className="text-[12px] text-muted-foreground mb-2.5">6 out of last 7 sessions attended</p>
            <AttendanceGrid />
          </div>

          {/* Private class metrics */}
          <div className="bg-card rounded-[14px] border border-border overflow-hidden shadow-sm">
            <MetricRow icon="🎥" iconBg="bg-emerald-100 dark:bg-emerald-950" name="Live Class Attendance" desc="16 of 18 scheduled classes" value="89%" valueColor="#0E8F64" change="↑ consistent" changeColor="#0E8F64" barPercent={89} barColor="#0E8F64" />
            <MetricRow icon="📝" iconBg="bg-amber-100 dark:bg-amber-950" name="Assignment Completion" desc="11 of 12 assignments done" value="92%" valueColor="#C4730A" change="1 pending" barPercent={92} barColor="#C4730A" />
            <MetricRow icon="🏆" iconBg="bg-primary/10" name="Assignment Avg Score" desc="Across submitted assignments" value="71%" change="↑ +9pts" changeColor="#0E8F64" />
            <MetricRow icon="✅" iconBg="bg-teal-100 dark:bg-teal-950" name="Content Completion" desc="Class materials consumed" value="78%" barPercent={78} barColor="#0C7A7A" change="14/18 modules" />
          </div>

          {/* Assignment Score Trend */}
          <TrendBars data={[55, 58, 60, 62, 58, 65, 68, 71]} color="#6936B8" startLabel="Session 1" endLabel="Latest: 71%" title="Assignment Score Trend" />
        </div>
      )}

      {/* Parent Share Card */}
      <div className="bg-gradient-to-r from-secondary/50 to-secondary/30 rounded-[14px] border border-border p-4">
        <p className="font-bold text-sm mb-2">👨‍👩‍👧 What My Parents Can See</p>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">✅ Subjects I'm improving in</p>
          <p className="flex items-center gap-1.5">✅ Topics I need help with</p>
          <p className="flex items-center gap-1.5">✅ My weekly study effort</p>
        </div>
        <Button variant="outline" size="sm" className="mt-3 text-xs gap-1.5" onClick={() => setShowShareModal(true)}>
          <Send className="w-3.5 h-3.5" /> Share Progress with Parent
        </Button>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📤 Share Progress with Parent</DialogTitle>
            <DialogDescription>Review the summary below before sharing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1">📊 Learning Progress Score: 72</p>
              <p className="text-xs text-muted-foreground">Class: {classGrade}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-email" className="text-sm">Parent's Email</Label>
              <Input id="parent-email" type="email" placeholder="parent@email.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowShareModal(false)}>Cancel</Button>
            <Button onClick={handleSendToParent} className="gap-2"><Send className="w-4 h-4" /> Send to Parent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentInsightZone;
