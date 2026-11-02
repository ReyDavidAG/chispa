import { useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Combobox } from '@/components/ui/combobox'
import type { NewChallengeForm } from '@/schemas/challenges/new/new_challenge.schema'
import type { OrgArea } from '@/services/api/challenge_repository'
import { cn } from '@/utils/cn'

interface Props {
	areas: OrgArea[]
	area: OrgArea | undefined
	publishes: boolean
}

export function ChallengeOrgFields({ areas, area, publishes }: Props) {
	const { control, setValue, formState } = useFormContext<NewChallengeForm>()
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

	return (
		<>
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
					className={cn('field__help', formState.errors.areaId && 'is-error')}
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
							placeholder={area ? 'Toda el área' : 'Primero elige el área'}
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
		</>
	)
}
