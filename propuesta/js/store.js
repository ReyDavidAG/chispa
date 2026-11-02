import * as seed from "./data.js";

const KEY = "chispa.demo.v1";

const empty = () => ({
  session: null,
  ideas: [],
  challenges: [],
  supports: [],
  comments: [],
  evaluations: {},
  statusOverrides: {},
  draft: null,
  challengesSeenAt: "2026-10-26T23:59:59",
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((fn) => fn());
}

export const onChange = (fn) => listeners.add(fn);

export const areaById = (id) => seed.areas.find((a) => a.id === id);
export const departmentById = (id) => seed.departments.find((d) => d.id === id);
export const departmentsOf = (areaId) => seed.departments.filter((d) => d.areaId === areaId);

export function personById(id) {
  if (state.session && id === state.session.id) return state.session;
  return seed.people.find((p) => p.id === id);
}

export const session = () => state.session;

export function findProfile(employeeNumber) {
  const n = Number(employeeNumber);
  const name = seed.demoNames[n % seed.demoNames.length];
  const area = seed.areas[n % seed.areas.length];
  return { id: `u${employeeNumber}`, employeeNumber, name, areaId: area.id, role: "member" };
}

export function signIn(profile) {
  state.session = profile;
  save();
}

export function signOut() {
  state.session = null;
  save();
}

export function setRole(role) {
  if (!state.session) return;
  state.session = { ...state.session, role };
  save();
}

export function resetDemo() {
  const s = state.session;
  state = { ...empty(), session: s };
  save();
}

const withStatus = (idea) => ({ ...idea, status: state.statusOverrides[idea.id] ?? idea.status });

export const challenges = {
  all: () => [...state.challenges, ...seed.challenges],
  byId: (id) => challenges.all().find((c) => c.id === id),
  create(input) {
    const all = challenges.all();
    const id = `RET-${String(all.length + 1).padStart(3, "0")}`;
    const record = { ...input, id, openedAt: today(), publishedAt: new Date().toISOString() };
    state.challenges = [record, ...state.challenges];
    save();
    return record;
  },
};

export const ideas = {
  all: () => [...state.ideas, ...seed.ideas].map(withStatus),
  byId: (id) => ideas.all().find((i) => i.id === id),
  byChallenge: (challengeId) => ideas.all().filter((i) => i.challengeId === challengeId),
  byAuthor: (authorId) => ideas.all().filter((i) => i.authorId === authorId),
  create(input) {
    const id = `CHI-${String(ideas.all().length + 1).padStart(3, "0")}`;
    const record = { ...input, id, status: "received", supports: 0, createdAt: today() };
    state.ideas = [record, ...state.ideas];
    state.draft = null;
    save();
    return record;
  },
  setStatus(id, status) {
    state.statusOverrides[id] = status;
    save();
  },
};

export const supports = {
  has: (ideaId) => state.supports.includes(ideaId),
  count: (idea) => idea.supports + (state.supports.includes(idea.id) ? 1 : 0),
  toggle(ideaId) {
    state.supports = supports.has(ideaId)
      ? state.supports.filter((id) => id !== ideaId)
      : [...state.supports, ideaId];
    save();
  },
  mine: () => state.supports,
};

export const comments = {
  byIdea: (ideaId) =>
    [...seed.comments, ...state.comments].filter((c) => c.ideaId === ideaId),
  count: (ideaId) => comments.byIdea(ideaId).length,
  add(ideaId, text) {
    state.comments = [
      ...state.comments,
      { id: `c${Date.now()}`, ideaId, authorId: state.session.id, text, createdAt: today() },
    ];
    save();
  },
};

export const evaluations = {
  get: (ideaId) => state.evaluations[ideaId] ?? null,
  set(ideaId, scores) {
    state.evaluations[ideaId] = scores;
    save();
  },
};

export const draft = {
  get: () => state.draft,
  set(value) {
    state.draft = value;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  },
};

export function today() {
  return new Date().toISOString().slice(0, 10);
}

const freshThisVisit = new Set();

export const novelty = {
  unseen: () =>
    challenges
      .all()
      .filter((c) => c.status !== "suggested" && c.ownerId !== state.session?.id && (c.publishedAt ?? c.openedAt) > state.challengesSeenAt)
      .sort((a, b) => (b.publishedAt ?? b.openedAt).localeCompare(a.publishedAt ?? a.openedAt)),
  count: () => novelty.unseen().length,
  isNew: (c) => freshThisVisit.has(c.id) || novelty.unseen().some((x) => x.id === c.id),
  markSeen() {
    const pending = novelty.unseen();
    if (!pending.length) return false;
    pending.forEach((c) => freshThisVisit.add(c.id));
    state.challengesSeenAt = new Date().toISOString();
    save();
    return true;
  },
};

const challengeHeat = (c) => {
  const list = ideas.byChallenge(c.id);
  return { supports: list.reduce((s, i) => s + supports.count(i), 0), ideas: list.length };
};

export const trending = {
  heat: challengeHeat,
  challenges() {
    return challenges
      .all()
      .filter((c) => c.status === "open")
      .map((c) => ({ c, h: challengeHeat(c) }))
      .map((x) => ({ ...x, score: x.h.supports + x.h.ideas * 12 }))
      .filter((x) => x.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  },
  isHotChallenge: (c) => trending.challenges().some((x) => x.c.id === c.id),
  reason(c) {
    const h = challengeHeat(c);
    return h.ideas >= 3 ? { kind: "busy", label: "Muy concurrido", detail: `${h.ideas} chispas` } : { kind: "supported", label: "Muy avivado", detail: `${h.supports} avivadas` };
  },
  ideas() {
    return ideas
      .all()
      .filter((i) => i.status !== "archived" && supports.count(i) >= 25)
      .sort((a, b) => supports.count(b) - supports.count(a))
      .slice(0, 3);
  },
  isHotIdea: (i) => trending.ideas().some((x) => x.id === i.id),
};
