import type { Person, Role, Session } from '@/types/session_type'

import { supabase, toMessage } from '../supabase/supabase_client'

export interface SessionRepository {
	current(): Promise<Session | null>
	claim(employeeNumber: string): Promise<Session>
	signOut(): Promise<void>
	markChallengesSeen(personId: string): Promise<void>
}

const PERSON_FIELDS =
	'id, employee_number, full_name, area_id, department_id, challenges_seen_at, area:areas!people_area_id_fkey(name, company:companies(code)), department:departments!people_department_id_area_id_fkey(name)'

interface PersonRow {
	id: string
	employee_number: string
	full_name: string
	area_id: string
	department_id: string | null
	challenges_seen_at: string
	area: { name: string; company: { code: string } } | null
	department: { name: string } | null
}

const toPerson = (r: PersonRow): Person => ({
	id: r.id,
	employeeNumber: r.employee_number,
	fullName: r.full_name,
	areaId: r.area_id,
	areaName: r.area?.name ?? '',
	departmentId: r.department_id,
	departmentName: r.department?.name ?? null,
	companyCode: r.area?.company.code ?? '',
	challengesSeenAt: r.challenges_seen_at,
})

async function buildSession(person: Person): Promise<Session> {
	const [areas, departments, committee] = await Promise.all([
		supabase
			.from('areas')
			.select('id')
			.eq('manager_id', person.id)
			.returns<{ id: string }[]>(),
		supabase
			.from('departments')
			.select('id')
			.eq('manager_id', person.id)
			.returns<{ id: string }[]>(),
		supabase
			.from('fair_committee')
			.select('fair_id, fairs!inner(is_current)')
			.eq('person_id', person.id)
			.eq('fairs.is_current', true),
	])
	const error = areas.error ?? departments.error ?? committee.error
	if (error) throw new Error(toMessage(error))
	const managedAreaIds = (areas.data ?? []).map(a => a.id)
	const managedDepartmentIds = (departments.data ?? []).map(d => d.id)
	const isCommittee = (committee.data ?? []).length > 0
	const role: Role = isCommittee
		? 'committee'
		: managedAreaIds.length || managedDepartmentIds.length
			? 'lead'
			: 'member'
	return { person, role, isCommittee, managedAreaIds, managedDepartmentIds }
}

async function loadPerson(filter: { column: string; value: string }) {
	const { data, error } = await supabase
		.from('people')
		.select(PERSON_FIELDS)
		.eq(filter.column, filter.value)
		.maybeSingle<PersonRow>()
	if (error) throw new Error(toMessage(error))
	return data ? toPerson(data) : null
}

export const sessionRepository: SessionRepository = {
	async current() {
		const { data } = await supabase.auth.getSession()
		const uid = data.session?.user.id
		if (!uid) return null
		const person = await loadPerson({ column: 'auth_subject', value: uid })
		return person ? buildSession(person) : null
	},

	async claim(employeeNumber) {
		const { data } = await supabase.auth.getSession()
		if (!data.session) {
			const { error } = await supabase.auth.signInAnonymously()
			if (error) throw new Error(toMessage(error))
		}
		const { error } = await supabase.rpc('claim_employee_number', {
			p_employee_number: employeeNumber,
		})
		if (error) throw new Error(toMessage(error))
		const person = await loadPerson({
			column: 'employee_number',
			value: employeeNumber,
		})
		if (!person) throw new Error('No encontramos ese número de trabajador.')
		return buildSession(person)
	},

	async signOut() {
		await supabase.auth.signOut()
	},

	async markChallengesSeen(personId) {
		const { error } = await supabase
			.from('people')
			.update({ challenges_seen_at: new Date().toISOString() })
			.eq('id', personId)
		if (error) throw new Error(toMessage(error))
	},
}
