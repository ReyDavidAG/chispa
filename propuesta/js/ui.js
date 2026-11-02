import { challengeStatus, ideaStatus, solutionTypes } from "./data.js";
import * as store from "./store.js";

const paths = {
  spark: '<path d="M12 2C12.7 8 16 11.3 22 12C16 12.7 12.7 16 12 22C11.3 16 8 12.7 2 12C8 11.3 11.3 8 12 2Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  chevronRight: '<path d="M9 6l6 6-6 6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M3 21h18M8 7h4M8 11h4M8 15h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  message: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  flame: '<path d="M12 3c.6 3.2 4.8 5.3 4.8 10.2a4.8 4.8 0 0 1-9.6 0c0-1.9.8-3.4 1.9-4.4.2 1.6 1 2.6 2.1 2.9-.6-2.9.1-5.8.8-8.7z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 6"/>',
  logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.6 3.2M6.6 6.6C4.1 8.2 3 12 3 12s4 6 9 6c1.6 0 3-.4 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L3 9M3 4v5h5M4 13a8 8 0 0 0 14.6 4.5L21 15M21 20v-5h-5"/>',
};

export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);
}

const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function shortDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]}${y !== 2026 ? ` ${y}` : ""}`;
}

export function daysUntil(iso) {
  const end = new Date(`${iso}T23:59:59`);
  return Math.ceil((end - Date.now()) / 86400000);
}

export function closesLabel(iso) {
  const days = daysUntil(iso);
  if (days < 0) return `Cerró el ${shortDate(iso)}`;
  if (days === 0) return "Cierra hoy";
  if (days === 1) return "Cierra mañana";
  if (days <= 14) return `Cierra en ${days} días`;
  return `Cierra el ${shortDate(iso)}`;
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function avatar(person, size = "") {
  if (!person) return `<span class="avatar ${size}" aria-hidden="true">?</span>`;
  return `<span class="avatar ${size}" data-area="${person.areaId}" aria-hidden="true">${initials(person.name)}</span>`;
}

export function authorLine(idea) {
  if (idea.anonymous) return `<span class="avatar is-anon" aria-hidden="true">${icon("eyeOff")}</span><span>Anónimo</span>`;
  const p = store.personById(idea.authorId);
  return `${avatar(p)}<span>${esc(p?.name ?? "Colaborador")}</span>`;
}

export function areaChip(areaId, asLink = false) {
  const area = store.areaById(areaId);
  const inner = `<span class="area-dot" aria-hidden="true"></span>${esc(area?.name)}`;
  return asLink
    ? `<a class="area-chip" data-area="${areaId}" href="#/challenges?area=${areaId}">${inner}</a>`
    : `<span class="area-chip" data-area="${areaId}">${inner}</span>`;
}

export function orgLine(c, asLink = false) {
  const dept = c.departmentId ? store.departmentById(c.departmentId) : null;
  return `<span class="org-line">${areaChip(c.areaId, asLink)}<span class="org-line__dept">${dept ? esc(dept.name) : "Toda el área"}</span></span>`;
}

export function statusPill(kind, status) {
  const map = kind === "idea" ? ideaStatus : challengeStatus;
  const s = map[status];
  return `<span class="pill tone-${s.tone}"><span class="pill-dot" aria-hidden="true"></span>${s.label}</span>`;
}

export const typeName = (id) => solutionTypes.find((t) => t.id === id)?.name ?? id;

export function sparkMeter(count) {
  const level = count >= 40 ? 3 : count >= 15 ? 2 : count >= 1 ? 1 : 0;
  return `<span class="spark-meter" data-level="${level}" aria-hidden="true">${icon("spark")}${icon("spark")}${icon("spark")}</span>`;
}

export const stagger = (i) => `--i:${Math.min(i, 12)}`;

export const newFlag = () => `<span class="flag flag--new">${icon("spark")}Nuevo</span>`;
export const hotFlag = (label = "En tendencia") => `<span class="flag flag--hot">${icon("flame")}${label}</span>`;

export function challengeTag(c, { compact = false, index = 0, preview = false } = {}) {
  const list = store.ideas.byChallenge(c.id);
  const heat = list.reduce((sum, i) => sum + store.supports.count(i), 0);
  const isNew = !preview && store.novelty.isNew(c);
  const isHot = !preview && store.trending.isHotChallenge(c);
  const flags = `${isNew ? newFlag() : ""}${isHot ? hotFlag() : ""}`;
  return `
  <article class="tag-card${compact ? " is-compact" : ""}${preview ? "" : " animate-tile-in"}${isNew ? " is-new" : ""}" data-area="${c.areaId}" style="${stagger(index)}">
    <a class="tag-card__link" href="#/challenges/${c.id}" aria-label="${esc(c.title)}${isNew ? ", nuevo" : ""}${isHot ? ", en tendencia" : ""}"${preview ? ' tabindex="-1"' : ""}></a>
    <header class="tag-card__head">
      <span class="tag-hole" aria-hidden="true"></span>
      <span class="folio">${c.id}</span>
      <span class="tag-card__flags">${flags}${statusPill("challenge", c.status)}</span>
    </header>
    <div class="tag-card__body">
      ${orgLine(c)}
      <h3 class="tag-card__title">${esc(c.title)}</h3>
      ${compact ? "" : `<p class="tag-card__summary">${esc(c.summary)}</p>`}
    </div>
    <footer class="tag-card__foot">
      <span class="meta">${icon("spark", "is-spark")}${plural(list.length, "chispa", "chispas")}</span>
      <span class="meta">${icon("flame")}${heat}</span>
      <span class="meta meta--push">${icon("clock")}${closesLabel(c.closesAt)}</span>
    </footer>
  </article>`;
}

export function supportButton(idea, size = "") {
  const on = store.supports.has(idea.id);
  const count = store.supports.count(idea);
  return `<button type="button" class="support-btn ${size}" data-support="${idea.id}" aria-pressed="${on}" aria-label="${on ? "Quitar avivada" : "Avivar esta chispa"}, ${count}">
    <span class="support-btn__icon">${icon("flame")}<span class="burst" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span></span><span class="support-btn__count"><span class="support-btn__num">${count}</span></span>${size === "is-large" ? `<span class="support-btn__label">${on ? "Avivada" : "Avivar"}</span>` : ""}
  </button>`;
}

export function ideaRow(idea, { showChallenge = false, index = 0 } = {}) {
  const c = store.challenges.byId(idea.challengeId);
  return `
  <article class="idea-row animate-row-in" style="${stagger(index)}">
    <div class="idea-row__main">
      <div class="idea-row__top">
        <span class="folio">${idea.id}</span>
        ${store.trending.isHotIdea(idea) ? hotFlag() : ""}
        ${statusPill("idea", idea.status)}
        <span class="type-tag">${esc(typeName(idea.type))}</span>
      </div>
      <h3 class="idea-row__title"><a href="#/ideas/${idea.id}">${esc(idea.title)}</a></h3>
      <p class="idea-row__summary">${esc(idea.summary)}</p>
      <div class="idea-row__meta">
        <span class="author">${authorLine(idea)}</span>
        <span class="meta">${icon("message")}${store.comments.count(idea.id)}</span>
        ${showChallenge && c ? `<span class="meta meta--reto">Reto: <a href="#/challenges/${c.id}">${esc(c.title)}</a></span>` : ""}
      </div>
    </div>
    ${supportButton(idea)}
  </article>`;
}

export function emptyState(title, body, action = "") {
  return `<div class="empty">
    <span class="empty__mark" aria-hidden="true">${icon("spark")}</span>
    <h3>${title}</h3>
    <p>${body}</p>
    ${action}
  </div>`;
}

export const wordmark = (cls = "") =>
  `<span class="wordmark ${cls}" role="img" aria-label="Chispa"><svg class="wordmark__mark" viewBox="0 0 24 24" aria-hidden="true">${paths.spark}</svg><span aria-hidden="true">chispa</span></span>`;

export function toast(message, actionLabel, onAction) {
  const host = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.innerHTML = `<span>${esc(message)}</span>${actionLabel ? `<button type="button" class="toast__action">${esc(actionLabel)}</button>` : ""}`;
  host.append(el);
  const close = () => {
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 200);
  };
  el.querySelector(".toast__action")?.addEventListener("click", () => {
    onAction?.();
    close();
  });
  setTimeout(close, 4200);
}

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function countUp(root) {
  root.querySelectorAll("[data-count-to]").forEach((el) => {
    const to = Number(el.dataset.countTo);
    if (reducedMotion() || !to) {
      el.textContent = to;
      return;
    }
    const delay = Number(el.dataset.countDelay ?? 0);
    const duration = Math.min(1100, 520 + to * 12);
    el.textContent = "0";
    const start = performance.now() + delay;
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const lastIndicator = new Map();

export function placeIndicator(container, active, key) {
  if (!container || !active) return;
  let bar = container.querySelector(":scope > .indicator");
  if (!bar) {
    bar = document.createElement("span");
    bar.className = "indicator";
    bar.setAttribute("aria-hidden", "true");
    container.prepend(bar);
  }
  const box = container.getBoundingClientRect();
  const r = active.getBoundingClientRect();
  const next = { x: r.left - box.left + container.scrollLeft, w: r.width };
  const prev = key ? lastIndicator.get(key) : null;
  const apply = (p) => {
    bar.style.transform = `translateX(${p.x}px)`;
    bar.style.width = `${p.w}px`;
  };
  if (prev && !reducedMotion()) {
    bar.classList.remove("is-ready");
    apply(prev);
    void bar.offsetWidth;
  }
  bar.classList.add("is-ready");
  apply(next);
  bar.classList.add("is-visible");
  if (key) lastIndicator.set(key, next);
}

export function bindSegmented(root) {
  root.querySelectorAll(".segmented").forEach((group) => {
    const move = () => placeIndicator(group, group.querySelector("input:checked")?.closest(".segmented__item"));
    group.classList.add("has-indicator");
    move();
    group.addEventListener("change", move);
  });
}

export function clearNewBadges() {
  document.querySelectorAll("[data-new-badge]").forEach((b) => {
    b.classList.add("is-leaving");
    b.addEventListener(
      "animationend",
      () => {
        b.remove();
        const nav = document.querySelector(".topnav");
        placeIndicator(nav, nav?.querySelector('[aria-current="page"]'), "topnav");
      },
      { once: true },
    );
  });
}
