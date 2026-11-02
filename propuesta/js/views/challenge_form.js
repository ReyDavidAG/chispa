import * as store from "../store.js";
import { areas, solutionTypes, stages } from "../data.js";
import { esc, icon, challengeTag, toast } from "../ui.js";

const fields = [
  { id: "title", label: "¿Cuál es el problema?", hint: "Una frase. Cuenta el problema, no la solución.", min: 12, max: 110, kind: "input", ph: "Ej. Las órdenes de mantenimiento se pierden entre papel y WhatsApp" },
  { id: "summary", label: "En corto, ¿qué está pasando?", hint: "Aparece en la tarjeta del reto.", min: 20, max: 200, kind: "textarea", rows: 2 },
  { id: "problem", label: "Cuéntalo con detalle", hint: "Cómo se hace hoy y dónde se atora.", min: 40, kind: "textarea", rows: 5 },
  { id: "affects", label: "¿A quién afecta?", min: 8, kind: "input", ph: "Puestos, turnos o áreas" },
  { id: "frequency", label: "¿Qué tan seguido pasa?", min: 4, kind: "input", ph: "Ej. unas 40 veces por semana" },
  { id: "tried", label: "¿Qué ya se intentó?", hint: "Si no se ha intentado nada, dilo.", min: 4, kind: "textarea", rows: 3 },
  { id: "success", label: "¿Cómo sabremos que se resolvió?", hint: "Lo que tendría que pasar para decir “listo”.", min: 15, kind: "textarea", rows: 3 },
  { id: "constraints", label: "¿Qué hay que tomar en cuenta?", optional: true, kind: "textarea", rows: 2, ph: "Señal, horarios, normas, presupuesto…" },
];

function validate(data) {
  const e = {};
  for (const f of fields) {
    const v = (data[f.id] ?? "").trim();
    if (f.optional && !v) continue;
    if (v.length < f.min) e[f.id] = v ? "Cuéntalo un poco más." : "Este dato hace falta.";
    else if (f.max && v.length > f.max) e[f.id] = `Sobran ${v.length - f.max} caracteres.`;
  }
  if (!data.types.length) e.types = "Elige al menos un tipo.";
  if (!data.areaId) e.areaId = "Elige el área.";
  return e;
}

function departmentOptions(areaId) {
  const list = areaId ? store.departmentsOf(areaId) : [];
  return `<option value="">${areaId ? "Toda el área" : "Primero elige el área"}</option>${list.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join("")}`;
}

function preview(data) {
  return challengeTag({
    id: "RET-nuevo",
    areaId: data.areaId || "produccion",
    departmentId: data.departmentId || null,
    status: data.status,
    title: data.title || "Aquí va el problema en una frase",
    summary: data.summary || "Y aquí el resumen corto que verá la gente en la lista de retos.",
    closesAt: data.closesAt,
    types: data.types,
  }, { preview: true });
}

export default {
  title: "Nuevo reto",
  render() {
    const user = store.session();
    const lead = user.role === "lead";
    const member = user.role === "member";
    const deadline = stages.find((s) => s.id === "ideas").to;
    const data = { areaId: member || lead ? user.areaId : "", status: member ? "suggested" : "open", types: [], closesAt: deadline };

    return `<div class="wrap">
      <a class="back-link" href="#/challenges">${icon("arrowLeft")}Retos</a>
      <header class="page-head">
        <div>
          <h1 class="h1">${member ? "Sugerir un reto" : "Publicar un reto"}</h1>
          <p class="lede">${member
            ? "Cuéntanos un problema que veas en tu trabajo. El área responsable lo revisa y, si lo acepta, se publica para todos."
            : "Un reto bien contado recibe mejores ideas. Piensa en alguien de otra área que no conoce tu operación."}</p>
        </div>
      </header>
      <div class="form-layout">
        <form class="stack-form" id="challenge-form" novalidate>
          <div class="field">
            <label for="areaId">Área</label>
            <span class="select-wrap select-wrap--block"><select class="select" id="areaId" name="areaId"${lead ? " disabled" : ""}>
              <option value="">Elige un área</option>
              ${areas.map((a) => `<option value="${a.id}"${data.areaId === a.id ? " selected" : ""}>${a.name}</option>`).join("")}
            </select>${icon("chevronDown")}</span>
            ${lead ? `<p class="field__help">Publicas como encargado de esta área.</p>` : ""}
          </div>
          <div class="field">
            <label for="departmentId">Departamento <span class="optional">Opcional</span></label>
            <span class="select-wrap select-wrap--block"><select class="select" id="departmentId" name="departmentId">${departmentOptions(data.areaId)}</select>${icon("chevronDown")}</span>
            <p class="field__help">Si el problema es de un solo departamento, acótalo. Si no, queda para toda el área.</p>
          </div>
          ${fields.map((f) => `<div class="field">
            <div class="field__label-row"><label for="${f.id}">${f.label}${f.optional ? ' <span class="optional">Opcional</span>' : ""}</label>${f.max ? `<span class="counter" id="${f.id}-count">0/${f.max}</span>` : ""}</div>
            ${f.kind === "input"
              ? `<input class="input" id="${f.id}" name="${f.id}" placeholder="${esc(f.ph ?? "")}" aria-describedby="${f.id}-help">`
              : `<textarea class="input textarea" id="${f.id}" name="${f.id}" rows="${f.rows}" placeholder="${esc(f.ph ?? "")}" aria-describedby="${f.id}-help"></textarea>`}
            <p class="field__help" id="${f.id}-help" data-hint="${esc(f.hint ?? "")}">${esc(f.hint ?? "")}</p>
          </div>`).join("")}
          <fieldset class="field">
            <legend>¿Qué tipo de solución imaginas?</legend>
            <p class="field__help" id="types-help" data-hint="Puedes elegir varios. Es una pista, no un límite.">Puedes elegir varios. Es una pista, no un límite.</p>
            <div class="check-chips">
              ${solutionTypes.map((t) => `<label class="check-chip"><input type="checkbox" name="types" value="${t.id}"><span>${icon("check")}${t.name}</span></label>`).join("")}
            </div>
          </fieldset>
          ${member ? "" : `<div class="field">
            <label for="closesAt">Recibe chispas hasta</label>
            <input class="input input--date" type="date" id="closesAt" name="closesAt" value="${deadline}" min="${store.today()}">
          </div>`}
          <div class="wizard-actions">
            <a class="btn btn--ghost" href="#/challenges">Cancelar</a>
            <button class="btn btn--spark btn--lg" type="submit">${member ? `${icon("send")}Enviar sugerencia` : `${icon("check")}Publicar reto`}</button>
          </div>
        </form>
        <aside class="form-preview" aria-label="Vista previa">
          <p class="kicker">Así se verá en la lista</p>
          <div id="tag-preview">${preview(data)}</div>
          <p class="muted small">${member ? "Se publica cuando el área lo acepte." : "Se publica en cuanto lo envíes."}</p>
        </aside>
      </div>
    </div>`;
  },
  bind(root) {
    const user = store.session();
    const form = root.querySelector("#challenge-form");
    const out = root.querySelector("#tag-preview");
    const read = () => {
      const d = new FormData(form);
      const data = Object.fromEntries(fields.map((f) => [f.id, d.get(f.id) ?? ""]));
      data.areaId = user.role === "lead" ? user.areaId : d.get("areaId");
      data.departmentId = d.get("departmentId") || null;
      data.types = d.getAll("types");
      data.closesAt = d.get("closesAt") || stages.find((s) => s.id === "ideas").to;
      data.status = user.role === "member" ? "suggested" : "open";
      return data;
    };
    const showErrors = (errors) => {
      for (const f of [...fields, { id: "types" }]) {
        const help = root.querySelector(`#${f.id}-help`);
        const input = form.elements[f.id];
        const msg = errors[f.id];
        if (help) {
          help.textContent = msg ?? help.dataset.hint;
          help.classList.toggle("is-error", Boolean(msg));
        }
        if (input && !(input instanceof RadioNodeList)) msg ? input.setAttribute("aria-invalid", "true") : input.removeAttribute("aria-invalid");
      }
      const area = form.elements.areaId;
      errors.areaId ? area.setAttribute("aria-invalid", "true") : area.removeAttribute("aria-invalid");
    };
    let tried = false;
    form.addEventListener("input", (e) => {
      const f = fields.find((x) => x.id === e.target.id);
      const count = root.querySelector(`#${e.target.id}-count`);
      if (f?.max && count) {
        count.textContent = `${e.target.value.length}/${f.max}`;
        count.classList.toggle("is-over", e.target.value.length > f.max);
      }
      out.innerHTML = preview(read());
      if (tried) showErrors(validate(read()));
    });
    form.addEventListener("change", (e) => {
      if (e.target.name === "areaId") form.elements.departmentId.innerHTML = departmentOptions(e.target.value);
      out.innerHTML = preview(read());
      if (tried) showErrors(validate(read()));
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      tried = true;
      const data = read();
      const errors = validate(data);
      showErrors(errors);
      const first = Object.keys(errors)[0];
      if (first) {
        (first === "types" ? form.querySelector('[name="types"]') : form.elements[first])?.focus();
        return;
      }
      const record = store.challenges.create({ ...data, ownerId: user.id });
      toast(data.status === "suggested" ? "Sugerencia enviada al área" : "Reto publicado");
      location.hash = data.status === "suggested" ? "#/challenges" : `#/challenges/${record.id}`;
    });
  },
};
