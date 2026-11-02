import * as store from "../store.js";
import { ideaStatus, ideaSteps } from "../data.js";
import { stagger, placeIndicator, esc, icon, ideaRow, emptyState } from "../ui.js";

function progressRow(idea, i = 0) {
  const step = ideaStatus[idea.status].step;
  return `<div class="mine-item animate-tile-in" style="${stagger(i)}">
    ${ideaRow(idea, { showChallenge: true })}
    <div class="mini-track" aria-label="Avance: ${ideaStatus[idea.status].label}">
      ${ideaSteps.map((name, i) => `<span class="mini-track__seg${i <= step ? " is-on" : ""}" title="${name}"></span>`).join("")}
      <span class="mini-track__label">${ideaStatus[idea.status].label}</span>
    </div>
  </div>`;
}

function draftCard() {
  const d = store.draft.get();
  if (!d || !(d.title || d.summary || d.challengeId)) return "";
  const c = store.challenges.byId(d.challengeId);
  return `<a class="draft-card" href="#/propose${d.challengeId ? `?challenge=${d.challengeId}` : ""}">
    <span class="draft-card__icon" aria-hidden="true">${icon("file")}</span>
    <span><strong>Tienes un borrador sin enviar</strong><span class="muted">${esc(d.title || "Sin nombre todavía")}${c ? ` · ${c.id}` : ""}</span></span>
    ${icon("chevronRight")}
  </a>`;
}

const panels = {
  mine(user) {
    const list = store.ideas.byAuthor(user.id);
    if (!list.length) {
      return emptyState(
        "Aún no propones ninguna chispa",
        "Cuando mandes una, aquí verás en qué va: si ya la revisaron, si quedó para la feria o si ya se está haciendo.",
        `<a class="btn btn--spark" href="#/propose">${icon("plus")}Proponer mi primera chispa</a>`,
      );
    }
    return `<div class="idea-list">${list.map((idea, i) => progressRow(idea, i)).join("")}</div>`;
  },
  supported() {
    const ids = store.supports.mine();
    const list = store.ideas.all().filter((i) => ids.includes(i.id));
    if (!list.length) {
      return emptyState("No has avivado ninguna", "Avivar es la forma de decir “esto sí hace falta”. Busca en los retos las ideas que te gustaría ver hechas.", `<a class="btn btn--ghost" href="#/challenges">Explorar retos</a>`);
    }
    return `<div class="idea-list">${list.map((idea, i) => ideaRow(idea, { showChallenge: true, index: i })).join("")}</div>`;
  },
};

export default {
  title: "Mis chispas",
  render() {
    const user = store.session();
    const mineCount = store.ideas.byAuthor(user.id).length;
    const supCount = store.supports.mine().length;
    return `<div class="wrap narrow-wide">
      <header class="page-head">
        <div>
          <h1 class="h1">Mis chispas</h1>
          <p class="lede">Lo que propusiste y lo que avivaste, con su avance.</p>
        </div>
      </header>
      ${draftCard()}
      <div class="tabs" role="tablist" aria-label="Mis chispas">
        <button type="button" role="tab" id="tab-mine" aria-controls="panel" aria-selected="true" data-tab="mine">Propuestas<span class="tabs__count num">${mineCount}</span></button>
        <button type="button" role="tab" id="tab-supported" aria-controls="panel" aria-selected="false" tabindex="-1" data-tab="supported">Avivadas<span class="tabs__count num">${supCount}</span></button>
      </div>
      <section id="panel" role="tabpanel" aria-labelledby="tab-mine" class="tab-panel">${panels.mine(user)}</section>
    </div>`;
  },
  bind(root) {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panel = root.querySelector("#panel");
    const strip = root.querySelector(".tabs");
    placeIndicator(strip, tabs[0]);
    const select = (tab) => {
      const from = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const to = tabs.indexOf(tab);
      if (from === to) return;
      placeIndicator(strip, tab);
      panel.style.setProperty("--dir", to > from ? 1 : -1);
      panel.classList.remove("animate-panel-in");
      void panel.offsetWidth;
      panel.classList.add("animate-panel-in");
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", tab.id);
      panel.innerHTML = panels[tab.dataset.tab](store.session());
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        select(next);
      });
    });
  },
};
