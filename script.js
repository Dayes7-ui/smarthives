/* =========================================================
   SMART HIVES — script.js
   ---------------------------------------------------------
   EDIT THIS BLOCK before going live:
   ========================================================= */
const SMART_HIVES_CONFIG = {
  // Where enquiries are sent. Leave "" until you have them — the form will
  // then show the finished message for the visitor to copy instead.
  email: "",            // e.g. "info@yourdomain.com"
  whatsapp: "263787569414"   // digits only with country code
};

document.documentElement.classList.add("js");

/* ---------- nav: scrolled state + mobile drawer ---------- */
(function () {
  const nav = document.querySelector(".nav");
  const burger = document.querySelector(".burger");
  const drawer = document.querySelector(".drawer");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 10);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  if (burger && drawer) {
    burger.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
    });
    drawer.addEventListener("click", e => {
      if (e.target.closest("a")) { drawer.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }
})();

/* ---------- reveal on scroll ---------- */
(function () {
  const els = document.querySelectorAll(".rv");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(e => io.observe(e));
})();

/* ---------- hero parallax ---------- */
(function () {
  const bg = document.querySelector(".hero-bg");
  const panel = document.querySelector(".hero-panel");
  if (!bg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.addEventListener("scroll", () => {
    const y = Math.min(window.scrollY, 900);
    bg.style.transform = `translateY(${y * .25}px) scale(1.08)`;
    if (panel) { panel.style.transform = `translateY(${y * -.06}px)`; panel.style.opacity = String(1 - y / 1300); }
  }, { passive: true });
})();

/* ---------- partner carousel ---------- */
(function () {
  const car = document.querySelector(".pcar");
  if (!car) return;
  const cards = [...car.querySelectorAll(".pcard")];
  const dots = document.querySelector(".pdots");
  let i = 0, timer;
  function render() {
    const n = cards.length;
    cards.forEach((c, k) => {
      c.className = "pcard";
      const rel = (k - i + n) % n;
      c.classList.add(rel === 0 ? "c1" : rel === 1 ? "c2" : rel === n - 1 ? "c0" : "c3");
      c.style.order = rel === n - 1 ? 0 : rel === 0 ? 1 : rel === 1 ? 2 : 3;
    });
    if (dots) [...dots.children].forEach((d, k) => d.setAttribute("aria-current", k === i));
  }
  if (dots) cards.forEach((_, k) => {
    const b = document.createElement("button"); b.setAttribute("aria-label", "Show partner " + (k + 1));
    b.onclick = () => { i = k; render(); restart(); }; dots.appendChild(b);
  });
  const restart = () => { clearInterval(timer); timer = setInterval(() => { i = (i + 1) % cards.length; render(); }, 3200); };
  render(); restart();
})();

/* ---------- enquiry list (stored in the visitor's browser) ---------- */
const Enquiry = {
  key: "smarthives_enquiry",
  get() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { return this._mem || []; } },
  set(list) { this._mem = list; try { localStorage.setItem(this.key, JSON.stringify(list)); } catch (e) {} this.paint(); },
  has(id) { return this.get().some(x => x.id === id); },
  toggle(id, name) {
    const l = this.get();
    const k = l.findIndex(x => x.id === id);
    if (k > -1) l.splice(k, 1); else l.push({ id, name });
    this.set(l);
  },
  remove(id) { this.set(this.get().filter(x => x.id !== id)); },
  paint() {
    const n = this.get().length;
    document.querySelectorAll(".enq-count").forEach(c => { c.textContent = n; c.dataset.n = n; });
    document.querySelectorAll("[data-enquire]").forEach(b => {
      const on = this.has(b.dataset.enquire);
      b.setAttribute("aria-pressed", on);
      b.textContent = on ? "✓ Added to enquiry" : "Add to enquiry";
    });
    const list = document.getElementById("enqList");
    if (list) {
      const l = this.get();
      list.innerHTML = l.map(x => `<li><span>${x.name.replace(/</g, "&lt;")}</span><button type="button" data-rm="${x.id}">Remove</button></li>`).join("");
      const empty = document.getElementById("enqEmpty"); if (empty) empty.style.display = l.length ? "none" : "block";
    }
  }
};
document.addEventListener("click", e => {
  const b = e.target.closest("[data-enquire]");
  if (b) { Enquiry.toggle(b.dataset.enquire, b.dataset.name); }
  const r = e.target.closest("[data-rm]");
  if (r) Enquiry.remove(r.dataset.rm);
});
Enquiry.paint();

/* ---------- product gallery thumbs ---------- */
document.querySelectorAll(".gal").forEach(g => {
  const main = g.querySelector(".gal-main img");
  g.querySelectorAll(".thumbs button").forEach(b => b.addEventListener("click", () => {
    main.src = b.dataset.src; main.alt = b.dataset.alt || main.alt;
    g.querySelectorAll(".thumbs button").forEach(x => x.setAttribute("aria-current", x === b));
  }));
});

/* ---------- honey filter ---------- */
(function () {
  const pills = document.querySelectorAll("[data-filter]");
  if (!pills.length) return;
  const cards = document.querySelectorAll(".hcard");
  const count = document.getElementById("hcount");
  pills.forEach(p => p.addEventListener("click", e => {
    e.preventDefault();
    pills.forEach(x => x.classList.toggle("on", x === p));
    const f = p.dataset.filter; let n = 0;
    cards.forEach(c => { const show = f === "all" || c.dataset.kind === f; c.classList.toggle("hide", !show); if (show) n++; });
    if (count) count.textContent = n + " products";
  }));
})();

/* ---------- contact form ---------- */
(function () {
  const form = document.getElementById("enqForm");
  if (!form) return;
  const ready = document.getElementById("ready");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim()) { const n = document.getElementById("name"); n.focus(); n.style.borderColor = "#b3261e"; n.placeholder = "Please enter your name"; return; }
    if (!d.phone.trim() && !d.email.trim()) { const p = document.getElementById("phone"); p.focus(); p.style.borderColor = "#b3261e"; p.placeholder = "Phone or email, so we can reply"; return; }
    const items = Enquiry.get().map(x => "• " + x.name).join("\n") || "• (none selected)";
    const subject = "Smart Hives enquiry — " + d.name;
    const body =
`Name: ${d.name}
Phone / WhatsApp: ${d.phone || "-"}
Email: ${d.email || "-"}
Location: ${d.location || "-"}
I am a: ${d.who}

Products of interest:
${items}

Message:
${d.message || "-"}`;
    const { email, whatsapp } = SMART_HIVES_CONFIG;
    if (email) { location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; return; }
    if (whatsapp) { window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(subject + "\n\n" + body)}`, "_blank"); return; }
    ready.querySelector("pre").textContent = body;
    ready.classList.add("show");
    ready.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  const copy = document.getElementById("copyMsg");
  if (copy) copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(ready.querySelector("pre").textContent); copy.textContent = "Copied ✓"; }
    catch (e) { copy.textContent = "Select the text and copy it"; }
  });
})();

/* ---------- hero video: fall back to the photo if the file is missing ---------- */
(function () {
  const v = document.querySelector(".hero-video");
  if (!v) return;
  const hero = v.closest(".hero");
  const off = () => v.classList.add("off");
  v.addEventListener("playing", () => hero.classList.add("has-video"));
  v.querySelectorAll("source").forEach(s => s.addEventListener("error", () => { if (!v.currentSrc) off(); }));
  v.addEventListener("error", off);
  const p = v.play(); if (p && p.catch) p.catch(off);
})();

/* ---------- BuzzBuddy form ---------- */
(function () {
  const form = document.getElementById("buzzForm");
  if (!form) return;
  const ready = document.getElementById("bready");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim()) { const n = document.getElementById("bname"); n.focus(); n.style.borderColor = "#b3261e"; n.placeholder = "Please enter your name"; return; }
    if (!d.phone.trim() && !d.email.trim()) { const p = document.getElementById("bphone"); p.focus(); p.style.borderColor = "#b3261e"; p.placeholder = "Phone or email, so we can reply"; return; }
    const subject = "BuzzBuddy Program: " + d.name;
    const body = `Name: ${d.name}
Phone / WhatsApp: ${d.phone || "-"}
Email: ${d.email || "-"}
Where are the bees: ${d.location || "-"}
What is happening: ${d.what}

Message:
${d.message || "-"}`;
    const { email, whatsapp } = SMART_HIVES_CONFIG;
    if (email) { location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; return; }
    if (whatsapp) { window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(subject + "\n\n" + body)}`, "_blank"); return; }
    ready.querySelector("pre").textContent = body; ready.classList.add("show");
  });
  const copy = document.getElementById("bcopy");
  if (copy) copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(ready.querySelector("pre").textContent); copy.textContent = "Copied ✓"; } catch (e) { copy.textContent = "Select the text and copy it"; }
  });
})();
