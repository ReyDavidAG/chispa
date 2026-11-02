import * as store from "../store.js";
import { benefits, ideaStatus, ideaSteps, rubric } from "../data.js";
import { esc, icon, statusPill, typeName, authorLine, avatar, shortDate, supportButton, areaChip, toast, plural } from "../ui.js";

function track(status) {
  const current = ideaStatus[status].step;
  if (current < 0) return `<p class="track-archived">${icon("info")}Esta chispa se archivó. Sigue visible para consulta.</p>`;
  return `<ol class="track" aria-label="Avance">
    ${ideaSteps.map((name, i) => `<li class="${i < current ? "is-done" : ""}${i === current ? " is-current" : ""}" style="--i:${i}"${i === current ? ' aria-current="step"' : ""}>
      <span class="track__dot" aria-hidden="true">${i < current ? icon("check") : ""}</span><span>${name}</span>
    </li>`).join("")}
  </ol>`;
}

function commentsBlock(idea) {
  const list = store.comments.byIdea(idea.id);
  return `<section class="comments" aria-labelledby="comments-title">
    <h2 class="h3" id="comments-title">${plural(list.length, "comentario", "comentarios")}</h2>
    <ul class="comment-list" role="list">
      ${list.map((c) => {
        const p = store.personById(c.authorId);
        return `<li class="comment">${avatar(p)}<div><p class="comment__who"><strong>${esc(p?.name ?? "Colaborador")}</strong><span>${shortDate(c.createdAt)}</span></p><p>${esc(c.text)}</p></div></li>`;
      }).join("")}
    </ul>
    <form class="comment-form" id="comment-form" novalidate>
      <label class="sr-only" for="comment">Escribe un comentario</label>
      <textarea class="input textarea" id="comment" name="comment" rows="2" placeholder="Suma algo a la idea: una duda, un ajuste, un dato."></textarea>
      <button class="btn" type="submit">${icon("send")}Comentar</button>
    </form>
  </section>`;
}

function canEvaluate(user, challenge) {
  return user.role === "committee" || (user.role === "lead" && user.areaId === challenge.areaId);
}

function evaluationPanel(idea) {
  const saved = store.evaluations.get(idea.id) ?? Object.fromEntries(rubric.map((r) => [r.id, 3]));
  const total = rubric.reduce((s, r) => s + Number(saved[r.id]), 0);
  return `<section class="eval-panel" aria-labelledby="eval-title">
    <div class="eval-panel__head">
      <h2 class="h4" id="eval-title">${icon("sliders")}Evaluación</h2>
      <p class="eval-score"><span class="num" id="eval-total">${total}</span><span>/ ${rubric.length * 5}</span></p>
    </div>
    <form id="eval-form" class="eval-form">
      ${rubric.map((r) => `<div class="range-field">
        <div class="range-field__top"><label for="r-${r.id}">${r.name}</label><output class="num" for="r-${r.id}" id="o-${r.id}">${saved[r.id]}</output></div>
        <input type="range" id="r-${r.id}" name="${r.id}" min="1" max="5" step="1" value="${saved[r.id]}" aria-describedby="h-${r.id}">
        <p class="field__help" id="h-${r.id}">${r.hint}</p>
      </div>`).join("")}
      <div class="field">
        <label for="status">Estado</label>
        <span class="select-wrap select-wrap--block"><select class="select" id="status" name="status">
          ${Object.entries(ideaStatus).map(([id, s]) => `<option value="${id}"${idea.status === id ? " selected" : ""}>${s.label}</option>`).join("")}
        </select>${icon("chevronDown")}</span>
      </div>
      <button type="submit" class="btn btn--block">Guardar evaluación</button>
    </form>
    <button type="button" class="btn btn--ghost btn--block" data-action="show-requirement">${icon("file")}${idea.type === "software" ? "Generar ficha de requerimiento" : "Generar ficha de proyecto"}</button>
  </section>`;
}

export function requirementText(idea, c) {
  const owner = store.personById(c.ownerId);
  const author = idea.anonymous ? "Anónimo (el comité tiene el contacto)" : store.personById(idea.authorId)?.name;
  const score = store.evaluations.get(idea.id);
  const total = score ? rubric.reduce((s, r) => s + Number(score[r.id]), 0) : null;
  return [
    ["Folio", `REQ-${idea.id}`],
    ["Título", idea.title],
    ["Origen", `${c.id} · ${store.areaById(c.areaId).name} · responsable ${owner?.name}`],
    ["Propone", `${author}${idea.wantsToJoin ? " · quiere participar" : ""}`],
    ["Tipo de solución", typeName(idea.type)],
    ["Problema actual", c.problem],
    ["Usuarios afectados", c.affects],
    ["Volumen", c.frequency],
    ["Lo que ya se intentó", c.tried],
    ["Propuesta", `${idea.summary} ${idea.how}`],
    ["Se necesitaría", idea.needs?.length ? idea.needs.join(", ") : "Por definir en el levantamiento"],
    ["Beneficio esperado", `${idea.benefits.map((b) => benefits.find((x) => x.id === b)?.name).join(", ")}${idea.estimate ? `. ${idea.estimate}` : ""}`],
    ["Criterio de éxito", c.success],
    ["Restricciones", c.constraints],
    ["Calificación del comité", total === null ? "Sin evaluar" : `${total} de ${rubric.length * 5}`],
    ["Siguiente paso", "Sesión de levantamiento con el área para validar alcance, usuarios y criterios de aceptación."],
  ];
}

function requirementSheet(idea, c) {
  const rows = requirementText(idea, c);
  return `<section class="req-sheet animate-panel-in" id="req-sheet" aria-labelledby="req-title">
    <header class="req-sheet__head">
      <div>
        <p class="kicker">${idea.type === "software" ? "Ficha de requerimiento" : "Ficha de proyecto"} · borrador</p>
        <h2 class="h3" id="req-title">REQ-${idea.id}</h2>
      </div>
      <button type="button" class="btn btn--ghost btn--sm" data-action="copy-requirement">${icon("copy")}Copiar</button>
    </header>
    <dl class="req-sheet__list">
      ${rows.slice(1).map(([k, v], i) => `<div class="animate-row-in" style="--i:${Math.min(i, 12)}"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}
    </dl>
    <p class="req-sheet__foot">Se arma sola con lo que escribieron el área y quien propuso. Es el punto de partida del levantamiento, no lo sustituye.</p>
  </section>`;
}

export default {
  title: ([id]) => store.ideas.byId(id)?.title ?? "Chispa",
  render([id]) {
    const idea = store.ideas.byId(id);
    if (!idea) return null;
    const c = store.challenges.byId(idea.challengeId);
    const user = store.session();
    const evaluator = canEvaluate(user, c);

    return `<div class="wrap">
      <a class="back-link" href="#/challenges/${c.id}">${icon("arrowLeft")}${c.id} · ${esc(c.title)}</a>
      <div class="idea-layout${evaluator ? " has-aside" : ""}">
        <article class="idea">
          <header class="idea__head">
            <div class="idea-row__top">
              <span class="folio">${idea.id}</span>
              <span id="idea-status">${statusPill("idea", idea.status)}</span>
              <span class="type-tag">${esc(typeName(idea.type))}</span>
            </div>
            <h1 class="h1">${esc(idea.title)}</h1>
            <p class="lede">${esc(idea.summary)}</p>
            <div class="idea__byline">
              <span class="author">${authorLine(idea)}</span>
              <span class="meta">${icon("calendar")}${shortDate(idea.createdAt)}</span>
              ${idea.wantsToJoin ? `<span class="meta meta--ok">${icon("users")}Quiere participar</span>` : ""}
            </div>
            <div class="idea__support">${supportButton(idea, "is-large")}<p class="muted small">Aviva si te gustaría que se hiciera. Ayuda al comité a ver qué importa más.</p></div>
          </header>

          <div id="idea-track">${track(idea.status)}</div>

          <div class="idea__body">
            <section><h2 class="reto__label">Cómo funcionaría</h2><p>${esc(idea.how)}</p></section>
            ${idea.needs?.length ? `<section><h2 class="reto__label">Se necesitaría</h2><ul class="type-list" role="list">${idea.needs.map((n) => `<li class="type-tag">${esc(n)}</li>`).join("")}</ul></section>` : ""}
            <section><h2 class="reto__label">Qué mejora</h2><ul class="type-list" role="list">${idea.benefits.map((b) => `<li class="benefit-tag">${icon("check")}${benefits.find((x) => x.id === b)?.name}</li>`).join("")}</ul>${idea.estimate ? `<p>${esc(idea.estimate)}</p>` : ""}</section>
          </div>

          <a class="reto-link" href="#/challenges/${c.id}" data-area="${c.areaId}">
            <span class="kicker">Responde al reto</span>
            <span class="reto-link__row"><span class="folio">${c.id}</span>${areaChip(c.areaId)}</span>
            <strong>${esc(c.title)}</strong>
          </a>

          <div id="req-host"></div>
          ${commentsBlock(idea)}
        </article>
        ${evaluator ? `<aside class="idea-aside">${evaluationPanel(idea)}</aside>` : ""}
      </div>
    </div>`;
  },
  bind(root, [id]) {
    const idea = store.ideas.byId(id);
    if (!idea) return;
    const c = store.challenges.byId(idea.challengeId);

    const bindComments = () =>
      root.querySelector("#comment-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const field = e.target.comment;
        const text = field.value.trim();
        if (text.length < 2) return field.focus();
        store.comments.add(id, text);
        root.querySelector(".comments").outerHTML = commentsBlock(idea);
        bindComments();
        root.querySelector("#comment").focus();
      });
    bindComments();

    const evalForm = root.querySelector("#eval-form");
    if (evalForm) {
      evalForm.addEventListener("input", () => {
        let total = 0;
        rubric.forEach((r) => {
          const v = evalForm.elements[r.id].value;
          root.querySelector(`#o-${r.id}`).textContent = v;
          total += Number(v);
        });
        const out = root.querySelector("#eval-total");
        if (out.textContent !== String(total)) {
          out.textContent = total;
          out.classList.remove("is-bump");
          void out.offsetWidth;
          out.classList.add("is-bump");
        }
      });
      evalForm.onsubmit = (e) => {
        e.preventDefault();
        const scores = Object.fromEntries(rubric.map((r) => [r.id, Number(evalForm.elements[r.id].value)]));
        store.evaluations.set(id, scores);
        const status = evalForm.elements.status.value;
        store.ideas.setStatus(id, status);
        root.querySelector("#idea-status").innerHTML = statusPill("idea", status);
        root.querySelector("#idea-track").innerHTML = track(status);
        if (root.querySelector("#req-sheet")) root.querySelector("#req-host").innerHTML = requirementSheet(store.ideas.byId(id), c);
        toast("Evaluación guardada");
      };
    }

    root.querySelector('[data-action="show-requirement"]')?.addEventListener("click", () => {
      const host = root.querySelector("#req-host");
      host.innerHTML = requirementSheet(store.ideas.byId(id), c);
      host.querySelector("#req-sheet").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });

    root.querySelector("#req-host").onclick = async (e) => {
      if (!e.target.closest('[data-action="copy-requirement"]')) return;
      const text = requirementText(store.ideas.byId(id), c).map(([k, v]) => `${k}: ${v}`).join("\n");
      try {
        await navigator.clipboard.writeText(text);
        toast("Ficha copiada");
      } catch {
        toast("No se pudo copiar; selecciona el texto a mano");
      }
    };
  },
};
