import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const relKey = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// ─── Initial Data ──────────────────────────────────────────────────────────
const INIT_HABITS = [
  { id: "h1", name: "Wake up at 6:00 AM", category: "routine", time: "6:00 AM", duration: "Morning", completedDates: [todayKey(), relKey(-1), relKey(-2)] },
  { id: "h2", name: "Exercise", category: "fitness", time: "7:00 AM", duration: "30 min", completedDates: [todayKey(), relKey(-1), relKey(-2), relKey(-3)] },
  { id: "h3", name: "Study", category: "education", time: "9:00 AM", duration: "1 hr", completedDates: [relKey(-1), relKey(-3)] },
  { id: "h4", name: "Drink 8 Glasses of Water", category: "health", time: "All Day", duration: "8 glasses", completedDates: [relKey(-1), relKey(-2)] },
  { id: "h5", name: "Morning Jog", category: "fitness", time: "7:30 AM", duration: "30 min", completedDates: [relKey(-1), relKey(-2), relKey(-3)] },
  { id: "h6", name: "Reading", category: "education", time: "9:00 PM", duration: "20 pages", completedDates: [relKey(-1), relKey(-2)] },
];
const INIT_PROFILE = { name: "Alex Johnson", level: 12, xp: 7200, maxXp: 10000, streak: 84, memberSince: "2023", isPro: true };
const INIT_SETTINGS = { theme: "light", notifications: true };

// ─── Storage ───────────────────────────────────────────────────────────────
function useLS(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

// ─── Category config ───────────────────────────────────────────────────────
const CAT = {
  fitness:   { label: "Fitness",   color: "#6366f1", bg: "rgba(99,102,241,0.1)",   icon: "🏃" },
  education: { label: "Education", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: "📚" },
  health:    { label: "Health",    color: "#10b981", bg: "rgba(16,185,129,0.1)",   icon: "💧" },
  routine:   { label: "Routine",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  icon: "⏰" },
  general:   { label: "General",   color: "#64748b", bg: "rgba(100,116,139,0.1)", icon: "✦"  },
};

// ─── Streak calculation ────────────────────────────────────────────────────
function calcStreak(habits) {
  if (!habits.length) return 0;
  let streak = 0;
  let day = 0;
  while (true) {
    const key = relKey(-day);
    const anyDone = habits.some(h => h.completedDates.includes(key));
    if (!anyDone) break;
    streak++;
    day++;
    if (day > 365) break;
  }
  return streak;
}

// ─── Mini icon SVGs ────────────────────────────────────────────────────────
const Icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  today:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  calendar:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  stats:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  plus:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  flame:     <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0-5.5 5-5.5 10a5.5 5.5 0 0011 0C17.5 7 12 2 12 2zm0 14a3 3 0 01-3-3c0-2 2-4 3-5.5 1 1.5 3 3.5 3 5.5a3 3 0 01-3 3z"/></svg>,
  menu:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  download:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  trend:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  award:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  chevLeft:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
};

// ─── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #f5f4f1;
  --surface: #ffffff;
  --surface2: #f0eee9;
  --border: rgba(0,0,0,0.07);
  --text: #1a1814;
  --text2: #6b6560;
  --text3: #a09890;
  --accent: #1a1814;
  --accent2: #e8643c;
  --green: #22c55e;
  --nav-h: 72px;
  --radius: 20px;
  --radius-sm: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
}
.dark {
  --bg: #0f0e0c;
  --surface: #1a1916;
  --surface2: #242220;
  --border: rgba(255,255,255,0.07);
  --text: #f0ede8;
  --text2: #8a8278;
  --text3: #5c5650;
  --accent: #f0ede8;
}

body { background: var(--bg); color: var(--text); line-height: 1.5; }

.app { display: flex; flex-direction: column; height: 100dvh; max-width: 430px; margin: 0 auto; background: var(--bg); position: relative; overflow: hidden; }
@media(min-width:768px) { body { background: #e8e6e2; display: flex; align-items: center; justify-content: center; min-height: 100dvh; } .dark body { background: #060504; } .app { height: 820px; border-radius: 32px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.1); } }

/* Header */
.header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--bg); border-bottom: 1px solid var(--border); flex-shrink: 0; position: relative; z-index: 10; }
.logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -0.5px; color: var(--text); }
.logo span { color: var(--accent2); }
.icon-btn { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text); transition: all 0.15s; }
.icon-btn:hover { background: var(--surface2); transform: scale(1.05); }
.icon-btn svg { width: 17px; height: 17px; }
.header-actions { display: flex; gap: 8px; }

/* Content area */
.content { flex: 1; overflow-y: auto; padding: 20px 20px 0; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.content::-webkit-scrollbar { display: none; }

/* Bottom Nav */
.nav { display: flex; align-items: center; justify-content: space-around; background: var(--surface); border-top: 1px solid var(--border); height: var(--nav-h); flex-shrink: 0; padding-bottom: env(safe-area-inset-bottom, 0); }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; padding: 8px 14px; border-radius: 14px; transition: all 0.15s; color: var(--text3); border: none; background: transparent; }
.nav-item svg { width: 20px; height: 20px; }
.nav-item span { font-size: 10px; font-weight: 600; letter-spacing: 0.3px; font-family: 'Syne', sans-serif; }
.nav-item.active { color: var(--accent2); background: rgba(232,100,60,0.1); }

/* Cards */
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
.card-sm { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; }

/* Section titles */
.section-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); margin-bottom: 12px; }

/* Progress bar */
.progress-track { background: var(--surface2); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent2), #f0954a); border-radius: 99px; transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }

/* Habit item */
.habit-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.15s; user-select: none; -webkit-tap-highlight-color: transparent; }
.habit-item:hover { border-color: rgba(232,100,60,0.3); background: var(--surface2); }
.habit-item.done { opacity: 0.55; }
.habit-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.habit-info { flex: 1; min-width: 0; }
.habit-name { font-weight: 600; font-size: 14px; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: all 0.15s; }
.habit-name.done { text-decoration: line-through; color: var(--text3); }
.habit-meta { font-size: 12px; color: var(--text2); margin-top: 2px; }
.check-btn { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; cursor: pointer; background: transparent; color: white; }
.check-btn svg { width: 14px; height: 14px; }
.check-btn.done { background: var(--accent2); border-color: var(--accent2); }
.check-btn.done svg { stroke: white; }

/* Stat grid */
.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px; }
.stat-label { font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Syne', sans-serif; margin-bottom: 6px; }
.stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: var(--text); line-height: 1; }
.stat-sub { font-size: 12px; color: var(--text2); margin-top: 4px; }

/* Ring */
.ring-wrap { position: relative; display: inline-flex; align-items: center; justify-content:: center; }
.ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }

/* Insight cards */
.insight { display: flex; gap: 12px; padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); margin-bottom: 10px; }
.insight-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }

/* Calendar */
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-day { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 44px; border-radius: 10px; cursor: pointer; transition: all 0.15s; border: none; background: transparent; color: var(--text); font-size: 13px; font-weight: 500; }
.cal-day:hover { background: var(--surface2); }
.cal-day.selected { background: var(--accent); color: var(--bg); font-weight: 700; }
.dark .cal-day.selected { background: var(--text); color: var(--bg); }
.cal-day.today:not(.selected) { color: var(--accent2); font-weight: 700; }
.cal-dot { width: 5px; height: 5px; border-radius: 50%; margin-top: 2px; }

/* Modal overlay */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); }
@media(min-width:768px) { .overlay { align-items: center; } }
.modal { background: var(--surface); border-radius: 24px 24px 0 0; width: 100%; max-width: 430px; padding: 24px 24px 32px; max-height: 85dvh; overflow-y: auto; }
@media(min-width:768px) { .modal { border-radius: 24px; max-height: 75vh; } }
.modal-handle { width: 36px; height: 4px; background: var(--border); border-radius: 99px; margin: 0 auto 20px; }

/* Form */
.form-label { font-size: 12px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px; font-family: 'Syne', sans-serif; }
.form-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; font-size: 14px; color: var(--text); outline: none; font-family: inherit; transition: border-color 0.15s; }
.form-input:focus { border-color: var(--accent2); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.cat-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cat-chip { padding: 6px 14px; border-radius: 99px; border: 1.5px solid var(--border); background: var(--surface2); font-size: 12px; font-weight: 600; color: var(--text2); cursor: pointer; transition: all 0.15s; font-family: 'Syne', sans-serif; }
.cat-chip.active { border-color: var(--accent2); color: var(--accent2); background: rgba(232,100,60,0.08); }
.btn-primary { width: 100%; padding: 15px; background: var(--text); color: var(--bg); border: none; border-radius: 14px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'Syne', sans-serif; letter-spacing: 0.5px; transition: opacity 0.15s; }
.btn-primary:hover { opacity: 0.85; }
.dark .btn-primary { background: var(--text); color: var(--bg); }

/* Sidebar */
.sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; backdrop-filter: blur(4px); }
.sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 280px; background: var(--surface); z-index: 201; display: flex; flex-direction: column; padding: 32px 20px 20px; border-right: 1px solid var(--border); overflow-y: auto; }
@media(min-width:768px) { .sidebar { position: absolute; } }

/* XP bar */
.xp-bar-wrap { margin-top: 12px; }
.xp-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--text2); margin-bottom: 5px; font-weight: 500; }
.xp-track { height: 6px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.xp-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a78bfa); border-radius: 99px; transition: width 0.4s ease; }

/* Tag chip */
.tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; font-family: 'Syne', sans-serif; letter-spacing: 0.3px; }

/* Toggle switch */
.toggle-wrap { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); }
.toggle-wrap:last-child { border-bottom: none; }
.toggle-label { font-size: 14px; font-weight: 500; color: var(--text); }
.toggle-sub { font-size: 12px; color: var(--text2); }
.switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: var(--surface2); border-radius: 99px; cursor: pointer; transition: background 0.2s; border: 1px solid var(--border); }
.slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 2px; top: 2px; background: white; border-radius: 50%; transition: transform 0.2s; }
input:checked + .slider { background: var(--accent2); border-color: var(--accent2); }
input:checked + .slider::before { transform: translateX(20px); }

/* Theme selector */
.theme-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
.theme-opt { padding: 12px 8px; border-radius: 12px; border: 2px solid var(--border); cursor: pointer; text-align: center; font-size: 11px; font-weight: 700; font-family: 'Syne', sans-serif; color: var(--text2); transition: all 0.15s; background: var(--surface2); }
.theme-opt.active { border-color: var(--accent2); color: var(--accent2); background: rgba(232,100,60,0.07); }
.theme-preview { width: 100%; height: 32px; border-radius: 8px; margin-bottom: 8px; display: flex; overflow: hidden; }

/* Empty state */
.empty { text-align: center; padding: 40px 20px; color: var(--text3); }
.empty-emoji { font-size: 40px; margin-bottom: 12px; }
.empty-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: var(--text2); margin-bottom: 6px; }

/* Spacing helpers */
.gap-stack { display: flex; flex-direction: column; gap: 12px; }
.row { display: flex; align-items: center; }
.row-between { display: flex; align-items: center; justify-content: space-between; }
.mt4 { margin-top: 4px; } .mt8 { margin-top: 8px; } .mt12 { margin-top: 12px; } .mt16 { margin-top: 16px; } .mt20 { margin-top: 20px; } .mt24 { margin-top: 24px; }
.mb16 { margin-bottom: 16px; } .mb20 { margin-bottom: 20px; }
.pb20 { padding-bottom: 20px; }

/* Animations */
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes checkPop { 0% { transform: scale(0.5); } 70% { transform: scale(1.15); } 100% { transform: scale(1); } }
.animate-up { animation: slideUp 0.3s ease both; }
.animate-fade { animation: fadeIn 0.2s ease both; }
.check-anim { animation: checkPop 0.25s ease both; }

/* week chart */
.chart-bar { border-radius: 6px 6px 0 0; transition: height 0.5s cubic-bezier(0.34,1.56,0.64,1); cursor: default; }
`;

// ─── Circular Ring ─────────────────────────────────────────────────────────
function Ring({ pct, size = 160, stroke = 10, color = "#e8643c", children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────
function DashboardTab({ habits, profile, onChangeTab }) {
  const key = todayKey();
  const total = habits.length;
  const done = habits.filter(h => h.completedDates.includes(key)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const streak = calcStreak(habits);
  const xpPct = Math.round((profile.xp / profile.maxXp) * 100);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  // Weekly completion: last 7 days
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const k = relKey(-(6 - i));
      const c = habits.filter(h => h.completedDates.includes(k)).length;
      const t = habits.length;
      return { pct: t ? Math.round((c / t) * 100) : 0, label: ["M","T","W","T","F","S","S"][(new Date(k).getDay() + 6) % 7] };
    });
  }, [habits]);

  return (
    <div className="animate-up gap-stack pb20">
      {/* Greeting */}
      <div className="card">
        <div className="row-between mb16">
          <div>
            <p style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, fontFamily: "Syne" }}>{greet()}</p>
            <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22, lineHeight: 1.2, marginTop: 4 }}>{profile.name}</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="tag" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>Lvl {profile.level}</div>
            {profile.isPro && <div className="tag mt4" style={{ background: "rgba(232,100,60,0.12)", color: "var(--accent2)", display: "block", marginTop: 6 }}>PRO</div>}
          </div>
        </div>
        <div className="xp-bar-wrap">
          <div className="xp-label"><span>XP {profile.xp.toLocaleString()}</span><span>{profile.maxXp.toLocaleString()}</span></div>
          <div className="xp-track"><div className="xp-fill" style={{ width: xpPct + "%" }} /></div>
        </div>
      </div>

      {/* Progress ring + stats */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Ring pct={pct} size={110} stroke={8}>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 22 }}>{pct}%</span>
          <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600 }}>TODAY</span>
        </Ring>
        <div style={{ flex: 1 }}>
          <div className="stat-grid" style={{ gap: 10 }}>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-label">Tasks</div>
              <div className="stat-val" style={{ fontSize: 18 }}>{done}/{total}</div>
            </div>
            <div className="stat-card" style={{ padding: 12, cursor: "pointer" }} onClick={() => onChangeTab("stats")}>
              <div className="stat-label">Streak</div>
              <div className="stat-val" style={{ fontSize: 18, color: "#f59e0b" }}>🔥 {streak}d</div>
            </div>
          </div>
          <div className="mt8" style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.4 }}>
            {pct === 100 ? "🎉 All done! Perfect day!" : done === 0 ? "Start your first habit today!" : `${total - done} left to complete`}
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="card">
        <div className="row-between mb16">
          <span className="section-title" style={{ margin: 0 }}>This Week</span>
          <span style={{ fontSize: 12, color: "var(--accent2)", fontWeight: 700 }}>Last 7 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 80, gap: 6 }}>
          {weekData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div className="chart-bar" style={{ width: "100%", height: Math.max(4, d.pct * 0.8) + "%", background: d.pct >= 80 ? "var(--accent2)" : d.pct >= 50 ? "rgba(232,100,60,0.4)" : "var(--surface2)" }} />
              </div>
              <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, fontFamily: "Syne" }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(232,100,60,0.06), rgba(99,102,241,0.06))" }}>
        <div className="row" style={{ gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>Daily Insight</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
          {done > total / 2 ? "You're past halfway — great momentum! Focus on finishing your remaining habits before evening." : "Morning hours show your highest completion rates. Try tackling your toughest habits before noon."}
        </p>
      </div>
    </div>
  );
}

// ─── Today Tab ─────────────────────────────────────────────────────────────
function TodayTab({ habits, onToggle, onAdd }) {
  const key = todayKey();
  const done = habits.filter(h => h.completedDates.includes(key));
  const pending = habits.filter(h => !h.completedDates.includes(key));
  const pct = habits.length ? Math.round((done.length / habits.length) * 100) : 0;

  const fmt = () => {
    const d = new Date();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  };

  const HabitRow = ({ habit, idx }) => {
    const isD = habit.completedDates.includes(key);
    const cat = CAT[habit.category] || CAT.general;
    return (
      <div className={`habit-item${isD ? " done" : ""} animate-up`} style={{ animationDelay: idx * 0.04 + "s" }} onClick={() => onToggle(habit.id)}>
        <div className="habit-icon" style={{ background: cat.bg }}>{cat.icon}</div>
        <div className="habit-info">
          <div className={`habit-name${isD ? " done" : ""}`}>{habit.name}</div>
          <div className="habit-meta">{habit.time} · {habit.duration}</div>
        </div>
        <button className={`check-btn${isD ? " done" : ""}`} onClick={e => { e.stopPropagation(); onToggle(habit.id); }}>
          {isD && <span className="check-anim">{Icons.check}</span>}
        </button>
      </div>
    );
  };

  return (
    <div className="animate-up gap-stack pb20">
      {/* Header */}
      <div>
        <p style={{ fontSize: 13, color: "var(--text3)", fontWeight: 600, fontFamily: "Syne", letterSpacing: 0.5 }}>{fmt()}</p>
        <div className="row-between mt8">
          <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24 }}>Today's Habits</h2>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, color: pct === 100 ? "var(--green)" : "var(--accent2)" }}>{pct}%</span>
        </div>
        <div className="progress-track mt8" style={{ height: 6 }}>
          <div className="progress-fill" style={{ width: pct + "%" }} />
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <div className="section-title">Remaining ({pending.length})</div>
          <div className="gap-stack" style={{ gap: 8 }}>
            {pending.map((h, i) => <HabitRow key={h.id} habit={h} idx={i} />)}
          </div>
        </div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <div>
          <div className="section-title">Completed ({done.length})</div>
          <div className="gap-stack" style={{ gap: 8 }}>
            {done.map((h, i) => <HabitRow key={h.id} habit={h} idx={i} />)}
          </div>
        </div>
      )}

      {habits.length === 0 && (
        <div className="empty card">
          <div className="empty-emoji">🌱</div>
          <div className="empty-title">No habits yet</div>
          <p style={{ fontSize: 13, color: "var(--text3)" }}>Tap the + button to add your first habit</p>
          <button className="btn-primary mt16" style={{ borderRadius: 99, padding: "10px 24px", width: "auto" }} onClick={onAdd}>Add Habit</button>
        </div>
      )}
    </div>
  );
}

// ─── Calendar Tab ──────────────────────────────────────────────────────────
function CalendarTab({ habits }) {
  const now = new Date();
  const [viewDate, setViewDate] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selDay, setSelDay] = useState(now.getDate());

  const { year, month } = viewDate;
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getStatus = (day) => {
    const k = `${year}-${pad(month + 1)}-${pad(day)}`;
    const todK = todayKey();
    if (k > todK) return "future";
    const c = habits.filter(h => h.completedDates.includes(k)).length;
    if (c === 0) return "missed";
    if (c >= habits.length) return "full";
    return "partial";
  };

  const dotColor = (s) => ({ full: "var(--green)", partial: "#f59e0b", missed: "rgba(239,68,68,0.6)", future: "transparent" }[s] || "transparent");

  const selKey = `${year}-${pad(month + 1)}-${pad(selDay)}`;
  const selHabits = habits.filter(h => h.completedDates.includes(selKey));
  const selTotal = habits.length;
  const selPct = selTotal ? Math.round((selHabits.length / selTotal) * 100) : 0;

  const isToday = (d) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d;
  };

  return (
    <div className="animate-up gap-stack pb20">
      {/* Month nav */}
      <div className="card">
        <div className="row-between mb16">
          <h3 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 17 }}>{monthNames[month]} {year}</h3>
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" onClick={() => { const d = new Date(year, month - 1); setViewDate({ year: d.getFullYear(), month: d.getMonth() }); setSelDay(1); }}>{Icons.chevLeft}</button>
            <button className="icon-btn" onClick={() => { const d = new Date(year, month + 1); setViewDate({ year: d.getFullYear(), month: d.getMonth() }); setSelDay(1); }}>{Icons.chevRight}</button>
          </div>
        </div>
        {/* Week labels */}
        <div className="cal-grid mb8">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text3)", fontFamily: "Syne" }}>{d}</div>)}
        </div>
        {/* Day cells */}
        <div className="cal-grid">
          {Array.from({ length: firstDow }, (_, i) => <div key={"e" + i} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const st = getStatus(d);
            return (
              <button key={d} className={`cal-day${selDay === d ? " selected" : ""}${isToday(d) ? " today" : ""}`} onClick={() => setSelDay(d)}>
                {d}
                <div className="cal-dot" style={{ background: selDay === d ? "transparent" : dotColor(st) }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <div className="card">
        <div className="row-between mb16">
          <div>
            <div className="section-title" style={{ margin: 0 }}>{monthNames[month]} {selDay}, {year}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24, color: selPct >= 80 ? "var(--green)" : "var(--accent2)" }}>{selPct}%</div>
            <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>complete</div>
          </div>
        </div>
        {selHabits.length > 0 ? (
          <div className="gap-stack" style={{ gap: 8 }}>
            {selHabits.map(h => {
              const cat = CAT[h.category] || CAT.general;
              return (
                <div key={h.id} className="row" style={{ gap: 12, padding: "12px 14px", background: "var(--surface2)", borderRadius: 12 }}>
                  <div style={{ fontSize: 18 }}>{cat.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{h.time} · {h.duration}</div>
                  </div>
                  <span style={{ color: "var(--green)", fontSize: 18 }}>✓</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", padding: "16px 0" }}>{getStatus(selDay) === "future" ? "Future date — keep building!" : "No habits completed this day."}</p>
        )}
      </div>
    </div>
  );
}

// ─── Stats Tab ─────────────────────────────────────────────────────────────
function StatsTab({ habits }) {
  const key = todayKey();
  const streak = calcStreak(habits);
  const totalCompletions = habits.reduce((a, h) => a + h.completedDates.length, 0);
  const avgComp = useMemo(() => {
    const days = new Set(habits.flatMap(h => h.completedDates)).size;
    if (!days || !habits.length) return 0;
    return Math.round((totalCompletions / (days * habits.length)) * 100);
  }, [habits, totalCompletions]);

  const byCat = useMemo(() => {
    const counts = {};
    habits.forEach(h => { counts[h.category] = (counts[h.category] || 0) + h.completedDates.length; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [habits]);

  const maxCat = byCat[0]?.[1] || 1;

  // 4-week heatmap
  const heatDays = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const k = relKey(-(27 - i));
      const c = habits.filter(h => h.completedDates.includes(k)).length;
      const t = habits.length;
      return t ? c / t : 0;
    });
  }, [habits]);

  const heatColor = (v) => {
    if (v === 0) return "var(--surface2)";
    if (v < 0.33) return "rgba(232,100,60,0.25)";
    if (v < 0.66) return "rgba(232,100,60,0.55)";
    return "var(--accent2)";
  };

  return (
    <div className="animate-up gap-stack pb20">
      <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24 }}>Your Stats</h2>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Streak</div>
          <div className="stat-val">🔥 {streak}d</div>
          <div className="stat-sub">days in a row</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Rate</div>
          <div className="stat-val" style={{ color: "var(--accent2)" }}>{avgComp}%</div>
          <div className="stat-sub">completion avg</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Done</div>
          <div className="stat-val" style={{ color: "#6366f1" }}>{totalCompletions}</div>
          <div className="stat-sub">all time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Habits</div>
          <div className="stat-val">{habits.length}</div>
          <div className="stat-sub">active goals</div>
        </div>
      </div>

      {/* 28-day heatmap */}
      <div className="card">
        <div className="section-title">28-Day Activity</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
          {heatDays.map((v, i) => (
            <div key={i} title={`${Math.round(v * 100)}%`} style={{ aspectRatio: "1", borderRadius: 6, background: heatColor(v) }} />
          ))}
        </div>
        <div className="row mt12" style={{ gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Less</span>
          {[0, 0.25, 0.6, 1].map((v, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(v) }} />)}
          <span style={{ fontSize: 11, color: "var(--text3)" }}>More</span>
        </div>
      </div>

      {/* By category */}
      {byCat.length > 0 && (
        <div className="card">
          <div className="section-title">By Category</div>
          <div className="gap-stack" style={{ gap: 10 }}>
            {byCat.map(([cat, count]) => {
              const cfg = CAT[cat] || CAT.general;
              return (
                <div key={cat}>
                  <div className="row-between mb4">
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{cfg.icon} {cfg.label}</span>
                    <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 700 }}>{count}</span>
                  </div>
                  <div className="progress-track" style={{ height: 6 }}>
                    <div style={{ height: "100%", width: Math.round((count / maxCat) * 100) + "%", background: cfg.color, borderRadius: 99, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      <div>
        <div className="section-title">Insights</div>
        <div className="insight">
          <div className="insight-dot" style={{ background: "var(--green)" }} />
          <div><b style={{ fontSize: 13 }}>Best Category</b><p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{byCat[0] ? `${CAT[byCat[0][0]]?.label || byCat[0][0]} leads with ${byCat[0][1]} completions.` : "Add habits to see insights."}</p></div>
        </div>
        <div className="insight">
          <div className="insight-dot" style={{ background: "#f59e0b" }} />
          <div><b style={{ fontSize: 13 }}>Streak Tip</b><p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>Complete at least one habit daily to keep your streak alive. You're on {streak} days!</p></div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────────────────
function SettingsTab({ profile, settings, onSettingsChange, onClear, onExport }) {
  return (
    <div className="animate-up gap-stack pb20">
      {/* Profile card */}
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent2), #6366f1)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          {profile.name.charAt(0)}
        </div>
        <h2 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20 }}>{profile.name}</h2>
        <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>Level {profile.level} · Member since {profile.memberSince}</p>
        <div className="row mt12" style={{ justifyContent: "center", gap: 10 }}>
          <div className="tag" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>Lvl {profile.level}</div>
          <div className="tag" style={{ background: "rgba(232,100,60,0.1)", color: "var(--accent2)" }}>PRO</div>
          <div className="tag" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>🔥 {calcStreak([])}</div>
        </div>
      </div>

      {/* Theme */}
      <div className="card">
        <div className="section-title">Appearance</div>
        <div className="theme-options">
          {[{ v: "light", l: "Light", preview: ["#f5f4f1", "#fff"] }, { v: "dark", l: "Dark", preview: ["#0f0e0c", "#1a1916"] }, { v: "system", l: "System", preview: ["#fff", "#0f0e0c"] }].map(t => (
            <button key={t.v} className={`theme-opt${settings.theme === t.v ? " active" : ""}`} onClick={() => onSettingsChange({ theme: t.v })}>
              <div className="theme-preview">{t.preview.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}</div>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="card">
        <div className="section-title">Preferences</div>
        <div className="toggle-wrap">
          <div><div className="toggle-label">Smart Notifications</div><div className="toggle-sub">Adaptive habit reminders</div></div>
          <label className="switch"><input type="checkbox" checked={settings.notifications} onChange={e => onSettingsChange({ notifications: e.target.checked })} /><span className="slider" /></label>
        </div>
      </div>

      {/* Data */}
      <div className="card">
        <div className="section-title">Data & Privacy</div>
        <div className="gap-stack" style={{ gap: 8 }}>
          <button className="card-sm row" style={{ gap: 12, cursor: "pointer", textAlign: "left", border: "1px solid var(--border)", width: "100%" }} onClick={onExport}>
            <span style={{ fontSize: 18 }}>⬇️</span>
            <div><div style={{ fontWeight: 600, fontSize: 14 }}>Export Data</div><div style={{ fontSize: 12, color: "var(--text2)" }}>Download as JSON backup</div></div>
          </button>
          <button className="card-sm row" style={{ gap: 12, cursor: "pointer", textAlign: "left", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.04)", width: "100%" }} onClick={onClear}>
            <span style={{ fontSize: 18 }}>🗑️</span>
            <div><div style={{ fontWeight: 600, fontSize: 14, color: "#ef4444" }}>Reset Data</div><div style={{ fontSize: 12, color: "#f87171" }}>Wipe all habits & settings</div></div>
          </button>
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", fontFamily: "Syne", letterSpacing: 1, textTransform: "uppercase" }}>LifeTracker v2.0 · Built for {profile.name}</p>
    </div>
  );
}

// ─── Add Habit Modal ───────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState("general");
  const [time, setTime] = useState("8:00 AM");
  const [dur, setDur] = useState("30 min");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ id: `h${Date.now()}`, name: name.trim(), category: cat, time, duration: dur, completedDates: [] });
    onClose();
  };

  return (
    <div className="overlay animate-fade" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="row-between mb20">
          <h3 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20 }}>New Habit</h3>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <form onSubmit={submit} className="gap-stack">
          <div>
            <label className="form-label">Habit Name</label>
            <input className="form-input" placeholder="e.g. Read 20 pages" value={name} onChange={e => setName(e.target.value)} maxLength={60} autoFocus required />
          </div>
          <div>
            <label className="form-label">Category</label>
            <div className="cat-chips mt8">
              {Object.entries(CAT).map(([k, c]) => (
                <button key={k} type="button" className={`cat-chip${cat === k ? " active" : ""}`} onClick={() => setCat(k)}>{c.icon} {c.label}</button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="form-label">Start Time</label>
              <input className="form-input" value={time} onChange={e => setTime(e.target.value)} placeholder="8:00 AM" required />
            </div>
            <div>
              <label className="form-label">Duration</label>
              <input className="form-input" value={dur} onChange={e => setDur(e.target.value)} placeholder="30 min" required />
            </div>
          </div>
          <button type="submit" className="btn-primary mt8">Add Habit</button>
        </form>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ profile, activeTab, onNav, onClose, onSync }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "today", label: "Today's Habits", icon: "✅" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "stats", label: "Statistics", icon: "📈" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];
  return (
    <>
      <div className="sidebar-overlay animate-fade" onClick={onClose} />
      <div className="sidebar animate-up">
        <div className="row-between mb20">
          <div>
            <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 18 }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>Level {profile.level} · {profile.isPro ? "PRO" : "Free"}</div>
          </div>
          <button className="icon-btn" onClick={onClose}>{Icons.close}</button>
        </div>
        <nav className="gap-stack" style={{ gap: 4, flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { onNav(item.id); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: "none", background: activeTab === item.id ? "rgba(232,100,60,0.1)" : "transparent", color: activeTab === item.id ? "var(--accent2)" : "var(--text2)", cursor: "pointer", width: "100%", fontSize: 14, fontWeight: 600, transition: "all 0.15s" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button onClick={() => { onSync(); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: "none", background: "transparent", color: "var(--text2)", cursor: "pointer", width: "100%", fontSize: 14, fontWeight: 600 }}>
            <span style={{ fontSize: 18 }}>🔄</span> Sync Data
          </button>
          <p style={{ textAlign: "center", fontSize: 10, color: "var(--text3)", fontFamily: "Syne", letterSpacing: 1, marginTop: 12 }}>LIFETRACKER v2.0</p>
        </div>
      </div>
    </>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [habits, setHabits] = useLS("lt2:habits", INIT_HABITS);
  const [profile, setProfile] = useLS("lt2:profile", INIT_PROFILE);
  const [settings, setSettings] = useLS("lt2:settings", INIT_SETTINGS);
  const [tab, setTab] = useState("today");
  const [showAdd, setShowAdd] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [toast, setToast] = useState(null);

  // Theme
  const [sysDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const isDark = settings.theme === "dark" || (settings.theme === "system" && sysDark);
  useEffect(() => { document.body.classList.toggle("dark", isDark); }, [isDark]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const toggleHabit = useCallback((id) => {
    const key = todayKey();
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(key);
      const dates = done ? h.completedDates.filter(d => d !== key) : [...h.completedDates, key];
      if (!done) showToast("✅ Habit completed! +150 XP");
      return { ...h, completedDates: dates };
    }));
    if (!habits.find(h => h.id === id)?.completedDates.includes(key)) {
      setProfile(p => {
        let xp = p.xp + 150;
        let level = p.level;
        if (xp >= p.maxXp) { xp -= p.maxXp; level++; showToast("🎉 Level up!"); }
        return { ...p, xp, level };
      });
    }
  }, [habits]);

  const addHabit = (h) => {
    setHabits(prev => [h, ...prev]);
    showToast("🌱 New habit added!");
  };

  const clearData = () => {
    if (confirm("Reset all data and restore defaults?")) {
      setHabits(INIT_HABITS); setProfile(INIT_PROFILE); setSettings(INIT_SETTINGS); setTab("today");
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ habits, profile, settings }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `lifetracker-${todayKey()}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast("📥 Data exported!");
  };

  const TABS = [
    { id: "dashboard", label: "Home", icon: Icons.dashboard },
    { id: "today", label: "Today", icon: Icons.today },
    { id: "calendar", label: "Calendar", icon: Icons.calendar },
    { id: "stats", label: "Stats", icon: Icons.stats },
    { id: "settings", label: "Settings", icon: Icons.settings },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className={`app${isDark ? " dark" : ""}`}>
        {/* Header */}
        <header className="header">
          <div className="row" style={{ gap: 12 }}>
            <button className="icon-btn" onClick={() => setShowSidebar(true)}>{Icons.menu}</button>
            <span className="logo">Life<span>Tracker</span></span>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowAdd(true)} title="Add Habit">{Icons.plus}</button>
          </div>
        </header>

        {/* Content */}
        <main className="content" key={tab}>
          {tab === "dashboard" && <DashboardTab habits={habits} profile={profile} onChangeTab={setTab} />}
          {tab === "today" && <TodayTab habits={habits} onToggle={toggleHabit} onAdd={() => setShowAdd(true)} />}
          {tab === "calendar" && <CalendarTab habits={habits} />}
          {tab === "stats" && <StatsTab habits={habits} />}
          {tab === "settings" && <SettingsTab profile={profile} settings={settings} onSettingsChange={u => setSettings(s => ({ ...s, ...u }))} onClear={clearData} onExport={exportData} />}
        </main>

        {/* Bottom Nav */}
        <nav className="nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-item${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Modals */}
        {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={addHabit} />}
        {showSidebar && <Sidebar profile={profile} activeTab={tab} onNav={setTab} onClose={() => setShowSidebar(false)} onSync={() => showToast("🔄 Data synced!")} />}

        {/* Toast */}
        {toast && (
          <div className="animate-up" style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "var(--text)", color: "var(--bg)", padding: "10px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", zIndex: 999, pointerEvents: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
