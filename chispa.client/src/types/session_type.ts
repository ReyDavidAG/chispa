export type Role = 'member' | 'lead' | 'committee'

export interface Person {
	id: string
	employeeNumber: string
	fullName: string
	areaId: string
	areaName: string
	departmentId: string | null
	departmentName: string | null
	companyCode: string
	challengesSeenAt: string
}

export interface Session {
	person: Person
	role: Role
	isCommittee: boolean
	managedAreaIds: string[]
	managedDepartmentIds: string[]
}
