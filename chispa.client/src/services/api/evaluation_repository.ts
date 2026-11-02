import type {
	Criterion,
	Evaluation,
	IdeaScore,
	Requirement,
} from '@/types/idea_type'

import { supabase, toMessage } from '../supabase/supabase_client'

export interface EvaluationRepository {
	criteria(): Promise<Criterion[]>
	mine(ideaId: string, personId: string): Promise<Evaluation | null>
	save(
		ideaId: string,
		personId: string,
		scores: Record<string, number>,
		comment: string
	): Promise<void>
	scores(): Promise<IdeaScore[]>
	requirement(ideaId: string): Promise<Requirement | null>
	saveRequirement(
		ideaId: string,
		personId: string,
		fields: Omit<Requirement, 'id' | 'updatedAt' | 'status'>
	): Promise<void>
}

const fail = (error: { message?: string } | null) => {
	if (error) throw new Error(toMessage(error))
}

export const evaluationRepository: EvaluationRepository = {
	async criteria() {
		const { data, error } = await supabase
			.from('rubric_criteria')
			.select('id, code, name, hint, weight, position, fairs!inner(is_current)')
			.eq('fairs.is_current', true)
			.order('position')
			.returns<
				{
					id: string
					code: string
					name: string
					hint: string | null
					weight: number
				}[]
			>()
		fail(error)
		return (data ?? []).map(c => ({
			id: c.id,
			code: c.code,
			name: c.name,
			hint: c.hint,
			weight: Number(c.weight),
		}))
	},

	async mine(ideaId, personId) {
		const { data, error } = await supabase
			.from('evaluations')
			.select('id, comment, evaluation_scores(criterion_id, score)')
			.eq('idea_id', ideaId)
			.eq('evaluator_id', personId)
			.maybeSingle<{
				id: string
				comment: string | null
				evaluation_scores: { criterion_id: string; score: number }[]
			}>()
		fail(error)
		if (!data) return null
		return {
			id: data.id,
			comment: data.comment,
			scores: Object.fromEntries(
				data.evaluation_scores.map(s => [s.criterion_id, s.score])
			),
		}
	},

	async save(ideaId, personId, scores, comment) {
		const { data, error } = await supabase
			.from('evaluations')
			.upsert(
				{ idea_id: ideaId, evaluator_id: personId, comment: comment || null },
				{ onConflict: 'idea_id,evaluator_id' }
			)
			.select('id')
			.single<{ id: string }>()
		fail(error)
		const rows = Object.entries(scores).map(([criterion_id, score]) => ({
			evaluation_id: data!.id,
			criterion_id,
			score,
		}))
		const res = await supabase
			.from('evaluation_scores')
			.upsert(rows, { onConflict: 'evaluation_id,criterion_id' })
		fail(res.error)
	},

	async scores() {
		const { data, error } = await supabase
			.from('idea_scores')
			.select('idea_id, evaluator_count, weighted_score')
			.returns<
				{ idea_id: string; evaluator_count: number; weighted_score: number }[]
			>()
		fail(error)
		return (data ?? []).map(s => ({
			ideaId: s.idea_id,
			evaluatorCount: Number(s.evaluator_count),
			weightedScore: Number(s.weighted_score),
		}))
	},

	async requirement(ideaId) {
		const { data, error } = await supabase
			.from('requirements')
			.select('*')
			.eq('idea_id', ideaId)
			.maybeSingle()
		fail(error)
		if (!data) return null
		return {
			id: data.id,
			status: data.status,
			currentProblem: data.current_problem,
			users: data.users,
			volume: data.volume,
			proposal: data.proposal,
			needs: data.needs,
			expectedBenefit: data.expected_benefit,
			successCriteria: data.success_criteria,
			constraints: data.constraints,
			acceptanceCriteria: data.acceptance_criteria,
			nextStep: data.next_step,
			updatedAt: data.updated_at,
		}
	},

	async saveRequirement(ideaId, personId, f) {
		const { error } = await supabase.from('requirements').upsert(
			{
				idea_id: ideaId,
				created_by: personId,
				current_problem: f.currentProblem,
				users: f.users,
				volume: f.volume,
				proposal: f.proposal,
				needs: f.needs,
				expected_benefit: f.expectedBenefit,
				success_criteria: f.successCriteria,
				constraints: f.constraints,
				acceptance_criteria: f.acceptanceCriteria,
				next_step: f.nextStep,
			},
			{ onConflict: 'idea_id' }
		)
		fail(error)
	},
}
