import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  ClipboardCheck,
  Clock3,
  LogOut,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import "./StaffDemoPage.css";

const demoEmail = "staff.one@kabadiwala.local";
const demoPassword = "StaffOne@123";

const demoQueue = [
  { id: "COL-1042", name: "Ramesh Patil", area: "Pimpri, Pune", task: "Collector verification", status: "Review needed" },
  { id: "LOT-2086", name: "Copper cable · 7.8 kg", area: "Hadapsar, Pune", task: "Handover record", status: "Awaiting review" },
  { id: "REC-0318", name: "GreenLoop Recyclers", area: "Bhosari, Pune", task: "Partner documents", status: "Review needed" },
];

export default function StaffDemoPage({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState(demoPassword);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");

  const signIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim().toLowerCase() !== demoEmail || password !== demoPassword) {
      setError("Those details do not match the Staff One demo account.");
      return;
    }
    setError("");
    setSignedIn(true);
  };

  if (!signedIn) {
    return (
      <main className="staff-demo-page">
        <header className="staff-demo-header">
          <a className="staff-demo-brand" href="/" onClick={event => { event.preventDefault(); onBack(); }}>
            <span className="staff-demo-brand-mark"><ShieldCheck size={23} aria-hidden="true" /></span>
            <span><strong>Kabadiwala Connect</strong><small>Staff demo portal</small></span>
          </a>
          <button type="button" className="staff-demo-back" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Back to main portal</button>
        </header>
        <section className="staff-demo-login">
          <div className="staff-demo-login-copy">
            <span className="staff-demo-eyebrow"><span /> SEPARATE STAFF PREVIEW</span>
            <h1>Staff One workspace</h1>
            <p>Preview a staff-facing operations overview using a demo account. This is separate from collector and recycler sign-in.</p>
            <div className="staff-demo-login-note"><ShieldCheck size={18} aria-hidden="true" /><span>Demo access only. No live staff records or permissions are connected.</span></div>
          </div>
          <form className="staff-demo-form" onSubmit={signIn}>
            <div className="staff-demo-form-title">
              <span className="staff-demo-form-icon"><BadgeCheck size={20} aria-hidden="true" /></span>
              <div><h2>Staff demo login</h2><p>Use the sample credentials below</p></div>
            </div>
            <label htmlFor="staff-demo-email">Email address</label>
            <input id="staff-demo-email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} />
            <label htmlFor="staff-demo-password">Password</label>
            <input id="staff-demo-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} />
            <div className="staff-demo-credentials"><span>Demo email</span><strong>{demoEmail}</strong><span>Demo password</span><strong>{demoPassword}</strong></div>
            {error && <p className="staff-demo-error" role="alert">{error}</p>}
            <button type="submit" className="staff-demo-submit">Open Staff One dashboard</button>
            <p className="staff-demo-local-note">Credentials are checked locally for this demonstration only.</p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="staff-demo-page staff-dashboard">
      <header className="staff-demo-header">
        <a className="staff-demo-brand" href="/" onClick={event => { event.preventDefault(); onBack(); }}>
          <span className="staff-demo-brand-mark"><ShieldCheck size={23} aria-hidden="true" /></span>
          <span><strong>Kabadiwala Connect</strong><small>Staff operations</small></span>
        </a>
        <div className="staff-dashboard-actions">
          <span className="staff-demo-chip"><span /> Demo workspace</span>
          <button type="button" className="staff-demo-back" onClick={() => setSignedIn(false)}><LogOut size={15} aria-hidden="true" /> Sign out</button>
        </div>
      </header>
      <section className="staff-dashboard-content">
        <div className="staff-dashboard-welcome">
          <div><span className="staff-demo-eyebrow">STAFF OVERVIEW · SAMPLE DATA</span><h1>Good morning, Staff One</h1><p>Here is a snapshot of the demo operations queue.</p></div>
          <span className="staff-dashboard-id"><BadgeCheck size={17} aria-hidden="true" /> Staff ID · DEMO-001</span>
        </div>
        <div className="staff-dashboard-metrics">
          <article><span className="staff-metric-icon"><ClipboardCheck size={19} aria-hidden="true" /></span><span className="staff-metric-label">Reviews to check</span><strong>03</strong><small>Sample queue items</small></article>
          <article><span className="staff-metric-icon"><Users size={19} aria-hidden="true" /></span><span className="staff-metric-label">Collectors onboarded</span><strong>08</strong><small>Demo overview count</small></article>
          <article><span className="staff-metric-icon"><PackageCheck size={19} aria-hidden="true" /></span><span className="staff-metric-label">Partner recyclers</span><strong>12</strong><small>Demo overview count</small></article>
        </div>
        <section className="staff-queue-card" aria-labelledby="staff-queue-heading">
          <div className="staff-queue-heading"><div><h2 id="staff-queue-heading">Operations review queue</h2><p>Example items for the staff dashboard preview</p></div><span><Clock3 size={15} aria-hidden="true" /> 3 open</span></div>
          <div className="staff-queue-list">
            {demoQueue.map(item => (
              <article className="staff-queue-row" key={item.id}>
                <span className="staff-queue-icon"><ClipboardCheck size={18} aria-hidden="true" /></span>
                <div className="staff-queue-main"><strong>{item.name}</strong><span>{item.id} · {item.task}</span></div>
                <span className="staff-queue-area"><MapPin size={14} aria-hidden="true" /> {item.area}</span>
                <span className="staff-queue-status">{item.status}</span>
              </article>
            ))}
          </div>
        </section>
        <p className="staff-demo-disclaimer"><ShieldCheck size={15} aria-hidden="true" /> Demonstration dashboard only. Queue entries and counts are sample data, not live operations.</p>
      </section>
    </main>
  );
}
