import { useState, useMemo } from "react"
import { useApp } from "../context/AppContext"
import HabitModal from "../components/habits/HabitModal"
import { CAT, DAYS_SHORT } from "../utils/constants"
import { EditIcon } from "../components/ui/Icons"
import { formatTime12 } from "../utils/dateHelpers"
import { calcHabitStreak } from "../utils/habitUtils"

const FILTERS = ["All", "Active", "Inactive"]

function ManageRow({ habit, onToggle, onEdit }) {
  const cat    = CAT[habit.category] || CAT.general
  const streak = calcHabitStreak(habit)
  const isActive = habit.active !== false

  const dayLabel = habit.days && habit.days.length > 0
    ? habit.days.map(d => DAYS_SHORT[d]).join(" · ")
    : "Every day"

  return (
    <div
      className={`manage-row${!isActive ? " inactive" : ""}`}
      style={{ "--cat-color": cat.color }}
      onClick={() => onEdit(habit)}
    >
      {/* Icon */}
      <div className="habit-icon" style={{ background: cat.bg, fontSize: 18, width: 38, height: 38 }}>
        {cat.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {habit.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 2 }}>
          {dayLabel} · {formatTime12(habit.time)}
          {streak > 0 && <span style={{ marginLeft: 8, color: "var(--amber)", fontWeight: 700 }}>🔥 {streak}d</span>}
        </div>
      </div>

      {/* Edit icon */}
      <button
        style={{ color: "var(--text3)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", display: "flex", alignItems: "center" }}
        onClick={e => { e.stopPropagation(); onEdit(habit) }}
      >
        <EditIcon style={{ width: 16, height: 16 }} />
      </button>

      {/* Toggle */}
      <label className="switch" onClick={e => e.stopPropagation()}>
        <input type="checkbox" checked={isActive} onChange={() => onToggle(habit.id)} />
        <span className="slider" />
      </label>
    </div>
  )
}

export default function Habits() {
  const { habits, addHabit, editHabit, deleteHabit, toggleActive } = useApp()
  const [filter, setFilter]   = useState("All")
  const [showAdd, setShowAdd] = useState(false)
  const [editHab, setEditHab] = useState(null)

  const filtered = useMemo(() => {
    if (filter === "Active")   return habits.filter(h => h.active !== false)
    if (filter === "Inactive") return habits.filter(h => h.active === false)
    return habits
  }, [habits, filter])

  // Group by category
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(h => {
      const c = h.category || "general"
      if (!groups[c]) groups[c] = []
      groups[c].push(h)
    })
    return groups
  }, [filtered])

  return (
    <div className="page-pad" style={{ paddingTop: 24 }}>
      {/* Header */}
      <div className="row-b" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 28 }}>My Habits</h1>
          <p className="page-subtitle">{habits.length} habit{habits.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          className="btn-primary"
          style={{ width: "auto", padding: "10px 20px", borderRadius: 99, fontSize: 14 }}
          onClick={() => setShowAdd(true)}
        >
          + New
        </button>
      </div>

      {/* Filters */}
      <div className="row" style={{ gap: 8, marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={`chip${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Habit list grouped by category */}
      {Object.keys(grouped).length === 0 ? (
        <div className="empty-state anim-up">
          <span className="empty-icon">🌱</span>
          <p className="empty-title">No habits yet</p>
          <p className="empty-sub">Tap "+ New" to add your first habit and start building a better routine.</p>
          <button
            className="btn-primary"
            style={{ marginTop: 20, borderRadius: 99, width: "auto", padding: "12px 28px" }}
            onClick={() => setShowAdd(true)}
          >
            Add your first habit
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([catKey, catHabits]) => {
          const cat = CAT[catKey] || CAT.general
          return (
            <div key={catKey} style={{ marginBottom: 20 }}>
              <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                <p className="section-title" style={{ margin: 0 }}>{cat.label}</p>
              </div>
              <div className="stack" style={{ gap: 8 }}>
                {catHabits.map((h, i) => (
                  <div key={h.id} className="anim-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ManageRow
                      habit={h}
                      onToggle={toggleActive}
                      onEdit={setEditHab}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Tip card */}
      {habits.length > 0 && (
        <div className="card-xs anim-up" style={{ marginBottom: 8, borderRadius: "var(--radius-sm)" }}>
          <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
            💡 <strong>Tip:</strong> Toggle habits off to pause them without losing history. Tap any habit to edit its schedule or details.
          </p>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <HabitModal
          onClose={() => setShowAdd(false)}
          onSave={addHabit}
        />
      )}
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
