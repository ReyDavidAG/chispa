import { useFormContext, useWatch } from 'react-hook-form'

import { ChallengeTag } from '@/components/challenges/challenge_tag'
import type { NewChallengeForm } from '@/schemas/challenges/new/new_challenge.schema'
import type { OrgArea } from '@/services/api/challenge_repository'

interface Props {
	area: OrgArea | undefined
	publishes: boolean
	deadline: string
}

export function ChallengePreview({ area, publishes, deadline }: Props) {
	const { control } = useFormContext<NewChallengeForm>()
	const [title, summary, closesOn, types, areaId, departmentId] = useWatch({
		control,
		name: ['title', 'summary', 'closesOn', 'types', 'areaId', 'departmentId'],
	})
	const dept = area?.departments.find(d => d.id === departmentId)

	return (
		<aside className='form-preview' aria-label='Vista previa'>
			<p className='kicker'>Así se verá en la lista</p>
			<ChallengeTag
				preview
				challenge={{
					id: 'preview',
					folio: 'RET-nuevo',
					status: publishes ? 'open' : 'suggested',
					title: title || 'Aquí va el problema en una frase',
					summary:
						summary ||
						'Y aquí el resumen corto que verá la gente en la lista de retos.',
					closesOn: closesOn || deadline,
					publishedAt: null,
					ideaCount: 0,
					supportCount: 0,
					areaId,
					areaCode: area?.name ?? '',
					areaName: area?.name ?? 'Área',
					companyCode: area?.companyCode ?? '',
					companyName: area?.companyName ?? '',
					departmentId: departmentId || null,
					departmentName: dept?.name ?? null,
					solutionTypes: types,
				}}
			/>
		</aside>
	)
}
