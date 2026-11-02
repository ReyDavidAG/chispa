import * as store from "../store.js";
import { challenges } from "../data.js";
import { esc, icon, wordmark, avatar, areaChip } from "../ui.js";

const roles = [
  { id: "member", name: "Colaborador", hint: "Ve retos y propone chispas." },
  { id: "lead", name: "Responsable de área", hint: "Publica retos y evalúa." },
  { id: "committee", name: "Comité", hint: "Evalúa todo y arma la feria." },
];

function stack() {
  const picks = [challenges[1], challenges[4], challenges[0]];
  return picks
    .map((c, i) => `<div class="signin-tag" data-area="${c.areaId}" style="--i:${i}">
      <span class="tag-hole" aria-hidden="true"></span>
      <span class="folio">${c.id}</span>
      <p>${esc(c.title)}</p>
    </div>`)
    .join("");
}

function numberStep() {
  return `<form class="signin-form" id="number-form" novalidate>
    <h2 class="h3">Entra con tu número</h2>
    <p class="muted">El mismo de tu gafete o de tu recibo.</p>
    <div class="field">
      <label for="employee-number">Número de trabajador</label>
      <input id="employee-number" name="employeeNumber" class="input input--number" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="00000" aria-describedby="number-help" required>
      <p class="field__help" id="number-help">Mínimo 5 dígitos, sólo números.</p>
    </div>
    <button class="btn btn--block btn--lg" type="submit">Continuar${icon("arrowRight")}</button>
    <p class="signin-note">${icon("info")}<span>Versión de demostración: cualquier número de 5 dígitos o más entra. Más adelante será con tu cuenta de la empresa.</span></p>
  </form>`;
}

function confirmStep(profile) {
  const area = store.areaById(profile.areaId);
  return `<form class="signin-form" id="confirm-form">
    <h2 class="h3">¿Eres tú?</h2>
    <div class="profile-card">
      ${avatar(profile, "is-xl")}
      <div>
        <strong>${esc(profile.name)}</strong>
        <span class="muted">No. ${esc(profile.employeeNumber)}</span>
        ${areaChip(area.id)}
      </div>
    </div>
    <fieldset class="choice-group">
      <legend>Para la demo, entra como</legend>
      ${roles.map((r, i) => `<label class="choice">
        <input type="radio" name="role" value="${r.id}"${i === 0 ? " checked" : ""}>
        <span class="choice__body"><strong>${r.name}</strong><span>${r.hint}</span></span>
        <span class="choice__check" aria-hidden="true">${icon("check")}</span>
      </label>`).join("")}
    </fieldset>
    <button class="btn btn--spark btn--block btn--lg" type="submit">Sí, entrar</button>
    <button class="btn btn--ghost btn--block" type="button" data-step="back">No soy yo</button>
  </form>`;
}

export default {
  title: "Entrar",
  render() {
    return `<div class="signin">
      <section class="signin__story" aria-hidden="false">
        <a class="signin__brand" href="#/sign-in">${wordmark("is-lg")}</a>
        <div class="signin__copy">
          <p class="signin__event">Feria de Innovación 2026</p>
          <h1 class="display">Toda mejora empieza con una chispa.</h1>
          <p class="lede">Las áreas publican sus retos. Tú propones cómo resolverlos. Las mejores ideas se presentan en la feria y se vuelven proyecto.</p>
        </div>
        <div class="signin__stack" aria-hidden="true">${stack()}</div>
      </section>
      <section class="signin__panel">
        <div class="signin__panel-inner" id="signin-step">${numberStep()}</div>
      </section>
    </div>`;
  },
  bind(root) {
    const host = root.querySelector("#signin-step");
    let profile = null;
    const slide = (dir) => {
      const f = host.firstElementChild;
      f.style.setProperty("--dir", dir);
      f.classList.add("animate-panel-in");
    };

    const mountNumber = () => {
      host.innerHTML = numberStep();
      if (profile) slide(-1);
      const form = host.querySelector("#number-form");
      const input = form.querySelector("input");
      const help = form.querySelector("#number-help");
      input.focus();
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "");
        if (input.getAttribute("aria-invalid") === "true" && input.value.length >= 5) {
          input.removeAttribute("aria-invalid");
          help.textContent = "Mínimo 5 dígitos, sólo números.";
          help.classList.remove("is-error");
        }
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (input.value.length < 5) {
          input.setAttribute("aria-invalid", "true");
          help.textContent = input.value.length === 0
            ? "Escribe tu número de trabajador."
            : `Faltan ${5 - input.value.length} dígitos: el número tiene al menos 5.`;
          help.classList.add("is-error");
          input.classList.remove("animate-nudge");
          void input.offsetWidth;
          input.classList.add("animate-nudge");
          input.focus();
          return;
        }
        profile = store.findProfile(input.value);
        mountConfirm();
      });
    };

    const mountConfirm = () => {
      host.innerHTML = confirmStep(profile);
      slide(1);
      const form = host.querySelector("#confirm-form");
      form.querySelector("input:checked").focus();
      form.querySelector('[data-step="back"]').addEventListener("click", mountNumber);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const role = new FormData(form).get("role");
        store.signIn({ ...profile, role });
        location.hash = "#/";
      });
    };

    mountNumber();
  },
};
