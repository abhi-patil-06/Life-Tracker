import { useState } from "react"
import { AppProvider, useApp } from "./context/AppContext"
import BottomNav from "./components/layout/BottomNav"
import Toast from "./components/ui/Toast"
import Onboarding from "./pages/Onboarding"
import Dashboard from "./pages/Dashboard"
import TodayCalendar from "./pages/TodayCalendar"
import Habits from "./pages/Habits"
import Stats from "./pages/Stats"
import Settings from "./pages/Settings"

function AppShell() {
  const { onboardingDone } = useApp()
  const [tab, setTab] = useState("dashboard")

  if (!onboardingDone) return <Onboarding />

  return (
    <div className="app">
      <main className="page-content" key={tab}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "today"     && <TodayCalendar />}
        {tab === "habits"    && <Habits />}
        {tab === "stats"     && <Stats />}
        {tab === "settings"  && <Settings />}
      </main>

      <BottomNav tab={tab} setTab={setTab} />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
