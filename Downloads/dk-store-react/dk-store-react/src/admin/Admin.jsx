import { useEffect, useState } from "react";
import { api, money } from "../lib.js";

export default function Admin() {
  const [state, setState] = useState("loading"); // loading | login | denied | ready | error
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [summary, products, orders, users] = await Promise.all([api("/admin/summary"), api("/admin/products"), api("/admin/orders"), api("/admin/users")]);
      setData({ summary, products, orders, users });
      setState("ready");
    } catch (x) {
      setError(x.message);
      setState(x.status === 401 ? "login" : x.status === 403 ? "denied" : "error");
    }
  }
  useEffect(() => { load(); }, []);

  const ready = state === "ready";
  return (
    <main>
      <div className="top">
        <h1>DK Store Admin</h1>
        <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/" style={{ color: "var(--gold)", fontWeight: 700 }}>View store</a>
          <span className="pill" id="who">{ready ? "Admin" : state === "denied" ? "No access" : "Signed out"}</span>
          {(ready || state === "denied") && <button className="btn s o" id="logout" onClick={() => api("/auth/logout", "POST").then(() => setState("login"))}>Log out</button>}
        </span>
      </div>
      {state === "loading" && <p className="empty" id="status">Loading...</p>}
      {state === "denied" && <p className="empty" id="status">Access denied. Only the store admin can view this dashboard.</p>}
      {state === "error" && <p className="empty" id="status">{error}</p>}
      {state === "login" && <Login onDone={load} />}
      {ready && <Dashboard d={data} reload={load} />}
    </main>
  );
}

function Login({ onDone }) {
  const [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault(); setErr("");
    try { await api("/auth/login", "POST", Object.fromEntries(new FormData(e.currentTarget))); onDone(); } catch (x) { setErr(x.message); }
  }
  return (
    <div className="card login-card" id="login">
      <h2>Admin login</h2>
      <form id="lf" onSubmit={submit}>
        <label style={{ display: "grid", gap: 4 }}><span className="empty" style={{ fontSize: 13 }}>Email</span><input id="lEmail" name="email" type="email" autoComplete="username" required /></label>
        <label style={{ display: "grid", gap: 4 }}><span className="empty" style={{ fontSize: 13 }}>Password</span><input id="lPass" name="password" type="password" autoComplete="current-password" required /></label>
        <p className="msg" id="lErr" role="alert">{err}</p>
        <button className="btn" type="submit">Log in</button>
      </form>
    </div>
  );
}

function Dashboard({ d, reload }) {
  const { summary: s, products, orders, users } = d;
  return (
    <div id="app">
      <div className="kpis" id="kpis">
        {[["Total revenue", money(s.revenue)], ["This month", money(s.monthRevenue)], ["Orders", s.orders], ["Items sold", s.units], ["New orders", s.pending], ["Low or out of stock", s.low]]
          .map(([k, v]) => <div className="card kpi" key={k}><small>{k}</small><b>{v}</b></div>)}
      </div>
      <div className="grid2">
        <NewOrder products={products} reload={reload} />
        <div className="card"><h2>Revenue, last 14 days</h2><Chart daily={s.daily} /></div>
      </div>
      <Products products={products} reload={reload} />
      <Orders orders={orders} reload={reload} />
      <ChangePassword />
      <div className="card">
        <h2>Customers</h2>
        <div className="scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Joined</th></tr></thead>
          <tbody id="users">{users.map((u) => (
            <tr key={u.id}><td>{u.name}{u.role === "admin" && <> <span className="tag ok">admin</span></>}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.orders}</td><td>{new Date(u.created_at).toLocaleDateString("en-GB")}</td></tr>
          ))}</tbody></table></div>
      </div>
    </div>
  );
}

function ChangePassword() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (values.newPassword !== values.confirmPassword) {
      setIsError(true);
      setMessage("The new passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await api("/auth/password", "PUT", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset();
      setIsError(false);
      setMessage("Password changed successfully.");
    } catch (x) {
      setIsError(true);
      setMessage(x.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card password-card">
      <h2>Change password</h2>
      <form className="password-form" onSubmit={submit}>
        <label>
          <span>Current password</span>
          <input name="currentPassword" type="password" autoComplete="current-password" required />
        </label>
        <label>
          <span>New password</span>
          <input name="newPassword" type="password" autoComplete="new-password" minLength="8" required />
        </label>
        <label>
          <span>Confirm new password</span>
          <input name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required />
        </label>
        <p className={isError ? "msg" : "ok"} role={isError ? "alert" : "status"}>{message}</p>
        <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Change password"}</button>
      </form>
      <p className="empty password-hint">Use at least 8 characters, including a letter and a number.</p>
    </section>
  );
}

function Chart({ daily }) {
  const max = Math.max(1, ...daily.map((d) => d.revenue));
  return (
    <div id="chart">
      <svg viewBox="0 0 560 170" width="100%" role="img" aria-label="Revenue per day for the last 14 days">
        {daily.map((d, i) => {
          const h = Math.round((d.revenue / max) * 120), x = i * 40 + 6;
          return (
            <g key={d.date}>
              <rect x={x} y={130 - h} width="28" height={h} rx="4" fill="#d9a521"><title>{new Date(d.date).toLocaleDateString("en-GB") + ": " + money(d.revenue)}</title></rect>
              <text x={x + 14} y="150" textAnchor="middle">{new Date(d.date).getDate()}</text>
            </g>
          );
        })}
      </svg>
      <p className="empty" style={{ margin: 0, fontSize: 13 }}>{max > 1 ? "Best day: " + money(max) : "No sales yet."}</p>
    </div>
  );
}

function NewOrder({ products, reload }) {
  const [f, setF] = useState({ name: "", phone: "", city: "", payment: "Cash on delivery" });
  const [q, setQ] = useState({});
  const [msg, setMsg] = useState(null); // { text, bad, id }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function create() {
    setMsg(null);
    const items = Object.entries(q).filter(([, n]) => n > 0).map(([id, n]) => ({ id: Number(id), qty: n }));
    try {
      const o = await api("/admin/orders", "POST", { ...f, items });
      setQ({}); setF({ ...f, name: "", phone: "", city: "" });
      setMsg({ text: `Order ${o.no} created (${money(o.total)}). `, id: o.id });
      reload();
    } catch (x) { setMsg({ text: x.message, bad: true }); }
  }
  return (
    <div className="card">
      <h2>New order (walk-in or WhatsApp)</h2>
      <div className="form">
        <label>Customer name<input id="oName" value={f.name} onChange={set("name")} /></label>
        <label>Phone<input id="oPhone" type="tel" placeholder="0300 1234567" value={f.phone} onChange={set("phone")} /></label>
        <label>City (optional)<input id="oCity" value={f.city} onChange={set("city")} /></label>
        <label>Payment<select id="oPay" value={f.payment} onChange={set("payment")}><option>Cash on delivery</option><option>Bank or wallet transfer</option></select></label>
      </div>
      <div className="scroll"><table style={{ minWidth: 300, marginTop: 8 }}><tbody>
        {products.filter((p) => p.active).map((p) => (
          <tr key={p.id}>
            <td>{p.name}<br /><small className="empty">{money(p.price)} each, {p.stock} in stock</small></td>
            <td><input className="n" type="number" min="0" placeholder="0" aria-label={"Quantity of " + p.name} value={q[p.id] || ""} onChange={(e) => setQ({ ...q, [p.id]: parseInt(e.target.value, 10) || 0 })} /></td>
          </tr>
        ))}
      </tbody></table></div>
      <button className="btn" id="oBtn" onClick={create}>Create order</button>
      <p className="msg" role="alert" style={msg && !msg.bad ? { color: "var(--fg)" } : undefined}>
        {msg && msg.text}{msg && msg.id && <a href={`/api/admin/orders/${msg.id}/receipt.pdf`} target="_blank" rel="noopener" style={{ color: "var(--gold)" }}>Open receipt PDF</a>}
      </p>
      <p className="empty" style={{ margin: 0, fontSize: 14 }}>Stock and revenue update straight away, and you get a PDF receipt.</p>
    </div>
  );
}

function Products({ products, reload }) {
  const [err, setErr] = useState("");
  const [np, setNp] = useState({ name: "", price: "", stock: "0", reorder: "5" });
  const guard = (p) => p.then(reload).catch((x) => { setErr(x.message); reload(); });
  const status = (p) => (p.stock <= 0 ? ["Out", "out"] : p.stock <= p.reorder ? ["Low", "low"] : ["In stock", "ok"]);
  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h2>Products and stock</h2>
      <div className="scroll"><table><thead><tr><th>Product</th><th>Price (Rs)</th><th>Stock</th><th>Status</th><th>Change stock</th></tr></thead>
        <tbody id="rows">{products.map((p) => {
          const st = status(p);
          return (
            <tr key={p.id}>
              <td><b>{p.name}</b></td>
              <td><input className="n" type="number" min="0" key={p.id + "-" + p.price} defaultValue={p.price} data-price={p.id} aria-label={"Price for " + p.name}
                onBlur={(e) => { if (Number(e.target.value) !== p.price) { setErr(""); guard(api("/admin/products/" + p.id, "PUT", { price: Number(e.target.value) })); } }} /></td>
              <td><b>{p.stock}</b></td>
              <td><span className={"tag " + st[1]}>{st[0]}</span></td>
              <td>{p.bundle ? <span className="empty">Automatic (uses the products inside)</span> : <StockCell p={p} onApply={(delta) => { setErr(""); guard(api(`/admin/products/${p.id}/stock`, "POST", { delta })); }} />}</td>
            </tr>
          );
        })}</tbody></table></div>
      <div className="form" style={{ marginTop: 14 }}>
        <label>New product<input placeholder="Product name" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} /></label>
        <label>Price (Rs)<input className="n" type="number" min="0" value={np.price} onChange={(e) => setNp({ ...np, price: e.target.value })} /></label>
        <label>Stock<input className="n" type="number" min="0" value={np.stock} onChange={(e) => setNp({ ...np, stock: e.target.value })} /></label>
        <label>Low stock at<input className="n" type="number" min="0" value={np.reorder} onChange={(e) => setNp({ ...np, reorder: e.target.value })} /></label>
        <button className="btn o" onClick={() => { setErr(""); api("/admin/products", "POST", np).then(() => { setNp({ ...np, name: "", price: "" }); reload(); }).catch((x) => setErr(x.message)); }}>Add product</button>
      </div>
      <p className="msg" role="alert">{err}</p>
    </div>
  );
}

function StockCell({ p, onApply }) {
  const [v, setV] = useState("");
  return (
    <>
      <input className="n" type="number" placeholder="+/-" data-qty={p.id} aria-label={"Change stock for " + p.name} value={v} onChange={(e) => setV(e.target.value)} />{" "}
      <button className="btn s" data-add={p.id} onClick={() => { const n = parseInt(v, 10); if (n) { onApply(n); setV(""); } }}>Apply</button>
    </>
  );
}

function Orders({ orders, reload }) {
  const setStatus = (id, status) => api(`/admin/orders/${id}/status`, "PUT", { status }).then(reload).catch((x) => { alert(x.message); reload(); });
  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h2>Orders</h2>
      <div className="scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Receipt</th></tr></thead>
        <tbody id="orders">
          {orders.map((o) => (
            <tr key={o.id}>
              <td><b>{o.no}</b><br /><small className="empty">{new Date(o.created_at).toLocaleString("en-GB")}{o.source === "admin" && " · admin"}</small></td>
              <td>{o.name}<br /><small className="empty">{o.phone}{o.city && " · " + o.city}</small></td>
              <td>{o.items.map((i, k) => <div key={k}>{i.qty} x {i.name}</div>)}</td>
              <td>{money(o.total)}</td>
              <td>{o.status === "cancelled"
                ? <span className="tag cancelled">cancelled</span>
                : <select className="st" value={o.status} aria-label={"Status of " + o.no} onChange={(e) => setStatus(o.id, e.target.value)}>{["new", "confirmed", "completed", "cancelled"].map((s) => <option key={s}>{s}</option>)}</select>}</td>
              <td><a className="btn s o" href={`/api/admin/orders/${o.id}/receipt.pdf`} target="_blank" rel="noopener">PDF</a></td>
            </tr>
          ))}
          {!orders.length && <tr><td colSpan="6" className="empty">No orders yet.</td></tr>}
        </tbody></table></div>
    </div>
  );
}
