import { useState } from "react"
import { useApp } from "../context/AppContext"

const STEPS = 4

export default function Onboarding() {
  const { completeOnboarding } = useApp()
  const [step, setStep]   = useState(0)
  const [form, setForm]   = useState({ name: "", email: "", age: "", gender: "" })
  const [error, setError] = useState("")

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError("") }

  const next = () => {
    if (step === 1 && !form.name.trim()) { setError("Please enter your name"); return }
    if (step < STEPS - 1) setStep(s => s + 1)
    else finish()
  }

  const finish = () => {
    completeOnboarding({
      name:        form.name.trim(),
      email:       form.email.trim(),
      age:         form.age,
      gender:      form.gender,
      memberSince: new Date().getFullYear().toString(),
    })
  }

  const genders = ["Male", "Female", "Non-binary", "Prefer not to say"]

  return (
    <div className="onboard-wrap">
      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="anim-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 20 }}>
          <div style={{
            width: 96, height: 96, borderRadius: 28,
            background: "linear-gradient(135deg, #FF6B35, #FF9F6B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48, boxShadow: "0 12px 40px rgba(255,107,53,0.4)",
            marginBottom: 8,
          }}>
            🎯
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 36, color: "var(--text)", lineHeight: 1.1 }}>
              Life<span style={{ color: "var(--primary)" }}>Tracker</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--text2)", marginTop: 10, lineHeight: 1.6, maxWidth: 280 }}>
              Build powerful habits. Track your growth. Become the best version of yourself.
            </p>
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            {[
              { icon: "🏆", text: "Track habits with streaks & XP" },
              { icon: "📊", text: "Visualize your progress daily" },
              { icon: "🔔", text: "Smart reminders before it's time" },
            ].map(f => (
              <div key={f.text} style={{ display: "flex", gap: 12, alignItems: "center", background: "var(--surface)", padding: "14px 16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="anim-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>👋</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>
              What's your name?
            </h2>
            <p style={{ fontSize: 15, color: "var(--text2)", marginTop: 8 }}>
              We'll personalise your experience.
            </p>
          </div>
          <div>
            <input
              className="form-input"
              placeholder="Your first name"
              value={form.name}
              onChange={e => set("name", e.target.value)}
              autoFocus
              style={{ fontSize: 18, padding: "16px 18px" }}
              onKeyDown={e => e.key === "Enter" && next()}
            />
            {error && <p style={{ color: "var(--red)", fontSize: 13, marginTop: 8 }}>{error}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Email */}
      {step === 2 && (
        <div className="anim-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28 }}>
              Your email?
            </h2>
            <p style={{ fontSize: 15, color: "var(--text2)", marginTop: 8 }}>
              Optional — only stored on your device.
            </p>
          </div>
          <input
            className="form-input"
            type="email"
            placeholder="you@example.com (optional)"
            value={form.email}
            onChange={e => set("email", e.target.value)}
            autoFocus
            style={{ fontSize: 16, padding: "16px 18px" }}
            onKeyDown={e => e.key === "Enter" && next()}
          />
        </div>
      )}

      {/* Step 3: Age + Gender */}
      {step === 3 && (
        <div className="anim-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🌟</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28 }}>
              A little about you
            </h2>
            <p style={{ fontSize: 15, color: "var(--text2)", marginTop: 8 }}>
              Helps us tailor your experience. All optional.
            </p>
          </div>
          <div>
            <label className="form-label">Age</label>
            <input
              className="form-input"
              type="number"
              placeholder="Your age"
              min={5} max={120}
              value={form.age}
              onChange={e => set("age", e.target.value)}
              style={{ fontSize: 16, padding: "16px 18px" }}
            />
          </div>
          <div>
            <label className="form-label">Gender</label>
            <div className="chip-group">
              {genders.map(g => (
                <button
                  key={g} type="button"
                  className={`chip${form.gender === g ? " active" : ""}`}
                  onClick={() => set("gender", g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress dots + CTA */}
      <div style={{ paddingBottom: "max(40px, env(safe-area-inset-bottom, 40px))", paddingTop: 24 }}>
        {step > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 28 }}>
            {Array.from({ length: STEPS - 1 }, (_, i) => (
              <div key={i} style={{
                width: i === step - 1 ? 24 : 7,
                height: 7,
                borderRadius: 99,
                background: i === step - 1 ? "var(--primary)" : "var(--surface3)",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        )}

        {step > 0 && (
          <button
            className="btn-ghost"
            style={{ position: "absolute", bottom: "calc(80px + env(safe-area-inset-bottom, 0))", left: 28, padding: "10px 16px", fontSize: 14 }}
            onClick={() => setStep(s => s - 1)}
          >
            ← Back
          </button>
        )}

        <button className="btn-primary" onClick={next} style={{ borderRadius: 99, fontSize: 17, padding: "18px 24px" }}>
          {step === 0 ? "Get Started →" : step === STEPS - 1 ? "Let's go 🚀" : "Continue →"}
        </button>
      </div>
    </div>
  )
}
