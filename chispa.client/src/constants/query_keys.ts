export const QUERY_KEYS = {
	session: ['session'] as const,
	fair: ['fair', 'current'] as const,
	challenges: ['challenges'] as const,
	challenge: (folio: string) => ['challenges', folio] as const,
	activity: ['challenges', 'activity'] as const,
	challengeIdeas: (challengeId: string) =>
		['ideas', 'challenge', challengeId] as const,
	idea: (folio: string) => ['ideas', 'detail', folio] as const,
	myIdeas: (personId: string) => ['ideas', 'mine', personId] as const,
	supportedIdeas: (personId: string) =>
		['ideas', 'supported', personId] as const,
	topIdeas: ['ideas', 'top'] as const,
	allIdeas: ['ideas', 'all'] as const,
	authors: (ids: readonly string[]) =>
		['people', 'authors', [...ids].sort()] as const,
	comments: (ideaId: string) => ['comments', ideaId] as const,
	criteria: ['rubric'] as const,
	myEvaluation: (ideaId: string) => ['evaluations', ideaId, 'mine'] as const,
	scores: ['evaluations', 'scores'] as const,
	requirement: (ideaId: string) => ['requirements', ideaId] as const,
	areaManager: (areaId: string) => ['areas', areaId, 'manager'] as const,
	orgAreas: ['org', 'areas'] as const,
}

export const CATALOG_STALE_TIME = 5 * 60_000
