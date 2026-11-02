import * as store from "../store.js";
import { solutionTypes, benefits } from "../data.js";
import { esc, icon, areaChip, typeName, closesLabel } from "../ui.js";

const steps = ["Reto", "Tu idea", "Cómo funciona", "Impacto", "Revisar"];
const blank = { challengeId: "", title: "", summary: "", how: "", type: "", needs: "", benefits: [], estimate: "", anonymous: false, wantsToJoin: false };

let form = { ...blank };
let step = 0;
let shownStep = null;

const fieldError = (id, msg) => `<p class="field__help is-error" id="${id}-error">${msg}</p>`;

function counter(id, value, max) {
  return `<span class="counter${value.length > max ? " is-over" : ""}" id="${id}-count" aria-live="polite">${value.length}/${max}</span>`;
}

function contextCard() {
  const c = store.challenges.byId(form.challengeId);
  if (!c) return `<div class="context-card is-empty"><p class="muted">Elige el reto para ver aquí su contexto mientras escribes.</p></div>`;
  return `<div class="context-card" data-area="${c.areaId}">
    <p class="kicker">Estás respondiendo a</p>
    <div class="context-card__tag"><span class="folio">${c.id}</span>${areaChip(c.areaId)}</div>
    <h2 class="h4">${esc(c.title)}</h2>
    <p class="muted">${esc(c.summary)}</p>
    <div class="context-card__goal"><p class="kicker">Se resuelve cuando</p><p>${esc(c.success)}</p></div>
    <a class="link-quiet" href="#/challenges/${c.id}" target="_blank" rel="noopener">Ver el reto completo${icon("chevronRight")}</a>
  </div>`;
}

const stepViews = [
  (errors) => {
    const open = store.challenges.all().filter((c) => c.status === "open");
    return `<fieldset class="step-fieldset">
      <legend class="h3">¿Qué reto quieres resolver?</legend>
      <p class="muted">Los retos abiertos de todas las áreas. No tiene que ser de la tuya.</p>
      ${errors.challengeId ? fieldError("challengeId", errors.challengeId) : ""}
      <div class="reto-picker">
        ${open.map((c) => `<label class="reto-option" data-area="${c.areaId}">
          <input type="radio" name="challengeId" value="${c.id}"${form.challengeId === c.id ? " checked" : ""}>
          <span class="reto-option__body">
            <span class="reto-option__top"><span class="folio">${c.id}</span>${areaChip(c.areaId)}</span>
            <strong>${esc(c.title)}</strong>
            <span class="muted">${closesLabel(c.closesAt)}</span>
          </span>
          <span class="choice__check" aria-hidden="true">${icon("check")}</span>
        </label>`).join("")}
      </div>
      <p class="muted small">¿Ves un problema que no está publicado? <a href="#/challenges/new">Sugiere un reto</a>.</p>
    </fieldset>`;
  },
  (errors) => `<div class="step-fieldset">
    <h2 class="h3">Cuéntala en corto</h2>
    <p class="muted">Como se la contarías a un compañero en el comedor.</p>
    <div class="field">
      <div class="field__label-row"><label for="title">Nombre de tu idea</label>${counter("title", form.title, 90)}</div>
      <input class="input" id="title" name="title" maxlength="120" value="${esc(form.title)}" placeholder="Ej. Reportar la falla con un QR en cada equipo"${errors.title ? ' aria-invalid="true" aria-describedby="title-error"' : ""}>
      ${errors.title ? fieldError("title", errors.title) : ""}
    </div>
    <div class="field">
      <div class="field__label-row"><label for="summary">En una o dos frases, ¿qué propones?</label>${counter("summary", form.summary, 280)}</div>
      <textarea class="input textarea" id="summary" name="summary" rows="4" placeholder="Qué cambia y para quién."${errors.summary ? ' aria-invalid="true" aria-describedby="summary-error"' : ""}>${esc(form.summary)}</textarea>
      ${errors.summary ? fieldError("summary", errors.summary) : ""}
    </div>
  </div>`,
  (errors) => `<div class="step-fieldset">
    <h2 class="h3">¿Cómo funcionaría?</h2>
    <div class="field">
      <label for="how">Paso a paso, ¿qué pasaría?</label>
      <textarea class="input textarea" id="how" name="how" rows="5" placeholder="Quién hace qué, en qué momento y con qué."${errors.how ? ' aria-invalid="true" aria-describedby="how-error"' : ""}>${esc(form.how)}</textarea>
      ${errors.how ? fieldError("how", errors.how) : `<p class="field__help">Si es un sistema, describe lo que verías en la pantalla.</p>`}
    </div>
    <fieldset class="field">
      <legend>¿Qué tipo de solución es?</legend>
      ${errors.type ? fieldError("type", errors.type) : ""}
      <div class="choice-grid">
        ${solutionTypes.map((t) => `<label class="choice">
          <input type="radio" name="type" value="${t.id}"${form.type === t.id ? " checked" : ""}>
          <span class="choice__body"><strong>${t.name}</strong><span>${t.hint}</span></span>
          <span class="choice__check" aria-hidden="true">${icon("check")}</span>
        </label>`).join("")}
      </div>
    </fieldset>
    <div class="field">
      <label for="needs">¿Qué se necesitaría? <span class="optional">Opcional</span></label>
      <input class="input" id="needs" name="needs" value="${esc(form.needs)}" placeholder="Ej. etiquetas QR, una pantalla web">
      <p class="field__help">Sepáralo con comas.</p>
    </div>
  </div>`,
  (errors) => `<div class="step-fieldset">
    <h2 class="h3">¿Qué mejoraría?</h2>
    <fieldset class="field">
      <legend>Elige uno o más</legend>
      ${errors.benefits ? fieldError("benefits", errors.benefits) : ""}
      <div class="check-chips">
        ${benefits.map((b) => `<label class="check-chip"><input type="checkbox" name="benefits" value="${b.id}"${form.benefits.includes(b.id) ? " checked" : ""}><span>${icon("check")}${b.name}</span></label>`).join("")}
      </div>
    </fieldset>
    <div class="field">
      <label for="estimate">¿Cuánto, más o menos? <span class="optional">Opcional</span></label>
      <textarea class="input textarea" id="estimate" name="estimate" rows="3" placeholder="Ej. dejaríamos de capturar dos horas al día.">${esc(form.estimate)}</textarea>
      <p class="field__help">Un cálculo a ojo está bien. El comité lo afina.</p>
    </div>
    <div class="toggles">
      <label class="switch"><input type="checkbox" role="switch" name="wantsToJoin"${form.wantsToJoin ? " checked" : ""}><span class="switch__track" aria-hidden="true"></span><span class="switch__text"><strong>Quiero participar si se elige</strong><span>Te buscaríamos para el equipo que la lleve a cabo.</span></span></label>
      <label class="switch"><input type="checkbox" role="switch" name="anonymous"${form.anonymous ? " checked" : ""}><span class="switch__track" aria-hidden="true"></span><span class="switch__text"><strong>Enviar como anónimo</strong><span>Tu nombre no se muestra. El comité sí lo ve por si necesita contactarte.</span></span></label>
    </div>
  </div>`,
  () => {
    const user = store.session();
    return `<div class="step-fieldset">
      <h2 class="h3">Así se verá tu chispa</h2>
      <article class="preview-idea">
        <div class="idea-row__top"><span class="folio">CHI-nueva</span><span class="type-tag">${esc(typeName(form.type))}</span></div>
        <h3 class="h3">${esc(form.title)}</h3>
        <p>${esc(form.summary)}</p>
        <dl class="preview-idea__list">
          <div><dt>Cómo funciona</dt><dd>${esc(form.how)}</dd></div>
          ${form.needs ? `<div><dt>Se necesitaría</dt><dd>${esc(form.needs)}</dd></div>` : ""}
          <div><dt>Mejora</dt><dd>${form.benefits.map((b) => benefits.find((x) => x.id === b).name).join(" · ")}</dd></div>
          ${form.estimate ? `<div><dt>Cuánto</dt><dd>${esc(form.estimate)}</dd></div>` : ""}
          <div><dt>Firma</dt><dd>${form.anonymous ? "Anónimo" : esc(user.name)}${form.wantsToJoin ? " · quiere participar" : ""}</dd></div>
        </dl>
      </article>
      <p class="muted small">Al enviarla, la ve el responsable del reto y cualquiera puede avivarla o comentarla.</p>
    </div>`;
  },
];

function validate(s) {
  const e = {};
  if (s === 0 && !form.challengeId) e.challengeId = "Elige un reto para continuar.";
  if (s === 1) {
    if (form.title.trim().length < 8) e.title = "Ponle un nombre de al menos 8 letras.";
    else if (form.title.length > 90) e.title = `Sobran ${form.title.length - 90} caracteres.`;
    if (form.summary.trim().length < 20) e.summary = "Cuéntala en al menos una frase completa.";
    else if (form.summary.length > 280) e.summary = `Sobran ${form.summary.length - 280} caracteres.`;
  }
  if (s === 2) {
    if (form.how.trim().length < 20) e.how = "Describe un poco más cómo funcionaría.";
    if (!form.type) e.type = "Elige el tipo que más se parezca.";
  }
  if (s === 3 && !form.benefits.length) e.benefits = "Elige al menos una mejora.";
  return e;
}

function progress() {
  return `<ol class="wizard-progress" aria-label="Pasos">
    ${steps.map((name, i) => `<li class="${i < step ? "is-done" : ""}${i === step ? " is-current" : ""}"${i === step ? ' aria-current="step"' : ""}><span class="wizard-progress__bar" aria-hidden="true"></span><span class="wizard-progress__name">${name}</span></li>`).join("")}
  </ol>`;
}

function stepMarkup(errors = {}) {
  const last = step === steps.length - 1;
  return `${progress()}
    <p class="step-count">Paso ${step + 1} de ${steps.length}</p>
    <form class="wizard-form" id="wizard-form" novalidate>
      ${stepViews[step](errors)}
      <div class="wizard-actions">
        ${step > 0 ? `<button type="button" class="btn btn--ghost" data-nav="back">${icon("arrowLeft")}Atrás</button>` : `<a class="btn btn--ghost" href="#/challenges">Cancelar</a>`}
        <button type="submit" class="btn ${last ? "btn--spark" : ""} btn--lg">${last ? `${icon("send")}Enviar mi chispa` : `Continuar${icon("arrowRight")}`}</button>
      </div>
      <p class="draft-note" id="draft-note">${icon("check")}El borrador se guarda solo en este equipo.</p>
    </form>`;
}

function success(idea) {
  const c = store.challenges.byId(idea.challengeId);
  return `<section class="success">
    <span class="success__mark" aria-hidden="true">${icon("spark")}<span class="rays">${"<i></i>".repeat(8)}</span></span>
    <p class="folio">${idea.id}</p>
    <h1 class="h1" tabindex="-1">Tu chispa ya está en el reto</h1>
    <p class="lede">La ve ${esc(store.personById(c.ownerId)?.name)}, responsable de ${esc(store.areaById(c.areaId).name)}. Te avisaremos aquí cuando cambie de estado.</p>
    <ol class="next-steps animate-tile-in" style="--i:4">
      <li><strong>Recibida.</strong> Ya cualquiera puede leerla, avivarla y comentarla.</li>
      <li><strong>En revisión.</strong> El área y el comité la califican con la rúbrica.</li>
      <li><strong>Seleccionada.</strong> Si queda entre las finalistas, se presenta en la feria.</li>
    </ol>
    <div class="btn-row btn-row--center">
      <a class="btn btn--lg" href="#/ideas/${idea.id}">Ver mi chispa</a>
      <a class="btn btn--ghost btn--lg" href="#/challenges">Ver otros retos</a>
    </div>
  </section>`;
}

export default {
  title: "Proponer chispa",
  render(_, query) {
    shownStep = null;
    const saved = store.draft.get();
    form = { ...blank, ...(saved ?? {}) };
    if (query.challenge && store.challenges.byId(query.challenge)?.status === "open") {
      if (form.challengeId !== query.challenge) form = { ...blank, challengeId: query.challenge };
      step = Math.max(1, saved && saved.challengeId === query.challenge ? saved._step ?? 1 : 1);
    } else {
      step = saved?._step ?? 0;
    }
    return `<div class="wrap">
      <div class="wizard">
        <div class="wizard__main">
          <h1 class="sr-only">Proponer una chispa</h1>
          <div id="wizard-step">${stepMarkup()}</div>
        </div>
        <aside class="wizard__aside" id="wizard-context">${contextCard()}</aside>
      </div>
    </div>`;
  },
  bind(root) {
    const host = root.querySelector("#wizard-step");
    const ctx = root.querySelector("#wizard-context");

    const collect = () => {
      const f = host.querySelector("#wizard-form");
      if (!f) return;
      const d = new FormData(f);
      for (const key of ["challengeId", "title", "summary", "how", "type", "needs", "estimate"]) {
        if (f.elements[key]) form[key] = d.get(key) ?? "";
      }
      if (f.querySelector('[name="benefits"]')) form.benefits = d.getAll("benefits");
      if (f.elements.anonymous) form.anonymous = f.elements.anonymous.checked;
      if (f.elements.wantsToJoin) form.wantsToJoin = f.elements.wantsToJoin.checked;
      store.draft.set({ ...form, _step: step });
    };

    const mount = (errors = {}, focusFirst = true) => {
      host.innerHTML = stepMarkup(errors);
      const moved = shownStep !== null && shownStep !== step;
      if (moved || shownStep === null) {
        const panel = host.querySelector(".step-fieldset");
        panel.style.setProperty("--dir", shownStep === null || step > shownStep ? 1 : -1);
        panel.classList.add("animate-panel-in");
      }
      if (!moved && shownStep !== null) host.querySelectorAll('[aria-invalid="true"], .step-fieldset > .field__help.is-error').forEach((el) => el.classList.add("animate-nudge"));
      shownStep = step;
      ctx.innerHTML = contextCard();
      const f = host.querySelector("#wizard-form");
      const clearFixed = () => {
        const now = validate(step);
        for (const key of ["challengeId", "title", "summary", "how", "type", "benefits"]) {
          if (now[key]) continue;
          host.querySelector(`#${key}-error`)?.remove();
          host.querySelector(`#${key}`)?.removeAttribute("aria-invalid");
        }
      };
      f.addEventListener("input", (e) => {
        collect();
        clearFixed();
        const count = host.querySelector(`#${e.target.id}-count`);
        if (count) {
          const max = e.target.id === "title" ? 90 : 280;
          count.textContent = `${e.target.value.length}/${max}`;
          count.classList.toggle("is-over", e.target.value.length > max);
        }
      });
      f.addEventListener("change", (e) => {
        collect();
        clearFixed();
        if (e.target.name === "challengeId") ctx.innerHTML = contextCard();
      });
      f.querySelector('[data-nav="back"]')?.addEventListener("click", () => {
        collect();
        step -= 1;
        store.draft.set({ ...form, _step: step });
        mount();
      });
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        collect();
        const errs = validate(step);
        if (Object.keys(errs).length) {
          mount(errs, false);
          host.querySelector('[aria-invalid="true"], .is-error')?.closest(".field, fieldset")?.querySelector("input, textarea")?.focus();
          return;
        }
        if (step < steps.length - 1) {
          step += 1;
          store.draft.set({ ...form, _step: step });
          mount();
          return;
        }
        const user = store.session();
        const idea = store.ideas.create({
          challengeId: form.challengeId,
          authorId: user.id,
          anonymous: form.anonymous,
          title: form.title.trim(),
          summary: form.summary.trim(),
          how: form.how.trim(),
          type: form.type,
          needs: form.needs.split(",").map((s) => s.trim()).filter(Boolean),
          benefits: form.benefits,
          estimate: form.estimate.trim(),
          wantsToJoin: form.wantsToJoin,
        });
        form = { ...blank };
        step = 0;
        root.querySelector(".wizard").outerHTML = success(idea);
        window.scrollTo(0, 0);
        root.querySelector(".success h1")?.focus();
      });
      if (focusFirst) host.querySelector(".step-fieldset input:not([type=radio]):not([type=checkbox]), .step-fieldset textarea")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    };

    mount({}, step > 0);
  },
};
