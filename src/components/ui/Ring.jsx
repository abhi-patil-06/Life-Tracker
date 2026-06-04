export default function Ring({ pct, size = 120, stroke = 9, color = "var(--primary)", children }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - Math.min(pct, 100) / 100 * circ

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface2)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center",
      }}>
        {children}
      </div>
    </div>
  )
}
