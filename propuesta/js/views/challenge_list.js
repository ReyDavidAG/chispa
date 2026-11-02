import * as store from "../store.js";
import { areas, solutionTypes } from "../data.js";
import { esc, icon, challengeTag, emptyState, plural, clearNewBadges } from "../ui.js";

const sorts = [
  { id: "recent", name: "Más recientes" },
  { id: "new", name: "Nuevos primero" },
  { id: "trending", name: "En tendencia" },
  { id: "fewest", name: "Menos chispas" },
  { id: "closing", name: "Cierran pronto" },
];

const statusFilters = [
  { id: "open", name: "Abiertos" },
  { id: "review", name: "En evaluación" },
  { id: "building", name: "En desarrollo" },
  { id: "solved", name: "Resueltos" },
  { id: "all", name: "Todos" },
];

const defaults = { q: "", area: "", type: "", status: "open", sort: "recent" };

const score = (c) => {
  const h = store.trending.heat(c);
  return h.supports + h.ideas * 12;
};

function apply(f) {
  const q = f.q.trim().toLowerCase();
  let list = store.challenges.all().filter((c) => c.status !== "suggested");
  if (f.status !== "all") list = list.filter((c) => c.status === f.status);
  if (f.area) list = list.filter((c) => c.areaId === f.area);
  if (f.type) list = list.filter((c) => c.types.includes(f.type));
  if (q) list = list.filter((c) => `${c.title} ${c.summary} ${c.id}`.toLowerCase().includes(q));
  const recent = (a, b) => (b.publishedAt ?? b.openedAt).localeCompare(a.publishedAt ?? a.openedAt);
  const by = {
    recent,
    new: (a, b) => Number(store.novelty.isNew(b)) - Number(store.novelty.isNew(a)) || recent(a, b),
    trending: (a, b) => score(b) - score(a),
    fewest: (a, b) => store.ideas.byChallenge(a.id).length - store.ideas.byChallenge(b.id).length,
    closing: (a, b) => a.closesAt.localeCompare(b.closesAt),
  };
  return list.sort(by[f.sort] ?? recent);
}

function results(f) {
  const list = apply(f);
  const active = f.area || f.type || f.q || f.status !== "open";
  const count = `<p class="results-count" aria-live="polite">${plural(list.length, "reto", "retos")}${active ? ` · <button type="button" class="link-btn" data-clear>Quitar filtros</button>` : ""}</p>`;
  if (!list.length) {
    return count + emptyState(
      "Ningún reto con esos filtros",
      "Prueba con otra área o quita la búsqueda. Si el problema que buscas no está, sugiérelo.",
      `<a class="btn btn--ghost" href="#/challenges/new">${icon("plus")}Sugerir un reto</a>`,
    );
  }
  return `${count}<div class="tag-grid">${list.map((c, i) => challengeTag(c, { index: i })).join("")}</div>`;
}

function freshBanner(fresh) {
  if (!fresh.length) return "";
  const areasText = [...new Set(fresh.map((c) => store.areaById(c.areaId).name))].join(", ");
  return `<div class="fresh-banner animate-tile-in" role="status">
    <span class="fresh-banner__icon" aria-hidden="true">${icon("spark")}</span>
    <p><strong>${fresh.length === 1 ? "Hay 1 reto nuevo" : `Hay ${fresh.length} retos nuevos`}</strong> desde tu última visita · ${esc(areasText)}</p>
    <button type="button" class="btn btn--sm" data-show-new>Verlos primero</button>
  </div>`;
}

const toQuery = (f) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v && v !== defaults[k]) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
};

export default {
  title: "Retos",
  render(_, query) {
    const f = { ...defaults, ...Object.fromEntries(Object.entries(query).filter(([k]) => k in defaults)) };
    const fresh = store.novelty.unseen();
    return `<div class="wrap">
      <header class="page-head">
        <div>
          <h1 class="h1">Retos</h1>
          <p class="lede">Problemas reales que las áreas quieren resolver. Entra a uno, lee el contexto y propón tu chispa.</p>
        </div>
        <a class="btn btn--ghost" href="#/challenges/new">${icon("plus")}Sugerir un reto</a>
      </header>

      ${freshBanner(fresh)}

      <form class="filters" id="filters" role="search" onsubmit="return false">
        <div class="search">
          ${icon("search")}
          <label class="sr-only" for="q">Buscar retos</label>
          <input class="input" id="q" name="q" type="search" placeholder="Buscar por palabra o folio" value="${esc(f.q)}" autocomplete="off">
        </div>
        <div class="filters__row">
          <div class="segmented" role="radiogroup" aria-label="Estado">
            ${statusFilters.map((s) => `<label class="segmented__item"><input type="radio" name="status" value="${s.id}"${f.status === s.id ? " checked" : ""}><span>${s.name}</span></label>`).join("")}
          </div>
          <div class="filters__selects">
            <label class="select-wrap"><span class="sr-only">Tipo de solución</span>
              <select class="select" name="type">
                <option value="">Cualquier solución</option>
                ${solutionTypes.map((t) => `<option value="${t.id}"${f.type === t.id ? " selected" : ""}>${t.name}</option>`).join("")}
              </select>${icon("chevronDown")}
            </label>
            <label class="select-wrap"><span class="sr-only">Ordenar</span>
              <select class="select" name="sort">
                ${sorts.map((s) => `<option value="${s.id}"${f.sort === s.id ? " selected" : ""}>${s.name}</option>`).join("")}
              </select>${icon("chevronDown")}
            </label>
          </div>
        </div>
        <div class="chip-scroll" role="group" aria-label="Área">
          <label class="filter-chip"><input type="radio" name="area" value=""${!f.area ? " checked" : ""}><span>Todas las áreas</span></label>
          ${areas.map((a) => `<label class="filter-chip" data-area="${a.id}"><input type="radio" name="area" value="${a.id}"${f.area === a.id ? " checked" : ""}><span><span class="area-dot" aria-hidden="true"></span>${a.name}</span></label>`).join("")}
        </div>
      </form>

      <section id="results" class="results">${results(f)}</section>
    </div>`;
  },
  bind(root, _, query) {
    const form = root.querySelector("#filters");
    const out = root.querySelector("#results");
    let timer;
    const read = () => {
      const d = new FormData(form);
      return Object.fromEntries(Object.keys(defaults).map((k) => [k, d.get(k) ?? defaults[k]]));
    };
    const update = () => {
      const f = read();
      out.innerHTML = results(f);
      history.replaceState(null, "", `#/challenges${toQuery(f)}`);
    };
    const reset = () => {
      form.elements.q.value = "";
      form.elements.type.value = "";
      form.elements.sort.value = "recent";
      form.querySelector('[name="status"][value="open"]').checked = true;
      form.querySelector('[name="area"][value=""]').checked = true;
      form.querySelector(".segmented").dispatchEvent(new Event("change"));
    };
    form.addEventListener("change", update);
    form.addEventListener("input", (e) => {
      if (e.target.name !== "q") return;
      clearTimeout(timer);
      timer = setTimeout(update, 300);
    });
    out.addEventListener("click", (e) => {
      if (!e.target.closest("[data-clear]")) return;
      reset();
      update();
      form.elements.q.focus();
    });
    root.querySelector("[data-show-new]")?.addEventListener("click", (e) => {
      reset();
      form.elements.sort.value = "new";
      update();
      const banner = e.target.closest(".fresh-banner");
      banner.classList.add("is-leaving");
      banner.addEventListener("animationend", () => banner.remove(), { once: true });
      out.querySelector(".tag-card")?.querySelector(".tag-card__link")?.focus({ preventScroll: true });
    });
    if (query.area) root.querySelector(`.filter-chip input[value="${query.area}"]`)?.closest("label").scrollIntoView({ inline: "center", block: "nearest" });
    if (store.novelty.markSeen()) setTimeout(clearNewBadges, 900);
  },
};
