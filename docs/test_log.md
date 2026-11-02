# Registro de pruebas · Chispa

Cada ronda anota qué se probó, con qué usuario, el resultado y los bugs que salieron con su arreglo.
Usuarios de prueba por rol: **Comité**, **Encargado** (de un departamento) y **Colaborador**.

## Ronda 1 · 2026-11-02 · `chispa.client` contra Supabase

### Base de datos (PGlite, mismo esquema y semillas que Supabase)

`supabase/tests/schema_check.mjs`: 33/33. Prueba de flujos por rol (`flows`): 28/28 con la migración `20261102010000`.

| Caso | Resultado |
|---|---|
| Colaborador crea chispa, beneficios y necesidades | ❌ sin la migración: *permission denied for table ideas* (la política leía `author_id`, oculto al cliente). ✅ con `is_idea_author()` |
| `submit_idea` guarda chispa + beneficios + necesidades en una transacción | ✅ CHI-016 con 2 beneficios y 2 necesidades |
| `submit_idea` con beneficio inválido no deja chispa huérfana | ✅ 16→16 |
| `submit_idea` sin beneficios | ✅ rechazada: "Elige al menos una mejora." |
| Comité aviva y comenta | ✅ |
| Encargado cambia el estado de una chispa de Sistemas | ✅ |
| Colaborador intenta cambiar estado | ✅ bloqueado (0 filas) |
| Encargado evalúa y corrige su evaluación (upsert) | ✅ |
| Comité evalúa | ✅ |
| Encargado genera la ficha | ✅ |
| `submit_challenge` Encargado en Sistemas | ✅ `open` |
| `submit_challenge` Colaborador en Sistemas | ✅ `suggested`, dueño el encargado |
| `submit_challenge` Encargado en un área que no es suya | ✅ `suggested` |
| `submit_challenge` Comité en cualquier área | ✅ `open` |
| Sugerido visible sólo para quien sugiere, el encargado y el comité | ✅ |

### Navegador (Chrome, http://localhost:5174)

| Usuario | Flujo | Resultado |
|---|---|---|
| — | `/` sin sesión → `/sign-in` | ✅ |
| — | Número con 4 dígitos | ✅ "El número tiene al menos 5 dígitos." |
| — | Número inexistente (99999) | ✅ "No encontramos ese número de trabajador" |
| Comité | Entrar → menú con "Evaluación", contador de 3 nuevos | ✅ |
| Comité | Menú de usuario: avatar | ❌ la inicial se salía del círculo → ✅ corregido |
| Comité | Inicio: etapa, banners, retos que necesitan ideas, lo más avivado | ✅ ve al autor de la anónima marcado "(anónima)" |
| Comité | Avivar CHI-012: animación `pop` + `burst` + `roll-up`, toast con Deshacer, persiste al recargar | ✅ 7 → 8 |
| Comité | Comentar CHI-012 | ✅ |
| Comité | Evaluar 5/4/3/3 y pasar a "En revisión" | ✅ 15/20, toast "Evaluación guardada" |
| Comité | Selector de estado después de guardar | ❌ regresaba a "Recibida" y al guardar otra vez revertía → ✅ corregido |
| Comité | Ficha de requerimiento: se arma, se edita, se guarda | ✅ "guardada el 2 nov" |
| Comité | Ficha: campos largos cortados | ❌ → ✅ el campo crece con el texto |
| Comité | Evaluación: KPIs y cola | ✅ 11 por evaluar, 10 sin calificar |
| Comité | Cómo funciona: etapas y rúbrica desde la base | ✅ |
| Comité | Proponer: validación por paso, borrador que sobrevive a recargar | ✅ |
| Comité | Proponer: el error no se quitaba al corregir el campo | ❌ → ✅ revalida al teclear |
| Comité | Proponer: enviar | ❌ *permission denied* y quedó **CHI-015 sin beneficios** → corregido con `submit_idea` (pendiente aplicar migración) |
| Comité | Salir | ❌ no salía: `queryClient.clear()` dejaba la sesión vieja en el observador → ✅ corregido |
| Encargado | Entrar, "No soy yo", volver a entrar | ✅ menú con "Mi área" |
| Encargado | Mi área: sólo Sistemas | ✅ 1 reto, 2 chispas, calificación de Comité (3.9) |
| Encargado | Panel de evaluación sólo en chispas de Sistemas | ✅ CHI-001 (Mantenimiento) sin panel; CHI-012 con panel |
| Encargado | Evaluar CHI-012 y marcar "Seleccionada" | ✅ 16/20, avance en "Seleccionada" |
| Encargado | Publicar reto: área y departamento precargados | ❌ el selector decía "Elige un área" mientras el valor sí estaba → ✅ el formulario espera a que carguen áreas y feria |
| Encargado | Publicar reto: aviso de si se publica o se sugiere según el área | ✅ |
| Encargado | Salir | ✅ |
| Colaborador | Entrar: rol Colaborador, sin "Mi área" | ✅ |
| Colaborador | Después de que Encargado salió, Colaborador cayó en `/challenges/new` | ❌ el guardia heredaba la ruta del usuario anterior → ✅ corregido |
| Colaborador | `/my-area` | ✅ redirige a Inicio |
| Colaborador | Chispa anónima | ✅ muestra "Anónimo" |
| Colaborador | Sin panel de evaluación | ✅ |
| Colaborador | Avivar y Deshacer | ✅ 20 → 21 → 20 |
| Colaborador | Comentar | ✅ |
| Colaborador | Mis chispas: vacío en Propuestas, 1 en Avivadas, indicador de pestaña | ✅ |
| Todos | 9 rutas a 320, 375 y 414 px sin desbordes | ❌ Publicar reto a 320 px: el botón se salía → ✅ los botones bajan de renglón |

### Pendiente de esta ronda (requiere aplicar `20261102010000_idea_author_policies.sql`)

- Proponer una chispa de punta a punta con los tres usuarios.
- Publicar reto (Encargado, Sistemas), sugerir reto (Colaborador) y que Encargado lo acepte o archive en Mi área.
- Borrar CHI-015 (la chispa incompleta del intento fallido).

## Ronda 2 · 2026-11-02 · combobox e iconos

Pedido: nada de `<select>`; todo desplegable es combobox con búsqueda; área primero y departamento después; iconos en tipos de solución y beneficios (formularios y tarjetas).

| Usuario | Caso | Resultado |
|---|---|---|
| — | `grep "<select" src` | ✅ 0 (también se borró su CSS) |
| Colaborador | Sugerir reto: área vacía, departamento deshabilitado con "Primero elige el área" | ❌ decía "Toda el área" → ✅ corregido |
| Colaborador | Buscar "manten" en área: filtra sin acentos y muestra la empresa | ✅ 4 resultados |
| Colaborador | Teclado: ↓ + Enter elige; Esc cierra | ✅ |
| Colaborador | Al elegir área se habilita el departamento con sus opciones y "Toda el área" | ✅ |
| Colaborador | Chips de tipo con icono | ✅ |
| Colaborador | Retos: filtro de tipo con búsqueda ("equipo" + Enter) → `?type=equipment`, 3 retos | ✅ |
| Colaborador | Tarjetas de reto con iconos de tipo | ✅ |
| Colaborador | Proponer: tarjetas de tipo con icono y chips de beneficio con icono | ✅ |
| Colaborador | Borrador de proponer compartido entre usuarios del mismo navegador | ❌ → ✅ el borrador va por persona |
| Colaborador | Enviar sin la migración `20261102010000` | ✅ falla sin dejar nada guardado; el mensaje técnico se tradujo |
| Colaborador → Comité | Salir y entrar con otro usuario | ✅ Comité entra en `/home` |
| Comité | Estado en el panel de evaluación: combobox con punto de color; se abre hacia arriba si no cabe | ✅ |
| Comité | Beneficios con icono en el detalle | ✅ |

Pendiente: aplicar `20261102010000_idea_author_policies.sql` y probar proponer, publicar, sugerir y aceptar con los tres usuarios.

## Ronda 3 · 2026-11-02 · con la migración `20261102010000` aplicada

| Usuario | Caso | Resultado |
|---|---|---|
| Comité | CHI-015 (incompleta) borrada | ✅ 14 chispas, como en la semilla |
| Colaborador | El borrador de proponer se recupera en el paso 5 | ✅ |
| Colaborador | Enviar chispa en RET-004 | ✅ **CHI-016**, pantalla de confirmación; beneficios con icono guardados; borrador limpio; aparece en Mis chispas |
| Colaborador | Lista de pasos de la confirmación sin números | ❌ (el reset de Tailwind quitaba los marcadores) → ✅ |
| Colaborador | Sugerir reto en su departamento buscando por empresa y departamento | ✅ "Sugerencia enviada al encargado" |
| Encargado | Mi área: ve la sugerencia de Colaborador y la publica | ✅ "Reto publicado" |
| Encargado | Publicar reto en Sistemas | ✅ **RET-012** publicado con 2 tipos |
| Encargado | Buscar "área + ciudad" en área | ❌ sin resultados (buscaba la frase entera) → ✅ ahora cada palabra puede ir en cualquier orden |
| Encargado | Publicar en un área que no es suya (un área ajena) | ✅ se envía como sugerencia |
| Comité | Evaluación: ve la sugerencia de Encargado | ✅ |
| Comité | Evaluar CHI-016 y buscar estado "revision" sin acento | ✅ "En revisión", evaluación guardada |
| Comité | Archivar la sugerencia | ✅ "Sugerencia archivada" |
| Comité | El reto archivado contaba en "Retos" | ❌ 13 → ✅ ya no cuenta ni sale en "Todos" |
| Colaborador | Mis chispas: CHI-016 en "En revisión" | ✅ |
| Colaborador | Retos: aparecen los dos retos nuevos, el archivado no | ✅ |

Flujo completo cerrado con los tres roles.
