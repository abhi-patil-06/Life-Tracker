import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'

// Prevent pull-to-refresh in Android WebViews (WebIntoApp, etc.)
// CSS overscroll-behavior alone is ignored by many WebView engines.
let lastTouchY = 0

document.addEventListener('touchstart', (e) => {
  lastTouchY = e.touches[0].clientY
}, { passive: true })

document.addEventListener('touchmove', (e) => {
  const touchY     = e.touches[0].clientY
  const scrollEl   = e.target.closest('.page-content')
  const atTop      = scrollEl ? scrollEl.scrollTop <= 0 : true
  const pullingDown = touchY > lastTouchY   // finger moving down = pull-to-refresh gesture

  // Block the gesture only when at the top and pulling down
  if (atTop && pullingDown) {
    e.preventDefault()
  }
}, { passive: false })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
