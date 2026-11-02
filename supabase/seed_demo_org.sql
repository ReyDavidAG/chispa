insert into public.companies (code, name) values ('DEMO', 'Empresa de ejemplo');

insert into public.areas (company_id, code, name)
select c.id, a.code, a.name
from public.companies c, (values
  ('PROD', 'Producción'),
  ('MANT', 'Mantenimiento'),
  ('CALI', 'Calidad'),
  ('LOGI', 'Logística'),
  ('RHUM', 'Recursos Humanos'),
  ('TECN', 'Tecnología'),
  ('FINA', 'Finanzas'),
  ('SEGU', 'Seguridad e Higiene')
) as a (code, name)
where c.code = 'DEMO';

insert into public.departments (area_id, code, name)
select a.id, d.code, d.name
from public.areas a
join (values
  ('PROD', 'NAVE', 'Naves de producción'),
  ('PROD', 'EMPA', 'Empaque'),
  ('MANT', 'ELEC', 'Mantenimiento eléctrico'),
  ('MANT', 'MECA', 'Mantenimiento mecánico'),
  ('CALI', 'LABO', 'Laboratorio'),
  ('LOGI', 'EMBA', 'Embarques'),
  ('LOGI', 'ALMA', 'Almacén'),
  ('RHUM', 'NOMI', 'Nóminas'),
  ('RHUM', 'CAPA', 'Capacitación'),
  ('TECN', 'SOPO', 'Soporte'),
  ('TECN', 'DESA', 'Desarrollo'),
  ('FINA', 'CXP', 'Cuentas por pagar'),
  ('SEGU', 'SEIN', 'Seguridad industrial')
) as d (area_code, code, name) on d.area_code = a.code;
