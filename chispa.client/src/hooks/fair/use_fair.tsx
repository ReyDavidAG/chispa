import { useQuery } from '@tanstack/react-query'

import { CATALOG_STALE_TIME, QUERY_KEYS } from '@/constants/query_keys'
import { services } from '@/services/api/unit_of_services'
import type { Fair } from '@/types/fair_type'
import { todayIso } from '@/utils/dates'

export function useFair() {
	return useQuery({
		queryKey: QUERY_KEYS.fair,
		queryFn: () => services.fair.current(),
		staleTime: CATALOG_STALE_TIME,
	})
}

export function currentStageIndex(fair: Fair, today = todayIso()) {
	const idx = fair.stages.findIndex(s => today <= s.endsOn)
	return idx === -1 ? fair.stages.length - 1 : idx
}
