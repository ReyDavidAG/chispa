import type {
	Author,
	IdeaCard,
	IdeaComment,
	IdeaDetail,
	IdeaStatus,
	NewIdea,
} from '@/types/idea_type'

import { supabase, toMessage } from '../supabase/supabase_client'

export interface IdeaRepository {
	byChallenge(challengeId: string): Promise<IdeaCard[]>
	byAuthor(personId: string): Promise<IdeaCard[]>
	supportedBy(personId: string): Promise<IdeaCard[]>
	all(): Promise<IdeaCard[]>
	byFolio(folio: string): Promise<IdeaDetail | null>
	authors(ids: string[]): Promise<Author[]>
	create(input: NewIdea): Promise<{ folio: string }>
	setSupport(ideaId: string, personId: string, on: boolean): Promise<void>
	setStatus(ideaId: string, status: IdeaStatus): Promise<void>
	comments(ideaId: string): Promise<IdeaComment[]>
	addComment(ideaId: string, authorId: string, body: string): Promise<void>
}

interface CardRow {
	id: string
	folio: string
	challenge_id: string
	author_id: string | null
	is_anonymous: boolean
	wants_to_join: boolean
	status: IdeaStatus
	solution_type_code: string
	title: string
	summary: string
	how: string
	estimate: string | null
	support_count: number
	comment_count: number
	created_at: string
	supported_by_me: boolean
}

const toCard = (r: CardRow): IdeaCard => ({
	id: r.id,
	folio: r.folio,
	challengeId: r.challenge_id,
	authorId: r.author_id,
	isAnonymous: r.is_anonymous,
	wantsToJoin: r.wants_to_join,
	status: r.status,
	solutionType: r.solution_type_code,
	title: r.title,
	summary: r.summary,
	how: r.how,
	estimate: r.estimate,
	supportCount: r.support_count,
	commentCount: r.comment_count,
	createdAt: r.created_at,
	supportedByMe: r.supported_by_me,
})

const fail = (error: { message?: string } | null) => {
	if (error) throw new Error(toMessage(error))
}

const cards = () => supabase.from('idea_cards').select('*')

const currentFairId = async () => {
	const { data, error } = await supabase
		.from('fairs')
		.select('id')
		.eq('is_current', true)
		.single<{ id: string }>()
	fail(error)
	return data!.id
}

export const ideaRepository: IdeaRepository = {
	async byChallenge(challengeId) {
		const { data, error } = await cards()
			.eq('challenge_id', challengeId)
			.order('support_count', { ascending: false })
			.returns<CardRow[]>()
		fail(error)
		return data!.map(toCard)
	},

	async byAuthor(personId) {
		const { data, error } = await cards()
			.eq('author_id', personId)
			.order('created_at', { ascending: false })
			.returns<CardRow[]>()
		fail(error)
		return data!.map(toCard)
	},

	async supportedBy(personId) {
		const s = await supabase
			.from('supports')
			.select('idea_id')
			.eq('person_id', personId)
			.returns<{ idea_id: string }[]>()
		fail(s.error)
		const ids = (s.data ?? []).map(x => x.idea_id)
		if (!ids.length) return []
		const { data, error } = await cards()
			.in('id', ids)
			.order('support_count', { ascending: false })
			.returns<CardRow[]>()
		fail(error)
		return data!.map(toCard)
	},

	async all() {
		const { data, error } = await cards()
			.eq('fair_id', await currentFairId())
			.order('support_count', { ascending: false })
			.returns<CardRow[]>()
		fail(error)
		return data!.map(toCard)
	},

	async byFolio(folio) {
		const { data, error } = await cards()
			.eq('fair_id', await currentFairId())
			.eq('folio', folio)
			.maybeSingle<CardRow>()
		fail(error)
		if (!data) return null
		const [benefits, needs] = await Promise.all([
			supabase
				.from('idea_benefits')
				.select('benefit_code')
				.eq('idea_id', data.id)
				.returns<{ benefit_code: string }[]>(),
			supabase
				.from('idea_needs')
				.select('label, position')
				.eq('idea_id', data.id)
				.order('position')
				.returns<{ label: string }[]>(),
		])
		fail(benefits.error ?? needs.error)
		return {
			...toCard(data),
			benefits: (benefits.data ?? []).map(b => b.benefit_code),
			needs: (needs.data ?? []).map(n => n.label),
		}
	},

	async authors(ids) {
		if (!ids.length) return []
		const { data, error } = await supabase
			.from('people')
			.select('id, full_name, area:areas!people_area_id_fkey(name)')
			.in('id', ids)
			.returns<
				{ id: string; full_name: string; area: { name: string } | null }[]
			>()
		fail(error)
		return data!.map(p => ({
			id: p.id,
			fullName: p.full_name,
			areaName: p.area?.name ?? '',
		}))
	},

	async create(input) {
		const { data, error } = await supabase.rpc('submit_idea', {
			p_challenge_id: input.challengeId,
			p_title: input.title,
			p_summary: input.summary,
			p_how: input.how,
			p_solution_type: input.solutionType,
			p_estimate: input.estimate,
			p_is_anonymous: input.isAnonymous,
			p_wants_to_join: input.wantsToJoin,
			p_benefits: input.benefits,
			p_needs: input.needs,
		})
		fail(error)
		if (typeof data !== 'string') throw new Error('No se recibió el folio.')
		return { folio: data }
	},

	async setSupport(ideaId, personId, on) {
		const { error } = on
			? await supabase
					.from('supports')
					.insert({ idea_id: ideaId, person_id: personId })
			: await supabase
					.from('supports')
					.delete()
					.eq('idea_id', ideaId)
					.eq('person_id', personId)
		fail(error)
	},

	async setStatus(ideaId, status) {
		const { data, error } = await supabase
			.from('ideas')
			.update({ status })
			.eq('id', ideaId)
			.select('id')
		fail(error)
		if (!data?.length)
			throw new Error(
				'No tienes permiso para cambiar el estado de esta chispa.'
			)
	},

	async comments(ideaId) {
		const { data, error } = await supabase
			.from('comments')
			.select(
				'id, body, created_at, author_id, author:people(full_name, area:areas!people_area_id_fkey(name))'
			)
			.eq('idea_id', ideaId)
			.order('created_at')
			.returns<
				{
					id: string
					body: string
					created_at: string
					author_id: string
					author: { full_name: string; area: { name: string } | null } | null
				}[]
			>()
		fail(error)
		return data!.map(c => ({
			id: c.id,
			body: c.body,
			createdAt: c.created_at,
			authorId: c.author_id,
			authorName: c.author?.full_name ?? 'Colaborador',
			authorArea: c.author?.area?.name ?? '',
		}))
	},

	async addComment(ideaId, authorId, body) {
		const { error } = await supabase
			.from('comments')
			.insert({ idea_id: ideaId, author_id: authorId, body })
		fail(error)
	},
}
