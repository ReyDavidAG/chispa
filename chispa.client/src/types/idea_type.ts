export type IdeaStatus =
	| 'received'
	| 'review'
	| 'selected'
	| 'building'
	| 'done'
	| 'archived'

export interface IdeaCard {
	id: string
	folio: string
	challengeId: string
	authorId: string | null
	isAnonymous: boolean
	wantsToJoin: boolean
	status: IdeaStatus
	solutionType: string
	title: string
	summary: string
	how: string
	estimate: string | null
	supportCount: number
	commentCount: number
	createdAt: string
	supportedByMe: boolean
}

export interface IdeaDetail extends IdeaCard {
	benefits: string[]
	needs: string[]
}

export interface Author {
	id: string
	fullName: string
	areaName: string
}

export interface IdeaComment {
	id: string
	body: string
	createdAt: string
	authorId: string
	authorName: string
	authorArea: string
}

export interface NewIdea {
	challengeId: string
	title: string
	summary: string
	how: string
	solutionType: string
	needs: string[]
	benefits: string[]
	estimate: string
	isAnonymous: boolean
	wantsToJoin: boolean
}

export interface Criterion {
	id: string
	code: string
	name: string
	hint: string | null
	weight: number
}

export interface Evaluation {
	id: string
	comment: string | null
	scores: Record<string, number>
}

export interface IdeaScore {
	ideaId: string
	evaluatorCount: number
	weightedScore: number
}

export interface Requirement {
	id: string
	status: string
	currentProblem: string
	users: string
	volume: string | null
	proposal: string
	needs: string | null
	expectedBenefit: string | null
	successCriteria: string
	constraints: string | null
	acceptanceCriteria: string | null
	nextStep: string | null
	updatedAt: string
}
