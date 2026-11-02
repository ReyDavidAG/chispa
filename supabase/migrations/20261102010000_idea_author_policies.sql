-- El autor no podía guardar beneficios ni necesidades de su chispa: la política leía ideas.author_id,
-- columna que el cliente no puede ver (protege el anonimato). Se valida con una función segura.

create function public.is_idea_author(p_idea uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.ideas where id = p_idea and author_id = public.current_person_id());
$$;

drop policy write_idea_benefits on public.idea_benefits;
create policy write_idea_benefits on public.idea_benefits for insert to authenticated
  with check (public.is_idea_author(idea_id));

drop policy write_idea_needs on public.idea_needs;
create policy write_idea_needs on public.idea_needs for insert to authenticated
  with check (public.is_idea_author(idea_id));

-- Proponer en una sola transacción: la chispa, sus beneficios y sus necesidades, o nada.
-- security invoker: aplican las mismas políticas RLS que a un insert directo.
create function public.submit_idea(
  p_challenge_id uuid,
  p_title text,
  p_summary text,
  p_how text,
  p_solution_type text,
  p_estimate text,
  p_is_anonymous boolean,
  p_wants_to_join boolean,
  p_benefits text[],
  p_needs text[]
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_folio integer;
begin
  if coalesce(array_length(p_benefits, 1), 0) = 0 then
    raise exception 'Elige al menos una mejora.';
  end if;
  insert into public.ideas (challenge_id, author_id, title, summary, how, solution_type_code, estimate, is_anonymous, wants_to_join)
  values (p_challenge_id, public.current_person_id(), p_title, p_summary, p_how, p_solution_type, nullif(p_estimate, ''), p_is_anonymous, p_wants_to_join)
  returning id, folio into v_id, v_folio;
  insert into public.idea_benefits (idea_id, benefit_code) select v_id, unnest(p_benefits);
  insert into public.idea_needs (idea_id, label, position)
    select v_id, n.label, n.ord::smallint from unnest(coalesce(p_needs, '{}')) with ordinality as n (label, ord);
  return 'CHI-' || lpad(v_folio::text, 3, '0');
end;
$$;

revoke execute on function public.submit_idea(uuid, text, text, text, text, text, boolean, boolean, text[], text[]) from public, anon;
grant execute on function public.submit_idea(uuid, text, text, text, text, text, boolean, boolean, text[], text[]) to authenticated;

-- Publicar o sugerir un reto en una sola transacción. La base decide: si quien lo manda es encargado
-- del área/departamento o comité, se publica a su nombre; si no, queda como sugerencia para el encargado.
create function public.submit_challenge(
  p_area_id uuid,
  p_department_id uuid,
  p_title text,
  p_summary text,
  p_problem text,
  p_affects text,
  p_frequency text,
  p_tried text,
  p_success text,
  p_constraints text,
  p_closes_on date,
  p_types text[]
)
returns table (folio text, status text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_me uuid := public.current_person_id();
  v_fair uuid;
  v_can boolean;
  v_owner uuid;
  v_id uuid;
  v_folio integer;
  v_status text;
begin
  if coalesce(array_length(p_types, 1), 0) = 0 then
    raise exception 'Elige al menos un tipo de solución.';
  end if;
  select id into v_fair from public.fairs where is_current;
  v_can := public.can_manage(p_area_id, p_department_id) or public.is_committee(v_fair);
  if v_can then
    v_owner := v_me;
    v_status := 'open';
  else
    select coalesce(
      (select d.manager_id from public.departments d where d.id = p_department_id),
      (select a.manager_id from public.areas a where a.id = p_area_id),
      v_me) into v_owner;
    v_status := 'suggested';
  end if;
  insert into public.challenges (fair_id, area_id, department_id, owner_id, suggested_by, status, title, summary, problem, affects, frequency, tried, success, constraints, closes_on)
  values (v_fair, p_area_id, p_department_id, v_owner, case when v_can then null else v_me end, v_status, p_title, p_summary, p_problem, p_affects, p_frequency, p_tried, p_success, nullif(p_constraints, ''), p_closes_on)
  returning id, challenges.folio into v_id, v_folio;
  insert into public.challenge_solution_types (challenge_id, solution_type_code) select v_id, unnest(p_types);
  return query select 'RET-' || lpad(v_folio::text, 3, '0'), v_status;
end;
$$;

revoke execute on function public.submit_challenge(uuid, uuid, text, text, text, text, text, text, text, text, date, text[]) from public, anon;
grant execute on function public.submit_challenge(uuid, uuid, text, text, text, text, text, text, text, text, date, text[]) to authenticated;
