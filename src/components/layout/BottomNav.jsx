import { HomeIcon, CalendarIcon, PlusIcon, StatsIcon, SettingsIcon } from "../ui/Icons"

const NAV = [
  { id: "dashboard", label: "Home",    Icon: HomeIcon },
  { id: "today",     label: "Today",   Icon: CalendarIcon },
  null, // center FAB slot
  { id: "stats",     label: "Stats",   Icon: StatsIcon },
  { id: "settings",  label: "Settings", Icon: SettingsIcon },
]

export default function BottomNav({ tab, setTab }) {
  return (
    <nav className="bottom-nav">
      <div className="nav-items">
        {NAV.map((item, i) => {
          if (!item) {
            // Center FAB
            return (
              <div key="fab" className="nav-center">
                <button
                  className={`fab-btn${tab === "habits" ? " active-tab" : ""}`}
                  onClick={() => setTab("habits")}
                  aria-label="Manage habits"
                >
                  <PlusIcon />
                </button>
              </div>
            )
          }
          const { id, label, Icon } = item
          const active = tab === id
          return (
            <button
              key={id}
              className={`nav-item${active ? " active" : ""}`}
              onClick={() => setTab(id)}
              aria-label={label}
            >
              <Icon />
              <span>{label}</span>
              <div className="nav-dot" />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
