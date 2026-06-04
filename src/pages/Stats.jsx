import { useMemo } from "react"
import { useApp } from "../context/AppContext"
import Ring from "../components/ui/Ring"
import { FlameIcon, AwardIcon, TargetIcon } from "../components/ui/Icons"
import { calcOverallStreak, getWeekData, getHeatmapData, getBestWorstHabits, calcHabitCompletionRate } from "../utils/habitUtils"
import { CAT, DAYS_LETTER } from "../utils/constants"
import { todayKey } from "../utils/dateHelpers"

function HeatmapCell({ ratio }) {
  const bg = ratio === 0
    ? "var(--surface2)"
    : ratio < 0.34
    ? "rgba(255,107,53,0.22)"
    : ratio < 0.67
    ? "rgba(255,107,53,0.52)"
    : "var(--primary)"
  return <div className="heat-cell" style={{ background: bg }} />
}

export default function Stats() {
  const { habits, profile } = useApp()

  const active = habits.filter(h => h.active !== false)
  const key    = todayKey()

  const streak         = useMemo(() => calcOverallStreak(habits), [habits])
  const totalCompleted = useMemo(() => habits.reduce((s, h) => s + h.completedDates.length, 0), [habits])
  const weekData       = useMemo(() => getWeekData(habits), [habits])
  const heatData       = useMemo(() => getHeatmapData(habits, 91), [habits])
  const { best, worst} = useMemo(() => getBestWorstHabits(habits, 30), [habits])

  const todayDue  = active.filter(h => h.completedDates.includes(key))
  const todayPct  = active.length ? Math.round((todayDue.length / active.length) * 100) : 0

  // 30-day avg completion
  const avgRate = useMemo(() => {
    if (!active.length) return 0
    const rates = active.map(h => calcHabitCompletionRate(h, 30))
    return Math.round(rates.reduce((s, r) => s + r, 0) / rates.length)
  }, [active])

  // Category breakdown
  const catStats = useMemo(() => {
    const groups = {}
    active.forEach(h => {
      if (!groups[h.category]) groups[h.category] = { done: 0, total: 0 }
      groups[h.category].done  += h.completedDates.length
      groups[h.category].total += Math.max(1, h.completedDates.length)
    })
    const arr = Object.entries(groups).map(([k, v]) => ({
      key: k,
      cat: CAT[k] || CAT.general,
      rate: calcHabitCompletionRate(active.find(h => h.category === k), 30) || 0,
      done: v.done,
    })).sort((a, b) => b.rate - a.rate)
    return arr
  }, [active])

  const maxCatRate = catStats.length ? Math.max(...catStats.map(c => c.rate), 1) : 1

  // Longest habit streak
  const longestStreak = useMemo(() => {
    if (!habits.length) return 0
    return Math.max(...habits.map(h => {
      // Simple streak: consecutive completedDates
      let s = 0, day = 0
      while (day <= 365) {
        const d = new Date(); d.setDate(d.getDate() - day)
        const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
        if (!h.completedDates.includes(k)) break
        s++; day++
      }
      return s
    }), 0)
  }, [habits])

  return (
    <div className="page-pad" style={{ paddingTop: 24 }}>
      <h1 className="page-title anim-up" style={{ marginBottom: 6 }}>Statistics</h1>
      <p className="page-subtitle anim-up" style={{ marginBottom: 20 }}>Your progress at a glance</p>

      {/* Key stats grid */}
      <div className="stat-grid anim-up" style={{ marginBottom: 16 }}>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(255,107,53,0.06))", borderColor: "rgba(245,158,11,0.2)" }}>
          <div className="stat-label">🔥 Streak</div>
          <div className="stat-val" style={{ color: "var(--amber)" }}>{streak}d</div>
          <div className="stat-sub">days running</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">📊 Avg Rate</div>
          <div className="stat-val" style={{ color: "var(--primary)" }}>{avgRate}%</div>
          <div className="stat-sub">last 30 days</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">✅ All Time</div>
          <div className="stat-val" style={{ color: "var(--purple)" }}>{totalCompleted}</div>
          <div className="stat-sub">completions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">🎯 Today</div>
          <div className="stat-val" style={{ color: todayPct === 100 ? "var(--green)" : "var(--text)" }}>{todayPct}%</div>
          <div className="stat-sub">{todayDue.length}/{active.length} done</div>
        </div>
      </div>

      {/* Today ring */}
      {active.length > 0 && (
        <div className="card anim-up" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <Ring pct={todayPct} size={100} stroke={8} color={todayPct === 100 ? "var(--green)" : "var(--primary)"}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20 }}>{todayPct}%</span>
          </Ring>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
              {todayPct === 100 ? "🏆 Perfect day!" : todayPct >= 50 ? "💪 Keep going!" : "🚀 Get started!"}
            </p>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
              {todayPct === 100
                ? "You completed every habit today. Outstanding!"
                : `Complete ${active.length - todayDue.length} more habit${active.length - todayDue.length !== 1 ? "s" : ""} to finish today.`}
            </p>
          </div>
        </div>
      )}

      {/* Weekly bar chart */}
      <div className="card anim-up" style={{ marginBottom: 16 }}>
        <p className="section-title">Weekly Overview</p>
        <div className="bar-chart">
          {weekData.map((d, i) => (
            <div key={i} className="bar-col">
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div
                  className="bar-fill"
                  style={{
                    height: Math.max(4, d.pct) + "%",
                    background: d.pct >= 80 ? "var(--primary)" : d.pct >= 40 ? "rgba(255,107,53,0.45)" : "var(--surface2)",
                  }}
                />
              </div>
              <span className="bar-label">{DAYS_LETTER[d.dayIndex]}</span>
            </div>
          ))}
        </div>
        <div className="row" style={{ gap: 16, marginTop: 12, justifyContent: "center" }}>
          {[
            { color: "var(--primary)", label: "80%+" },
            { color: "rgba(255,107,53,0.45)", label: "40%+" },
            { color: "var(--surface2)", label: "< 40%" },
          ].map(l => (
            <div key={l.label} className="row" style={{ gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
              <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-display)", fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 91-day heatmap */}
      <div className="card anim-up" style={{ marginBottom: 16 }}>
        <p className="section-title">3-Month Activity</p>
        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 1fr)", gap: 3, minWidth: "max-content" }}>
            {heatData.map((d, i) => (
              <HeatmapCell key={i} ratio={d.ratio} />
            ))}
          </div>
        </div>
        <div className="row" style={{ gap: 8, marginTop: 12, justifyContent: "flex-end", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Less</span>
          {[0, 0.25, 0.55, 1].map((v, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: v === 0 ? "var(--surface2)" : v < 0.34 ? "rgba(255,107,53,0.22)" : v < 0.67 ? "rgba(255,107,53,0.52)" : "var(--primary)" }} />
          ))}
          <span style={{ fontSize: 11, color: "var(--text3)" }}>More</span>
        </div>
      </div>

      {/* Category breakdown */}
      {catStats.length > 0 && (
        <div className="card anim-up" style={{ marginBottom: 16 }}>
          <p className="section-title">By Category · Last 30 Days</p>
          <div className="stack" style={{ gap: 14 }}>
            {catStats.map(({ key, cat, rate }) => (
              <div key={key}>
                <div className="row-b" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>
                    {cat.icon} {cat.label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "var(--font-display)", color: rate >= 70 ? "var(--green)" : rate >= 40 ? "var(--amber)" : "var(--red)" }}>
                    {rate}%
                  </span>
                </div>
                <div className="progress-track" style={{ height: 7 }}>
                  <div style={{ height: "100%", width: rate + "%", background: cat.color, borderRadius: 99, transition: "width 0.7s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best / Worst habit insights */}
      {(best || worst) && (
        <div style={{ marginBottom: 16 }}>
          <p className="section-title">Insights</p>
          <div className="stack" style={{ gap: 10 }}>
            {best && (
              <div className="insight-card" style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.06)" }}>
                <div className="row" style={{ gap: 10, marginBottom: 6 }}>
                  <AwardIcon style={{ width: 18, height: 18, color: "var(--green)" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--green)" }}>
                    Strongest Habit
                  </span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{best.habit.name}</p>
                <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 3 }}>{best.rate}% completion rate — keep it up!</p>
              </div>
            )}
            {worst && worst.habit.id !== best?.habit.id && worst.rate < 70 && (
              <div className="insight-card" style={{ border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.04)" }}>
                <div className="row" style={{ gap: 10, marginBottom: 6 }}>
                  <TargetIcon style={{ width: 18, height: 18, color: "var(--primary)" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>
                    Needs Attention
                  </span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{worst.habit.name}</p>
                <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 3 }}>
                  {worst.rate}% completion. Try scheduling it at a better time.
                </p>
              </div>
            )}

            {/* Streak insight */}
            <div className="card-xs" style={{ borderRadius: "var(--radius-sm)" }}>
              <div className="row" style={{ gap: 10 }}>
                <span style={{ fontSize: 22 }}>🔥</span>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>
                    {streak > 0 ? `${streak}-day streak` : "Start your streak today!"}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                    {streak === 0
                      ? "Complete any habit today to begin your streak."
                      : streak < 7
                      ? `${7 - streak} more day${7 - streak !== 1 ? "s" : ""} to a 7-day streak!`
                      : streak < 30
                      ? `${30 - streak} more day${30 - streak !== 1 ? "s" : ""} to a 30-day streak!`
                      : "You're on fire! Consistency is your superpower."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {active.length === 0 && (
        <div className="empty-state anim-up">
          <span className="empty-icon">📊</span>
          <p className="empty-title">No data yet</p>
          <p className="empty-sub">Add habits and start tracking to see your statistics here.</p>
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  )
}
