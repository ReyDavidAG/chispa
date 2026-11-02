# Plan · Chispa

Qué sigue y en qué orden. Cada fase se aprueba antes de empezarla. El avance real vive en `state.md`.

## Fase 0 · Propuesta visual · aprobada el 2026-11-02

Prototipo navegable en `propuesta/` con datos de ejemplo. Diseño aprobado; se agregaron las animaciones, el contador y banner de retos nuevos y las marcas de tendencia.

### Rutas (en inglés; el texto en pantalla sigue en español)

| Ruta | Pantalla | Quién | Para qué |
|---|---|---|---|
| `/sign-in` | Entrar | Todos | Número de trabajador (mín. 5 dígitos) → "¿Eres tú?" con el perfil encontrado. |
| `/home` (`/` redirige) | Inicio | Todos | Etapa de la feria y días para cerrar, banners de **retos nuevos** y **en tendencia**, retos que necesitan ideas, lo más avivado, tu actividad, retos por área. |
| `/challenges` | Retos | Todos | Lista con búsqueda y filtros en la URL: `q`, `status`, `area`, `type`, `sort` (`recent`, `new`, `trending`, `fewest`, `closing`). Banner de nuevos y marcas "Nuevo" y "En tendencia". |
| `/challenges/:id` | Detalle del reto | Todos | Problema, a quién afecta, qué tan seguido, qué ya se intentó, cómo sabremos que se resolvió, restricciones, chispas ordenables. |
| `/challenges/new` | Publicar o sugerir reto | Responsable y comité publican; colaborador sugiere | Formulario con vista previa en vivo. |
| `/propose?challenge=` | Proponer chispa | Todos | 5 pasos con borrador, anónimo y "quiero participar". |
| `/ideas/:id` | Detalle de la chispa | Todos; evaluación sólo responsable y comité | Avance, avivar, comentarios, rúbrica y ficha de requerimiento. |
| `/my-ideas` | Mis chispas | Todos | Propuestas con su avance, avivadas y borrador. |
| `/my-area` | Mi área / Evaluación | Responsable (su área) y comité (todas) | Indicadores, chispas por evaluar, retos, sugeridos. |
| `/how-it-works` | Cómo funciona | Todos | Etapas, buenas prácticas, rúbrica y preguntas frecuentes. |

Contador de nuevos: un número en la pestaña **Retos** (barra superior y barra inferior de móvil) con los retos publicados desde tu última visita. Se apaga al entrar a Retos; las tarjetas siguen marcadas como "Nuevo" durante esa visita.

En tendencia: se calcula con la actividad de los últimos 7 días (`challenge_activity_7d`). La marca dice el motivo: **Muy avivado** (avivadas) o **Muy concurrido** (chispas).

### Vocabulario de animación (sale tal cual a React)

Sólo `transform` y `opacity`, CSS puro y apagado con `prefers-reduced-motion`. Los nombres de clase son los mismos de el cliente de referencia:

| Clase | Uso |
|---|---|
| `animate-page-in` | Entrada de cada página (6 px y opacidad, 420 ms). |
| `animate-tile-in` | Tarjetas, con escalonado `--i` topado a 12. |
| `animate-row-in` | Filas: sólo opacidad. |
| `animate-panel-in` | Paso del asistente o pestaña, entra del lado del que vienes (`--dir`). |
| `animate-nudge` | Campo con error. |
| `indicator` | Pastilla o subrayado que viaja entre pestañas y en la navegación. |

Momentos de firma: la chispa del logo, el marcador que subraya "8 retos abiertos", la barra de etapas que se llena con el punto vivo, el contador que cuenta, la etiqueta que se mece desde su perforación, la explosión de chispas al avivar con el número que sube, el encendido con rayos al enviar y el destello de "Nuevo".

## Fase 1 · Web de demostración (`chispa.client`)

### Librerías (las mismas versiones fijas de el cliente de referencia)

| Para qué | Paquete | Nota |
|---|---|---|
| Base | `react` 19.2.8, `react-dom`, `typescript` 5.9.3, `vite` 7.3.6, `@vitejs/plugin-react` | |
| Estilos | `tailwindcss` 4.3.3, `@tailwindcss/vite`, `clsx`, `tailwind-merge`, `prettier-plugin-tailwindcss` | Los tokens de `propuesta/css/tokens.css` van a `@theme`. |
| Rutas | `react-router` 8.3.0 (`createBrowserRouter` + `lazy`) | Mismo patrón que `src/router/app_router.tsx`. |
| Datos | `@tanstack/react-query` 5.101.2 | `queryKey` = petición, claves en `constants/query_keys.ts`. |
| Tablas | `@tanstack/react-table` | Sólo en Mi área / Evaluación. |
| Formularios | `react-hook-form`, `@hookform/resolvers`, `zod` 3.25.76 | Toda validación es un schema Zod. |
| Número de trabajador | `input-otp` | Las 5+ cajas del login, como `components/ui/input_otp.tsx`. |
| Fechas | `react-day-picker` | Cierre del reto. |
| Avisos | `sonner` | Toasts con "Deshacer". |
| Ventanas flotantes | `@radix-ui/react-popover`, `@radix-ui/react-tooltip` | Menú de usuario y tooltips. |
| Recorrido guiado | `driver.js` | Tour la primera vez que entras. |
| Fuentes | `@fontsource-variable/bricolage-grotesque`, `@fontsource/figtree`, `@fontsource/ibm-plex-mono` | Como en el proyecto de referencia, servidas desde el bundle y no desde Google. |
| Backend | `@supabase/supabase-js` | Sólo en fase 1. En fase 2 entra `axios` + `@auth0/auth0-react` como en el proyecto de referencia. |
| Calidad | El mismo `eslint.config`, `prettier`, `typescript-eslint` y plugins del proyecto de referencia | |

**Iconos:** el proyecto de referencia usa FontAwesome **Pro**, que requiere licencia de la empresa. Para una propuesta personal se propone conservar el set SVG propio del prototipo o usar FontAwesome Free. Lo decide el usuario.

**Política de dependencias:** el mismo `.npmrc` del proyecto de referencia (`ignore-scripts`, `allow-git=none`, `min-release-age=7`, `save-exact`), sin la línea del registro de FontAwesome.

### Estructura (convención de el cliente de referencia)

```
chispa.client/src/
  router/app_router.tsx
  layouts/{auth,protected,root}/
  pages/<module>/<feature>/<feature>_page.tsx     p. ej. pages/challenges/detail/challenge_detail_page.tsx
  components/ui/ · components/<module>/
  hooks/<domain>/use_<name>.tsx
  schemas/<module>/<feature>/<name>.schema.ts
  services/api/unit_of_services.ts                 cada repositorio detrás de una interfaz
  constants/ · types/ · utils/ · tests/
```

### Pasos

1. Crear el proyecto Supabase, aplicar `supabase/migrations/…_init.sql` y `supabase/seed.sql`, y activar *anonymous sign-ins*.
2. Script de datos de ejemplo (personas, retos y chispas del prototipo) con números de trabajador de prueba.
3. Andamiaje de `chispa.client` con las librerías y el `.npmrc` de arriba.
4. Tokens y `motion.css` → `index.css` con `@theme` y `@utility animate-*`.
5. `SessionProvider`: sesión anónima + `claim_employee_number`, con la forma que tendrá Auth0 (`user`, `isAuthenticated`, `signIn`, `signOut`).
6. Repositorios con interfaz (`ChallengeRepository`, `IdeaRepository`, `SupportRepository`, `CommentRepository`, `EvaluationRepository`, `RequirementRepository`), implementación Supabase y una en memoria para pruebas.
7. Las 10 rutas en el orden de la tabla.
8. Tiempo real de Supabase para avivadas y chispas nuevas.
9. Despliegue en Vercel con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
10. `/frontend-review` antes de cada commit.

## Fase 2 · Producto (deseable)

API .NET con la estructura de el proyecto de referencia (Api / Application CQRS / Domain / Infrastructure), SQL Server con el mismo modelo (ver `docs/database.md`, sección "Paso a SQL Server"), Auth0 en lugar del número de trabajador, notificaciones y exportar la ficha a la herramienta de desarrollo.

## Decisiones abiertas

- Iconos: set propio o FontAwesome Free.
- ¿Las chispas anónimas pueden comentar sin mostrar nombre?
- ¿Un colaborador puede editar su chispa después de enviarla?
- ¿Avivar tiene límite por persona?
- Fechas reales de las etapas.
