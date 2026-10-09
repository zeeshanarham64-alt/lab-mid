import { useEffect, useRef, useState } from "react";
import { api, money } from "../lib.js";

const img = (p) => "/img/" + (p.image || "logo.jpg");
const thumb = (p) => (p.image ? "/img/" + p.image.replace(".jpg", "-thumb.jpg") : "/img/logo-96.jpg");
const fallback = (e) => { if (!e.target.dataset.fb) { e.target.dataset.fb = "1"; e.target.src = "/img/logo.jpg"; } };
const RINGS = [
  "M200 40c70-10 150 40 150 120s-60 120-130 150-150 0-160-80S130 50 200 40z",
  "M200 66c58-8 122 32 122 98s-50 100-108 124-124 0-132-66S142 74 200 66z",
  "M200 92c46-6 96 24 96 76s-40 80-86 98-98 0-104-52S154 98 200 92z",
  "M200 118c34-4 70 16 70 54s-30 60-64 72-72 0-76-38 36-84 70-88z",
  "M200 144c22-2 44 10 44 34s-20 40-42 46-48-2-50-26 26-52 48-54z",
];

export default function Store() {
  const [products, setProducts] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem("dk_cart") || "{}"); } catch { return {}; } });
  const [me, setMe] = useState(null);
  const [cfg, setCfg] = useState({ whatsapp: "" });
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef();

  const notify = (t) => { setToast(t); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2200); };
  const loadProducts = () =>
    api("/products").then((d) => {
      setProducts(d);
      setCart((c) => Object.fromEntries(Object.entries(c).filter(([id]) => d.some((p) => p.id == id && p.inStock))));
      setLoadFailed(false);
    }).catch(() => setLoadFailed(true));

  useEffect(() => {
    loadProducts();
    api("/config").then(setCfg).catch(() => {});
    api("/auth/me").then((d) => setMe(d.user)).catch(() => {});
  }, []);
  useEffect(() => { try { localStorage.setItem("dk_cart", JSON.stringify(cart)); } catch { /* storage unavailable */ } }, [cart]);

  const add = (id) => { setCart((c) => ({ ...c, [id]: Math.min((c[id] || 0) + 1, 50) })); notify("Added to cart"); };
  const change = (id, d) => setCart((c) => { const q = (c[id] || 0) + d, n = { ...c }; if (q < 1) delete n[id]; else n[id] = q; return n; });
  const count = Object.entries(cart).reduce((a, [id, q]) => a + (products.some((p) => p.id == id) ? q : 0), 0);

  return (
    <>
      <header>
        <a className="brand" href="#top"><img src="/img/logo.jpg" alt="" /><b>DK Store</b></a>
        <nav aria-label="Main">
          <a className="hide-s" href="#shop">Shop</a>
          <a className="hide-s" href="#about">About</a>
          <a className="hide-s" href="#contact">Contact</a>
          <button className="cartbtn" id="acctBtn" aria-haspopup="dialog" onClick={() => setAuthOpen(true)}>{me ? "Hi, " + me.name.split(" ")[0] : "Log in"}</button>
          <button className="cartbtn" id="openCart" aria-haspopup="dialog" onClick={() => setCartOpen(true)}>Cart (<span id="count">{count}</span>)</button>
        </nav>
      </header>

      <main id="top">
        <div className="hero">
          {["c1", "c2"].map((c, i) => (
            <svg key={c} className={"contours " + c} viewBox="0 0 400 400" fill="none" stroke="#fff" strokeWidth="1.4" aria-hidden="true">
              {RINGS.map((d) => <path key={d} d={d} />)}
            </svg>
          ))}
          <div style={{ position: "relative" }}>
            <p className="eyebrow">AZM car care by DK Store</p>
            <h1>A cleaner<br /><span className="gold">shine for<br />every car.</span></h1>
            <p>AZM Ceramic Shampoo and Glass Cleaner, made by DK Store. Add them to your cart and we confirm your order on WhatsApp.</p>
            <a className="btn" href="#shop">Shop now</a><a className="btn ghost" href="#contact">Contact us</a>
          </div>
          <div className="photo"><img src="/img/deal.jpg" alt="AZM Ceramic Shampoo and AZM Glass Cleaner bottles" /></div>
        </div>
        <div className="strip"><span>Deep clean, pH balanced shampoo</span><span>Streak-free, quick-dry glass cleaner</span><span>Made by DK Store</span></div>

        <section className="shop" id="shop">
          <h2>AZM car care</h2>
          <p className="sub">Choose your products, add them to the cart, and send the order in one message.</p>
          <div className="grid" id="grid">
            {products.map((p) => <ProductCard key={p.id} p={p} onAdd={() => add(p.id)} />)}
            {!products.length && <p className="note">{loadFailed ? "Could not load products. Please refresh." : "Loading products..."}</p>}
          </div>
          <p className="note">Prices are in Pakistani rupees. We confirm delivery and payment on WhatsApp.</p>
        </section>

        <section id="how">
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "clamp(36px,5vw,64px)", lineHeight: 1, margin: 0 }}>How ordering works</h2>
          <div className="steps">
            <div><h3>Add to cart</h3><p>Pick your products and quantities.</p></div>
            <div><h3>Enter delivery details</h3><p>Your name, phone, city and address. Logging in fills these for you.</p></div>
            <div><h3>We confirm it</h3><p>Your order reaches us instantly. We contact you on WhatsApp to confirm delivery and payment.</p></div>
          </div>
        </section>

        <section className="about" id="about">
          <div>
            <h2>Clean cars, clear glass</h2>
            <p>AZM is the car care range from DK Store. The Ceramic Shampoo is safe on paint and tough on dirt, and the Glass Cleaner leaves windows streak free.</p>
            <p>Questions about using them or about an order? Message us and we will help.</p>
          </div>
          <div className="facts">
            <div><h3>pH balanced shampoo</h3><p>Deep cleaning that stays gentle on your paint.</p></div>
            <div><h3>Streak-free glass</h3><p>A quick-dry formula that is safe on all surfaces.</p></div>
            <div><h3>Upgraded formula</h3><p>The Ceramic Shampoo is back in stock in a 500 ml bottle.</p></div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div>
            <h2>Order or ask a question</h2>
            <p className="sub" style={{ margin: "0 0 16px" }}>Message us on WhatsApp for prices and availability.</p>
            <p className="lines"><a href="tel:+923141993887">0314 1993887</a><br /><a href="mailto:dkstore125@gmail.com">dkstore125@gmail.com</a></p>
          </div>
          <div><a className="btn" id="waContact" href={cfg.whatsapp ? "https://wa.me/" + cfg.whatsapp : "#contact"} target="_blank" rel="noopener">Message on WhatsApp</a></div>
        </section>
      </main>

      <footer className="foot">
        <a className="brand" href="#top"><img src="/img/logo.jpg" alt="" /><b>DK Store</b></a>
        <span><a href="tel:+923141993887">0314 1993887</a> &nbsp; <a href="mailto:dkstore125@gmail.com">dkstore125@gmail.com</a></span>
        <span>&copy; 2026 DK Store. All rights reserved. {me && me.role === "admin" && <>&nbsp; <a href="/admin.html" id="adminLink">Admin</a></>}</span>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} products={products} cart={cart} change={change} me={me} cfg={cfg}
        onOrdered={() => { setCart({}); loadProducts(); }} />
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} me={me} setMe={setMe} notify={notify} />
      <div className={"toast" + (toast ? " on" : "")} id="toast" role="status">{toast}</div>
    </>
  );
}

function ProductCard({ p, onAdd }) {
  return (
    <article className="prod">
      <div className="tile"><img className="big" src={img(p)} alt={p.name} onError={fallback} /></div>
      <h3>{p.name}</h3>
      <p className="cat">{p.description}</p>
      <ul className="pts">{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
      <div className="row">
        <span className="price">{money(p.price)}{p.was && <> <s style={{ color: "var(--muted)", fontWeight: 400, fontSize: 14 }}>{money(p.was)}</s></>}</span>
        {p.inStock
          ? <button className="add" onClick={onAdd} aria-label={"Add " + p.name + " to cart"}>Add to cart</button>
          : <button className="add" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Out of stock</button>}
      </div>
    </article>
  );
}

function CartDrawer({ open, onClose, products, cart, change, me, cfg, onOrdered }) {
  const blank = { name: "", phone: "", city: "", address: "", payment: "Cash on delivery" };
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!open) return;
    setDone(null); setErr("");
    if (me) setForm((f) => ({ ...f, name: f.name || me.name, phone: f.phone || me.phone || "", address: f.address || me.address || "" }));
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, me]);

  const lines = Object.entries(cart).map(([id, q]) => ({ p: products.find((x) => x.id == id), q })).filter((l) => l.p);
  const total = lines.reduce((a, l) => a + l.p.price * l.q, 0);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const o = await api("/orders", "POST", { ...form, items: lines.map((l) => ({ id: l.p.id, qty: l.q })) });
      setDone({ ...o, name: form.name.trim() });
      onOrdered();
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }

  return (
    <>
      <div className={"scrim" + (open ? " on" : "")} id="scrim" onClick={onClose} />
      <aside id="drawer" className={open ? "on" : ""} role="dialog" aria-modal="true" aria-label="Your cart" aria-hidden={!open}>
        <header><h2>Your cart</h2><button className="x" id="closeCart" aria-label="Close cart" onClick={onClose}>&times;</button></header>
        {done ? (
          <div id="done">
            <h3>Order placed</h3>
            <p>Your order number is <b>{done.no}</b>. Total {money(done.total)}. We will contact you on WhatsApp to confirm delivery and payment.</p>
            {cfg.whatsapp && <a className="btn full" target="_blank" rel="noopener"
              href={"https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(`Hi DK Store, I placed order ${done.no} (total ${money(done.total)}). Name: ${done.name}. Please confirm.`)}>Message us on WhatsApp</a>}
            <button className="btn ghost full" type="button" style={{ margin: "10px 0 0" }} onClick={onClose}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="items" id="items">
              {lines.length ? lines.map(({ p, q }) => (
                <div className="item" key={p.id}>
                  <img className="sw" src={thumb(p)} alt="" onError={fallback} />
                  <div className="i"><b>{p.name}</b><span>{money(p.price)}</span></div>
                  <div className="qty">
                    <button aria-label={"Remove one " + p.name} onClick={() => change(p.id, -1)}>&minus;</button>
                    <span>{q}</span>
                    <button aria-label={"Add one " + p.name} onClick={() => change(p.id, 1)}>+</button>
                  </div>
                </div>
              )) : <p className="empty">Your cart is empty. Add something from the collection.</p>}
            </div>
            <div className="total"><span>Total</span><span id="total">{money(total)}</span></div>
            <form id="coForm" noValidate onSubmit={submit}>
              <label className="field"><span>Full name</span><input id="cName" autoComplete="name" value={form.name} onChange={set("name")} /></label>
              <label className="field"><span>Phone (WhatsApp)</span><input id="cPhone" type="tel" autoComplete="tel" placeholder="0300 1234567" value={form.phone} onChange={set("phone")} /></label>
              <label className="field"><span>City</span><input id="cCity" autoComplete="address-level2" value={form.city} onChange={set("city")} /></label>
              <label className="field"><span>Delivery address</span><textarea id="cAddr" autoComplete="street-address" value={form.address} onChange={set("address")} /></label>
              <label className="field"><span>Payment</span>
                <select id="cPay" value={form.payment} onChange={set("payment")}><option>Cash on delivery</option><option>Bank or wallet transfer</option></select></label>
              <p className="err" role="alert">{err}</p>
              <button className="btn full" type="submit" id="coBtn" disabled={!lines.length || busy}>Place order</button>
              <p className="small" style={{ textAlign: "center", marginTop: 10 }}>We will contact you on WhatsApp to confirm delivery and payment.</p>
            </form>
          </>
        )}
      </aside>
    </>
  );
}

function Pw({ id, name, auto }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input id={id} name={name} type={show ? "text" : "password"} autoComplete={auto} required />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}

function AuthDialog({ open, onClose, me, setMe, notify }) {
  const ref = useRef();
  const [view, setView] = useState("login");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState({ text: "", bad: false });
  const [orders, setOrders] = useState([]);
  const v = me ? "account" : view;
  const titles = { login: "Welcome back", signup: "Create your account", account: "Your account" };

  useEffect(() => {
    const d = ref.current;
    if (open && !d.open) { setErr(""); setMsg({ text: "", bad: false }); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => { if (open && me) api("/orders/mine").then(setOrders).catch(() => {}); }, [open, me]);

  const run = (fn, text) => async (e) => {
    e.preventDefault(); setErr("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try { const u = await fn(f); setMe(u); onClose(); notify(text); } catch (x) { setErr(x.message); }
  };
  const saveProfile = async (e) => {
    e.preventDefault();
    try { setMe(await api("/auth/me", "PUT", Object.fromEntries(new FormData(e.currentTarget)))); setMsg({ text: "Saved.", bad: false }); }
    catch (x) { setMsg({ text: x.message, bad: true }); }
  };
  const logout = () => api("/auth/logout", "POST").then(() => { setMe(null); onClose(); notify("Logged out"); });

  return (
    <dialog ref={ref} id="auth" aria-labelledby="authTitle" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="dlg">
        <div className="top"><h2 id="authTitle">{titles[v]}</h2><button className="x" type="button" aria-label="Close" onClick={onClose}>&times;</button></div>
        {v !== "account" && (
          <div className="tabs" role="tablist">
            <button type="button" role="tab" id="tabLogin" aria-selected={v === "login"} onClick={() => { setView("login"); setErr(""); }}>Log in</button>
            <button type="button" role="tab" id="tabSignup" aria-selected={v === "signup"} onClick={() => { setView("signup"); setErr(""); }}>Sign up</button>
          </div>
        )}
        {v === "login" && (
          <form id="loginForm" noValidate onSubmit={run((f) => api("/auth/login", "POST", f), "Logged in")}>
            <label className="field"><span>Email</span><input id="lEmail" name="email" type="email" autoComplete="email" required /></label>
            <label className="field"><span>Password</span><Pw id="lPass" name="password" auto="current-password" /></label>
            <p className="err" role="alert">{err}</p>
            <button className="btn full" type="submit">Log in</button>
          </form>
        )}
        {v === "signup" && (
          <form id="signupForm" noValidate onSubmit={run((f) => api("/auth/signup", "POST", f), "Account created")}>
            <label className="field"><span>Full name</span><input id="sName" name="name" autoComplete="name" required /></label>
            <label className="field"><span>Phone (WhatsApp)</span><input id="sPhone" name="phone" type="tel" autoComplete="tel" placeholder="0300 1234567" required /></label>
            <label className="field"><span>Email</span><input id="sEmail" name="email" type="email" autoComplete="email" required /></label>
            <label className="field"><span>Password</span><Pw id="sPass" name="password" auto="new-password" />
              <span className="small" style={{ display: "block", marginTop: 5 }}>At least 8 characters, with a letter and a number.</span></label>
            <label className="field"><span>Delivery address (optional)</span><textarea id="sAddr" name="address" autoComplete="street-address" /></label>
            <p className="err" role="alert">{err}</p>
            <button className="btn full" type="submit">Create account</button>
          </form>
        )}
        {v === "account" && me && (
          <div>
            <p className="small" style={{ margin: "0 0 16px" }}>Signed in as {me.email}</p>
            <form key={me.id + me.name} onSubmit={saveProfile} noValidate>
              <label className="field"><span>Full name</span><input name="name" defaultValue={me.name} autoComplete="name" /></label>
              <label className="field"><span>Phone (WhatsApp)</span><input name="phone" type="tel" defaultValue={me.phone} autoComplete="tel" /></label>
              <label className="field"><span>Delivery address</span><textarea name="address" defaultValue={me.address} autoComplete="street-address" /></label>
              <p className="ok" role="status" style={msg.bad ? { color: "var(--err)" } : undefined}>{msg.text}</p>
              <button className="btn full" type="submit">Save changes</button>
            </form>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, margin: "18px 0 4px" }}>My orders</h3>
            <ul className="act" id="myOrders">
              {orders.length ? orders.map((o) => <li key={o.no}>{o.no} &middot; {money(o.total)} &middot; {o.status}<br /><small>{new Date(o.created_at).toLocaleDateString("en-GB")}</small></li>) : <li className="empty">No orders yet.</li>}
            </ul>
            <button className="btn ghost full" type="button" style={{ margin: "12px 0 0" }} onClick={logout}>Log out</button>
          </div>
        )}
      </div>
    </dialog>
  );
}
