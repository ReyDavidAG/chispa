export type StageCode = 'call' | 'ideas' | 'review' | 'fair' | 'build'

export interface Stage {
	code: StageCode
	name: string
	detail: string | null
	startsOn: string
	endsOn: string
}

export interface Fair {
	id: string
	edition: number
	name: string
	stages: Stage[]
}
