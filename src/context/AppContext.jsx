import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { INIT_PROFILE, INIT_SETTINGS, getLevelForXP, getMaxXPForLevel, getMinXPForLevel, XP_PER_HABIT, XP_PERFECT_DAY } from "../utils/constants"
import { todayKey, parseTime } from "../utils/dateHelpers"
import { isDueToday } from "../utils/habitUtils"

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [onboardingDone, setOnboardingDone] = useLocalStorage("lt:onboarding", false)
  const [habits,   setHabits]   = useLocalStorage("lt:habits",   [])
  const [profile,  setProfile]  = useLocalStorage("lt:profile",  INIT_PROFILE)
  const [settings, setSettings] = useLocalStorage("lt:settings", INIT_SETTINGS)
  const [toast, setToast]       = useState(null)
  const toastTimer              = useRef(null)
  const sentNotifs              = useRef(new Set())

  /* ─── Toast ──────────────────────────────────────────────────────────── */
  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  /* ─── Theme ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const applyTheme = (theme) => {
      if (theme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        // system
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches
        document.documentElement.classList.toggle("dark", dark)
      }
    }
    applyTheme(settings.theme)

    if (settings.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (e) => document.documentElement.classList.toggle("dark", e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [settings.theme])

  /* ─── Notifications ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!settings.notifications || Notification.permission !== "granted") return

    const check = () => {
      const now    = new Date()
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const today  = todayKey()

      habits.forEach(h => {
        if (!h.active || h.completedDates.includes(today) || !isDueToday(h)) return
        const parsed = parseTime(h.time)
        if (!parsed) return
        const habitMin = parsed.hours * 60 + parsed.minutes
        const diff     = habitMin - nowMin
        if (diff === 10 || diff === 5) {
          const nKey = `${h.id}-${today}-${diff}`
          if (!sentNotifs.current.has(nKey)) {
            sentNotifs.current.add(nKey)
            new Notification(`⏰ ${h.name}`, {
              body:  `Starts in ${diff} minutes`,
              icon:  "/favicon.svg",
              badge: "/favicon.svg",
            })
          }
        }
      })
    }

    check()
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [habits, settings.notifications])

  /* ─── Habit mutations ────────────────────────────────────────────────── */
  const toggleHabit = useCallback((id) => {
    const key = todayKey()
    let wasCompleted = false

    setHabits(prev => {
      const next = prev.map(h => {
        if (h.id !== id) return h
        const done  = h.completedDates.includes(key)
        wasCompleted = done
        const dates = done
          ? h.completedDates.filter(d => d !== key)
          : [...h.completedDates, key]
        return { ...h, completedDates: dates }
      })

      // XP — check perfect day after toggle
      if (!wasCompleted) {
        const activeTodayHabits = next.filter(h => h.active !== false && isDueToday(h))
        const allDone = activeTodayHabits.every(h => h.completedDates.includes(key))
        let xpGain = XP_PER_HABIT
        if (allDone && activeTodayHabits.length > 0) xpGain += XP_PERFECT_DAY

        setProfile(p => {
          let newXp    = p.xp + xpGain
          let newLevel = getLevelForXP(newXp)
          const leveledUp = newLevel > p.level
          if (leveledUp) setTimeout(() => showToast(`🎉 Level Up! You're now Level ${newLevel}!`), 400)
          else if (allDone && activeTodayHabits.length > 0)
            setTimeout(() => showToast("🏆 Perfect day! All habits done!"), 300)
          else
            setTimeout(() => showToast(`✅ Done! +${xpGain} XP`), 100)

          return {
            ...p,
            xp:    newXp,
            level: newLevel,
            maxXp: getMaxXPForLevel(newLevel),
          }
        })
      }

      return next
    })
  }, [showToast])

  const addHabit = useCallback((habit) => {
    setHabits(prev => [{ ...habit, id: `h${Date.now()}`, completedDates: [], createdAt: todayKey() }, ...prev])
    showToast("🌱 Habit added!")
  }, [showToast])

  const editHabit = useCallback((id, updates) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h))
    showToast("✏️ Habit updated")
  }, [showToast])

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    showToast("🗑️ Habit removed")
  }, [showToast])

  const toggleActive = useCallback((id) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, active: h.active === false ? true : false } : h))
  }, [])

  /* ─── Profile mutations ──────────────────────────────────────────────── */
  const updateProfile = useCallback((updates) => {
    setProfile(p => ({ ...p, ...updates }))
  }, [])

  /* ─── Settings mutations ─────────────────────────────────────────────── */
  const updateSettings = useCallback((updates) => {
    setSettings(s => ({ ...s, ...updates }))
  }, [])

  /* ─── Onboarding ─────────────────────────────────────────────────────── */
  const completeOnboarding = useCallback((profileData) => {
    setProfile(p => ({ ...p, ...profileData }))
    setOnboardingDone(true)
  }, [])

  return (
    <AppContext.Provider value={{
      onboardingDone,
      habits,
      profile,
      settings,
      toast,
      showToast,
      toggleHabit,
      addHabit,
      editHabit,
      deleteHabit,
      toggleActive,
      updateProfile,
      updateSettings,
      completeOnboarding,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be inside AppProvider")
  return ctx
}
