import { useRef, useState } from "react"
import { useApp } from "../context/AppContext"
import { calcOverallStreak } from "../utils/habitUtils"
import {
  UserIcon, MoonIcon, SunIcon, MonitorIcon, BellIcon,
  CameraIcon, EditIcon, CloseIcon, ShieldIcon,
} from "../components/ui/Icons"

const THEMES = [
  { id: "light",  label: "Light",  Icon: SunIcon,     preview: ["#F7F6F3","#FFFFFF"] },
  { id: "dark",   label: "Dark",   Icon: MoonIcon,    preview: ["#0E0E0E","#1A1917"] },
  { id: "system", label: "System", Icon: MonitorIcon, preview: ["#F7F6F3","#0E0E0E"] },
]

function Avatar({ profile, size = 80, onClick }) {
  const initials = profile.name
    ? profile.name.trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()
    : "?"

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      {initials}
      {profile.photo && <img src={profile.photo} alt={profile.name} />}
      {onClick && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "50%", opacity: 0, transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <CameraIcon style={{ width: 22, height: 22, color: "white" }} />
        </div>
      )}
    </div>
  )
}

function EditProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    name:   profile.name   || "",
    email:  profile.email  || "",
    age:    profile.age    || "",
    gender: profile.gender || "",
  })
  const [error, setError] = useState("")

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError("Name is required"); return }
    onSave(form)
    onClose()
  }

  return (
    <div className="overlay anim-fade" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="row-b" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>Edit Profile</h3>
          <button className="icon-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)} autoFocus />
            {error && <p style={{ color: "var(--red)", fontSize: 12, marginTop: 6 }}>{error}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="Optional" />
          </div>
          <div className="form-row" style={{ marginBottom: 16 }}>
            <div>
              <label className="form-label">Age</label>
              <input className="form-input" type="number" value={form.age} onChange={e => set("age", e.target.value)} min={5} max={120} />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender} onChange={e => set("gender", e.target.value)}>
                <option value="">Select</option>
                {["Male","Female","Non-binary","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </div>
    </div>
  )
}

export default function Settings() {
  const { habits, profile, settings, updateProfile, updateSettings } = useApp()
  const [editOpen, setEditOpen]     = useState(false)
  const [notifError, setNotifError] = useState("")
  const fileRef                     = useRef()
  const streak                      = calcOverallStreak(habits)

  // Photo upload
  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateProfile({ photo: ev.target.result })
    reader.readAsDataURL(file)
  }

  // Notification toggle
  const handleNotifToggle = async (val) => {
    if (val) {
      if (!("Notification" in window)) {
        setNotifError("Browser notifications not supported.")
        return
      }
      const perm = await Notification.requestPermission()
      if (perm !== "granted") {
        setNotifError("Permission denied. Enable notifications in browser settings.")
        updateSettings({ notifications: false })
        return
      }
      setNotifError("")
    } else {
      setNotifError("")
    }
    updateSettings({ notifications: val })
  }

  return (
    <div className="page-pad" style={{ paddingTop: 24 }}>
      <h1 className="page-title anim-up" style={{ marginBottom: 24 }}>Settings</h1>

      {/* Profile card */}
      <div className="card anim-up" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Avatar profile={profile} size={72} onClick={() => fileRef.current.click()} />
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: 24, height: 24, borderRadius: "50%",
              background: "var(--primary)", border: "2px solid var(--surface)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }} onClick={() => fileRef.current.click()}>
              <CameraIcon style={{ width: 12, height: 12, color: "white" }} />
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.name || "Your Name"}
            </p>
            {profile.email && (
              <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {profile.email}
              </p>
            )}
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <div className="level-badge">LVL {profile.level}</div>
              <div className="tag" style={{ background: "var(--primary-soft)", color: "var(--primary)", fontSize: 10 }}>
                🔥 {streak}d streak
              </div>
            </div>
          </div>

          <button className="icon-btn" onClick={() => setEditOpen(true)}>
            <EditIcon />
          </button>
        </div>

        {/* XP bar */}
        <div style={{ marginTop: 16 }}>
          <div className="row-b" style={{ marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
              Level {profile.level} · {profile.xp.toLocaleString()} XP
            </span>
            <span style={{ fontSize: 11, color: "var(--text3)" }}>{(profile.maxXp || 1000).toLocaleString()} XP</span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: Math.min(Math.round((profile.xp / (profile.maxXp || 1000)) * 100), 100) + "%" }} />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card anim-up" style={{ marginBottom: 16 }}>
        <p className="section-title">Appearance</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => updateSettings({ theme: t.id })}
              style={{
                padding: "12px 8px", borderRadius: "var(--radius-sm)",
                border: `2px solid ${settings.theme === t.id ? "var(--primary)" : "var(--border)"}`,
                background: settings.theme === t.id ? "var(--primary-soft)" : "var(--surface2)",
                cursor: "pointer", textAlign: "center",
                transition: "all 0.15s",
              }}
            >
              {/* Preview swatch */}
              <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                {t.preview.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                fontFamily: "var(--font-display)",
                color: settings.theme === t.id ? "var(--primary)" : "var(--text2)",
              }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card anim-up" style={{ marginBottom: 16 }}>
        <p className="section-title">Notifications</p>

        <div className="settings-item" style={{ cursor: "default" }}>
          <div className="settings-icon" style={{ background: "var(--amber-soft)" }}>
            <BellIcon style={{ width: 18, height: 18, color: "var(--amber)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: 14, fontFamily: "var(--font-display)" }}>Smart Reminders</p>
            <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
              10 min & 5 min before each habit
            </p>
            {notifError && <p style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>{notifError}</p>}
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={e => handleNotifToggle(e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>

        {settings.notifications && Notification.permission === "granted" && (
          <div style={{ background: "var(--green-soft)", borderRadius: "var(--radius-xs)", padding: "10px 14px", marginTop: 8 }}>
            <p style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
              ✅ Notifications active — make sure the app is open for reminders to work.
            </p>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="card anim-up" style={{ marginBottom: 16 }}>
        <p className="section-title">Account</p>
        {[
          { label: "Member Since", value: profile.memberSince || new Date().getFullYear() },
          { label: "Total Habits", value: habits.length },
          { label: "All Time XP",  value: profile.xp.toLocaleString() },
          { label: "Current Level",value: `Level ${profile.level}` },
        ].map(row => (
          <div key={row.label} className="settings-item" style={{ cursor: "default" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{row.label}</p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text2)" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* About */}
      <div className="card anim-up" style={{ marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
          Life<span style={{ color: "var(--primary)" }}>Tracker</span>
        </p>
        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
          Build powerful habits. Live intentionally.
        </p>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 12, color: "var(--text3)" }}>
            Designed & built by
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text)", marginTop: 4 }}>
            Abhilash Patil
          </p>
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>Version 2.0</p>
        </div>
      </div>

      <div style={{ height: 8 }} />

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={updateProfile}
        />
      )}
    </div>
  )
}
