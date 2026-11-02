# Cambios

## 0.1.1 · 2026-11-02

- Se ignora la caché local de Vite (`.vite/`).

## 0.1.0 · 2026-11-02

Primera versión de la propuesta.

- Prototipo navegable con las 10 pantallas, animaciones, retos nuevos y en tendencia.
- Esquema de base de datos con organización empresa → área → departamento, retos, chispas, avivadas, comentarios, evaluación con rúbrica ponderada, ficha de requerimiento, historial de estados y notificaciones. Seguridad por filas (RLS) por rol.
- Alta atómica de chispas (`submit_idea`) y de retos (`submit_challenge`); la base decide si un reto se publica o queda como sugerencia.
- Web en React conectada a Supabase: entrar con número de trabajador, inicio, retos con filtros, detalle, proponer en 5 pasos, avivar, comentar, evaluar, ficha de requerimiento, mis chispas, mi área / evaluación, publicar o sugerir retos y cómo funciona.
- Combobox con búsqueda en todos los desplegables; iconos para tipos de solución y beneficios.
