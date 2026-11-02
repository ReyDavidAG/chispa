insert into public.solution_types (code, name, hint, position) values
  ('software', 'Sistema o app', 'Una pantalla, un reporte, una app.', 1),
  ('process', 'Cambio de proceso', 'Otra forma de hacer lo mismo.', 2),
  ('equipment', 'Equipo o infraestructura', 'Una herramienta, un sensor, una instalación.', 3),
  ('other', 'Otra cosa', 'Capacitación, comunicación, un acuerdo.', 4);

insert into public.benefits (code, name, position) values
  ('time', 'Ahorra tiempo', 1),
  ('money', 'Ahorra dinero', 2),
  ('safety', 'Más seguridad', 3),
  ('quality', 'Mejor calidad', 4),
  ('people', 'Mejor día a día', 5),
  ('control', 'Más control', 6);

with f as (
  insert into public.fairs (edition, name, is_current) values (2026, 'Feria de Innovación 2026', true) returning id
)
insert into public.fair_stages (fair_id, code, name, detail, position, starts_on, ends_on)
select f.id, s.code, s.name, s.detail, s.position, s.starts_on, s.ends_on
from f, (values
  ('call', 'Convocatoria', 'Las áreas publican sus retos.', 1, date '2026-10-13', date '2026-10-31'),
  ('ideas', 'Chispas', 'Todos proponen cómo resolverlos.', 2, date '2026-11-02', date '2026-11-28'),
  ('review', 'Evaluación', 'El comité califica con la rúbrica.', 3, date '2026-12-01', date '2026-12-12'),
  ('fair', 'Feria', 'Las finalistas se presentan.', 4, date '2026-12-17', date '2026-12-17'),
  ('build', 'Proyectos', 'Las elegidas se vuelven realidad.', 5, date '2027-01-11', date '2027-06-30')
) as s (code, name, detail, position, starts_on, ends_on);

insert into public.rubric_criteria (fair_id, code, name, hint, weight, position)
select f.id, r.code, r.name, r.hint, r.weight, r.position
from public.fairs f, (values
  ('impact', 'Impacto', 'Cuánta gente o cuánto proceso mejora.', 1.5, 1),
  ('feasibility', 'Factibilidad', 'Qué tan realista es hacerla con lo que tenemos.', 1.0, 2),
  ('cost', 'Costo', '5 = casi no cuesta; 1 = requiere una inversión fuerte.', 1.0, 3),
  ('reach', 'Alcance', 'Si sirve también a otras áreas o plantas.', 1.0, 4)
) as r (code, name, hint, weight, position)
where f.edition = 2026;
