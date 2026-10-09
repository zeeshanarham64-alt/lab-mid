export const money = (n) => "Rs " + Math.round(Number(n)).toLocaleString("en-PK");

// Talks to the server. Throws an Error (with .status) when the server says no.
export async function api(path, method = "GET", body) {
  const opt = { method, headers: {} };
  if (method !== "GET") {
    opt.headers["Content-Type"] = "application/json";
    opt.body = JSON.stringify(body || {});
  }
  const r = await fetch("/api" + path, opt);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error || "Something went wrong."), { status: r.status });
  return d;
}
