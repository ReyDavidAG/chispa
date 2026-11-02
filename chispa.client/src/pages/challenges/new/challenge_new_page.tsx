import { useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { ChallengeTag } from '@/components/challenges/challenge_tag'
import { ChallengeTextFields } from '@/components/challenges/challenge_text_fields'
import { Combobox } from '@/components/ui/combobox'
import { Icon } from '@/components/ui/icon'
import { ROUTES } from '@/constants/routes'
import { SOLUTION_ICONS, SOLUTION_TYPES } from '@/constants/status'
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
import { cn } from '@/utils/cn'
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
		defaultValues: {
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
			closesOn: deadline,
		},
	})
	const { register, watch, handleSubmit, setValue, formState, control } =
		methods
	const areaId = watch('areaId')
	const departmentId = watch('departmentId') || null
	const area = useMemo(() => areas.find(a => a.id === areaId), [areas, areaId])
	const areaOptions = useMemo(
		() =>
			[...areas]
				.sort(
					(a, b) =>
						a.companyName.localeCompare(b.companyName) ||
						a.name.localeCompare(b.name)
				)
				.map(a => ({
					value: a.id,
					label: a.name,
					description: a.companyName,
					keywords: a.companyCode,
				})),
		[areas]
	)
	const departmentOptions = useMemo(
		() => (area?.departments ?? []).map(d => ({ value: d.id, label: d.name })),
		[area]
	)
	const publishes = canPublishIn(session, areaId, departmentId)
	const dept = area?.departments.find(d => d.id === departmentId)

	const onSubmit = handleSubmit(async v => {
		try {
			const res = await create.mutateAsync({
				areaId: v.areaId,
				departmentId: v.departmentId || null,
				title: v.title.trim(),
				summary: v.summary.trim(),
				problem: v.problem.trim(),
				affects: v.affects.trim(),
				frequency: v.frequency.trim(),
				tried: v.tried.trim(),
				success: v.success.trim(),
				constraints: v.constraints.trim(),
				closesOn: v.closesOn,
				types: v.types,
			})
			toast.success(
				res.status === 'open'
					? `Reto ${res.folio} publicado`
					: 'Sugerencia enviada al encargado'
			)
			navigate(
				res.status === 'open' ? ROUTES.challenge(res.folio) : ROUTES.challenges
			)
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'No se pudo guardar el reto')
		}
	})

	const preview = {
		id: 'preview',
		folio: 'RET-nuevo',
		status: publishes ? ('open' as const) : ('suggested' as const),
		title: watch('title') || 'Aquí va el problema en una frase',
		summary:
			watch('summary') ||
			'Y aquí el resumen corto que verá la gente en la lista de retos.',
		closesOn: watch('closesOn') || deadline || todayIso(),
		publishedAt: null,
		ideaCount: 0,
		supportCount: 0,
		areaId,
		areaCode: area?.name ?? '',
		areaName: area?.name ?? 'Área',
		companyCode: area?.companyCode ?? '',
		companyName: area?.companyName ?? '',
		departmentId,
		departmentName: dept?.name ?? null,
		solutionTypes: watch('types'),
	}

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
			<div className='form-layout'>
				<FormProvider {...methods}>
					<form className='stack-form' noValidate onSubmit={onSubmit}>
						<div className='field'>
							<label htmlFor='areaId'>Área</label>
							<Controller
								control={control}
								name='areaId'
								render={({ field, fieldState }) => (
									<Combobox
										id='areaId'
										options={areaOptions}
										value={field.value}
										onChange={v => {
											field.onChange(v)
											setValue('departmentId', '')
										}}
										invalid={!!fieldState.error}
										describedBy='areaId-help'
										placeholder='Elige el área'
										searchPlaceholder='Busca el área o la empresa'
									/>
								)}
							/>
							<p
								className={cn(
									'field__help',
									formState.errors.areaId && 'is-error'
								)}
								id='areaId-help'>
								{formState.errors.areaId?.message ??
									'Puedes buscar por nombre del área o de la empresa.'}
							</p>
						</div>
						<div className='field'>
							<label htmlFor='departmentId'>
								Departamento <span className='optional'>Opcional</span>
							</label>
							<Controller
								control={control}
								name='departmentId'
								render={({ field }) => (
									<Combobox
										id='departmentId'
										options={departmentOptions}
										value={field.value}
										onChange={field.onChange}
										disabled={!area}
										clearLabel={area ? 'Toda el área' : undefined}
										placeholder={
											area ? 'Toda el área' : 'Primero elige el área'
										}
										searchPlaceholder='Busca el departamento'
										describedBy='departmentId-help'
									/>
								)}
							/>
							<p
								className={cn('field__help', area && publishes && 'is-ok')}
								id='departmentId-help'>
								{!area
									? 'Se habilita en cuanto elijas el área.'
									: publishes
										? 'Tienes permiso aquí: se publica en cuanto lo envíes.'
										: 'Se enviará como sugerencia al encargado; lo publica cuando lo acepte.'}
							</p>
						</div>
						<ChallengeTextFields />
						<fieldset className='field'>
							<legend>¿Qué tipo de solución imaginas?</legend>
							<p
								className={cn(
									'field__help',
									formState.errors.types && 'is-error'
								)}>
								{formState.errors.types?.message ??
									'Puedes elegir varios. Es una pista, no un límite.'}
							</p>
							<div className='check-chips'>
								{Object.entries(SOLUTION_TYPES).map(([id, name]) => (
									<label key={id} className='check-chip'>
										<input type='checkbox' value={id} {...register('types')} />
										<span>
											<Icon name={SOLUTION_ICONS[id]} className='chip-icon' />
											{name}
										</span>
									</label>
								))}
							</div>
						</fieldset>
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
				</FormProvider>
				<aside className='form-preview' aria-label='Vista previa'>
					<p className='kicker'>Así se verá en la lista</p>
					<ChallengeTag challenge={preview} preview />
				</aside>
			</div>
		</div>
	)
}
