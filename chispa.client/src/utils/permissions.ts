import type { OrgUnit } from '@/types/challenge_type'
import type { Session } from '@/types/session_type'

export const canManage = (
	session: Session,
	unit: Pick<OrgUnit, 'areaId' | 'departmentId'>
) =>
	session.isCommittee ||
	session.managedAreaIds.includes(unit.areaId) ||
	(!!unit.departmentId &&
		session.managedDepartmentIds.includes(unit.departmentId))

export const canPublishIn = (
	session: Session,
	areaId: string,
	departmentId: string | null
) => canManage(session, { areaId, departmentId })
