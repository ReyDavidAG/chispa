import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";

const root = process.argv[2];
const db = new PGlite();
const ok = (m) => console.log("ok  ", m);
const fail = (m) => { console.log("FAIL", m); process.exitCode = 1; };

await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);
await db.exec(readFileSync(`${root}/supabase/migrations/20261102000000_init.sql`, "utf8"));
await db.exec(`
  grant usage on schema public to anon, authenticated;
  grant select, insert, update, delete on all tables in schema public to authenticated;
  revoke select on public.ideas from authenticated;
  grant select (id, fair_id, folio, challenge_id, is_anonymous, status, support_count, comment_count, created_at) on public.ideas to authenticated;
  grant usage on all sequences in schema public to authenticated;
`);
await db.exec(readFileSync(`${root}/supabase/seed_demo_org.sql`, "utf8"));
await db.exec(readFileSync(`${root}/supabase/seed.sql`, "utf8"));
ok("migración y semilla aplicadas");

const U = { member: "11111111-1111-1111-1111-111111111111", lead: "22222222-2222-2222-2222-222222222222", committee: "33333333-3333-3333-3333-333333333333", other: "44444444-4444-4444-4444-444444444444", dept: "66666666-6666-6666-6666-666666666666" };
await db.exec(`
  insert into people (employee_number, full_name, area_id, auth_subject) values
    ('10001', 'Colaborador Uno', (select id from areas where code='CALI'), '${U.member}'),
    ('10002', 'Responsable Mtto', (select id from areas where code='MANT'), '${U.lead}'),
    ('10003', 'Comité Tres', (select id from areas where code='RHUM'), '${U.committee}'),
    ('10004', 'Colaborador Cuatro', (select id from areas where code='RHUM'), '${U.other}');
  insert into people (employee_number, full_name, area_id, department_id, auth_subject) values
    ('10005', 'Encargado Eléctrico', (select id from areas where code='MANT'), (select d.id from departments d join areas a on a.id = d.area_id where a.code='MANT' and d.code='ELEC'), '${U.dept}');
  update areas set manager_id = (select id from people where employee_number='10002') where code='MANT';
  update departments set manager_id = (select id from people where employee_number='10005') where code='ELEC';
  insert into fair_committee select f.id, p.id from fairs f, people p where f.is_current and p.employee_number='10003';
`);

async function as(user, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user}', false); set role authenticated;`);
  try { return await db.query(sql, params); } finally { await db.exec("reset role;"); }
}
async function expectError(label, fn) {
  try { await fn(); fail(`${label}: debió fallar`); } catch { ok(label); }
}

const base = `fair_id, area_id, owner_id, title, summary, problem, affects, frequency, tried, success, closes_on`;
const values = (status, owner) => `(select id from fairs where is_current), (select id from areas where code='MANT'), (select id from people where employee_number='${owner}'),
  'Las órdenes de mantenimiento se pierden', 'Cada falla se reporta por un canal distinto.', 'Los reportes de falla llegan en hojas, mensajes y de palabra, y se pierden.',
  'Técnicos', '40 por semana', 'Un Excel', 'Que cada falla tenga folio', current_date + 20`;

const c1 = await as(U.lead, `insert into challenges (${base}) values (${values("open", "10002")}) returning id, folio, published_at`);
c1.rows[0].folio === 1 && c1.rows[0].published_at ? ok("responsable publica reto: folio 1 y publicado") : fail("folio/publicado");
const challengeId = c1.rows[0].id;

await expectError("colaborador no puede publicar reto abierto", () => as(U.member, `insert into challenges (${base}) values (${values("open", "10001")})`));
const sug = await as(U.member, `insert into challenges (${base}, status, suggested_by) values (${values("suggested", "10002")}, 'suggested', (select id from people where employee_number='10001')) returning folio, published_at`);
sug.rows[0].published_at === null ? ok("colaborador sugiere reto (sin publicar)") : fail("sugerido publicado");
const seenByOther = await as(U.other, `select count(*)::int n from challenges where status='suggested'`);
seenByOther.rows[0].n === 0 ? ok("otro colaborador no ve el reto sugerido") : fail("sugerido visible");

const ideaSql = (author, anon) => `insert into ideas (challenge_id, author_id, is_anonymous, solution_type_code, title, summary, how)
  values ('${challengeId}', (select id from people where employee_number='${author}'), ${anon}, 'software', 'Reportar con QR', 'Escaneas el QR y queda la orden con folio.', 'Cada equipo lleva un QR que abre la captura.')`;
await as(U.member, ideaSql("10001", "true"));
await expectError("no se puede proponer a nombre de otro", () => as(U.member, ideaSql("10004", "false")));
await as(U.other, ideaSql("10004", "false"));
const counts = await db.query(`select idea_count from challenges where id = $1`, [challengeId]);
counts.rows[0].idea_count === 2 ? ok("contador de chispas del reto = 2") : fail(`idea_count ${counts.rows[0].idea_count}`);
const folios = await db.query(`select string_agg(folio::text, ',' order by folio) f from ideas`);
folios.rows[0].f === "1,2" ? ok("folios de chispa 1,2") : fail(folios.rows[0].f);

const ideas = await as(U.other, `select id, folio, author_id, is_anonymous from idea_cards order by folio`);
const anonIdea = ideas.rows[0];
anonIdea.author_id === null ? ok("chispa anónima oculta al autor para otros") : fail("anónimo expuesto");
await expectError("la tabla ideas no expone author_id al cliente", () => as(U.other, `select author_id from ideas`));
const byCommittee = await as(U.committee, `select author_id from idea_cards where id = $1`, [anonIdea.id]);
byCommittee.rows[0].author_id ? ok("el comité sí ve al autor anónimo") : fail("comité sin autor");
const byAuthor = await as(U.member, `select author_id from idea_cards where id = $1`, [anonIdea.id]);
byAuthor.rows[0].author_id ? ok("el autor se ve a sí mismo") : fail("autor sin su nombre");

await as(U.other, `insert into supports (idea_id, person_id) values ($1, (select id from people where employee_number='10004'))`, [anonIdea.id]);
await expectError("no se puede avivar dos veces", () => as(U.other, `insert into supports (idea_id, person_id) values ($1, (select id from people where employee_number='10004'))`, [anonIdea.id]));
await expectError("no se puede avivar a nombre de otro", () => as(U.other, `insert into supports (idea_id, person_id) values ($1, (select id from people where employee_number='10001'))`, [anonIdea.id]));
let sc = await db.query(`select i.support_count s, c.support_count cs from ideas i join challenges c on c.id = i.challenge_id where i.id = $1`, [anonIdea.id]);
sc.rows[0].s === 1 && sc.rows[0].cs === 1 ? ok("contadores de avivadas en chispa y reto") : fail(JSON.stringify(sc.rows[0]));
const mine = await as(U.other, `select supported_by_me from idea_cards where id = $1`, [anonIdea.id]);
mine.rows[0].supported_by_me ? ok("supported_by_me") : fail("supported_by_me");
await as(U.other, `delete from supports where idea_id = $1`, [anonIdea.id]);
sc = await db.query(`select support_count s from ideas where id = $1`, [anonIdea.id]);
sc.rows[0].s === 0 ? ok("quitar avivada descuenta") : fail("no descontó");

await as(U.other, `insert into comments (idea_id, author_id, body) values ($1, (select id from people where employee_number='10004'), 'Buena idea')`, [anonIdea.id]);
sc = await db.query(`select comment_count c from ideas where id = $1`, [anonIdea.id]);
sc.rows[0].c === 1 ? ok("contador de comentarios") : fail("comentarios");

const upd = await as(U.member, `update ideas set status = 'selected' where id = $1 returning id`, [anonIdea.id]);
upd.rows.length === 0 ? ok("colaborador no puede cambiar el estado") : fail("colaborador cambió estado");
await as(U.lead, `update ideas set status = 'review' where id = $1`, [anonIdea.id]);
const ev = await db.query(`select string_agg(coalesce(from_status,'-') || '>' || to_status, ' ' order by id) e from idea_status_events where idea_id = $1`, [anonIdea.id]);
ev.rows[0].e === "->received received>review" ? ok("historial de estados: " + ev.rows[0].e) : fail(ev.rows[0].e);
const notif = await as(U.member, `select count(*)::int n from notifications`);
notif.rows[0].n === 1 ? ok("el autor recibe notificación del cambio") : fail("notificación");

const e = await as(U.committee, `insert into evaluations (idea_id, evaluator_id) values ($1, (select id from people where employee_number='10003')) returning id`, [anonIdea.id]);
await as(U.committee, `insert into evaluation_scores (evaluation_id, criterion_id, score) select $1, id, case code when 'impact' then 5 else 3 end from rubric_criteria`, [e.rows[0].id]);
const score = await as(U.committee, `select weighted_score::float s from idea_scores where idea_id = $1`, [anonIdea.id]);
Math.abs(score.rows[0].s - 3.67) < 0.01 ? ok("calificación ponderada 3.67 (impacto pesa 1.5)") : fail(String(score.rows[0].s));
await expectError("colaborador no puede evaluar", () => as(U.member, `insert into evaluations (idea_id, evaluator_id) values ($1, (select id from people where employee_number='10001'))`, [anonIdea.id]));

const req = await as(U.lead, `insert into requirements (idea_id, current_problem, users, proposal, success_criteria, created_by) values ($1, 'p', 'u', 'pr', 'sc', (select id from people where employee_number='10002')) returning id`, [anonIdea.id]);
req.rows.length === 1 ? ok("responsable genera ficha de requerimiento") : fail("ficha");

await db.exec(`update challenges set status = 'open' where status = 'suggested'`);
const pub = await db.query(`select count(*)::int n from challenges where status='open' and published_at is not null`);
pub.rows[0].n === 2 ? ok("aceptar un sugerido lo publica") : fail("sugerido no publicado");

const claim = await db.exec(`reset role; select set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', false); set role authenticated;`);
try { await db.query(`select public.claim_employee_number('10004')`); ok("claim_employee_number liga la sesión"); } catch (err) { fail("claim " + err.message); }
await db.exec("reset role;");
try { await as("55555555-5555-5555-5555-555555555555", `select public.claim_employee_number('123')`); fail("debió rechazar número corto"); } catch { ok("claim rechaza menos de 5 dígitos"); }
const act = await db.query(`select supports_7d, ideas_7d from challenge_activity_7d where challenge_id = $1`, [challengeId]);
act.rows[0].ideas_7d === 2 ? ok("actividad de 7 días para tendencia") : fail(JSON.stringify(act.rows[0]));

const deptOf = (code) => `(select d.id from departments d where d.code='${code}')`;
const inElec = await as(U.dept, `insert into challenges (${base}, department_id) values (${values("open", "10005")}, ${deptOf("ELEC")}) returning folio`);
inElec.rows.length === 1 ? ok("encargado de departamento publica en su departamento") : fail("depto propio");
await expectError("encargado de departamento no publica en otro departamento", () => as(U.dept, `insert into challenges (${base}, department_id) values (${values("open", "10005")}, ${deptOf("MECA")})`));
await expectError("encargado de departamento no publica a nivel área", () => as(U.dept, `insert into challenges (${base}) values (${values("open", "10005")})`));
await expectError("el departamento debe pertenecer al área del reto", () => db.query(`insert into challenges (${base}, department_id) values (${values("open", "10002")}, ${deptOf("LABO")})`));
const areaMgr = await as(U.lead, `insert into challenges (${base}, department_id) values (${values("open", "10002")}, ${deptOf("MECA")}) returning folio`);
areaMgr.rows.length === 1 ? ok("encargado del área publica en cualquier departamento del área") : fail("área → depto");
