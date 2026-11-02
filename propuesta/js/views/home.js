import * as store from "../store.js";
import { areas, stages } from "../data.js";
import { esc, icon, challengeTag, ideaRow, shortDate, daysUntil, plural, areaChip, stagger } from "../ui.js";

export function currentStageIndex() {
  const t = store.today();
  const idx = stages.findIndex((s) => t <= s.to);
  return idx === -1 ? stages.length - 1 : idx;
}

export function stageStrip({ withDates = false } = {}) {
  const current = currentStageIndex();
  return `<ol class="stages">
    ${stages.map((s, i) => `<li class="stage${i < current ? " is-done" : ""}${i === current ? " is-current" : ""}"${i === current ? ' aria-current="step"' : ""} style="--i:${i}">
      <span class="stage__mark" aria-hidden="true">${i < current ? icon("check") : i === current ? icon("spark") : ""}</span>
      <span class="stage__name">${s.name}</span>
      ${withDates ? `<span class="stage__date">${s.from === s.to ? shortDate(s.from) : `${shortDate(s.from)} – ${shortDate(s.to)}`}</span>` : ""}
    </li>`).join("")}
  </ol>`;
}

function stageCard() {
  const s = stages[currentStageIndex()];
  const days = daysUntil(s.to);
  return `<section class="stage-card" aria-labelledby="stage-title">
    <div class="stage-card__top">
      <p class="kicker">La feria va en</p>
      <a class="link-quiet" href="#/how-it-works">Cómo funciona${icon("chevronRight")}</a>
    </div>
    <h2 class="stage-card__title" id="stage-title">${s.name}<span>${esc(s.detail)}</span></h2>
    <p class="stage-card__count"><span class="num" data-count-to="${days}" data-count-delay="300">${days}</span> ${days === 1 ? "día" : "días"} para cerrar · ${shortDate(s.to)}</p>
    ${stageStrip()}
    <p class="stage-card__note">Fechas de ejemplo, por confirmar con el comité.</p>
  </section>`;
}

function newsBanners() {
  const fresh = store.novelty.unseen();
  const top = store.trending.challenges()[0];
  if (!fresh.length && !top) return "";
  const newest = fresh[0];
  const newCard = newest
    ? `<a class="news news--new animate-tile-in" style="${stagger(0)}" href="#/challenges?sort=new">
        <span class="news__icon" aria-hidden="true">${icon("spark")}</span>
        <span class="news__body">
          <span class="news__kicker">${fresh.length === 1 ? "Reto nuevo" : `${fresh.length} retos nuevos`} desde tu última visita</span>
          <strong class="news__title">${esc(newest.title)}</strong>
          <span class="news__meta">${areaChip(newest.areaId)}${fresh.length > 1 ? `<span>y ${fresh.length - 1} más</span>` : ""}</span>
        </span>
        <span class="news__go" aria-hidden="true">${icon("arrowRight")}</span>
      </a>`
    : "";
  const reason = top ? store.trending.reason(top.c) : null;
  const hotCard = top
    ? `<a class="news news--hot animate-tile-in" style="${stagger(1)}" href="#/challenges/${top.c.id}">
        <span class="news__icon" aria-hidden="true">${icon("flame")}</span>
        <span class="news__body">
          <span class="news__kicker">En tendencia · ${reason.label}</span>
          <strong class="news__title">${esc(top.c.title)}</strong>
          <span class="news__meta">${areaChip(top.c.areaId)}<span>${plural(top.h.supports, "avivada", "avivadas")} · ${plural(top.h.ideas, "chispa", "chispas")}</span></span>
        </span>
        <span class="news__go" aria-hidden="true">${icon("arrowRight")}</span>
      </a>`
    : "";
  return `<section class="news-row" aria-label="Novedades">${newCard}${hotCard}</section>`;
}

function myActivity(user) {
  const mine = store.ideas.byAuthor(user.id);
  const given = store.supports.mine().length;
  const received = mine.reduce((sum, i) => sum + store.supports.count(i), 0);
  if (mine.length === 0) {
    return `<section class="panel panel--spark">
      <h2 class="h4">Aún no echas tu primera chispa</h2>
      <p class="muted">Elige un reto de tu área o de cualquier otra. Una idea sencilla también cuenta.</p>
      <a class="btn btn--spark" href="#/propose">${icon("plus")}Proponer una chispa</a>
      ${given ? `<p class="panel__foot">Has avivado ${plural(given, "chispa", "chispas")}.</p>` : ""}
    </section>`;
  }
  return `<section class="panel">
    <h2 class="h4">Tu actividad</h2>
    <dl class="stat-row">
      <div><dt>Propuestas</dt><dd class="num" data-count-to="${mine.length}">${mine.length}</dd></div>
      <div><dt>Avivadas recibidas</dt><dd class="num" data-count-to="${received}">${received}</dd></div>
      <div><dt>Avivaste</dt><dd class="num" data-count-to="${given}">${given}</dd></div>
    </dl>
    <a class="btn btn--ghost btn--block" href="#/my-ideas">Ver mis chispas${icon("arrowRight")}</a>
  </section>`;
}

function areaStrip() {
  const all = store.challenges.all();
  return `<ul class="area-strip" role="list">
    ${areas.map((a, i) => {
      const n = all.filter((c) => c.areaId === a.id && c.status === "open").length;
      return `<li class="animate-row-in" style="${stagger(i + 2)}"><a class="area-tile" data-area="${a.id}" href="#/challenges?area=${a.id}">
        <span class="area-tile__count num">${n}</span>
        <span class="area-tile__name">${a.name}</span>
      </a></li>`;
    }).join("")}
  </ul>`;
}

export default {
  title: "Inicio",
  render() {
    const user = store.session();
    const open = store.challenges.all().filter((c) => c.status === "open");
    const needIdeas = [...open]
      .sort((a, b) => store.ideas.byChallenge(a.id).length - store.ideas.byChallenge(b.id).length)
      .slice(0, 3);
    const hot = store.ideas.all()
      .filter((i) => i.status !== "archived")
      .sort((a, b) => store.supports.count(b) - store.supports.count(a))
      .slice(0, 4);
    const ownArea = open.filter((c) => c.areaId === user.areaId).length;
    const area = store.areaById(user.areaId);

    return `<div class="wrap">
      <section class="home-head">
        <div class="home-head__greet">
          <p class="kicker">Hola, ${esc(user.name.split(" ")[0])}</p>
          <h1 class="display display--home">Hay <span class="hl">${plural(open.length, "reto abierto", "retos abiertos")}</span> esperando tu idea.</h1>
          <p class="lede">${ownArea ? `${plural(ownArea, "es", "son")} de ${esc(area.name)}, tu área. ` : ""}Nadie conoce mejor un problema que quien lo vive todos los días.</p>
          <div class="btn-row">
            <a class="btn btn--lg" href="#/challenges">Explorar retos</a>
            <a class="btn btn--ghost btn--lg" href="#/propose">${icon("plus")}Proponer chispa</a>
          </div>
        </div>
        ${stageCard()}
      </section>

      ${newsBanners()}

      <section class="section">
        <div class="section__head">
          <h2 class="h2">Retos que necesitan ideas</h2>
          <a class="link-quiet" href="#/challenges?sort=fewest">Ver todos${icon("chevronRight")}</a>
        </div>
        <div class="tag-grid">${needIdeas.map((c, i) => challengeTag(c, { index: i })).join("")}</div>
      </section>

      <div class="home-split">
        <section class="section">
          <div class="section__head">
            <h2 class="h2">Lo más avivado</h2>
          </div>
          <div class="idea-list">${hot.map((idea, i) => ideaRow(idea, { showChallenge: true, index: i })).join("")}</div>
        </section>
        <aside class="home-aside">
          ${myActivity(user)}
          <section class="panel">
            <h2 class="h4">Retos por área</h2>
            ${areaStrip()}
          </section>
        </aside>
      </div>
    </div>`;
  },
};
