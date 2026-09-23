import { useEffect, useState } from 'react'
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

type DashboardStats = {
  total_parcels: number
  total_owners: number
  total_transactions: number
  transactions_under_review: number
  low_risk_transactions: number
  medium_risk_transactions: number
  high_risk_transactions: number
  recent_verification_activity: { action: string; entity: string; entity_id: string | null; created_at: string }[]
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

function App() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('landguard_demo_session') === 'true')
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [alertFilter, setAlertFilter] = useState<Risk | 'All'>('All')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [apiState, setApiState] = useState<'demo' | 'live'>('demo')
  const visibleAlerts = alertFilter === 'All' ? alerts : alerts.filter((alert) => alert.risk === alertFilter)

  useEffect(() => {
    const token = localStorage.getItem('landguard_access_token')
    if (!token) return
    fetch(`${apiUrl}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Dashboard access denied')))
      .then((data: DashboardStats) => { setStats(data); setApiState('live') })
      .catch(() => setApiState('demo'))
  }, [])

  const display = stats ?? {
    total_parcels: 4812,
    total_owners: 3940,
    total_transactions: 1207,
    transactions_under_review: 36,
    low_risk_transactions: 982,
    medium_risk_transactions: 189,
    high_risk_transactions: 36,
  }

  if (!authenticated) {
    return <LoginScreen onContinue={() => { localStorage.setItem('landguard_demo_session', 'true'); setAuthenticated(true) }} />
  }

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
          {activeNav !== 'Dashboard' ? <WorkspacePage page={activeNav} onBack={() => setActiveNav('Dashboard')} /> : <>
          <section className="page-heading"><div><p className="eyebrow">Tuesday, 22 September 2026</p><h1>Dashboard</h1><p className="heading-subtitle">Here is today&apos;s verification overview.</p></div><button className="outline-button"><FileText size={15} /> Export report</button></section>

          <section className="metric-grid" aria-label="Overview metrics">
            <Metric icon={Map} label="Parcels" value={formatNumber(display.total_parcels)} change={apiState === 'live' ? 'Live' : 'Demo'} accent="blue" />
            <Metric icon={Users} label="Owners" value={formatNumber(display.total_owners)} change={apiState === 'live' ? 'Live' : 'Demo'} accent="violet" />
            <Metric icon={FileText} label="Transactions" value={formatNumber(display.total_transactions)} change={apiState === 'live' ? 'Live' : 'Demo'} accent="amber" />
            <Metric icon={FolderOpen} label="Under review" value={formatNumber(display.transactions_under_review)} change={apiState === 'live' ? 'Live' : 'Demo'} accent="red" />
          </section>

          <section className="risk-row">
            <RiskCard label="Low risk" value={formatNumber(display.low_risk_transactions)} percent={riskPercent(display.low_risk_transactions, display.total_transactions)} tone="low" icon={Check} />
            <RiskCard label="Medium risk" value={formatNumber(display.medium_risk_transactions)} percent={riskPercent(display.medium_risk_transactions, display.total_transactions)} tone="medium" icon={AlertTriangle} />
            <RiskCard label="High risk" value={formatNumber(display.high_risk_transactions)} percent={riskPercent(display.high_risk_transactions, display.total_transactions)} tone="high" icon={Flag} />
          </section>

          <section className="dashboard-grid">
            <article className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">Last 30 days</p><h2>Transactions by risk level</h2></div><button className="filter-button">Monthly <ChevronDown size={14} /></button></div><div className="chart"><div className="y-axis"><span>1k</span><span>750</span><span>500</span><span>250</span><span>0</span></div><div className="chart-plot"><div className="grid-line line-1" /><div className="grid-line line-2" /><div className="grid-line line-3" /><div className="grid-line line-4" /><div className="bars"><Bar value="78%" label="Low" tone="low" count="982" /><Bar value="38%" label="Medium" tone="medium" count="189" /><Bar value="16%" label="High" tone="high" count="36" /></div></div></div></article>
            <article className="panel alerts-panel"><div className="panel-heading"><div><p className="eyebrow">Needs attention</p><h2>Recent alerts</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="alert-filters">{(['All', 'High', 'Medium'] as const).map((filter) => <button key={filter} className={alertFilter === filter ? 'filter-active' : ''} onClick={() => setAlertFilter(filter)}>{filter}</button>)}</div><div className="alerts-list">{visibleAlerts.map((alert) => <div className="alert-item" key={alert.id}><div className={`alert-icon alert-icon--${alert.risk.toLowerCase()}`}>{alert.risk === 'High' ? <Flag size={14} /> : <AlertTriangle size={14} />}</div><div className="alert-copy"><strong>{alert.id}</strong><span>{alert.title}</span></div><span className={`status-pill status-pill--${alert.risk.toLowerCase()}`}>{alert.risk}</span></div>)}</div><button className="view-all">View all alerts <span>→</span></button></article>
          </section>

          <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Your team&apos;s work</p><h2>Recent verification activity</h2></div><button className="text-button">View activity <span>→</span></button></div><div className="activity-list">{activity.map(({ icon: Icon, text, time, tone }) => <div className="activity-item" key={text}><div className={`activity-icon activity-icon--${tone}`}><Icon size={14} /></div><span>{text}</span><time>{time}</time></div>)}</div></section>

          <footer className="footer"><span><span className="live-dot" />{apiState === 'live' ? 'Connected to LandGuard API' : 'Demo data mode'}</span><span>{apiState === 'live' ? 'Live database metrics' : 'Use the backend login to connect API'}</span></footer>
          </>}
        </div>
      </main>
    </div>
  )
}

function LoginScreen({ onContinue }: { onContinue: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(`${apiUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      if (!response.ok) throw new Error('Invalid email or password')
      const result = await response.json()
      localStorage.setItem('landguard_access_token', result.access_token)
      onContinue()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in')
    }
  }
  return <div className="login-screen"><div className="login-card"><div className="brand-row login-brand"><div className="brand-mark"><ShieldCheck size={17} /></div><span>LandVerify</span></div><p className="eyebrow">Secure workspace</p><h1>Welcome back</h1><p className="heading-subtitle">Sign in to review land transactions and risk indicators.</p><form onSubmit={submit} className="login-form"><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="officer@example.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required /></label>{error && <p className="login-error">{error}</p>}<button className="login-button" type="submit">Sign in <span>→</span></button></form><div className="login-divider"><span>or</span></div><button className="demo-button" onClick={onContinue}>Explore demo workspace</button><p className="login-note">Demo data is synthetic and for academic development only.</p></div></div>
}

function WorkspacePage({ page, onBack }: { page: string; onBack: () => void }) {
  const content: Record<string, { eyebrow: string; title: string; description: string; rows: string[][] }> = {
    Parcels: { eyebrow: 'Land registry', title: 'Parcels', description: 'Search and inspect registered land parcels.', rows: [['RW-10432', 'Kigali, Gasabo', '1.24 ha', 'Active'], ['RW-88213', 'Kigali, Kicukiro', '0.87 ha', 'Active'], ['RW-33107', 'Huye, Ngoma', '2.10 ha', 'Active']] },
    Owners: { eyebrow: 'Registry records', title: 'Owners', description: 'Review registered owners and their parcel relationships.', rows: [['OWN-001', 'Jean Claude N.', '4 parcels', 'Verified'], ['OWN-002', 'Aline M.', '2 parcels', 'Verified'], ['OWN-003', 'Emmanuel K.', '1 parcel', 'Review required']] },
    Transactions: { eyebrow: 'Transaction desk', title: 'Transactions', description: 'Track sale activity and run verification checks.', rows: [['TX-10432', 'RW-10432', 'Sale', 'Pending review'], ['TX-88213', 'RW-88213', 'Transfer', 'Verified'], ['TX-33107', 'RW-33107', 'Sale', 'Closed']] },
    Cases: { eyebrow: 'Human review', title: 'Suspicious cases', description: 'Review risk indicators and record an officer decision.', rows: [['CASE-10432', 'Possible duplicate', 'High', 'Open'], ['CASE-88213', 'Recent ownership change', 'Medium', 'Under review'], ['CASE-20991', 'Review required', 'Medium', 'Open']] },
    'Audit logs': { eyebrow: 'Accountability', title: 'Audit logs', description: 'Every important action is recorded for traceability.', rows: [['Today 09:42', 'Transaction verification', 'TX-10432', 'Officer'], ['Today 08:15', 'Case opened', 'CASE-88213', 'Officer'], ['Yesterday', 'User login', 'Gilbert Godson', 'System']] },
  }
  const selected = content[page]
  return <section className="workspace-page"><button className="back-button" onClick={onBack}>← Dashboard</button><p className="eyebrow">{selected.eyebrow}</p><div className="workspace-title"><div><h1>{selected.title}</h1><p className="heading-subtitle">{selected.description}</p></div><button className="outline-button"><Search size={15} /> Search records</button></div><div className="table-panel"><div className="table-toolbar"><strong>{selected.rows.length * 401} records</strong><button className="filter-button">Filter <ChevronDown size={14} /></button></div><div className="data-table">{selected.rows.map((row) => <div className="data-row" key={row[0]}>{row.map((cell, index) => <span className={index === row.length - 1 ? 'row-status' : ''} key={cell}>{cell}</span>)}<button className="row-action" aria-label={`Open ${row[0]}`}>→</button></div>)}</div></div></section>
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

function formatNumber(value: number) {
  return value.toLocaleString()
}

function riskPercent(value: number, total: number) {
  return total ? `${((value / total) * 100).toFixed(1)}%` : '0.0%'
}

export default App
