# Estado · Chispa

Última actualización: 2026-11-02

## Dónde vamos

**Fase 0 · Propuesta visual: aprobada** (el diseño, el 2026-11-02). Ya tiene animaciones, retos nuevos, tendencia y rutas en inglés.
**Fase 1 · `chispa.client`: arrancado.** Supabase con esquema, catálogos y estructura real aplicados por el usuario. Las 10 rutas están conectadas y probadas de punta a punta con los tres usuarios (3 rondas en `docs/test_log.md`). Migración `20261102010000` aplicada.

## Hecho

- `CLAUDE.md`, `plan.md` y `docs/database.md`.
- Prototipo en `propuesta/` con las 10 rutas, ya en inglés (`/sign-in`, `/challenges`, `/challenges/:id`, `/challenges/new`, `/propose`, `/ideas/:id`, `/my-ideas`, `/my-area`, `/how-it-works`).
- **Retos nuevos:** contador en la pestaña Retos (arriba y en la barra de móvil), banner en Inicio y en Retos, marca "Nuevo" con destello y orden "Nuevos primero". El contador se apaga al entrar a Retos.
- **En tendencia:** banner en Inicio con el motivo (Muy avivado o Muy concurrido), marca en tarjetas y chispas, y orden "En tendencia".
- **Animaciones** en `propuesta/css/motion.css`, con el vocabulario de el cliente de referencia:
  - Entrada de página, tarjetas y filas escalonadas.
  - Indicador que viaja en la navegación, las pestañas y los segmentados.
  - Logo que gira, marcador que subraya, barra de etapas que se llena con el punto vivo y números que cuentan.
  - Tarjeta que se mece desde su perforación.
  - Avivar con explosión de chispas y número que rueda.
  - Pasos del asistente con dirección, error que tiembla y envío con rayos.
  - Etiquetas del login que caen y se mecen.
  - FAQ que se despliega suave.
  - Todo apagado con `prefers-reduced-motion`.
- Probado en Chrome: 9 rutas a 320, 375 y 414 px sin desplazamiento horizontal, sin errores en consola, y animaciones verificadas por código (avivar dispara `pop`, `burst` y `roll-up`).
- `supabase/migrations/20261102000000_init.sql`: 23 tablas con la jerarquía de RH (empresa → área → departamento), triggers de folios, contadores e historial, 3 vistas, RLS por rol y `claim_employee_number` para el login simulado.
- Migraciones aplicadas en Supabase (2026-11-02).
- `supabase/seed.sql`: catálogos, feria 2026, etapas y rúbrica con pesos.
- Estructura real de la organización (empresas, áreas y departamentos con personal activo) en una semilla local que no se publica.
- `supabase/seed_demo_org.sql`: organización ficticia, sólo para la prueba del esquema.
- `supabase/tests/schema_check.mjs`: 33 comprobaciones en verde con PGlite.

- Personas, retos y chispas de prueba en una semilla local que no se publica.
- `chispa.client`:
  - Misma base que el cliente de referencia: versiones exactas, `.npmrc` y configs de prettier, eslint y tsconfig. El override de `brace-expansion` quedó en 2.1.7.
  - Estructura: `router/`, `layouts/{auth,protected}`, `context/session`, `services/api` (repositorios con interfaz + `unit_of_services`), `hooks/`, `schemas/`, `components/{ui,layout,auth,challenges,home}`, `pages/`.
  - Sesión: inicio anónimo de Supabase + `claim_employee_number`. El rol se deduce de encargado y comité.
  - Pantallas conectadas: Entrar (dos pasos), marco (barra superior con indicador y contador de nuevos, barra inferior), Inicio (etapa, banners de nuevos y tendencia, retos que necesitan ideas), Retos (filtros en la URL, búsqueda con espera de 300 ms, banner y marcas) y Detalle de reto.
  - prettier, eslint y build en verde. `npm audit` sólo reporta las herramientas de desarrollo (cadena de eslint), igual que en el proyecto de referencia.

## Decisiones tomadas

- El rol no se guarda en la persona: responsable = encargado de área o departamento (como en el sistema de RH); comité = `fair_committee` por edición. El selector "Ver la demo como" es sólo del prototipo.
- Estados como texto con `check` y tablas puente en lugar de enums y arreglos, para que el paso a SQL Server sea mecánico.
- El anonimato es de presentación: `author_id` siempre se guarda y la vista `idea_cards` lo oculta.
- Las librerías de fase 1 son las de el cliente de referencia con las mismas versiones (lista en `plan.md`).
- El logo es la chispa junto a la palabra. Las etapas de ejemplo no se traslapan.

## Siguiente

1. `/frontend-review` sobre `chispa.client`.
2. Desplegar en Vercel (variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
3. Decidir iconos (set propio o FontAwesome Free) y arrancar `chispa.client` según `plan.md`.
