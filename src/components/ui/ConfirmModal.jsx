export default function ConfirmModal({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <div className="confirm-overlay anim-fade" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, marginBottom: 10 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "12px", border: "none", borderRadius: "var(--radius-sm)",
              background: danger ? "var(--red)" : "var(--primary)",
              color: "white", fontWeight: 700, fontSize: 14,
              fontFamily: "var(--font-display)", cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
