const S = { fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }

export const HomeIcon     = () => <svg viewBox="0 0 24 24" {...S}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
export const CalendarIcon = () => <svg viewBox="0 0 24 24" {...S}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
export const PlusIcon     = () => <svg viewBox="0 0 24 24" {...S} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
export const StatsIcon    = () => <svg viewBox="0 0 24 24" {...S}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
export const SettingsIcon = () => <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
export const CheckIcon    = () => <svg viewBox="0 0 24 24" {...S} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
export const CloseIcon    = () => <svg viewBox="0 0 24 24" {...S} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
export const TrashIcon    = () => <svg viewBox="0 0 24 24" {...S}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
export const EditIcon     = () => <svg viewBox="0 0 24 24" {...S}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
export const ChevLeftIcon = () => <svg viewBox="0 0 24 24" {...S} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
export const ChevRightIcon= () => <svg viewBox="0 0 24 24" {...S} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
export const InfoIcon     = () => <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
export const BellIcon     = () => <svg viewBox="0 0 24 24" {...S}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
export const UserIcon     = () => <svg viewBox="0 0 24 24" {...S}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
export const MoonIcon     = () => <svg viewBox="0 0 24 24" {...S}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
export const SunIcon      = () => <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
export const MonitorIcon  = () => <svg viewBox="0 0 24 24" {...S}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
export const ShieldIcon   = () => <svg viewBox="0 0 24 24" {...S}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
export const CameraIcon   = () => <svg viewBox="0 0 24 24" {...S}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
export const FlameIcon    = () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c0 0-5.5 5-5.5 10a5.5 5.5 0 0011 0C17.5 7 12 2 12 2zm0 14a3 3 0 01-3-3c0-2 2-4 3-5.5 1 1.5 3 3.5 3 5.5a3 3 0 01-3 3z"/></svg>
export const TrendIcon    = () => <svg viewBox="0 0 24 24" {...S}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
export const AwardIcon    = () => <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
export const TargetIcon   = () => <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
export const GridIcon     = () => <svg viewBox="0 0 24 24" {...S}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
export const ChevDownIcon = () => <svg viewBox="0 0 24 24" {...S} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
export const LogOutIcon   = () => <svg viewBox="0 0 24 24" {...S}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
