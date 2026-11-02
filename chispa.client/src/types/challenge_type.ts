export type ChallengeStatus =
	| 'suggested'
	| 'open'
	| 'review'
	| 'building'
	| 'solved'
	| 'archived'

export interface OrgUnit {
	areaId: string
	areaCode: string
	areaName: string
	companyCode: string
	companyName: string
	departmentId: string | null
	departmentName: string | null
}

export interface ChallengeCard extends OrgUnit {
	id: string
	folio: string
	status: ChallengeStatus
	title: string
	summary: string
	closesOn: string
	publishedAt: string | null
	ideaCount: number
	supportCount: number
	solutionTypes: string[]
}

export interface ChallengeDetail extends ChallengeCard {
	problem: string
	affects: string
	frequency: string
	tried: string
	success: string
	constraints: string | null
	ownerName: string
}

export interface ChallengeActivity {
	challengeId: string
	supports7d: number
	ideas7d: number
}
