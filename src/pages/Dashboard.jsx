import { useState, useMemo } from "react"
import { useApp } from "../context/AppContext"
import Ring from "../components/ui/Ring"
import { InfoIcon, FlameIcon, TrendIcon, CloseIcon } from "../components/ui/Icons"
import { todayKey } from "../utils/dateHelpers"
import { getGreeting } from "../utils/dateHelpers"
import { calcOverallStreak, getWeekData, isDueToday } from "../utils/habitUtils"
import { getDailyQuote } from "../utils/quotes"
import { DAYS_LETTER } from "../utils/constants"

function XpInfoModal({ onClose }) {
  return (
    <div className="overlay anim-fade" onClick={onClose}>
      <div className="info-modal" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="row-b" style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>
            How XP & Levels work
          </h3>
          <button className="icon-btn" onClick={onClose}><CloseIcon /></button>
        </div>

        {[
          { icon: "⭐", title: "XP (Experience Points)", desc: "You earn 150 XP for every habit you complete. Finish ALL habits in a day and you get a bonus +200 XP for a perfect day!" },
          { icon: "🎯", title: "Levels", desc: "As you accumulate XP, you level up. Level 2 needs 1,000 XP, Level 3 needs 2,500, and so on. Each level shows your dedication." },
          { icon: "🔥", title: "Streak", desc: "Your streak counts how many consecutive days you completed at least one habit. Don't break the chain!" },
          { icon: "🏆", title: "Perfect Day", desc: "Complete every scheduled habit in a day for a Perfect Day bonus. It awards +200 extra XP on top of your usual habit XP." },
          { icon: "💎", title: "Pro", desc: "Pro features are planned for the future — advanced analytics, custom themes, cloud sync & more. Stay tuned!" },
        ].map(item => (
          <div key={item.title} style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 26, flexShrink: 0, width: 38, textAlign: "center" }}>{item.icon}</div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          </div>
        ))}
        <div style={{ paddingBottom: 8 }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { habits, profile } = useApp()
  const [showInfo, setShowInfo] = useState(false)

  const key      = todayKey()
  const today    = new Date()
  const active   = habits.filter(h => h.active !== false && isDueToday(h))
  const done     = active.filter(h => h.completedDates.includes(key))
  const pct      = active.length ? Math.round((done.length / active.length) * 100) : 0
  const streak   = calcOverallStreak(habits)
  const weekData = useMemo(() => getWeekData(habits), [habits])
  const quote    = useMemo(() => getDailyQuote(), [])

  const xpMin    = profile.xp
  const xpMax    = profile.maxXp || 1000
  const xpPct    = Math.min(Math.round((xpMin / xpMax) * 100), 100)

  const greetMsg = getGreeting()

  const ringColor = pct === 100 ? "var(--green)" : "var(--primary)"

  return (
    <div className="page-pad stack" style={{ paddingTop: 28 }}>
      {/* Greeting */}
      <div className="anim-up">
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1.2 }}>
          {greetMsg} 👋
        </p>
        <h1 className="page-title" style={{ marginTop: 6, fontSize: 32 }}>
          {profile.name || "Friend"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>
          {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* XP Card */}
      <div className="card anim-up">
        <div className="row-b" style={{ marginBottom: 14 }}>
          <div className="row" style={{ gap: 10 }}>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                Level {profile.level}
              </p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, marginTop: 1 }}>
                {profile.xp.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)" }}>XP</span>
              </p>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <div className="level-badge">LVL {profile.level}</div>
            <button className="icon-btn" onClick={() => setShowInfo(true)}>
              <InfoIcon />
            </button>
          </div>
        </div>

        <div className="xp-track">
          <div className="xp-fill" style={{ width: xpPct + "%" }} />
        </div>
        <div className="row-b" style={{ marginTop: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>{profile.xp.toLocaleString()} XP</span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>{(profile.maxXp || 1000).toLocaleString()} XP</span>
        </div>
      </div>

      {/* Progress + Streak */}
      <div className="card anim-up" style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Ring pct={pct} size={108} stroke={9} color={ringColor}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, color: pct === 100 ? "var(--green)" : "var(--text)" }}>
            {pct}%
          </span>
          <span style={{ fontSize: 9, color: "var(--text3)", fontWeight: 700, letterSpacing: 0.5, fontFamily: "var(--font-display)" }}>
            TODAY
          </span>
        </Ring>

        <div style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div className="card-xs">
              <div className="stat-label">Done</div>
              <div className="stat-val" style={{ fontSize: 20 }}>{done.length}/{active.length}</div>
            </div>
            <div className="card-xs">
              <div className="stat-label">Streak</div>
              <div className="stat-val" style={{ fontSize: 20, color: "var(--amber)" }}>
                🔥 {streak}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
            {pct === 100
              ? "🎉 Perfect day! Keep it up!"
              : done.length === 0
              ? "Start your first habit today!"
              : `${active.length - done.length} habit${active.length - done.length !== 1 ? "s" : ""} remaining`}
          </p>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card anim-up">
        <div className="row-b" style={{ marginBottom: 16 }}>
          <span className="section-title" style={{ margin: 0 }}>This Week</span>
          <div className="row" style={{ gap: 6 }}>
            <TrendIcon style={{ width: 14, height: 14, color: "var(--text3)" }} />
            <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>Last 7 days</span>
          </div>
        </div>
        <div className="bar-chart">
          {weekData.map((d, i) => (
            <div key={i} className="bar-col">
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                <div
                  className="bar-fill"
                  style={{
                    height: Math.max(4, d.pct) + "%",
                    background: d.pct >= 80
                      ? "var(--primary)"
                      : d.pct >= 40
                      ? "rgba(255,107,53,0.45)"
                      : "var(--surface2)",
                  }}
                />
              </div>
              <span className="bar-label">{DAYS_LETTER[d.dayIndex]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily insight / motivational quote */}
      <div className="insight-card anim-up">
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>💡</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--primary)" }}>
            Daily Motivation
          </span>
        </div>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, fontStyle: "italic", fontWeight: 500 }}>
          "{quote.text}"
        </p>
        {quote.author !== "Unknown" && (
          <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 8, fontWeight: 600 }}>
            — {quote.author}
          </p>
        )}
      </div>

      {/* Streak card */}
      {streak > 0 && (
        <div className="card anim-up" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(255,107,53,0.06))", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="row" style={{ gap: 14 }}>
            <div style={{ fontSize: 40 }}>🔥</div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--amber)" }}>
                {streak}-day streak!
              </p>
              <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>
                {streak < 7
                  ? `${7 - streak} more days to a 1-week streak`
                  : streak < 30
                  ? `${30 - streak} more days to a 30-day streak 🏆`
                  : "Outstanding discipline! Keep going!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No habits nudge */}
      {habits.length === 0 && (
        <div className="empty-state anim-up" style={{ padding: "32px 0" }}>
          <span className="empty-icon">🌱</span>
          <p className="empty-title">No habits yet</p>
          <p className="empty-sub">Tap the + button below to start building your first habit.</p>
        </div>
      )}

      <div style={{ height: 8 }} />
      {showInfo && <XpInfoModal onClose={() => setShowInfo(false)} />}
    </div>
  )
}
