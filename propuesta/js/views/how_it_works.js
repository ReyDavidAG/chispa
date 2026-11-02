import { rubric, stages } from "../data.js";
import { icon, shortDate } from "../ui.js";
import { currentStageIndex } from "./home.js";

const faqs = [
  ["¿Sólo cuentan ideas de software?", "No. La mayoría de los retos se resuelven con un sistema, pero un cambio de proceso, una herramienta o un acuerdo entre áreas cuentan igual."],
  ["¿Puedo proponer para un reto que no es de mi área?", "Sí, y es de lo más valioso: alguien de fuera ve lo que quien está adentro ya no nota."],
  ["¿Puedo mandar mi idea anónima?", "Sí. Tu nombre no se muestra a nadie; sólo el comité lo ve por si necesita preguntarte algo."],
  ["¿Qué pasa si eligen mi chispa?", "Se presenta en la feria. Si avanza, se vuelve proyecto y, si marcaste que quieres participar, te invitamos al equipo."],
  ["¿Avivar es votar?", "Ayuda al comité a ver qué le importa a la gente, pero la decisión se toma con la rúbrica. Una idea con pocas avivadas puede ganar."],
  ["¿Y si veo un problema que no está publicado?", "Sugiérelo como reto. El área responsable lo revisa y, si lo acepta, se publica para todos."],
];

export default {
  title: "Cómo funciona",
  render() {
    const current = currentStageIndex();
    return `<div class="wrap narrow-wide">
      <header class="how-head">
        <h1 class="display">De un problema de todos los días a un proyecto de verdad.</h1>
        <p class="lede">Chispa junta a quien vive el problema con quien tiene la idea. Así funciona la Feria de Innovación.</p>
      </header>

      <section class="section">
        <h2 class="h2">Las cinco etapas</h2>
        <ol class="stage-detail" role="list">
          ${stages.map((s, i) => `<li class="animate-tile-in${i === current ? " is-current" : ""}" style="--i:${i}">
            <span class="stage-detail__n num" aria-hidden="true">${i + 1}</span>
            <div><h3 class="h4">${s.name}</h3><p>${s.detail}</p><p class="muted small">${s.from === s.to ? shortDate(s.from) : `${shortDate(s.from)} – ${shortDate(s.to)}`}</p></div>
          </li>`).join("")}
        </ol>
        <p class="muted small">${icon("info")} Fechas de ejemplo, por confirmar con el comité.</p>
      </section>

      <section class="section how-pair">
        <div class="how-card">
          <h2 class="h3">Un buen reto</h2>
          <ul class="check-list" role="list">
            <li>${icon("check")}Cuenta el problema, no la solución.</li>
            <li>${icon("check")}Dice a quién afecta y qué tan seguido.</li>
            <li>${icon("check")}Cuenta qué ya se intentó.</li>
            <li>${icon("check")}Dice cómo sabremos que se resolvió.</li>
          </ul>
        </div>
        <div class="how-card how-card--spark">
          <h2 class="h3">Una buena chispa</h2>
          <ul class="check-list" role="list">
            <li>${icon("check")}Se entiende en dos frases.</li>
            <li>${icon("check")}Explica qué pasaría, paso a paso.</li>
            <li>${icon("check")}Dice qué mejora, aunque sea a ojo.</li>
            <li>${icon("check")}Puede ser sencilla: no tiene que costar.</li>
          </ul>
        </div>
      </section>

      <section class="section">
        <h2 class="h2">Cómo se evalúa</h2>
        <p class="lede">El área y el comité califican cada chispa del 1 al 5 en cuatro puntos. Las de mayor calificación pasan a la feria.</p>
        <dl class="rubric">
          ${rubric.map((r) => `<div><dt>${r.name}</dt><dd>${r.hint}</dd></div>`).join("")}
        </dl>
      </section>

      <section class="section">
        <h2 class="h2">Preguntas frecuentes</h2>
        <div class="faq">
          ${faqs.map(([q, a]) => `<details><summary>${q}${icon("chevronDown")}</summary><div class="faq__body"><p>${a}</p></div></details>`).join("")}
        </div>
      </section>

      <section class="how-cta">
        <h2 class="h2">¿Ya tienes una idea?</h2>
        <div class="btn-row btn-row--center">
          <a class="btn btn--spark btn--lg" href="#/propose">${icon("plus")}Proponer chispa</a>
          <a class="btn btn--ghost btn--lg" href="#/challenges">Ver los retos</a>
        </div>
      </section>
    </div>`;
  },
};
