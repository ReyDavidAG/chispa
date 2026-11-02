# CLAUDE.md

Guía para Claude Code en este repositorio. Es la fuente de verdad del proyecto; `plan.md` dice **qué sigue** y `state.md` dice **dónde vamos**.

## Qué es Chispa

Chispa es la propuesta de un portal para la **Feria de Innovación**: cada área o departamento publica sus **retos** (problemáticas reales de su operación) y cualquier colaborador propone **chispas** (ideas de solución). El comité evalúa, las mejores se presentan en la feria y las que avanzan se convierten en proyectos.

La mayoría de las chispas terminarán en **levantamiento de requerimientos de software**, pero no todas: también caben cambios de proceso, equipo, infraestructura o seguridad. El portal tiene que servir a los dos casos, y para el de software genera una **ficha de requerimiento** lista para que desarrollo la tome.

Es una propuesta personal para presentar a la dirección. **No es un sistema oficial de la empresa todavía**: no corre en sus servidores. La única información interna que se usa es la **estructura de la organización** (empresas, áreas y departamentos), en una semilla local que no se publica. Nunca datos de personas. El contexto interno vive en `CLAUDE.local.md` (no se publica). Tiene que verse terminada y ser atractiva para el usuario final, aunque el backend real llegue después.

### Objetivos

1. Que cualquier colaborador entienda en 10 segundos qué es un reto, cómo proponer y en qué etapa va la feria.
2. Que proponer una chispa sea guiado y tome menos de 3 minutos, desde el celular.
3. Que el responsable de área publique un reto bien planteado (problema, a quién afecta, qué se ha intentado, cómo se sabrá que se resolvió).
4. Que el comité evalúe con una rúbrica común y no a ojo.
5. Que una chispa elegida salga del portal como una ficha de requerimiento, no como un mensaje de WhatsApp.

### Vocabulario (se usa igual en código, pantalla y documentos)

| Pantalla | Código | Qué es |
|---|---|---|
| Reto | `challenge` | Problemática que publica un área. Folio `RET-000`. |
| Chispa | `idea` | Propuesta de solución a un reto. Folio `CHI-000`. |
| Avivar | `support` | El "me gusta" de una chispa: sumarse a la idea. |
| Área | `area` | Departamento dueño del reto. |
| Ficha de requerimiento | `requirement` | Salida estructurada de una chispa elegida. |
| Etapa | `stage` | Fase de la feria: convocatoria, propuestas, evaluación, feria, implementación. |

Estados del reto: `open` (Abierto) · `review` (En evaluación) · `building` (En desarrollo) · `solved` (Resuelto) · `suggested` (Sugerido, falta que el área lo acepte).
Estados de la chispa: `received` (Recibida) · `review` (En revisión) · `selected` (Seleccionada para la feria) · `building` (En desarrollo) · `done` (Implementada) · `archived` (Archivada).

### Roles

| Rol | Puede |
|---|---|
| Colaborador | Ver retos, proponer chispas (con nombre o anónimas), avivar, comentar, sugerir un reto. |
| Responsable de área | Lo anterior + publicar y editar los retos de su área, aceptar retos sugeridos, evaluar chispas de su área. |
| Comité | Lo anterior en todas las áreas + mover etapas, seleccionar para la feria y generar la ficha de requerimiento. |

## Fases

| Fase | Qué | Dónde corre |
|---|---|---|
| 0 · Propuesta visual | Prototipo navegable en HTML/CSS/JS sin compilación, con datos de ejemplo. Sirve para aprobar diseño y rutas. | `propuesta/` local |
| 1 · Web de demostración | `chispa.client` (React + Vite + Tailwind) con login simulado por número de trabajador y datos en un servicio gratuito. | Vercel + servicio gratuito (Supabase recomendado) |
| 2 · Producto | API .NET + SQL Server + Auth0, misma estructura que el proyecto de referencia. | Por definir |

**Login simulado (fases 0 y 1):** se pide sólo el número de trabajador, **mínimo 5 dígitos** y sólo números. Se "encuentra" un perfil de ejemplo y se confirma ("¿Eres tú?"). No es seguridad, es una cortina: se diseña para que el día que llegue Auth0 sólo se cambie el proveedor de sesión, no las pantallas.

**Datos:** toda lectura y escritura pasa por una capa de repositorio con interfaz (`ChallengeRepository`, `IdeaRepository`, …). Fase 0 usa memoria + `localStorage`; fase 1 el servicio gratuito; fase 2 el API. Las pantallas no saben cuál está detrás.

## Estructura

```
./
  CLAUDE.md  plan.md  state.md
  propuesta/                  Fase 0: prototipo estático (se sirve, no se compila)
  supabase/migrations/        Esquema de la base (fase 1) · supabase/seed.sql catálogos y feria
  supabase/tests/             Prueba del esquema con PGlite (npm run check)
  docs/database.md            Por qué cada tabla, RLS, triggers y paso a SQL Server
  chispa.client/              Fase 1: React 19 + Vite + TS + Tailwind v4 + Supabase (en construcción)
  Chispa.Api/ .Application/ .Domain/ .Infrastructure/   Fase 2 (aún no existe)
  .claude/skills/             Skills del proyecto (frontend-review, .NET)
```

### Web (`chispa.client`)

```bash
cd chispa.client
npm install            # respeta .npmrc: sin scripts, versiones exactas, cuarentena de 7 días
npm run dev            # http://localhost:5174
npm run build          # tsc -b && vite build: debe terminar en "✓ built"
npx prettier --write <archivos> && npx eslint <archivos>
```

`.env` (ignorado por git) con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`; plantilla en `.env.example`. Los estilos del diseño aprobado viven en `src/styles/` (`tokens.css` es el `@theme` de Tailwind; `app.css` y `motion.css` son las clases del prototipo). Las clases condicionales siempre con `cn()` de `utils/cn.ts`: el plugin de Tailwind para Prettier pega las clases de un template literal.

Semillas de Supabase, en orden: las migraciones de `supabase/migrations/`, `seed.sql` y la organización. En el repo va `seed_demo_org.sql` (organización ficticia); las semillas con la estructura real y las personas de prueba son locales y no se publican.

Los usuarios de prueba están en `CLAUDE.local.md`.

### Ver el prototipo

```bash
cd propuesta && python3 -m http.server 5180
# http://localhost:5180
```

No abre con doble clic: usa módulos ES y necesita servidor. El servidor de Python deja que Chrome guarde los módulos en caché: después de editar, recarga con Cmd+Shift+R.

## Convenciones

- **Respuestas al usuario en español; código en inglés** (archivos, variables, funciones, tipos, claves). Español sólo en texto que ve una persona.
- **Sin comentarios en el código**, salvo una línea que registre algo que el código no puede enseñar (un requisito externo, un bug de navegador).
- **Commits de una sola línea**, sin descripción ni trailer.
- El front pasa por **`/frontend-review`** antes de cada commit. Aplica a `chispa.client/` con las reglas del proyecto de referencia (tamaños, estructura `snake_case` con sufijo, Zod para validar, rendimiento para equipos de bajos recursos, cierre con prettier + eslint + build).
- Del proyecto de referencia se toman **convenciones, estructura y librerías** (versiones exactas), nunca código con datos, cadenas de conexión ni dominios internos. La lista está en `plan.md`.
- **Rutas y parámetros en inglés** (`/challenges/:id`, `/propose?challenge=`, `?sort=trending`); el texto en pantalla, en español.
- Cambios a la base: una migración nueva en `supabase/migrations/` (nunca editar una ya aplicada), su explicación en `docs/database.md` y la prueba de `supabase/tests/` en verde.

### Diseño

- Móvil primero. Se comprueba a 320, 375, 414, 768 y 1280 px, sin desplazamiento horizontal.
- Todo color y tipografía sale de los tokens (`propuesta/css/tokens.css`, después `@theme` de Tailwind). Nada de hex sueltos en componentes.
- Tipografía: **Bricolage Grotesque** (títulos), **Figtree** (texto), **IBM Plex Mono** (folios y cifras). Títulos siempre rectos, nunca itálica.
- La pieza de identidad es la **etiqueta de reto**: una ficha con perforación, folio en mono y línea punteada, como las tarjetas de trabajo de planta.
- **Prohibido `<select>` nativo.** Toda lista desplegable es `components/ui/combobox.tsx` (Radix Popover, con búsqueda por palabras sin acentos y teclado completo). Los dependientes van en orden: el segundo se habilita al elegir el primero (área → departamento).
- Cada tipo de solución y cada beneficio lleva su icono (`SOLUTION_ICONS`, `BENEFIT_ICONS` en `constants/status.ts`) en formularios, tarjetas y detalle.
- Contraste AA mínimo (4.5:1 texto, 3:1 componentes). Foco visible siempre.
- Animación: CSS puro, sólo `transform`/`opacity`, apagada con `prefers-reduced-motion`. Vocabulario fijo (`animate-page-in`, `animate-tile-in`, `animate-row-in`, `animate-panel-in`, `animate-nudge`, `indicator`) igual al del proyecto de referencia; escalonado con `--i` topado a 12. Nada se anima al hacer scroll. Está en `propuesta/css/motion.css` y descrito en `plan.md`.
- Nada de métricas inventadas presentadas como reales: los datos de ejemplo se marcan como tales.

## Cómo se trabaja

1. Antes de construir algo nuevo se acuerda en `plan.md` y el usuario lo aprueba.
2. Al terminar una tarea se actualiza `state.md` (qué se hizo, qué falta, decisiones tomadas).
3. Lo visual se prueba en el navegador antes de pedir aprobación.

## Git (gitflow)

- `main`: lo publicado. Sólo recibe merges de `release/*` y `hotfix/*`, con tag `vX.Y.Z`.
- `develop`: integración. Recibe los `feature/*`.
- `feature/<nombre>`: sale de `develop` y vuelve a `develop` con merge `--no-ff`.
- `release/<versión>`: sale de `develop`, se cierra en `main` (tag) y regresa a `develop`.
- `hotfix/<nombre>`: sale de `main`, se cierra en `main` (tag de parche) y regresa a `develop`.
- Commits de una línea, varios por feature, cada uno con un solo propósito.
- El repo es **público**: nada de datos de personas, números de trabajador, cadenas de conexión ni estructura interna de bases. Lo privado va en `CLAUDE.local.md`, `docs/local/` y `.git/info/exclude`.
