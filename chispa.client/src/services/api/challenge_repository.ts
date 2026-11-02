import type {
	ChallengeActivity,
	ChallengeCard,
	ChallengeDetail,
	ChallengeStatus,
} from '@/types/challenge_type'
import { formatFolio } from '@/utils/folio'

import { supabase, toMessage } from '../supabase/supabase_client'

export interface NewChallenge {
	areaId: string
	departmentId: string | null
	title: string
	summary: string
	problem: string
	affects: string
	frequency: string
	tried: string
	success: string
	constraints: string
	closesOn: string
	types: string[]
}

export interface OrgArea {
	id: string
	name: string
	companyCode: string
	companyName: string
	managerId: string | null
	departments: { id: string; name: string; managerId: string | null }[]
}

export interface ChallengeRepository {
	list(): Promise<ChallengeCard[]>
	byFolio(folio: number): Promise<ChallengeDetail | null>
	activity(): Promise<ChallengeActivity[]>
	create(
		input: NewChallenge
	): Promise<{ folio: string; status: ChallengeStatus }>
	setStatus(id: string, status: ChallengeStatus): Promise<void>
	orgAreas(): Promise<OrgArea[]>
}

const CARD_FIELDS =
	'id, folio, status, title, summary, closes_on, published_at, idea_count, support_count, area_id, department_id, area:areas(code, name, company:companies(code, name)), department:departments(name), challenge_solution_types(solution_type_code)'

const DETAIL_FIELDS = `${CARD_FIELDS}, problem, affects, frequency, tried, success, constraints, owner:people!challenges_owner_id_fkey(full_name)`

interface CardRow {
	id: string
	folio: number
	status: ChallengeStatus
	title: string
	summary: string
	closes_on: string
	published_at: string | null
	idea_count: number
	support_count: number
	area_id: string
	department_id: string | null
	area: { code: string; name: string; company: { code: string; name: string } }
	department: { name: string } | null
	challenge_solution_types: { solution_type_code: string }[]
}

interface DetailRow extends CardRow {
	problem: string
	affects: string
	frequency: string
	tried: string
	success: string
	constraints: string | null
	owner: { full_name: string } | null
}

const toCard = (r: CardRow): ChallengeCard => ({
	id: r.id,
	folio: formatFolio('RET', r.folio),
	status: r.status,
	title: r.title,
	summary: r.summary,
	closesOn: r.closes_on,
	publishedAt: r.published_at,
	ideaCount: r.idea_count,
	supportCount: r.support_count,
	areaId: r.area_id,
	areaCode: r.area.code,
	areaName: r.area.name,
	companyCode: r.area.company.code,
	companyName: r.area.company.name,
	departmentId: r.department_id,
	departmentName: r.department?.name ?? null,
	solutionTypes: r.challenge_solution_types.map(t => t.solution_type_code),
})

const currentFair = () =>
	supabase
		.from('fairs')
		.select('id')
		.eq('is_current', true)
		.single<{ id: string }>()

export const challengeRepository: ChallengeRepository = {
	async list() {
		const fair = await currentFair()
		if (fair.error) throw new Error(toMessage(fair.error))
		const { data, error } = await supabase
			.from('challenges')
			.select(CARD_FIELDS)
			.eq('fair_id', fair.data.id)
			.order('published_at', { ascending: false, nullsFirst: false })
			.returns<CardRow[]>()
		if (error) throw new Error(toMessage(error))
		return data.map(toCard)
	},

	async byFolio(folio) {
		const fair = await currentFair()
		if (fair.error) throw new Error(toMessage(fair.error))
		const { data, error } = await supabase
			.from('challenges')
			.select(DETAIL_FIELDS)
			.eq('fair_id', fair.data.id)
			.eq('folio', folio)
			.maybeSingle<DetailRow>()
		if (error) throw new Error(toMessage(error))
		if (!data) return null
		return {
			...toCard(data),
			problem: data.problem,
			affects: data.affects,
			frequency: data.frequency,
			tried: data.tried,
			success: data.success,
			constraints: data.constraints,
			ownerName: data.owner?.full_name ?? '',
		}
	},

	async activity() {
		const { data, error } = await supabase
			.from('challenge_activity_7d')
			.select('challenge_id, supports_7d, ideas_7d')
		if (error) throw new Error(toMessage(error))
		return (data ?? []).map(r => ({
			challengeId: r.challenge_id as string,
			supports7d: Number(r.supports_7d),
			ideas7d: Number(r.ideas_7d),
		}))
	},

	async create(input) {
		const { data, error } = await supabase
			.rpc('submit_challenge', {
				p_area_id: input.areaId,
				p_department_id: input.departmentId,
				p_title: input.title,
				p_summary: input.summary,
				p_problem: input.problem,
				p_affects: input.affects,
				p_frequency: input.frequency,
				p_tried: input.tried,
				p_success: input.success,
				p_constraints: input.constraints,
				p_closes_on: input.closesOn,
				p_types: input.types,
			})
			.single<{ folio: string; status: ChallengeStatus }>()
		if (error) throw new Error(toMessage(error))
		return data
	},

	async setStatus(id, status) {
		const { data, error } = await supabase
			.from('challenges')
			.update({ status })
			.eq('id', id)
			.select('id')
		if (error) throw new Error(toMessage(error))
		if (!data?.length)
			throw new Error('No tienes permiso para cambiar este reto.')
	},

	async orgAreas() {
		const { data, error } = await supabase
			.from('areas')
			.select(
				'id, name, manager_id, company:companies(code, name), departments!departments_area_id_fkey(id, name, manager_id)'
			)
			.eq('is_active', true)
			.order('name')
			.returns<
				{
					id: string
					name: string
					manager_id: string | null
					company: { code: string; name: string }
					departments: { id: string; name: string; manager_id: string | null }[]
				}[]
			>()
		if (error) throw new Error(toMessage(error))
		return data.map(a => ({
			id: a.id,
			name: a.name,
			companyCode: a.company.code,
			companyName: a.company.name,
			managerId: a.manager_id,
			departments: a.departments
				.map(d => ({ id: d.id, name: d.name, managerId: d.manager_id }))
				.sort((x, y) => x.name.localeCompare(y.name)),
		}))
	},
}
