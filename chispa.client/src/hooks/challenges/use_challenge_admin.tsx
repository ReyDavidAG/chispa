import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/query_keys'
import type { NewChallenge } from '@/services/api/challenge_repository'
import { services } from '@/services/api/unit_of_services'
import type { ChallengeStatus } from '@/types/challenge_type'

export function useOrgAreas() {
	return useQuery({
		queryKey: QUERY_KEYS.orgAreas,
		queryFn: () => services.challenges.orgAreas(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function useCreateChallenge() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: (input: NewChallenge) => services.challenges.create(input),
		onSuccess: () =>
			void client.invalidateQueries({ queryKey: QUERY_KEYS.challenges }),
	})
}

export function useSetChallengeStatus() {
	const client = useQueryClient()
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: ChallengeStatus }) =>
			services.challenges.setStatus(id, status),
		onSuccess: () =>
			void client.invalidateQueries({ queryKey: QUERY_KEYS.challenges }),
	})
}
