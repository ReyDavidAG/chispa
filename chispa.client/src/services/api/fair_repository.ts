import type { Fair, StageCode } from '@/types/fair_type'

import { supabase, toMessage } from '../supabase/supabase_client'

export interface FairRepository {
	current(): Promise<Fair>
}

interface FairRow {
	id: string
	edition: number
	name: string
	fair_stages: {
		code: StageCode
		name: string
		detail: string | null
		position: number
		starts_on: string
		ends_on: string
	}[]
}

export const fairRepository: FairRepository = {
	async current() {
		const { data, error } = await supabase
			.from('fairs')
			.select(
				'id, edition, name, fair_stages(code, name, detail, position, starts_on, ends_on)'
			)
			.eq('is_current', true)
			.single<FairRow>()
		if (error) throw new Error(toMessage(error))
		return {
			id: data.id,
			edition: data.edition,
			name: data.name,
			stages: [...data.fair_stages]
				.sort((a, b) => a.position - b.position)
				.map(s => ({
					code: s.code,
					name: s.name,
					detail: s.detail,
					startsOn: s.starts_on,
					endsOn: s.ends_on,
				})),
		}
	},
}
