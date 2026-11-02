import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/query_keys'
import { useRequiredSession } from '@/hooks/auth/use_session'
import { services } from '@/services/api/unit_of_services'
import type { Requirement } from '@/types/idea_type'

export function useCriteria() {
	return useQuery({
		queryKey: QUERY_KEYS.criteria,
		queryFn: () => services.evaluations.criteria(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useMyEvaluation(ideaId: string, enabled: boolean) {
	const { person } = useRequiredSession()
	return useQuery({
		queryKey: QUERY_KEYS.myEvaluation(ideaId),
		queryFn: () => services.evaluations.mine(ideaId, person.id),
		enabled,
	})
}

export function useScores() {
	return useQuery({
		queryKey: QUERY_KEYS.scores,
		queryFn: () => services.evaluations.scores(),
	})
}

export function useSaveEvaluation(ideaId: string) {
	const client = useQueryClient()
	const { person } = useRequiredSession()
	return useMutation({
		mutationFn: (v: { scores: Record<string, number>; comment: string }) =>
			services.evaluations.save(ideaId, person.id, v.scores, v.comment),
		onSuccess: () => {
			void client.invalidateQueries({
				queryKey: QUERY_KEYS.myEvaluation(ideaId),
			})
			void client.invalidateQueries({ queryKey: QUERY_KEYS.scores })
		},
	})
}

export function useRequirement(ideaId: string, enabled: boolean) {
	return useQuery({
		queryKey: QUERY_KEYS.requirement(ideaId),
		queryFn: () => services.evaluations.requirement(ideaId),
		enabled,
	})
}

export function useSaveRequirement(ideaId: string) {
	const client = useQueryClient()
	const { person } = useRequiredSession()
	return useMutation({
		mutationFn: (f: Omit<Requirement, 'id' | 'updatedAt' | 'status'>) =>
			services.evaluations.saveRequirement(ideaId, person.id, f),
		onSuccess: () =>
			void client.invalidateQueries({
				queryKey: QUERY_KEYS.requirement(ideaId),
			}),
	})
}
