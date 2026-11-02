import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/constants/query_keys'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { services } from '@/services/api/unit_of_services'
import type { ChallengeCard } from '@/types/challenge_type'
import { parseFolio } from '@/utils/folio'

export const trendScore = (c: ChallengeCard, supports7d = 0, ideas7d = 0) =>
	supports7d + ideas7d * 12 + (c.supportCount + c.ideaCount * 12) * 0.25

export function useChallenges() {
	return useQuery({
		queryKey: QUERY_KEYS.challenges,
		queryFn: () => services.challenges.list(),
	})
}

export function useChallenge(folio: string) {
	const n = parseFolio('RET', folio)
	return useQuery({
		queryKey: QUERY_KEYS.challenge(folio),
		queryFn: () => services.challenges.byFolio(n!),
		enabled: n !== null,
	})
}

function useActivity() {
	return useQuery({
		queryKey: QUERY_KEYS.activity,
		queryFn: () => services.challenges.activity(),
	})
}

export function useChallengeSignals(list: ChallengeCard[] | undefined) {
	const { person } = useRequiredSession()
	const activity = useActivity()

	return useMemo(() => {
		const byId = new Map((activity.data ?? []).map(a => [a.challengeId, a]))
		const open = (list ?? []).filter(c => c.status === 'open')
		const ranked = open
			.map(c => {
				const a = byId.get(c.id)
				return { c, score: trendScore(c, a?.supports7d, a?.ideas7d) }
			})
			.filter(x => x.score >= 12)
			.sort((a, b) => b.score - a.score)
			.slice(0, 3)
		const hotIds = new Set(ranked.map(x => x.c.id))
		const fresh = (list ?? [])
			.filter(
				c =>
					c.status !== 'suggested' &&
					c.publishedAt &&
					c.publishedAt > person.challengesSeenAt
			)
			.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
		const freshIds = new Set(fresh.map(c => c.id))
		return {
			hot: ranked.map(x => x.c),
			fresh,
			isHot: (c: ChallengeCard) => hotIds.has(c.id),
			isNew: (c: ChallengeCard) => freshIds.has(c.id),
			score: (c: ChallengeCard) => {
				const a = byId.get(c.id)
				return trendScore(c, a?.supports7d, a?.ideas7d)
			},
		}
	}, [list, activity.data, person.challengesSeenAt])
}

export function trendReason(c: ChallengeCard) {
	return c.ideaCount >= 3
		? { label: 'Muy concurrido', detail: `${c.ideaCount} chispas` }
		: { label: 'Muy avivado', detail: `${c.supportCount} avivadas` }
}
