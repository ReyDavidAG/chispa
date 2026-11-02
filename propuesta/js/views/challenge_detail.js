import * as store from "../store.js";
import { orgLine, newFlag, hotFlag, esc, icon, areaChip, statusPill, avatar, shortDate, closesLabel, ideaRow, emptyState, typeName, plural } from "../ui.js";

const blocks = [
  ["problem", "El problema"],
  ["affects", "A quién afecta"],
  ["frequency", "Qué tan seguido pasa"],
  ["tried", "Qué ya se intentó"],
  ["success", "Cómo sabremos que se resolvió"],
  ["constraints", "Hay que tomar en cuenta"],
];

function ideasList(list, sort) {
  if (!list.length) {
    return emptyState("Todavía nadie propone nada", "Sé la primera chispa de este reto. Una idea a medias también ayuda: alguien más la puede completar.");
  }
  const sorted = [...list].sort(sort === "recientes"
    ? (a, b) => b.createdAt.localeCompare(a.createdAt)
    : (a, b) => store.supports.count(b) - store.supports.count(a));
  return sorted.map((idea, i) => ideaRow(idea, { index: i })).join("");
}

export default {
  title: ([id]) => store.challenges.byId(id)?.title ?? "Reto",
  render([id]) {
    const c = store.challenges.byId(id);
    if (!c) return null;
    const owner = store.personById(c.ownerId);
    const list = store.ideas.byChallenge(c.id);
    const heat = list.reduce((s, i) => s + store.supports.count(i), 0);
    const canPropose = c.status === "open";

    return `<div class="wrap">
      <a class="back-link" href="#/challenges">${icon("arrowLeft")}Retos</a>
      <article class="reto" data-area="${c.areaId}">
        <header class="reto__head">
          <div class="reto__tagline">
            <span class="tag-hole" aria-hidden="true"></span>
            <span class="folio">${c.id}</span>
            ${statusPill("challenge", c.status)}
            ${store.novelty.isNew(c) ? newFlag() : ""}${store.trending.isHotChallenge(c) ? hotFlag(`En tendencia · ${store.trending.reason(c).label}`) : ""}
            ${orgLine(c, true)}
          </div>
          <h1 class="h1 reto__title">${esc(c.title)}</h1>
          <p class="lede">${esc(c.summary)}</p>
          <div class="reto__meta">
            <span class="author">${avatar(owner)}<span><strong>${esc(owner?.name)}</strong> · responsable del reto</span></span>
            <span class="meta">${icon("calendar")}Publicado el ${shortDate(c.openedAt)}</span>
            <span class="meta">${icon("clock")}${closesLabel(c.closesAt)}</span>
          </div>
        </header>

        <aside class="reto__aside">
          <div class="cta-card">
            <dl class="stat-row stat-row--tight">
              <div><dt>Chispas</dt><dd class="num">${list.length}</dd></div>
              <div><dt>Avivadas</dt><dd class="num">${heat}</dd></div>
            </dl>
            ${canPropose
              ? `<a class="btn btn--spark btn--block btn--lg" href="#/propose?challenge=${c.id}">${icon("plus")}Proponer mi chispa</a>
                 <p class="cta-card__hint">Toma unos 3 minutos. Puedes mandarla anónima.</p>`
              : `<p class="cta-card__closed">${icon("info")}Este reto ya no recibe chispas. Puedes leer y avivar las que hay.</p>`}
            <div class="cta-card__types">
              <p class="kicker">Soluciones que se esperan</p>
              <ul class="type-list" role="list">${c.types.map((t) => `<li class="type-tag">${esc(typeName(t))}</li>`).join("")}</ul>
              <p class="cta-card__hint">No es obligatorio: cualquier buena idea cuenta.</p>
            </div>
          </div>
        </aside>

        <div class="reto__body">
          ${blocks.filter(([k]) => c[k]).map(([k, label]) => `<section class="reto__block${k === "success" ? " is-goal" : ""}">
            <h2 class="reto__label">${label}</h2>
            <p>${esc(c[k])}</p>
          </section>`).join("")}
        </div>
      </article>

      <section class="section" aria-labelledby="ideas-title">
        <div class="section__head">
          <h2 class="h2" id="ideas-title">${plural(list.length, "chispa", "chispas")} para este reto</h2>
          ${list.length > 1 ? `<div class="segmented segmented--sm" role="radiogroup" aria-label="Ordenar chispas">
            <label class="segmented__item"><input type="radio" name="idea-sort" value="avivadas" checked><span>Más avivadas</span></label>
            <label class="segmented__item"><input type="radio" name="idea-sort" value="recientes"><span>Recientes</span></label>
          </div>` : ""}
        </div>
        <div class="idea-list" id="idea-list">${ideasList(list, "avivadas")}</div>
      </section>
    </div>`;
  },
  bind(root, [id]) {
    root.querySelectorAll('[name="idea-sort"]').forEach((r) =>
      r.addEventListener("change", () => {
        root.querySelector("#idea-list").innerHTML = ideasList(store.ideas.byChallenge(id), r.value);
      }),
    );
  },
};
