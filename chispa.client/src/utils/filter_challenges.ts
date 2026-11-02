import type { ChallengeCard } from '@/types/challenge_type'

export interface ChallengeQuery {
	q: string
	status: string
	area: string
	type: string
	sort: string
}

interface Signals {
	isNew: (c: ChallengeCard) => boolean
	score: (c: ChallengeCard) => number
}

export function filterChallenges(
	list: ChallengeCard[],
	f: ChallengeQuery,
	s: Signals
) {
	const q = f.q.trim().toLowerCase()
	const rows = list.filter(
		c =>
			c.status !== 'suggested' &&
			c.status !== 'archived' &&
			(f.status === 'all' || c.status === f.status) &&
			(!f.area || c.areaId === f.area) &&
			(!f.type || c.solutionTypes.includes(f.type)) &&
			(!q ||
				`${c.title} ${c.summary} ${c.folio} ${c.areaName} ${c.departmentName ?? ''}`
					.toLowerCase()
					.includes(q))
	)
	const recent = (a: ChallengeCard, b: ChallengeCard) =>
		(b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
	const by: Record<string, (a: ChallengeCard, b: ChallengeCard) => number> = {
		recent,
		new: (a, b) => Number(s.isNew(b)) - Number(s.isNew(a)) || recent(a, b),
		trending: (a, b) => s.score(b) - s.score(a),
		fewest: (a, b) => a.ideaCount - b.ideaCount,
		closing: (a, b) => a.closesOn.localeCompare(b.closesOn),
	}
	return rows.sort(by[f.sort] ?? recent)
}
