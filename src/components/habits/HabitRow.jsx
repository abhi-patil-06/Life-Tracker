import { CAT } from "../../utils/constants"
import { CheckIcon } from "../ui/Icons"
import { calcHabitStreak } from "../../utils/habitUtils"
import { formatTime12 } from "../../utils/dateHelpers"

export default function HabitRow({ habit, isCompleted, onToggle, onEdit, idx = 0 }) {
  const cat    = CAT[habit.category] || CAT.general
  const streak = calcHabitStreak(habit)

  return (
    <div
      className={`habit-item anim-up${isCompleted ? " done" : ""}`}
      style={{ animationDelay: `${idx * 0.05}s`, "--cat-color": cat.color }}
      onClick={() => onEdit && onEdit(habit)}
    >
      {/* Icon */}
      <div className="habit-icon" style={{ background: cat.bg, fontSize: 20 }}>
        {cat.icon}
      </div>

      {/* Info */}
      <div className="habit-info">
        <div className={`habit-name${isCompleted ? " done" : ""}`}>{habit.name}</div>
        <div className="habit-meta">
          {formatTime12(habit.time)}
          {habit.duration ? ` · ${habit.duration}` : ""}
          {streak > 0 && (
            <span style={{ marginLeft: 8, color: "var(--amber)", fontWeight: 600 }}>
              🔥 {streak}d
            </span>
          )}
        </div>
      </div>

      {/* Check button */}
      <button
        className={`check-btn${isCompleted ? " done" : ""}`}
        onClick={e => { e.stopPropagation(); onToggle(habit.id) }}
        aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
      >
        {isCompleted && <span className="check-pop"><CheckIcon /></span>}
      </button>
    </div>
  )
}
