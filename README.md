# Chispa

Portal para una **Feria de Innovación**: cada área publica sus **retos** (problemas reales de su operación) y cualquier colaborador propone **chispas** (ideas para resolverlos). El comité evalúa con una rúbrica común, las mejores llegan a la feria y, si son de software, salen con una **ficha de requerimiento** lista para desarrollo.

> Propuesta en evaluación. Los datos de este repositorio son de ejemplo.

## Qué hay aquí

| Carpeta | Qué es |
|---|---|
| `propuesta/` | Prototipo navegable (HTML, CSS y JS sin compilación) con el diseño aprobado. |
| `chispa.client/` | Web en React 19 + Vite + TypeScript + Tailwind v4, conectada a Supabase. |
| `supabase/` | Esquema (migraciones), semillas de catálogos y una organización ficticia, y la prueba del esquema con PGlite. |
| `docs/` | Modelo de datos explicado y registro de pruebas. |
| `CLAUDE.md`, `plan.md`, `state.md` | Guía del proyecto, plan por fases y estado actual. |

## Correr el web

```bash
cd chispa.client
cp .env.example .env    # URL del proyecto y llave anon de Supabase
npm install
npm run dev             # http://localhost:5174
```

En Supabase: aplicar las migraciones de `supabase/migrations/` en orden, luego `supabase/seed.sql` y `supabase/seed_demo_org.sql`, y activar *anonymous sign-ins*.

## Ver el prototipo

```bash
cd propuesta && python3 -m http.server 5180   # http://localhost:5180
```

## Probar el esquema

```bash
cd supabase/tests && npm install --ignore-scripts && npm run check
```
