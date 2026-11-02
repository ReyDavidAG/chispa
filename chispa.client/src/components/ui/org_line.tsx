import type { OrgUnit } from '@/types/challenge_type'

export function OrgLine({
	unit,
	showCompany = false,
}: {
	unit: OrgUnit
	showCompany?: boolean
}) {
	return (
		<span className='org-line'>
			<span className='area-chip' data-area=''>
				<span className='area-dot' aria-hidden='true' />
				{unit.areaName}
			</span>
			<span className='org-line__dept'>
				{unit.departmentName ?? 'Toda el área'}
				{showCompany && ` · ${unit.companyCode}`}
			</span>
		</span>
	)
}
