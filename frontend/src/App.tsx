import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
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
  UserRound,
  LogOut,
  MinusCircle,
  Trash2,
  Users,
  X,
} from 'lucide-react'

type NavItem = { label: string; icon: typeof LayoutDashboard }

type Risk = 'Low' | 'Medium' | 'High'

const navigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Users', icon: Users },
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

type RoleRecord = { name: string }
type CurrentUser = { id: number; full_name: string; email: string; is_active: boolean; roles: string[] }
type UserRecord = Omit<CurrentUser, 'roles'> & { roles: RoleRecord[] }

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

function App() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('landguard_demo_session') === 'true')
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [alertFilter, setAlertFilter] = useState<Risk | 'All'>('All')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [apiState, setApiState] = useState<'demo' | 'live'>('demo')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const visibleAlerts = alertFilter === 'All' ? alerts : alerts.filter((alert) => alert.risk === alertFilter)

  useEffect(() => {
    const token = localStorage.getItem('landguard_access_token')
    if (!token) return
    fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Session expired')))
      .then((data: CurrentUser) => setCurrentUser(data))
      .catch(() => { localStorage.removeItem('landguard_access_token'); localStorage.removeItem('landguard_demo_session'); setAuthenticated(false) })
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

  const logout = () => {
    localStorage.removeItem('landguard_access_token')
    localStorage.removeItem('landguard_demo_session')
    setAuthenticated(false)
    setCurrentUser(null)
  }

  if (!authenticated) {
    return <LoginScreen onContinue={(user) => { localStorage.setItem('landguard_demo_session', 'true'); setCurrentUser(user); setAuthenticated(true) }} />
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
          {navigation.filter(({ label }) => label !== 'Users' || currentUser?.roles.includes('ADMIN')).map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'nav-item--active' : ''}`} onClick={() => { setActiveNav(label); setMobileNavOpen(false) }}>
              <Icon size={16} strokeWidth={1.9} /><span>{label}</span>
              {label === 'Cases' && <span className="nav-count">12</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-link"><CircleHelp size={16} /><span>Help & documentation</span></div>
          <div className="user-card"><div className="avatar">{currentUser ? initials(currentUser.full_name) : 'GG'}</div><div><strong>{currentUser?.full_name ?? 'Demo Officer'}</strong><span>{currentUser ? displayRole(currentUser.roles[0]) : 'Demo workspace'}</span></div><button className="logout-button" onClick={logout}><LogOut size={14} /> Log out</button></div>
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>{activeNav}</strong></div>
          <div className="top-actions"><button className="search-trigger"><Search size={16} /><span>Search anything</span><kbd>⌘ K</kbd></button><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="profile-menu-wrap"><button className="profile-trigger" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen(!profileMenuOpen)}><div className="top-avatar">{currentUser ? initials(currentUser.full_name) : 'DO'}</div><span>{currentUser?.full_name ?? 'Demo Officer'}</span><ChevronDown size={16} /></button>{profileMenuOpen && <div className="profile-menu"><div className="profile-menu-heading"><strong>{currentUser?.full_name ?? 'Demo Officer'}</strong><span>{currentUser ? displayRole(currentUser.roles[0]) : 'Demo workspace'}</span></div><button className="profile-menu-item"><UserRound size={19} /> Profile settings</button><button className="profile-menu-item profile-menu-item--logout" onClick={logout}><LogOut size={19} /> Log out</button></div>}</div></div>
        </header>

        <div className="content-wrap">
          {activeNav !== 'Dashboard' ? <WorkspacePage page={activeNav} onBack={() => setActiveNav('Dashboard')} currentUser={currentUser} /> : <>
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

function LoginScreen({ onContinue }: { onContinue: (user: CurrentUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Officer')
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(`${apiUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, role: role.toUpperCase() }) })
      if (!response.ok) throw new Error('Invalid email or password')
      const result = await response.json()
      localStorage.setItem('landguard_access_token', result.access_token)
      const userResponse = await fetch(`${apiUrl}/auth/me`, { headers: { Authorization: `Bearer ${result.access_token}` } })
      onContinue(await userResponse.json())
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in')
    }
  }
  const enterDemo = () => onContinue({ id: 0, full_name: 'Demo Officer', email: 'demo@landguard.local', is_active: true, roles: ['VERIFICATION_OFFICER'] })
  return <div className="login-screen"><div className="login-card"><div className="brand-row login-brand"><div className="brand-mark"><ShieldCheck size={17} /></div><span>LandGuard AI</span></div><h1>Sign in</h1><p className="login-subtitle">Verification and fraud-risk decision-support system</p><form onSubmit={submit} className="login-form"><label>Username<input type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="m.habyarimana" autoComplete="username" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" autoComplete="current-password" required /></label><fieldset className="role-field"><legend>Role</legend><div className="role-switcher">{['Officer', 'Admin', 'Auditor'].map((option) => <button type="button" key={option} className={role === option ? 'role-option role-option--active' : 'role-option'} onClick={() => setRole(option)}>{option}</button>)}</div></fieldset>{error && <p className="login-error">{error}</p>}<button className="login-button" type="submit">Sign in</button></form><button className="demo-button" onClick={enterDemo}>Explore demo workspace</button><p className="login-note">Authorized personnel only.<br />All access attempts are logged and audited.</p></div></div>
}

function WorkspacePage({ page, onBack, currentUser }: { page: string; onBack: () => void; currentUser: CurrentUser | null }) {
  const pageConfig: Record<string, { title: string; subtitle: string; search: string; columns: string[]; rows: string[][] }> = {
    Users: { title: 'Users', subtitle: 'Manage authorized workspace accounts', search: 'Search users', columns: ['NAME', 'EMAIL', 'ROLE', 'STATUS'], rows: [['Gilbert Godson', 'admin@landguard.com', 'ADMIN', 'Active']] },
    Parcels: { title: 'Parcels', subtitle: '4,812 registered land parcels', search: 'Search by parcel ID or location', columns: ['PARCEL ID', 'LOCATION', 'AREA', 'STATUS', 'REGISTERED OWNER', 'LAST UPDATED'], rows: [['RW-10432', 'Kicukiro / Niboye / Kagarama', '820 m2', 'Registered', 'J. Mugisha', '2 days ago'], ['RW-88213', 'Gasabo / Remera / Nyabisindu', '1,150 m2', 'Registered', 'A. Uwase', '5 hours ago'], ['RW-20991', 'Huye / Ngoma / Butare', '640 m2', 'Under review', 'E. Nkurunziza', '1 day ago'], ['RW-33107', 'Musanze / Muhoza / Amajyaruguru', '990 m2', 'Registered', 'C. Ingabire', '3 days ago'], ['RW-55621', 'Nyarugenge / Nyamirambo / Rugarama', '410 m2', 'Registered', 'P. Habimana', '1 week ago'], ['RW-77890', 'Rubavu / Gisenyi / Kivu', '1,420 m2', 'Disputed', 'S. Mukamana', '6 hours ago']] },
    Owners: { title: 'Owners', subtitle: '3,940 registered land owners', search: 'Search owners', columns: ['OWNER ID', 'NAME', 'ID REFERENCE', 'PARCELS OWNED', 'STATUS'], rows: [['O-2291', 'Jean Mugisha', '1199 •••• 5521', '2 parcels', 'Active'], ['O-2292', 'Alice Uwase', '1198 •••• 0073', '1 parcel', 'Active'], ['O-2293', 'Eric Nkurunziza', '1197 •••• 4412', '3 parcels', 'Active'], ['O-2294', 'Claudine Ingabire', '1196 •••• 8820', '1 parcel', 'Active'], ['O-2295', 'Patrick Habimana', '1195 •••• 1150', '1 parcel', 'Inactive'], ['O-2296', 'Solange Mukamana', '1194 •••• 6634', '2 parcels', 'Active']] },
    Transactions: { title: 'Transactions', subtitle: '1,207 recorded land transactions', search: 'Search transactions', columns: ['TRANSACTION ID', 'PARCEL', 'SELLER', 'BUYER', 'TYPE', 'DATE', 'RISK', 'STATUS'], rows: [['TX-98231', 'RW-10432', 'J. Mugisha', 'D. Nseŋimana', 'Sale', 'Sep 20, 2026', 'LOW', 'Verified'], ['TX-98232', 'RW-88213', 'A. Uwase', 'F. Byiringiro', 'Sale', 'Sep 21, 2026', 'MEDIUM', 'Under review'], ['TX-98233', 'RW-20991', 'E. Nkurunziza', 'G. Mutesi', 'Transfer', 'Sep 21, 2026', 'HIGH', 'Review required'], ['TX-98234', 'RW-33107', 'C. Ingabire', 'L. Kayitesi', 'Sale', 'Sep 19, 2026', 'LOW', 'Verified'], ['TX-98235', 'RW-55621', 'P. Habimana', 'B. Ndayambaje', 'Inheritance', 'Sep 18, 2026', 'MEDIUM', 'Under review'], ['TX-98236', 'RW-77890', 'S. Mukamana', 'T. Uwimana', 'Sale', 'Sep 22, 2026', 'HIGH', 'Review required']] },
    'Audit logs': { title: 'Audit logs', subtitle: 'Complete system activity trail', search: 'Filter audit logs', columns: ['TIMESTAMP', 'USER', 'ACTION', 'ENTITY', 'ENTITY ID'], rows: [['2026-09-23 14:02', 'm. habyarimana', 'Verification run', 'Transaction', 'TX-98233'], ['2026-09-23 13:41', 'system', 'AI risk prediction', 'Transaction', 'TX-98236'], ['2026-09-23 09:15', 'r. uwizeye', 'Case status changed', 'Case', 'CASE-0444'], ['2026-09-22 17:30', 'a. mukiza', 'User created', 'User', 'U-1082'], ['2026-09-22 11:04', 'm. habyarimana', 'Ownership record updated', 'Parcel', 'RW-55621'], ['2026-09-21 08:47', 'm. habyarimana', 'Login', 'User', 'U-1041']] },
    Cases: { title: 'Cases', subtitle: '12 cases open for officer review', search: 'Search cases', columns: [], rows: [['CASE-0441', 'HIGH', 'Under review', 'Parcel RW-20991 · E. Nkurunziza → G. Mutesi', 'Opened 1 day ago', 'M. Habyarimana'], ['CASE-0442', 'HIGH', 'Open', 'Parcel RW-77890 · S. Mukamana → T. Uwimana', 'Opened 6 hours ago', 'Unassigned'], ['CASE-0443', 'MEDIUM', 'Needs information', 'Parcel RW-88213 · A. Uwase → F. Byiringiro', 'Opened 5 hours ago', 'M. Habyarimana'], ['CASE-0444', 'MEDIUM', 'Under review', 'Parcel RW-55621 · P. Habimana → B. Ndayambaje', 'Opened 2 days ago', 'R. Uwizeye']] },
  }
  const selected = pageConfig[page]
  if (page === 'Users' && currentUser?.roles.includes('ADMIN')) return <AdminUsersPage onBack={onBack} />
  if (page === 'Cases') return <section className="workspace-page"><WorkspaceHeader title={selected.title} subtitle={selected.subtitle} search={selected.search} onBack={onBack} currentUser={currentUser} /><div className="case-list">{selected.rows.map((row) => <div className="case-card" key={row[0]}><div><strong>{row[0]}</strong><span className={`risk-label risk-label--${row[1].toLowerCase()}`}>{row[1]}</span><span className="case-status">{row[2]}</span><p>{row[3]}</p></div><div className="case-meta"><span>{row[4]}</span><strong>{row[5]}</strong></div></div>)}</div></section>
  return <section className="workspace-page"><WorkspaceHeader title={selected.title} subtitle={selected.subtitle} search={selected.search} onBack={onBack} currentUser={currentUser} /><div className={`reference-table reference-table--${page.toLowerCase().replace(' ', '-')}`}><div className="reference-header">{selected.columns.map((column) => <span key={column}>{column}</span>)}</div>{selected.rows.map((row) => <div className="reference-row" key={row[0]}>{row.map((cell, index) => <span key={`${row[0]}-${cell}`} className={`${index === row.length - 1 ? 'reference-muted' : ''} ${['LOW', 'MEDIUM', 'HIGH'].includes(cell) ? `risk-label risk-label--${cell.toLowerCase()}` : ''} ${['Registered', 'Active', 'Verified'].includes(cell) ? 'status-label' : ''}`}>{cell}</span>)}</div>)}</div></section>
}

function AdminUsersPage({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'VERIFICATION_OFFICER' })
  const [message, setMessage] = useState('')
  const [accounts, setAccounts] = useState<UserRecord[]>([])
  const [removeTarget, setRemoveTarget] = useState<UserRecord | null>(null)
  const [loadError, setLoadError] = useState('')
  const token = localStorage.getItem('landguard_access_token')
  const loadAccounts = () => fetch(`${apiUrl}/users`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.ok ? response.json() : Promise.reject(new Error('Only administrators can view users.'))).then((data: UserRecord[]) => { setAccounts(data); setLoadError('') }).catch((error: Error) => setLoadError(error.message))
  useEffect(() => { loadAccounts() }, [])
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const token = localStorage.getItem('landguard_access_token')
    const response = await fetch(`${apiUrl}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
    setMessage(response.ok ? 'User created successfully.' : (await response.json()).detail ?? 'Unable to create user.')
    if (response.ok) { setForm({ full_name: '', email: '', password: '', role: 'VERIFICATION_OFFICER' }); loadAccounts() }
  }
  const removeAccess = async () => { if (!removeTarget) return; await fetch(`${apiUrl}/users/${removeTarget.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); setRemoveTarget(null); loadAccounts() }
  return <section className="workspace-page"><button className="back-button" onClick={onBack}>← Dashboard</button><div className="workspace-header"><div><h1>Users</h1><p>Only administrators can create officer and auditor accounts, or remove access for staff who have left.</p></div></div>{loadError ? <div className="access-message">{loadError}</div> : <div className="admin-user-layout"><form className="user-create-form" onSubmit={submit}><p className="eyebrow">Create account</p><div className="create-fields"><label>Full name<input required placeholder="e.g. Diane Uwimana" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></label><label>Username or email<input required type="email" placeholder="d.uwimana" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Temporary password<input required type="password" minLength={8} placeholder="Auto-generated or set manually" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="VERIFICATION_OFFICER">Verification officer</option><option value="AUDITOR">Auditor</option></select></label></div><button className="login-button" type="submit">Create user</button>{message && <p className="form-message">{message}</p>}<small>The new user must change their password on first sign-in. This action is recorded in the audit log.</small></form><div className="accounts-panel"><div className="accounts-heading"><div><strong>Authorized accounts</strong><span>{accounts.filter((account) => account.is_active).length} active accounts</span></div></div>{accounts.map((account) => <div className="account-row" key={account.id}><div className="avatar">{initials(account.full_name)}</div><div className="account-name"><strong>{account.full_name}</strong><span>{account.email}{!account.is_active && ' (access revoked)'}</span></div><span className={`account-role account-role--${account.roles[0]?.name.toLowerCase()}`}>{displayRole(account.roles[0]?.name).replace('Verification ', '')}</span><span className={account.is_active ? 'account-active' : 'account-inactive'}>{account.is_active ? '● Active' : '● Revoked'}</span><button className="account-icon" aria-label={`Disable ${account.full_name}`} onClick={() => setRemoveTarget(account)} disabled={!account.is_active || account.id === 0}><MinusCircle size={14} /></button><button className="account-icon account-icon--delete" aria-label={`Remove access for ${account.full_name}`} onClick={() => setRemoveTarget(account)} disabled={!account.is_active || account.id === 0}><Trash2 size={14} /></button></div>)}</div></div>}{removeTarget && <div className="modal-backdrop"><div className="remove-modal"><div className="remove-icon"><Trash2 size={22} /></div><h2>Remove {removeTarget.full_name}?</h2><p>This account will immediately lose access to LandGuard AI. Their <strong>{displayRole(removeTarget.roles[0]?.name)}</strong> role and login will be revoked.</p><div className="remove-note">Their past actions stay in the audit log and case history. Removing the account does not delete records they created or reviewed.</div><div className="modal-actions"><button className="cancel-button" onClick={() => setRemoveTarget(null)}>Cancel</button><button className="remove-button" onClick={removeAccess}>Remove user</button></div></div></div>}</section>
}

function WorkspaceHeader({ title, subtitle, search, onBack, currentUser }: { title: string; subtitle: string; search: string; onBack: () => void; currentUser: CurrentUser | null }) {
  return <><div className="workspace-header"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="workspace-actions"><div className="page-search"><Search size={14} /><span>{search}</span></div><Bell size={16} className="header-bell" /><div className="top-avatar">{currentUser ? initials(currentUser.full_name) : 'DO'}</div></div></div>{title === 'Parcels' && <div className="page-tabs"><button className="tab-active">All parcels</button><button>Registered</button><button>Under review</button><button>Disputed</button></div>}{title === 'Transactions' && <div className="page-tabs"><button className="tab-active">All</button><button>Pending</button><button>Under review</button><button>Verified</button></div>}<button className="back-button" onClick={onBack}>← Dashboard</button></>
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

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function displayRole(role?: string) {
  if (role === 'VERIFICATION_OFFICER') return 'Verification officer'
  if (role === 'ADMIN') return 'Administrator'
  if (role === 'AUDITOR') return 'Auditor'
  return 'Authorized user'
}

export default App
