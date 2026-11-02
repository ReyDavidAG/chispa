-- Chispa · esquema inicial (Supabase / Postgres 15+)
-- La explicación de cada decisión está en docs/database.md.

-- ───────────────────────── Organización (como en RH: empresa → área → departamento) ─────────────────────────

create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (length(code) between 1 and 10),
  name        text not null check (length(name) between 2 and 120),
  rh_key      text unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.areas (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies (id),
  code        text not null check (length(code) between 1 and 10),
  name        text not null check (length(name) between 2 and 80),
  manager_id  uuid,
  rh_key      integer unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (company_id, code)
);

create table public.departments (
  id          uuid primary key default gen_random_uuid(),
  area_id     uuid not null references public.areas (id),
  code        text not null check (length(code) between 1 and 10),
  name        text not null check (length(name) between 2 and 80),
  manager_id  uuid,
  rh_key      integer unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (area_id, code),
  unique (id, area_id)
);

create table public.people (
  id                  uuid primary key default gen_random_uuid(),
  employee_number     text not null unique check (employee_number ~ '^[0-9]{5,10}$'),
  full_name           text not null check (length(full_name) between 2 and 120),
  area_id             uuid not null references public.areas (id),
  department_id       uuid,
  auth_subject        text unique,
  is_admin            boolean not null default false,
  is_active           boolean not null default true,
  challenges_seen_at  timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  foreign key (department_id, area_id) references public.departments (id, area_id)
);
create index people_area_idx on public.people (area_id, department_id);

alter table public.areas add foreign key (manager_id) references public.people (id) on delete set null;
alter table public.departments add foreign key (manager_id) references public.people (id) on delete set null;
create index areas_manager_idx on public.areas (manager_id);
create index departments_manager_idx on public.departments (manager_id);

-- ───────────────────────── Feria (una por edición) ─────────────────────────

create table public.fairs (
  id          uuid primary key default gen_random_uuid(),
  edition     smallint not null unique check (edition between 2024 and 2100),
  name        text not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index fairs_one_current_idx on public.fairs (is_current) where is_current;

create table public.fair_stages (
  id          uuid primary key default gen_random_uuid(),
  fair_id     uuid not null references public.fairs (id) on delete cascade,
  code        text not null check (code in ('call', 'ideas', 'review', 'fair', 'build')),
  name        text not null,
  detail      text,
  position    smallint not null,
  starts_on   date not null,
  ends_on     date not null,
  check (ends_on >= starts_on),
  unique (fair_id, code),
  unique (fair_id, position)
);

create table public.fair_committee (
  fair_id     uuid not null references public.fairs (id) on delete cascade,
  person_id   uuid not null references public.people (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (fair_id, person_id)
);
create index fair_committee_person_idx on public.fair_committee (person_id);

create table public.rubric_criteria (
  id          uuid primary key default gen_random_uuid(),
  fair_id     uuid not null references public.fairs (id) on delete cascade,
  code        text not null check (code ~ '^[a-z_]{2,30}$'),
  name        text not null,
  hint        text,
  weight      numeric(4, 2) not null default 1 check (weight > 0),
  position    smallint not null,
  unique (fair_id, code)
);

-- ───────────────────────── Catálogos ─────────────────────────

create table public.solution_types (
  code      text primary key check (code ~ '^[a-z_]{2,30}$'),
  name      text not null,
  hint      text,
  position  smallint not null
);

create table public.benefits (
  code      text primary key check (code ~ '^[a-z_]{2,30}$'),
  name      text not null,
  position  smallint not null
);

-- ───────────────────────── Folios legibles (RET-001, CHI-001) ─────────────────────────

create table public.folio_counters (
  fair_id     uuid not null references public.fairs (id) on delete cascade,
  kind        text not null check (kind in ('RET', 'CHI')),
  last_value  integer not null default 0,
  primary key (fair_id, kind)
);

create function public.next_folio(p_fair uuid, p_kind text)
returns integer
language plpgsql
as $$
declare
  v integer;
begin
  insert into public.folio_counters (fair_id, kind, last_value)
  values (p_fair, p_kind, 1)
  on conflict (fair_id, kind) do update set last_value = public.folio_counters.last_value + 1
  returning last_value into v;
  return v;
end;
$$;

-- ───────────────────────── Retos ─────────────────────────

create table public.challenges (
  id             uuid primary key default gen_random_uuid(),
  fair_id        uuid not null references public.fairs (id),
  folio          integer not null,
  area_id        uuid not null references public.areas (id),
  department_id  uuid,
  owner_id       uuid not null references public.people (id),
  suggested_by   uuid references public.people (id),
  status         text not null default 'open'
                 check (status in ('suggested', 'open', 'review', 'building', 'solved', 'archived')),
  title          text not null check (length(title) between 12 and 110),
  summary        text not null check (length(summary) between 20 and 200),
  problem        text not null check (length(problem) >= 40),
  affects        text not null,
  frequency      text not null,
  tried          text not null,
  success        text not null,
  constraints    text,
  closes_on      date not null,
  published_at   timestamptz,
  idea_count     integer not null default 0 check (idea_count >= 0),
  support_count  integer not null default 0 check (support_count >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (fair_id, folio),
  check (status <> 'suggested' or published_at is null),
  foreign key (department_id, area_id) references public.departments (id, area_id)
);
create index challenges_list_idx on public.challenges (fair_id, status, published_at desc);
create index challenges_area_idx on public.challenges (area_id, department_id, status);

create table public.challenge_solution_types (
  challenge_id        uuid not null references public.challenges (id) on delete cascade,
  solution_type_code  text not null references public.solution_types (code),
  primary key (challenge_id, solution_type_code)
);

-- ───────────────────────── Chispas ─────────────────────────

create table public.ideas (
  id                  uuid primary key default gen_random_uuid(),
  fair_id             uuid not null references public.fairs (id),
  folio               integer not null,
  challenge_id        uuid not null references public.challenges (id),
  author_id           uuid not null references public.people (id),
  is_anonymous        boolean not null default false,
  wants_to_join       boolean not null default false,
  status              text not null default 'received'
                      check (status in ('received', 'review', 'selected', 'building', 'done', 'archived')),
  solution_type_code  text not null references public.solution_types (code),
  title               text not null check (length(title) between 8 and 90),
  summary             text not null check (length(summary) between 20 and 280),
  how                 text not null check (length(how) >= 20),
  estimate            text,
  support_count       integer not null default 0 check (support_count >= 0),
  comment_count       integer not null default 0 check (comment_count >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (fair_id, folio)
);
create index ideas_challenge_idx on public.ideas (challenge_id, support_count desc);
create index ideas_author_idx on public.ideas (author_id);
create index ideas_status_idx on public.ideas (fair_id, status);

create table public.idea_benefits (
  idea_id       uuid not null references public.ideas (id) on delete cascade,
  benefit_code  text not null references public.benefits (code),
  primary key (idea_id, benefit_code)
);

create table public.idea_needs (
  id        uuid primary key default gen_random_uuid(),
  idea_id   uuid not null references public.ideas (id) on delete cascade,
  label     text not null check (length(label) between 1 and 80),
  position  smallint not null,
  unique (idea_id, position)
);

create table public.idea_status_events (
  id           bigint generated always as identity primary key,
  idea_id      uuid not null references public.ideas (id) on delete cascade,
  from_status  text,
  to_status    text not null,
  changed_by   uuid references public.people (id),
  note         text,
  created_at   timestamptz not null default now()
);
create index idea_status_events_idea_idx on public.idea_status_events (idea_id, created_at);

-- ───────────────────────── Participación ─────────────────────────

create table public.supports (
  idea_id     uuid not null references public.ideas (id) on delete cascade,
  person_id   uuid not null references public.people (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (idea_id, person_id)
);
create index supports_person_idx on public.supports (person_id);
create index supports_recent_idx on public.supports (created_at);

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  idea_id     uuid not null references public.ideas (id) on delete cascade,
  author_id   uuid not null references public.people (id),
  parent_id   uuid references public.comments (id),
  body        text not null check (length(body) between 2 and 1000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index comments_idea_idx on public.comments (idea_id, created_at);

-- ───────────────────────── Evaluación ─────────────────────────

create table public.evaluations (
  id            uuid primary key default gen_random_uuid(),
  idea_id       uuid not null references public.ideas (id) on delete cascade,
  evaluator_id  uuid not null references public.people (id),
  comment       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (idea_id, evaluator_id)
);

create table public.evaluation_scores (
  evaluation_id  uuid not null references public.evaluations (id) on delete cascade,
  criterion_id   uuid not null references public.rubric_criteria (id),
  score          smallint not null check (score between 1 and 5),
  primary key (evaluation_id, criterion_id)
);

create table public.requirements (
  id                   uuid primary key default gen_random_uuid(),
  idea_id              uuid not null unique references public.ideas (id) on delete cascade,
  status               text not null default 'draft'
                       check (status in ('draft', 'validated', 'in_backlog', 'discarded')),
  current_problem      text not null,
  users                text not null,
  volume               text,
  proposal             text not null,
  needs                text,
  expected_benefit     text,
  success_criteria     text not null,
  constraints          text,
  acceptance_criteria  text,
  next_step            text,
  created_by           uuid not null references public.people (id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  person_id     uuid not null references public.people (id) on delete cascade,
  kind          text not null check (kind in ('idea_status', 'idea_comment', 'challenge_new', 'challenge_accepted')),
  idea_id       uuid references public.ideas (id) on delete cascade,
  challenge_id  uuid references public.challenges (id) on delete cascade,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index notifications_inbox_idx on public.notifications (person_id, read_at, created_at desc);

-- ───────────────────────── Sesión ─────────────────────────

create function public.current_person_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.people where auth_subject = auth.uid()::text and is_active;
$$;

create function public.is_committee(p_fair uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.fair_committee where fair_id = p_fair and person_id = public.current_person_id())
      or exists (select 1 from public.people where id = public.current_person_id() and is_admin);
$$;

create function public.can_manage(p_area uuid, p_department uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.areas where id = p_area and manager_id = public.current_person_id())
      or exists (select 1 from public.departments where id = p_department and area_id = p_area and manager_id = public.current_person_id());
$$;

-- ───────────────────────── Triggers ─────────────────────────

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger people_touch before update on public.people for each row execute function public.touch_updated_at();
create trigger challenges_touch before update on public.challenges for each row execute function public.touch_updated_at();
create trigger ideas_touch before update on public.ideas for each row execute function public.touch_updated_at();
create trigger comments_touch before update on public.comments for each row execute function public.touch_updated_at();
create trigger evaluations_touch before update on public.evaluations for each row execute function public.touch_updated_at();
create trigger requirements_touch before update on public.requirements for each row execute function public.touch_updated_at();

create function public.assign_challenge_folio()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.folio := public.next_folio(new.fair_id, 'RET');
  if new.status <> 'suggested' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;
create trigger challenges_folio before insert on public.challenges for each row execute function public.assign_challenge_folio();

create function public.publish_accepted_challenge()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'suggested' and new.status not in ('suggested', 'archived') and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;
create trigger challenges_publish before update of status on public.challenges for each row execute function public.publish_accepted_challenge();

create function public.prepare_idea()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select fair_id into new.fair_id from public.challenges where id = new.challenge_id;
  new.folio := public.next_folio(new.fair_id, 'CHI');
  new.status := 'received';
  new.support_count := 0;
  new.comment_count := 0;
  return new;
end;
$$;
create trigger ideas_prepare before insert on public.ideas for each row execute function public.prepare_idea();

create function public.count_ideas()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.challenges set idea_count = idea_count + 1 where id = new.challenge_id;
    insert into public.idea_status_events (idea_id, to_status, changed_by) values (new.id, new.status, new.author_id);
  elsif tg_op = 'DELETE' then
    update public.challenges
       set idea_count = idea_count - 1, support_count = support_count - old.support_count
     where id = old.challenge_id;
  end if;
  return null;
end;
$$;
create trigger ideas_count after insert or delete on public.ideas for each row execute function public.count_ideas();

create function public.log_idea_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.idea_status_events (idea_id, from_status, to_status, changed_by)
  values (new.id, old.status, new.status, public.current_person_id());
  insert into public.notifications (person_id, kind, idea_id) values (new.author_id, 'idea_status', new.id);
  return null;
end;
$$;
create trigger ideas_status_log after update of status on public.ideas
  for each row when (old.status is distinct from new.status) execute function public.log_idea_status();

create function public.count_supports()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  delta integer := case when tg_op = 'INSERT' then 1 else -1 end;
  target uuid := coalesce(new.idea_id, old.idea_id);
begin
  update public.ideas set support_count = support_count + delta where id = target;
  update public.challenges c set support_count = c.support_count + delta
    from public.ideas i where i.id = target and c.id = i.challenge_id;
  return null;
end;
$$;
create trigger supports_count after insert or delete on public.supports for each row execute function public.count_supports();

create function public.count_comments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.ideas set comment_count = comment_count + 1 where id = new.idea_id;
  elsif tg_op = 'UPDATE' and old.deleted_at is null and new.deleted_at is not null then
    update public.ideas set comment_count = comment_count - 1 where id = new.idea_id;
  end if;
  return null;
end;
$$;
create trigger comments_count after insert or update of deleted_at on public.comments for each row execute function public.count_comments();

-- ───────────────────────── Vistas de lectura ─────────────────────────

create view public.idea_cards
with (security_barrier = true)
as
select
  i.id,
  i.fair_id,
  'CHI-' || lpad(i.folio::text, 3, '0') as folio,
  i.challenge_id,
  case when i.is_anonymous and i.author_id is distinct from public.current_person_id() and not public.is_committee(i.fair_id)
       then null else i.author_id end as author_id,
  i.is_anonymous,
  i.wants_to_join,
  i.status,
  i.solution_type_code,
  i.title,
  i.summary,
  i.how,
  i.estimate,
  i.support_count,
  i.comment_count,
  i.created_at,
  exists (select 1 from public.supports s where s.idea_id = i.id and s.person_id = public.current_person_id()) as supported_by_me
from public.ideas i;

create view public.challenge_activity_7d
with (security_invoker = true)
as
select
  c.id as challenge_id,
  count(distinct s.person_id) filter (where s.created_at > now() - interval '7 days') as supports_7d,
  count(distinct i.id) filter (where i.created_at > now() - interval '7 days') as ideas_7d
from public.challenges c
left join public.ideas i on i.challenge_id = c.id
left join public.supports s on s.idea_id = i.id
group by c.id;

create view public.idea_scores
with (security_invoker = true)
as
select
  e.idea_id,
  count(distinct e.id) as evaluator_count,
  round(sum(sc.score * rc.weight) / nullif(sum(rc.weight), 0), 2) as weighted_score
from public.evaluations e
join public.evaluation_scores sc on sc.evaluation_id = e.id
join public.rubric_criteria rc on rc.id = sc.criterion_id
group by e.idea_id;

-- ───────────────────────── Login simulado (fase 1) ─────────────────────────

create function public.claim_employee_number(p_employee_number text)
returns public.people
language plpgsql
security definer
set search_path = public
as $$
declare
  p public.people;
begin
  if auth.uid() is null then
    raise exception 'Sin sesión';
  end if;
  if p_employee_number !~ '^[0-9]{5,10}$' then
    raise exception 'El número de trabajador debe tener al menos 5 dígitos';
  end if;
  update public.people set auth_subject = null where auth_subject = auth.uid()::text and employee_number <> p_employee_number;
  update public.people set auth_subject = auth.uid()::text
   where employee_number = p_employee_number and is_active
  returning * into p;
  if p.id is null then
    raise exception 'No encontramos ese número de trabajador';
  end if;
  return p;
end;
$$;

-- ───────────────────────── Seguridad (RLS) ─────────────────────────

alter table public.companies enable row level security;
alter table public.areas enable row level security;
alter table public.people enable row level security;
alter table public.departments enable row level security;
alter table public.fairs enable row level security;
alter table public.fair_stages enable row level security;
alter table public.fair_committee enable row level security;
alter table public.rubric_criteria enable row level security;
alter table public.solution_types enable row level security;
alter table public.benefits enable row level security;
alter table public.folio_counters enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_solution_types enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_benefits enable row level security;
alter table public.idea_needs enable row level security;
alter table public.idea_status_events enable row level security;
alter table public.supports enable row level security;
alter table public.comments enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluation_scores enable row level security;
alter table public.requirements enable row level security;
alter table public.notifications enable row level security;

create policy read_catalog on public.companies for select to authenticated using (true);
create policy read_catalog on public.areas for select to authenticated using (true);
create policy read_catalog on public.departments for select to authenticated using (true);
create policy read_catalog on public.fairs for select to authenticated using (true);
create policy read_catalog on public.fair_stages for select to authenticated using (true);
create policy read_catalog on public.fair_committee for select to authenticated using (true);
create policy read_catalog on public.rubric_criteria for select to authenticated using (true);
create policy read_catalog on public.solution_types for select to authenticated using (true);
create policy read_catalog on public.benefits for select to authenticated using (true);

create policy read_people on public.people for select to authenticated using (is_active);
create policy update_self on public.people for update to authenticated
  using (id = public.current_person_id()) with check (id = public.current_person_id());

create policy read_challenges on public.challenges for select to authenticated
  using (status <> 'suggested' or suggested_by = public.current_person_id() or public.can_manage(area_id, department_id) or public.is_committee(fair_id));
create policy create_challenge on public.challenges for insert to authenticated
  with check (
    (status = 'suggested' and suggested_by = public.current_person_id())
    or (status = 'open' and owner_id = public.current_person_id() and (public.can_manage(area_id, department_id) or public.is_committee(fair_id)))
  );
create policy manage_challenge on public.challenges for update to authenticated
  using (public.can_manage(area_id, department_id) or public.is_committee(fair_id))
  with check (public.can_manage(area_id, department_id) or public.is_committee(fair_id));

create policy read_challenge_types on public.challenge_solution_types for select to authenticated using (true);
create policy write_challenge_types on public.challenge_solution_types for all to authenticated
  using (exists (select 1 from public.challenges c where c.id = challenge_id and (c.suggested_by = public.current_person_id() or public.can_manage(c.area_id, c.department_id) or public.is_committee(c.fair_id))))
  with check (exists (select 1 from public.challenges c where c.id = challenge_id and (c.suggested_by = public.current_person_id() or public.can_manage(c.area_id, c.department_id) or public.is_committee(c.fair_id))));

create policy create_idea on public.ideas for insert to authenticated
  with check (author_id = public.current_person_id()
              and exists (select 1 from public.challenges c where c.id = challenge_id and c.status = 'open' and c.closes_on >= current_date));
create policy evaluate_idea on public.ideas for update to authenticated
  using (exists (select 1 from public.challenges c where c.id = challenge_id and (public.can_manage(c.area_id, c.department_id) or public.is_committee(c.fair_id))));

create policy read_idea_details on public.idea_benefits for select to authenticated using (true);
create policy write_idea_benefits on public.idea_benefits for insert to authenticated
  with check (exists (select 1 from public.ideas i where i.id = idea_id and i.author_id = public.current_person_id()));
create policy read_idea_needs on public.idea_needs for select to authenticated using (true);
create policy write_idea_needs on public.idea_needs for insert to authenticated
  with check (exists (select 1 from public.ideas i where i.id = idea_id and i.author_id = public.current_person_id()));
create policy read_idea_events on public.idea_status_events for select to authenticated using (true);

create policy read_supports on public.supports for select to authenticated using (true);
create policy own_supports on public.supports for insert to authenticated with check (person_id = public.current_person_id());
create policy remove_own_supports on public.supports for delete to authenticated using (person_id = public.current_person_id());

create policy read_comments on public.comments for select to authenticated using (deleted_at is null);
create policy own_comments on public.comments for insert to authenticated with check (author_id = public.current_person_id());
create policy edit_own_comments on public.comments for update to authenticated
  using (author_id = public.current_person_id()) with check (author_id = public.current_person_id());

create policy read_evaluations on public.evaluations for select to authenticated
  using (evaluator_id = public.current_person_id()
         or exists (select 1 from public.ideas i join public.challenges c on c.id = i.challenge_id
                    where i.id = idea_id and (public.can_manage(c.area_id, c.department_id) or public.is_committee(c.fair_id))));
create policy write_evaluations on public.evaluations for all to authenticated
  using (evaluator_id = public.current_person_id())
  with check (evaluator_id = public.current_person_id()
              and exists (select 1 from public.ideas i join public.challenges c on c.id = i.challenge_id
                          where i.id = idea_id and (public.can_manage(c.area_id, c.department_id) or public.is_committee(c.fair_id))));
create policy read_scores on public.evaluation_scores for select to authenticated
  using (exists (select 1 from public.evaluations e where e.id = evaluation_id));
create policy write_scores on public.evaluation_scores for all to authenticated
  using (exists (select 1 from public.evaluations e where e.id = evaluation_id and e.evaluator_id = public.current_person_id()))
  with check (exists (select 1 from public.evaluations e where e.id = evaluation_id and e.evaluator_id = public.current_person_id()));

create policy read_requirements on public.requirements for select to authenticated using (true);
create policy write_requirements on public.requirements for all to authenticated
  using (exists (select 1 from public.ideas i join public.challenges c on c.id = i.challenge_id
                 where i.id = idea_id and (public.can_manage(c.area_id, c.department_id) or public.is_committee(c.fair_id))))
  with check (created_by = public.current_person_id()
              and exists (select 1 from public.ideas i join public.challenges c on c.id = i.challenge_id
                          where i.id = idea_id and (public.can_manage(c.area_id, c.department_id) or public.is_committee(c.fair_id))));

create policy own_notifications on public.notifications for select to authenticated using (person_id = public.current_person_id());
create policy read_own_notifications on public.notifications for update to authenticated
  using (person_id = public.current_person_id()) with check (person_id = public.current_person_id());

create policy read_ideas on public.ideas for select to authenticated using (true);
revoke select on public.ideas from anon, authenticated;
grant select (id, fair_id, folio, challenge_id, is_anonymous, status, support_count, comment_count, created_at) on public.ideas to authenticated;
grant select on public.idea_cards to authenticated;
grant select on public.challenge_activity_7d to authenticated;
grant select on public.idea_scores to authenticated;
revoke execute on function public.claim_employee_number(text) from public, anon;
grant execute on function public.claim_employee_number(text) to authenticated;
