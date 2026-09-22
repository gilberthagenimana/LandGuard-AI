import { useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Flag,
  FolderOpen,
  LayoutDashboard,
  Map,
  Menu,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'

type NavItem = { label: string; icon: typeof LayoutDashboard }

type Risk = 'Low' | 'Medium' | 'High'

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Parcels', icon: Map },
  { label: 'Owners', icon: Users },
  { label: 'Transactions', icon: FileText },
  { label: 'Cases', icon: FolderOpen },
  { label: 'Audit logs', icon: ClipboardCheck },
]

const alerts: { id: string; title: string; meta: string; risk: Risk }[] = [
  { id: 'RW-10432', title: 'Possible duplicate', meta: '8 min ago', risk: 'High' },
  { id: 'RW-88213', title: 'Recent ownership change', meta: '32 min ago', risk: 'Medium' },
  { id: 'RW-20991', title: 'Review required', meta: '1 hr ago', risk: 'Medium' },
]

const activity = [
  { icon: Check, text: 'Verified transaction on parcel RW-10432', time: '2h ago', tone: 'green' },
  { icon: FolderOpen, text: 'Opened review case for RW-88213', time: '5h ago', tone: 'blue' },
  { icon: FolderOpen, text: 'Closed case for RW-33107 — no issues found', time: 'Yesterday', tone: 'muted' },
]

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [alertFilter, setAlertFilter] = useState<Risk | 'All'>('All')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const visibleAlerts = alertFilter === 'All' ? alerts : alerts.filter((alert) => alert.risk === alertFilter)

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar--open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><ShieldCheck size={17} strokeWidth={2.4} /></div>
          <span>LandVerify</span>
          <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-icon"><Building2 size={15} /></div>
          <div><strong>Rwanda registry</strong><span>Verification office</span></div>
          <ChevronDown size={14} className="workspace-chevron" />
        </div>
        <nav className="primary-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'nav-item--active' : ''}`} onClick={() => { setActiveNav(label); setMobileNavOpen(false) }}>
              <Icon size={16} strokeWidth={1.9} /><span>{label}</span>
              {label === 'Cases' && <span className="nav-count">12</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-link"><CircleHelp size={16} /><span>Help & documentation</span></div>
          <div className="user-card"><div className="avatar">GG</div><div><strong>Gilbert Godson</strong><span>Verification officer</span></div><MoreHorizontal size={15} className="user-more" /></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>{activeNav}</strong></div>
          <div className="top-actions"><button className="search-trigger"><Search size={16} /><span>Search anything</span><kbd>⌘ K</kbd></button><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">GG</div></div>
        </header>

        <div className="content-wrap">
          <section className="page-heading"><div><p className="eyebrow">Tuesday, 22 September 2026</p><h1>Dashboard</h1><p className="heading-subtitle">Here is today&apos;s verification overview.</p></div><button className="outline-button"><FileText size={15} /> Export report</button></section>

          <section className="metric-grid" aria-label="Overview metrics">
            <Metric icon={Map} label="Parcels" value="4,812" change="+4.8%" accent="blue" />
            <Metric icon={Users} label="Owners" value="3,940" change="+2.1%" accent="violet" />
            <Metric icon={FileText} label="Transactions" value="1,207" change="+8.6%" accent="amber" />
            <Metric icon={FolderOpen} label="Under review" value="36" change="+3 cases" accent="red" />
          </section>

          <section className="risk-row">
            <RiskCard label="Low risk" value="982" percent="81.4%" tone="low" icon={Check} />
            <RiskCard label="Medium risk" value="189" percent="15.7%" tone="medium" icon={AlertTriangle} />
            <RiskCard label="High risk" value="36" percent="2.9%" tone="high" icon={Flag} />
          </section>

          <section className="dashboard-grid">
            <article className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">Last 30 days</p><h2>Transactions by risk level</h2></div><button className="filter-button">Monthly <ChevronDown size={14} /></button></div><div className="chart"><div className="y-axis"><span>1k</span><span>750</span><span>500</span><span>250</span><span>0</span></div><div className="chart-plot"><div className="grid-line line-1" /><div className="grid-line line-2" /><div className="grid-line line-3" /><div className="grid-line line-4" /><div className="bars"><Bar value="78%" label="Low" tone="low" count="982" /><Bar value="38%" label="Medium" tone="medium" count="189" /><Bar value="16%" label="High" tone="high" count="36" /></div></div></div></article>
            <article className="panel alerts-panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Recent alerts</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="alert-filters">{(['All', 'High', 'Medium'] as const).map((filter) => <button key={filter} className={alertFilter === filter ? 'filter-active' : ''} onClick={() => setAlertFilter(filter)}>{filter}</button>)}</div><div className="alerts-list">{visibleAlerts.map((alert) => <div className="alert-item" key={alert.id}><div className={`alert-icon alert-icon--${alert.risk.toLowerCase()}`}>{alert.risk === 'High' ? <Flag size={14} /> : <AlertTriangle size={14} />}</div><div className="alert-copy"><strong>{alert.id}</strong><span>{alert.title}</span></div><span className={`status-pill status-pill--${alert.risk.toLowerCase()}`}>{alert.risk}</span></div>)}</div><button className="view-all">View all alerts <span>→</span></button></article>
          </section>

          <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Your team&apos;s work</p><h2>Recent verification activity</h2></div><button className="text-button">View activity <span>→</span></button></div><div className="activity-list">{activity.map(({ icon: Icon, text, time, tone }) => <div className="activity-item" key={text}><div className={`activity-icon activity-icon--${tone}`}><Icon size={14} /></div><span>{text}</span><time>{time}</time></div>)}</div></section>

          <footer className="footer"><span><span className="live-dot" />All systems operational</span><span>Data refreshed 4 minutes ago</span></footer>
        </div>
      </main>
    </div>
  )
}

function Metric({ icon: Icon, label, value, change, accent }: { icon: typeof Map; label: string; value: string; change: string; accent: string }) {
  return <div className="metric-card"><div className={`metric-icon metric-icon--${accent}`}><Icon size={17} /></div><div className="metric-info"><span>{label}</span><strong>{value}</strong></div><span className="metric-change">{change}</span></div>
}

function RiskCard({ label, value, percent, tone, icon: Icon }: { label: string; value: string; percent: string; tone: string; icon: typeof Check }) {
  return <div className={`risk-card risk-card--${tone}`}><div className="risk-card-top"><div><span>{label}</span><strong>{value}</strong></div><div className="risk-card-icon"><Icon size={16} /></div></div><div className="risk-card-bottom"><span>{percent} of transactions</span><div className="progress-track"><div style={{ width: percent }} /></div></div></div>
}

function Bar({ value, label, tone, count }: { value: string; label: string; tone: string; count: string }) {
  return <div className="bar-column"><div className={`bar bar--${tone}`} style={{ height: value }}><span>{count}</span></div><strong>{label}</strong></div>
}

export default App
