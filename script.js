/* Replace with your real FPX / payment gateway URL */
const FPX_CHECKOUT_URL = "YOUR_FPX_PAYMENT_URL_HERE";

const PACKAGES = {
  start:  { name: "INFINITE START",  price: 299, platform: "1 PLATFORM", platforms: ["Meta", "TikTok", "Google"], platText: "Meta / TikTok / Google", items: ["1 Video", "1 Poster Iklan"] },
  growth: { name: "INFINITE GROWTH", price: 499, platform: "2 PLATFORM", platforms: ["Meta + TikTok", "Meta + Google", "TikTok + Google"], platText: "Meta + TikTok, Meta + Google, or TikTok + Google", items: ["2 Video", "3 Poster Iklan"] },
  scale:  { name: "INFINITE SCALE",  price: 699, platform: "3 PLATFORM", platforms: ["Meta + TikTok + Google"], platText: "Meta + TikTok + Google", items: ["3 Video", "5 Poster Iklan"] }
};
const COMMON = ["Setup & Manage Ads", "Audience Targeting", "Monitoring & Optimization", "Ads Report", "Strategic Consultation", "Copywriting"];
const inc = k => PACKAGES[k].items.concat(COMMON);
const rm = n => "RM" + n.toLocaleString("en-MY");
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Landing page ---------- */
const hdr = $(".hdr");
if (hdr) {
  addEventListener("scroll", () => hdr.classList.toggle("small", scrollY > 30), { passive: true });
  const m = $("#mnav"), s = $("#scrim");
  const toggle = o => { m.classList.toggle("open", o); s.classList.toggle("open", o); $("#burger").setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; };
  $("#burger").onclick = () => toggle(true);
  $("#close").onclick = s.onclick = () => toggle(false);
  m.querySelectorAll("a").forEach(a => a.onclick = () => toggle(false));
  addEventListener("keydown", e => e.key === "Escape" && toggle(false));
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll(".rv").forEach(el => io.observe(el));

const num = $("#counter");
if (num) {
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return; o.disconnect();
    if (reduce) { num.textContent = "800+"; return; }
    const t0 = performance.now();
    (function f(t) { const p = Math.min((t - t0) / 1800, 1); num.textContent = Math.round(800 * (1 - Math.pow(1 - p, 3))) + (p === 1 ? "+" : ""); p < 1 && requestAnimationFrame(f); })(t0);
  }), { threshold: .4 }).observe(num);
}
const track = $(".track");
if (track) { track.innerHTML += track.innerHTML; track.lastElementChild && [...track.children].slice(track.children.length / 2).forEach(n => n.setAttribute("aria-hidden", "true")); }

/* ---------- Checkout ---------- */
const form = $("#orderForm");
if (form) {
  const key = PACKAGES[new URLSearchParams(location.search).get("package")] ? new URLSearchParams(location.search).get("package") : "growth";
  const P = PACKAGES[key];
  const store = "im_order";
  const incList = inc(key).map(i => `<li>${esc(i)}</li>`).join("");
  const summary = `<div class="lab">YOUR SELECTED PACKAGE</div><h2>${P.name}</h2><div class="pr">${rm(P.price)} / BULAN</div><p><b>${P.platform}</b> — ${esc(P.platText)}</p><ul>${incList}</ul>`;
  $("#selBox").innerHTML = summary;
  $("#pkgField").value = `${P.name} — ${rm(P.price)} / BULAN`;
  const sel = $("#platform");
  sel.innerHTML = '<option value="">Select platform</option>' + P.platforms.map(p => `<option>${p}</option>`).join("");
  if (P.platforms.length === 1) sel.value = P.platforms[0];

  const saved = JSON.parse(sessionStorage.getItem(store) || "null");
  if (saved && saved.pkg === key) Object.entries(saved.data).forEach(([k, v]) => form.elements[k] && k !== "package" && (form.elements[k].value = v));

  const step = n => {
    ["stepForm", "stepReview"].forEach((id, i) => $("#" + id).classList.toggle("hide", i !== n));
    document.querySelectorAll(".steps span").forEach((s, i) => s.classList.toggle("on", i <= n + 0));
    scrollTo({ top: 0, behavior: "smooth" });
  };
  const fields = [["name", "Full Name"], ["phone", "Phone"], ["email", "Email"], ["company", "Company / Business"], ["location", "Location"], ["btype", "Business Type"], ["platform", "Advertising Platform"], ["message", "Additional Message"]];

  form.onsubmit = e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("[required]").forEach(f => { const er = f.parentElement.querySelector(".err"); const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value)) || (f.name === "phone" && f.value.replace(/\D/g, "").length < 9); if (er) er.textContent = bad ? "Please enter a valid " + f.dataset.l : ""; if (bad && ok) { f.focus(); } ok = ok && !bad; });
    if (!ok) return;
    const data = Object.fromEntries(new FormData(form));
    sessionStorage.setItem(store, JSON.stringify({ pkg: key, data }));
    $("#custRows").innerHTML = fields.map(([k, l]) => `<div class="row"><span>${l}</span><b>${esc((data[k] || "").trim() || "Not provided")}</b></div>`).join("");
    $("#pkgRev").innerHTML = `<div class="lab">SELECTED PACKAGE</div><h2>${P.name}</h2><div class="pr">${rm(P.price)} / BULAN</div><p><b>${P.platform}</b> — ${esc(P.platText)}</p><ul>${incList}</ul>`;
    $("#sumRows").innerHTML = `<div class="row"><span>Package</span><b>${P.name}</b></div><div class="row"><span>Service Fee</span><b>${rm(P.price)} / BULAN</b></div><div class="row"><span>Ads Spend</span><b>NOT INCLUDED</b></div><div class="tot"><span>TOTAL PAYABLE</span><b>${rm(P.price)} / BULAN</b></div>`;
    step(1);
  };
  $("#edit").onclick = () => step(0);
  $("#pay").onclick = () => {
    if (!FPX_CHECKOUT_URL || FPX_CHECKOUT_URL.includes("YOUR_FPX")) { $("#payMsg").textContent = "Payment link is not configured yet. Set FPX_CHECKOUT_URL in script.js, or contact us on WhatsApp to complete your order."; return; }
    const u = new URL(FPX_CHECKOUT_URL, location.href);
    u.searchParams.set("package", key); u.searchParams.set("amount", P.price);
    location.href = u.toString();
  };
}
