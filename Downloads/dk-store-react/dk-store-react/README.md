# DK Store: React front end + Node back end

Online store with customer accounts, admin dashboard, stock, revenue and PDF receipts.

* **Front end:** React 19 (store and admin pages) in `src/`
* **Back end:** one file, `dk-store.cjs` (Node 22.13+, SQLite built in, no packages)

## 1. Just run it (no install, no build)

`dk-store.cjs` already contains the finished React website.

1. Open this folder in VS Code (**File > Open Folder**).
2. Create a file called `.env` next to `dk-store.cjs`:
   ```
   PORT=3000
   ADMIN_EMAIL=you@example.com
   ADMIN_PASSWORD=choose-a-strong-password
   WHATSAPP=923141993887
   ```
   (Leave `ADMIN_PASSWORD` out and a random one is printed once in the terminal.)
3. Terminal: `npm start`
4. Store: http://localhost:3000   Admin: http://localhost:3000/admin.html
5. Log in to the admin and add stock. Stock starts at 0, so customers see "Out of stock" until you do.

## 2. Change the React code

You need Node 22.13+ (already needed above) and npm.

```
npm install
```

**While editing (hot reload):** open two terminals.

```
npm start              # terminal 1: the server and database on port 3000
npm run dev             # terminal 2: the React site on http://localhost:5173
```
Vite forwards `/api` calls to the server, so login and orders work in development.

**To use your changes for real:**

```
npm run build
npm start
```
`npm run build` creates a `dist/` folder. If `dist/` exists, `dk-store.cjs` serves it instead of the copy embedded inside the file. Delete `dist/` to go back to the embedded copy. (Note: the embedded copy inside `dk-store.cjs` does not update itself. Keep `dist/` next to the server when you deploy your edited version.)

## Where things are

| Path | What it is |
| --- | --- |
| `dk-store.cjs` | Server, database, login, orders, stock, PDF receipts, plus the embedded React build |
| `src/store/Store.jsx` | The whole store: header, hero, products, cart, checkout, login/sign up/account |
| `src/store/store.css` | Store styles (black and gold) |
| `src/admin/Admin.jsx` | Admin dashboard: login, revenue, chart, new order, stock, orders, customers |
| `src/admin/admin.css` | Dashboard styles |
| `src/lib.js` | `api()` helper and `money()` |
| `src/main.jsx`, `src/admin-main.jsx` | Entry points |
| `index.html`, `admin.html` | The two pages Vite builds |
| `public/img/` | Logo and product photos. Replace these files to change the pictures |
| `vite.config.js` | Dev server and build settings |
| `data/` | Created on first run: your database (`store.db`). Back it up. |

## How it works

* **Roles:** `admin` (you) and `user` (customers; guests can order too). Every `/api/admin/...` route refuses anyone who is not an admin, and the admin page shows "Access denied" to everyone else.
* **Prices and stock are decided by the server.** The browser only sends product ids and quantities.
* **The deal** (Rs 1,100) is a product made of one shampoo plus one glass cleaner and takes one of each from stock.
* **Cancelling an order** puts its stock back and removes it from revenue.
* Change a price in the dashboard and the store shows it immediately.

## Putting it online

### Render

This project includes a Render Blueprint in `render.yaml`. The service needs a paid
Starter web service and persistent disk so the SQLite database (orders, users and
stock) survives deploys and restarts.

1. Push this project to GitHub and sign in to [Render](https://render.com/).
2. In Render, create a new Blueprint and connect the GitHub repository
   `zeeshanarham64-alt/lab-mid`. Set the Blueprint file to
   `Downloads/dk-store-react/dk-store-react/render.yaml`.
3. When prompted, set `ADMIN_EMAIL`, a strong unique `ADMIN_PASSWORD`, and
   `WHATSAPP` as digits only with country code (for example, `923001234567`).
   Do not put these secrets in GitHub.
4. Review the service and disk pricing, then deploy. Render will show the public
   URL when the deploy is healthy. The storefront is at that URL and the admin
   dashboard is at `/admin.html`.

The Blueprint configures HTTPS cookies, a generated session secret, and a
persistent database directory at `/var/data`. Back up the Render disk regularly.

### Other hosts

Use a host that runs Node 22 (Railway, Fly.io, a VPS).
Set `COOKIE_SECURE=1` once the site is on HTTPS. Keep `data/` on a **persistent
disk** (set `DATA_DIR` to it) or orders vanish on restart.
* Back up `data/store.db` regularly.

## Not included yet

Online card or wallet payments (JazzCash, Easypaisa, Stripe), email/SMS alerts, "forgot password", image upload, refunds.
