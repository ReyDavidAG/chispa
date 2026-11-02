import * as store from "./store.js";
import { esc, icon, supportButton, wordmark, avatar, toast, countUp, placeIndicator, bindSegmented } from "./ui.js";
import signIn from "./views/sign_in.js";
import home from "./views/home.js";
import challengeList from "./views/challenge_list.js";
import challengeDetail from "./views/challenge_detail.js";
import challengeForm from "./views/challenge_form.js";
import ideaForm from "./views/idea_form.js";
import ideaDetail from "./views/idea_detail.js";
import myIdeas from "./views/my_ideas.js";
import areaPanel from "./views/area_panel.js";
import howItWorks from "./views/how_it_works.js";

const routes = [
  { pattern: /^\/sign-in$/, view: signIn, public: true },
  { pattern: /^\/$/, view: home, nav: "home" },
  { pattern: /^\/challenges$/, view: challengeList, nav: "challenges" },
  { pattern: /^\/challenges\/new$/, view: challengeForm, nav: "challenges" },
  { pattern: /^\/challenges\/(RET-\d+)$/, view: challengeDetail, nav: "challenges" },
  { pattern: /^\/propose$/, view: ideaForm, nav: "propose" },
  { pattern: /^\/ideas\/(CHI-\d+)$/, view: ideaDetail, nav: "mine" },
  { pattern: /^\/my-ideas$/, view: myIdeas, nav: "mine" },
  { pattern: /^\/my-area$/, view: areaPanel, nav: "area", roles: ["lead", "committee"] },
  { pattern: /^\/how-it-works$/, view: howItWorks, nav: "how" },
];

const roleNames = { member: "Colaborador", lead: "Responsable de área", committee: "Comité" };

const app = document.getElementById("app");

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs = ""] = raw.split("?");
  return { path, query: Object.fromEntries(new URLSearchParams(qs)) };
}

export function go(path) {
  location.hash = `#${path}`;
}

function newBadge() {
  const n = store.novelty.count();
  return n ? `<span class="nav-badge" data-new-badge><span class="sr-only">, </span>${n}<span class="sr-only"> ${n === 1 ? "nuevo" : "nuevos"}</span></span>` : "";
}

function navLinks(active, user) {
  const items = [
    { id: "home", href: "#/", label: "Inicio", icon: "home" },
    { id: "challenges", href: "#/challenges", label: "Retos", icon: "tag" },
    { id: "mine", href: "#/my-ideas", label: "Mis chispas", icon: "spark" },
  ];
  if (user.role !== "member") items.push({ id: "area", href: "#/my-area", label: user.role === "committee" ? "Evaluación" : "Mi área", icon: "building" });
  items.push({ id: "how", href: "#/how-it-works", label: "Cómo funciona", icon: "info" });
  return items
    .map((i) => `<a class="topnav__link" href="${i.href}"${i.id === active ? ' aria-current="page"' : ""}>${i.label}${i.id === "challenges" ? newBadge() : ""}</a>`)
    .join("");
}

function tabbar(active, user) {
  const tab = (id, href, label, ic) =>
    `<a class="tabbar__item" href="${href}"${id === active ? ' aria-current="page"' : ""}><span class="tabbar__icon">${icon(ic)}${id === "challenges" ? newBadge() : ""}</span><span>${label}</span></a>`;
  const fourth = user.role === "member"
    ? tab("how", "#/how-it-works", "La feria", "info")
    : tab("area", "#/my-area", user.role === "committee" ? "Evaluar" : "Mi área", "building");
  return `<nav class="tabbar" aria-label="Principal">
    ${tab("home", "#/", "Inicio", "home")}
    ${tab("challenges", "#/challenges", "Retos", "tag")}
    <a class="tabbar__propose" href="#/propose"${active === "propose" ? ' aria-current="page"' : ""}><span class="tabbar__propose-btn">${icon("plus")}</span><span>Proponer</span></a>
    ${tab("mine", "#/my-ideas", "Mis chispas", "spark")}
    ${fourth}
  </nav>`;
}

function userMenu(user) {
  const area = store.areaById(user.areaId);
  const roles = Object.entries(roleNames)
    .map(([id, name]) => `<label class="role-option"><input type="radio" name="demo-role" value="${id}"${user.role === id ? " checked" : ""}><span>${name}</span></label>`)
    .join("");
  return `<div class="user-menu" id="user-menu" hidden>
    <div class="user-menu__head">
      ${avatar(user, "is-lg")}
      <div><strong>${esc(user.name)}</strong><span>No. ${esc(user.employeeNumber)} · ${esc(area.name)}</span></div>
    </div>
    <fieldset class="user-menu__roles">
      <legend>Ver la demo como</legend>
      ${roles}
    </fieldset>
    <button type="button" class="menu-item" data-action="reset-demo">${icon("refresh")}Reiniciar datos de ejemplo</button>
    <button type="button" class="menu-item" data-action="sign-out">${icon("logout")}Salir</button>
  </div>`;
}

function shell(route, user, content) {
  return `
  <a class="skip-link" href="#main">Saltar al contenido</a>
  <header class="topbar">
    <div class="topbar__inner">
      <a class="topbar__brand" href="#/" aria-label="Chispa, inicio">${wordmark()}<span class="topbar__event">Feria de Innovación</span></a>
      <nav class="topnav" aria-label="Principal">${navLinks(route.nav, user)}</nav>
      <div class="topbar__actions">
        <a class="btn btn--spark btn--sm topbar__propose" href="#/propose">${icon("plus")}Proponer chispa</a>
        <button type="button" class="user-chip" aria-haspopup="true" aria-expanded="false" aria-controls="user-menu" data-action="toggle-menu">
          ${avatar(user)}<span class="user-chip__name">${esc(user.name.split(" ")[0])}</span>${icon("chevronDown")}
        </button>
        ${userMenu(user)}
      </div>
    </div>
  </header>
  <div class="demo-ribbon" role="note">${icon("info")}<span>Demo<span class="demo-ribbon__long"> con datos de ejemplo</span> · viendo como <strong>${roleNames[user.role]}</strong></span></div>
  <main id="main" class="page" tabindex="-1"><div class="animate-page-in">${content}</div></main>
  ${tabbar(route.nav, user)}`;
}

function notFound() {
  return `<section class="wrap narrow"><div class="empty"><span class="empty__mark" aria-hidden="true">${icon("spark")}</span><h1 class="h2">No encontramos esa página</h1><p>Puede que la liga esté incompleta o que el reto ya no exista.</p><a class="btn" href="#/">Volver al inicio</a></div></section>`;
}

function render() {
  const { path, query } = parseHash();
  const user = store.session();
  const match = routes.map((r) => ({ r, m: path.match(r.pattern) })).find((x) => x.m);

  if (!user && !match?.r.public) return go("/sign-in");
  if (user && match?.r.public) return go("/");

  if (!match) {
    app.innerHTML = shell({ nav: "" }, user, notFound());
    return;
  }
  const { r, m } = match;
  if (r.roles && !r.roles.includes(user.role)) return go("/");

  const params = m.slice(1);
  const view = r.view;
  const content = view.render(params, query) ?? notFound();
  app.innerHTML = r.public ? content : shell(r, user, content);
  document.title = `${typeof view.title === "function" ? view.title(params) : view.title} · Chispa`;
  view.bind?.(app, params, query);
  window.scrollTo(0, 0);
  countUp(app);
  bindSegmented(app);
  placeIndicator(app.querySelector(".topnav"), app.querySelector('.topnav [aria-current="page"]'), "topnav");
  if (!r.public) document.getElementById("main")?.focus({ preventScroll: true });
}

function refreshSupport(ideaId) {
  const idea = store.ideas.byId(ideaId);
  document.querySelectorAll(`[data-support="${ideaId}"]`).forEach((btn) => {
    const size = btn.classList.contains("is-large") ? "is-large" : "";
    btn.outerHTML = supportButton(idea, size);
  });
  document.querySelectorAll(`[data-support="${ideaId}"]`).forEach((btn) => {
    btn.classList.add("is-pop", btn.getAttribute("aria-pressed") === "true" ? "is-burst" : "is-cool");
  });
}

function closeMenu() {
  const menu = document.getElementById("user-menu");
  const chip = document.querySelector('[data-action="toggle-menu"]');
  if (menu && !menu.hidden) {
    menu.hidden = true;
    chip?.setAttribute("aria-expanded", "false");
  }
}

document.addEventListener("click", (e) => {
  const support = e.target.closest("[data-support]");
  if (support) {
    const id = support.dataset.support;
    const was = store.supports.has(id);
    store.supports.toggle(id);
    refreshSupport(id);
    if (!was) {
      toast("Avivaste la chispa", "Deshacer", () => {
        store.supports.toggle(id);
        refreshSupport(id);
      });
    }
    return;
  }
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "toggle-menu") {
    const menu = document.getElementById("user-menu");
    menu.hidden = !menu.hidden;
    e.target.closest("button").setAttribute("aria-expanded", String(!menu.hidden));
    if (!menu.hidden) menu.querySelector("input:checked")?.focus();
    return;
  }
  if (action === "sign-out") {
    store.signOut();
    return go("/sign-in");
  }
  if (action === "reset-demo") {
    store.resetDemo();
    closeMenu();
    render();
    toast("Datos de ejemplo reiniciados");
    return;
  }
  if (!e.target.closest(".user-menu")) closeMenu();
});

document.addEventListener("change", (e) => {
  if (e.target.name === "demo-role") {
    store.setRole(e.target.value);
    render();
    toast(`Ahora ves la demo como ${roleNames[e.target.value]}`);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const menu = document.getElementById("user-menu");
    if (menu && !menu.hidden) {
      closeMenu();
      document.querySelector('[data-action="toggle-menu"]')?.focus();
    }
  }
});

window.addEventListener("hashchange", render);
render();
