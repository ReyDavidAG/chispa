import { useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { ChallengeOrgFields } from '@/components/challenges/challenge_org_fields'
import { ChallengePreview } from '@/components/challenges/challenge_preview'
import { ChallengeTextFields } from '@/components/challenges/challenge_text_fields'
import { SolutionTypeChips } from '@/components/challenges/solution_type_chips'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { useRequiredSession } from '@/hooks/auth/use_session'
import {
	useCreateChallenge,
	useOrgAreas,
} from '@/hooks/challenges/use_challenge_admin'
import { useFair } from '@/hooks/fair/use_fair'
import LoadingPage from '@/pages/core/loading/loading_page'
import {
	type NewChallengeForm,
	newChallengeSchema,
} from '@/schemas/challenges/new/new_challenge.schema'
import type { OrgArea } from '@/services/api/challenge_repository'
import { todayIso } from '@/utils/dates'
import { canPublishIn } from '@/utils/permissions'

export default function ChallengeNewPage() {
	const fair = useFair()
	const areas = useOrgAreas()
	if (!fair.data || !areas.data) return <LoadingPage />
	const deadline =
		fair.data.stages.find(s => s.code === 'ideas')?.endsOn ?? todayIso()
	return <ChallengeForm areas={areas.data} deadline={deadline} />
}

const EMPTY: Omit<NewChallengeForm, 'closesOn'> = {
	areaId: '',
	departmentId: '',
	title: '',
	summary: '',
	problem: '',
	affects: '',
	frequency: '',
	tried: '',
	success: '',
	constraints: '',
	types: [],
}

function ChallengeForm({
	areas,
	deadline,
}: {
	areas: OrgArea[]
	deadline: string
}) {
	const session = useRequiredSession()
	const navigate = useNavigate()
	const create = useCreateChallenge()
	const methods = useForm<NewChallengeForm>({
		resolver: zodResolver(newChallengeSchema),
		defaultValues: { ...EMPTY, closesOn: deadline },
	})
	const { register, handleSubmit, control } = methods
	const [areaId, rawDepartmentId] = useWatch({
		control,
		name: ['areaId', 'departmentId'],
	})
	const departmentId = rawDepartmentId || null
	const area = useMemo(() => areas.find(a => a.id === areaId), [areas, areaId])
	const publishes = canPublishIn(session, areaId, departmentId)

	const onSubmit = handleSubmit(async v => {
		try {
			const res = await create.mutateAsync({ ...v, departmentId })
			const open = res.status === 'open'
			toast.success(
				open ? `Reto ${res.folio} publicado` : 'Sugerencia enviada al encargado'
			)
			navigate(open ? ROUTES.challenge(res.folio) : ROUTES.challenges)
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'No se pudo guardar el reto')
		}
	})

	return (
		<div className='wrap'>
			<Link className='back-link' to={ROUTES.challenges}>
				<Icon name='arrowLeft' />
				Retos
			</Link>
			<header className='page-head'>
				<div>
					<h1 className='h1'>
						{session.role === 'member' ? 'Sugerir un reto' : 'Publicar un reto'}
					</h1>
					<p className='lede'>
						Un reto bien contado recibe mejores ideas. Piensa en alguien de otra
						área que no conoce tu operación.
					</p>
				</div>
			</header>
			<FormProvider {...methods}>
				<div className='form-layout'>
					<form className='stack-form' noValidate onSubmit={onSubmit}>
						<ChallengeOrgFields
							areas={areas}
							area={area}
							publishes={publishes}
						/>
						<ChallengeTextFields />
						<SolutionTypeChips />
						<div className='field'>
							<label htmlFor='closesOn'>Recibe chispas hasta</label>
							<input
								id='closesOn'
								type='date'
								className='input input--date'
								min={todayIso()}
								{...register('closesOn')}
							/>
						</div>
						<div className='wizard-actions'>
							<Link className='btn btn--ghost' to={ROUTES.challenges}>
								Cancelar
							</Link>
							<button
								className='btn btn--spark btn--lg'
								type='submit'
								disabled={create.isPending}>
								<Icon name={publishes ? 'check' : 'send'} />
								{create.isPending
									? 'Guardando…'
									: publishes
										? 'Publicar reto'
										: 'Enviar sugerencia'}
							</button>
						</div>
					</form>
					<ChallengePreview
						area={area}
						publishes={publishes}
						deadline={deadline}
					/>
				</div>
			</FormProvider>
		</div>
	)
}
