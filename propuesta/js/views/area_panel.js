import * as store from "../store.js";
import { areas, rubric } from "../data.js";
import { stagger, esc, icon, statusPill, areaChip, closesLabel, plural, authorLine, typeName } from "../ui.js";

function scoreOf(idea) {
  const e = store.evaluations.get(idea.id);
  return e ? rubric.reduce((s, r) => s + Number(e[r.id]), 0) : null;
}

function queueRow(idea, i = 0) {
  const c = store.challenges.byId(idea.challengeId);
  const score = scoreOf(idea);
  return `<li class="animate-row-in" style="${stagger(i)}"><a class="queue-row" href="#/ideas/${idea.id}">
    <span class="queue-row__main">
      <span class="idea-row__top"><span class="folio">${idea.id}</span>${statusPill("idea", idea.status)}<span class="type-tag">${esc(typeName(idea.type))}</span></span>
      <strong>${esc(idea.title)}</strong>
      <span class="queue-row__meta"><span class="author">${authorLine(idea)}</span><span class="muted">${c.id}</span></span>
    </span>
    <span class="queue-row__score">${score === null ? `<span class="muted small">Sin calificar</span>` : `<span class="num">${score}</span><span class="muted small">/ ${rubric.length * 5}</span>`}</span>
    <span class="queue-row__heat">${icon("flame")}<span class="num">${store.supports.count(idea)}</span></span>
  </a></li>`;
}

function challengeRow(c, i = 0) {
  const n = store.ideas.byChallenge(c.id).length;
  return `<li class="animate-row-in" style="${stagger(i)}"><a class="queue-row" href="#/challenges/${c.id}">
    <span class="queue-row__main">
      <span class="idea-row__top"><span class="folio">${c.id}</span>${statusPill("challenge", c.status)}${areaChip(c.areaId)}</span>
      <strong>${esc(c.title)}</strong>
      <span class="muted small">${closesLabel(c.closesAt)}</span>
    </span>
    <span class="queue-row__score"><span class="num">${n}</span><span class="muted small">${n === 1 ? "chispa" : "chispas"}</span></span>
  </a></li>`;
}

export default {
  title: "Mi área",
  render(_, query) {
    const user = store.session();
    const committee = user.role === "committee";
    const scope = committee ? query.area ?? "" : user.areaId;
    const inScope = (c) => !scope || c.areaId === scope;
    const list = store.challenges.all().filter(inScope);
    const ids = new Set(list.map((c) => c.id));
    const ideasIn = store.ideas.all().filter((i) => ids.has(i.challengeId));
    const pending = ideasIn.filter((i) => ["received", "review"].includes(i.status));
    const unscored = pending.filter((i) => scoreOf(i) === null);
    const selected = ideasIn.filter((i) => i.status === "selected");
    const suggested = list.filter((c) => c.status === "suggested");
    const area = store.areaById(scope);

    return `<div class="wrap">
      <header class="page-head">
        <div>
          <p class="kicker">${committee ? "Comité de la feria" : "Responsable de área"}</p>
          <h1 class="h1">${committee ? "Evaluación" : esc(area.name)}</h1>
          <p class="lede">${committee ? "Todas las chispas de todas las áreas. Califica con la rúbrica y elige las finalistas." : "Tus retos y las chispas que recibieron. Califica las que estén pendientes."}</p>
        </div>
        <a class="btn btn--spark" href="#/challenges/new">${icon("plus")}Publicar reto</a>
      </header>

      ${committee ? `<form class="chip-scroll" id="scope" aria-label="Filtrar por área">
        <label class="filter-chip"><input type="radio" name="area" value=""${!scope ? " checked" : ""}><span>Todas las áreas</span></label>
        ${areas.map((a) => `<label class="filter-chip" data-area="${a.id}"><input type="radio" name="area" value="${a.id}"${scope === a.id ? " checked" : ""}><span><span class="area-dot" aria-hidden="true"></span>${a.name}</span></label>`).join("")}
      </form>` : ""}

      <dl class="kpis">
        <div class="kpi"><dt>Retos abiertos</dt><dd class="num" data-count-to="${list.filter((c) => c.status === "open").length}">0</dd></div>
        <div class="kpi"><dt>Chispas recibidas</dt><dd class="num" data-count-to="${ideasIn.length}">0</dd></div>
        <div class="kpi is-attention"><dt>Sin calificar</dt><dd class="num" data-count-to="${unscored.length}">0</dd></div>
        <div class="kpi"><dt>Seleccionadas</dt><dd class="num" data-count-to="${selected.length}">0</dd></div>
      </dl>

      ${suggested.length ? `<section class="section">
        <div class="section__head"><h2 class="h3">Retos sugeridos por colaboradores</h2></div>
        <ul class="queue" role="list">${suggested.map(challengeRow).join("")}</ul>
      </section>` : ""}

      <div class="panel-split">
        <section class="section">
          <div class="section__head"><h2 class="h3">Por evaluar · ${pending.length}</h2></div>
          ${pending.length
            ? `<ul class="queue" role="list">${pending.sort((a, b) => store.supports.count(b) - store.supports.count(a)).map((idea, i) => queueRow(idea, i)).join("")}</ul>`
            : `<p class="muted">No hay chispas pendientes.</p>`}
        </section>
        <section class="section">
          <div class="section__head"><h2 class="h3">${committee ? "Retos" : "Mis retos"} · ${list.length}</h2></div>
          <ul class="queue" role="list">${list.map((c, i) => challengeRow(c, i)).join("")}</ul>
        </section>
      </div>
      <p class="muted small">${plural(selected.length, "chispa seleccionada", "chispas seleccionadas")} para la feria hasta ahora.</p>
    </div>`;
  },
  bind(root) {
    root.querySelector("#scope")?.addEventListener("change", (e) => {
      location.hash = `#/my-area${e.target.value ? `?area=${e.target.value}` : ""}`;
    });
  },
};
