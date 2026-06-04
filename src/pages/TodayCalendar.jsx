import { useState, useMemo } from "react"
import { useApp } from "../context/AppContext"
import HabitRow from "../components/habits/HabitRow"
import HabitModal from "../components/habits/HabitModal"
import { ChevLeftIcon, ChevRightIcon } from "../components/ui/Icons"
import { todayKey, dateToKey, formatDateLong, pad } from "../utils/dateHelpers"
import { isDueOnDate } from "../utils/habitUtils"
import { DAYS_LETTER } from "../utils/constants"

function CalendarGrid({ year, month, selectedKey, onSelectKey }) {
  const today        = new Date()
  const todK         = todayKey()
  const firstDow     = new Date(year, month, 1).getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]

  return (
    <>
      {/* Day headers */}
      <div className="cal-grid" style={{ marginBottom: 6 }}>
        {DAYS_LETTER.map((l, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--text3)", fontFamily: "var(--font-display)", padding: "4px 0" }}>
            {l}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="cal-grid">
        {Array.from({ length: firstDow }, (_, i) => <div key={"e" + i} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day   = i + 1
          const k     = `${year}-${pad(month + 1)}-${pad(day)}`
          const isToday   = k === todK
          const isSel     = k === selectedKey
          const isFuture  = k > todK

          return (
            <button
              key={day}
              className={`cal-day${isSel ? " selected" : ""}${isToday && !isSel ? " today" : ""}`}
              onClick={() => onSelectKey(k)}
            >
              {day}
              {!isSel && !isFuture && <DayDot dateKey={k} />}
            </button>
          )
        })}
      </div>
    </>
  )
}

function DayDot({ dateKey }) {
  const { habits } = useApp()
  const d = new Date(dateKey)
  const due  = habits.filter(h => h.active !== false && isDueOnDate(h, d))
  if (!due.length) return <div className="cal-dot" />
  const done = due.filter(h => h.completedDates.includes(dateKey)).length
  const color = done === due.length ? "var(--green)" : done > 0 ? "var(--amber)" : "rgba(239,68,68,0.6)"
  return <div className="cal-dot" style={{ background: color }} />
}

export default function TodayCalendar() {
  const { habits, toggleHabit, addHabit, editHabit, deleteHabit } = useApp()
  const now  = new Date()
  const todK = todayKey()

  const [viewY, setViewY]     = useState(now.getFullYear())
  const [viewM, setViewM]     = useState(now.getMonth())
  const [selKey, setSelKey]   = useState(todK)
  const [editHab, setEditHab] = useState(null)

  const selDate  = useMemo(() => { const [y,m,d] = selKey.split("-").map(Number); return new Date(y, m-1, d) }, [selKey])
  const isToday  = selKey === todK
  const isFuture = selKey > todK
  const isPast   = selKey < todK

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]

  const prevMonth = () => {
    if (viewM === 0) { setViewY(y => y - 1); setViewM(11) }
    else setViewM(m => m - 1)
  }
  const nextMonth = () => {
    if (viewM === 11) { setViewY(y => y + 1); setViewM(0) }
    else setViewM(m => m + 1)
  }

  // Habits for selected day
  const dueHabits = useMemo(
    () => habits.filter(h => h.active !== false && isDueOnDate(h, selDate)),
    [habits, selDate]
  )
  const pending = dueHabits.filter(h => !h.completedDates.includes(selKey))
  const done    = dueHabits.filter(h =>  h.completedDates.includes(selKey))
  const pct     = dueHabits.length ? Math.round((done.length / dueHabits.length) * 100) : 0

  return (
    <div className="page-pad" style={{ paddingTop: 24 }}>
      {/* Page title */}
      <div className="row-b" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 28 }}>Calendar</h1>
          <p className="page-subtitle">{isToday ? "Today's schedule" : formatDateLong(selDate)}</p>
        </div>
        {!isToday && (
          <button
            onClick={() => { setSelKey(todK); setViewY(now.getFullYear()); setViewM(now.getMonth()) }}
            style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "var(--primary-soft)", border: "none", borderRadius: 99, padding: "6px 14px", cursor: "pointer", fontFamily: "var(--font-display)" }}
          >
            Today
          </button>
        )}
      </div>

      {/* Calendar card */}
      <div className="card anim-up" style={{ marginBottom: 16 }}>
        {/* Month nav */}
        <div className="row-b" style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18 }}>
            {monthNames[viewM]} {viewY}
          </h3>
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" onClick={prevMonth}><ChevLeftIcon /></button>
            <button className="icon-btn" onClick={nextMonth}><ChevRightIcon /></button>
          </div>
        </div>

        <CalendarGrid year={viewY} month={viewM} selectedKey={selKey} onSelectKey={setSelKey} />

        {/* Legend */}
        <div className="row" style={{ gap: 16, marginTop: 14, justifyContent: "center" }}>
          {[
            { color: "var(--green)",            label: "All done" },
            { color: "var(--amber)",             label: "Partial" },
            { color: "rgba(239,68,68,0.6)",      label: "Missed" },
          ].map(l => (
            <div key={l.label} className="row" style={{ gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-display)", fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day habits */}
      <div style={{ marginBottom: 4 }}>
        <div className="row-b" style={{ marginBottom: 12 }}>
          <p className="section-title" style={{ margin: 0 }}>
            {isToday ? "Today" : formatDateLong(selDate)}
          </p>
          {dueHabits.length > 0 && (
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: pct === 100 ? "var(--green)" : "var(--primary)" }}>
              {pct}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        {dueHabits.length > 0 && (
          <div className="progress-track" style={{ height: 5, marginBottom: 16 }}>
            <div className="progress-fill" style={{ width: pct + "%" }} />
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p className="section-title">Remaining · {pending.length}</p>
            <div className="stack" style={{ gap: 8 }}>
              {pending.map((h, i) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  isCompleted={false}
                  onToggle={isToday ? toggleHabit : () => {}}
                  onEdit={isToday ? setEditHab : undefined}
                  idx={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p className="section-title">Completed · {done.length}</p>
            <div className="stack" style={{ gap: 8 }}>
              {done.map((h, i) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  isCompleted={true}
                  onToggle={isToday ? toggleHabit : () => {}}
                  onEdit={isToday ? setEditHab : undefined}
                  idx={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty states */}
        {dueHabits.length === 0 && (
          <div className="empty-state" style={{ padding: "32px 0" }}>
            <span className="empty-icon">{isFuture ? "📅" : isPast ? "😴" : "🌱"}</span>
            <p className="empty-title">
              {isFuture ? "Nothing planned yet" : isPast ? "No habits tracked" : "No habits today"}
            </p>
            <p className="empty-sub">
              {isFuture ? "Add habits to build your schedule." : isPast ? "You didn't have any habits scheduled for this day." : "Tap + to add your first habit."}
            </p>
          </div>
        )}

        {isFuture && dueHabits.length > 0 && (
          <p style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", padding: "8px 0 20px", fontStyle: "italic" }}>
            📅 Future date — habits will be trackable on the day.
          </p>
        )}
      </div>

      {editHab && (
        <HabitModal
          habit={editHab}
          onClose={() => setEditHab(null)}
          onSave={data => editHabit(editHab.id, data)}
          onDelete={deleteHabit}
        />
      )}
    </div>
  )
}
