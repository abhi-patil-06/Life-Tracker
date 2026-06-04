import { useState } from "react"
import { CAT, DAYS_SHORT } from "../../utils/constants"
import { CloseIcon, TrashIcon } from "../ui/Icons"
import ConfirmModal from "../ui/ConfirmModal"

const EMPTY = {
  name: "", category: "general", time: "07:00",
  duration: "30 min", days: [], active: true,
}

export default function HabitModal({ habit, onClose, onSave, onDelete }) {
  const isEdit = Boolean(habit)
  const [form, setForm] = useState(habit ? {
    name:     habit.name,
    category: habit.category,
    time:     habit.time     || "07:00",
    duration: habit.duration || "30 min",
    days:     habit.days     || [],
    active:   habit.active !== false,
  } : { ...EMPTY })
  const [confirm, setConfirm] = useState(false)
  const [error, setError]     = useState("")

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleDay = (d) => {
    set("days", form.days.includes(d)
      ? form.days.filter(x => x !== d)
      : [...form.days, d].sort((a,b) => a-b))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError("Habit name is required"); return }
    setError("")
    onSave(isEdit ? form : { ...form, name: form.name.trim() })
    onClose()
  }

  return (
    <>
      <div className="overlay anim-fade" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-handle" />

          {/* Header */}
          <div className="row-b" style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22 }}>
              {isEdit ? "Edit Habit" : "New Habit"}
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              {isEdit && (
                <button className="icon-btn" style={{ color: "var(--red)", borderColor: "rgba(239,68,68,0.2)" }}
                  onClick={() => setConfirm(true)}>
                  <TrashIcon />
                </button>
              )}
              <button className="icon-btn" onClick={onClose}><CloseIcon /></button>
            </div>
          </div>

          <form onSubmit={submit}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Habit Name</label>
              <input
                className="form-input"
                placeholder="e.g. Morning run, Read 20 pages…"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                maxLength={60}
                autoFocus
              />
              {error && <p style={{ color: "var(--red)", fontSize: 12, marginTop: 6 }}>{error}</p>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="chip-group" style={{ marginTop: 8 }}>
                {Object.entries(CAT).map(([k, c]) => (
                  <button
                    key={k} type="button"
                    className={`chip${form.category === k ? " active" : ""}`}
                    onClick={() => set("category", k)}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time + Duration */}
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div>
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.time}
                  onChange={e => set("time", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Duration</label>
                <input
                  className="form-input"
                  placeholder="30 min"
                  value={form.duration}
                  onChange={e => set("duration", e.target.value)}
                />
              </div>
            </div>

            {/* Days */}
            <div className="form-group">
              <label className="form-label">Repeat Days</label>
              <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>
                Leave empty = every day
              </p>
              <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
                {DAYS_SHORT.map((d, i) => (
                  <button
                    key={i} type="button"
                    className={`chip day-chip${form.days.includes(i) ? " active" : ""}`}
                    onClick={() => toggleDay(i)}
                  >
                    {d[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
              {isEdit ? "Save Changes" : "Add Habit"}
            </button>
          </form>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          title="Delete Habit"
          message={`Are you sure you want to delete "${form.name}"? This cannot be undone.`}
          onConfirm={() => { onDelete(habit.id); onClose() }}
          onCancel={() => setConfirm(false)}
        />
      )}
    </>
  )
}
