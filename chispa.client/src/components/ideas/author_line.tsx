import { Icon } from '@/components/ui/icon'
import type { Author } from '@/types/idea_type'
import { areaStyle } from '@/utils/area_hue'
import { initials } from '@/utils/initials'

export function AuthorLine({
	author,
	anonymous,
}: {
	author?: Author
	anonymous: boolean
}) {
	if (!author)
		return (
			<span className='author'>
				<span className='avatar is-anon' aria-hidden='true'>
					<Icon name={anonymous ? 'eyeOff' : 'spark'} />
				</span>
				<span>{anonymous ? 'Anónimo' : 'Colaborador'}</span>
			</span>
		)
	return (
		<span className='author'>
			<span
				className='avatar'
				data-area=''
				style={areaStyle(author.areaName)}
				aria-hidden='true'>
				{initials(author.fullName)}
			</span>
			<span>
				{author.fullName}
				{anonymous && ' (anónima)'}
			</span>
		</span>
	)
}
