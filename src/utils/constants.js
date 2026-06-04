export const CAT = {
  fitness:     { label: "Fitness",     color: "#FF6B35", bg: "rgba(255,107,53,0.12)",   icon: "🏃" },
  health:      { label: "Health",      color: "#10B981", bg: "rgba(16,185,129,0.12)",   icon: "💧" },
  education:   { label: "Education",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)",   icon: "📚" },
  mindfulness: { label: "Mindfulness", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: "🧘" },
  nutrition:   { label: "Nutrition",   color: "#06B6D4", bg: "rgba(6,182,212,0.12)",   icon: "🥗" },
  routine:     { label: "Routine",     color: "#EC4899", bg: "rgba(236,72,153,0.12)",  icon: "⏰" },
  social:      { label: "Social",      color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  icon: "🤝" },
  general:     { label: "General",     color: "#64748B", bg: "rgba(100,116,139,0.12)", icon: "⭐" },
}

export const DAYS_FULL   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
export const DAYS_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
export const DAYS_LETTER = ["S","M","T","W","T","F","S"]

export const INIT_PROFILE = {
  name: "",
  email: "",
  age: "",
  gender: "",
  photo: null,
  level: 1,
  xp: 0,
  maxXp: 1000,
  memberSince: new Date().getFullYear().toString(),
}

export const INIT_SETTINGS = {
  theme: "light",
  notifications: false,
}

// XP required to reach each level (index = level)
export const LEVEL_XP = [0, 1000, 2500, 5000, 8500, 13000, 18500, 25000, 33000, 42000, 52000]

export const getLevelForXP = (xp) => {
  let lv = 1
  for (let i = 1; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) lv = i + 1
    else break
  }
  return Math.min(lv, LEVEL_XP.length)
}

export const getMaxXPForLevel = (level) => {
  return LEVEL_XP[Math.min(level, LEVEL_XP.length - 1)] ?? LEVEL_XP[LEVEL_XP.length - 1]
}

export const getMinXPForLevel = (level) => {
  return LEVEL_XP[Math.min(level - 1, LEVEL_XP.length - 1)] ?? 0
}

export const XP_PER_HABIT = 150
export const XP_PERFECT_DAY = 200
export const XP_WEEK_STREAK = 500
