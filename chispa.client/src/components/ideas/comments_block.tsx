import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

import { Icon } from '@/components/ui/icon'
import { useAddComment, useComments } from '@/hooks/ideas/use_ideas'
import { areaStyle } from '@/utils/area_hue'
import { shortDate } from '@/utils/dates'
import { initials } from '@/utils/initials'
import { plural } from '@/utils/plural'
import { stagger } from '@/utils/stagger'

export function CommentsBlock({ ideaId }: { ideaId: string }) {
	const { data = [] } = useComments(ideaId)
	const add = useAddComment(ideaId)
	const [body, setBody] = useState('')

	const submit = (e: FormEvent) => {
		e.preventDefault()
		const text = body.trim()
		if (text.length < 2) return
		add.mutate(text, {
			onSuccess: () => setBody(''),
			onError: err =>
				toast.error(err instanceof Error ? err.message : 'No se pudo comentar'),
		})
	}

	return (
		<section className='comments' aria-labelledby='comments-title'>
			<h2 className='h3' id='comments-title'>
				{plural(data.length, 'comentario', 'comentarios')}
			</h2>
			<ul className='comment-list' role='list'>
				{data.map((c, i) => (
					<li key={c.id} className='comment animate-row-in' style={stagger(i)}>
						<span
							className='avatar'
							data-area=''
							style={areaStyle(c.authorArea)}
							aria-hidden='true'>
							{initials(c.authorName)}
						</span>
						<div>
							<p className='comment__who'>
								<strong>{c.authorName}</strong>
								<span>{shortDate(c.createdAt)}</span>
							</p>
							<p>{c.body}</p>
						</div>
					</li>
				))}
			</ul>
			<form className='comment-form' onSubmit={submit} noValidate>
				<label className='sr-only' htmlFor='comment'>
					Escribe un comentario
				</label>
				<textarea
					id='comment'
					className='input textarea'
					rows={2}
					maxLength={1000}
					placeholder='Suma algo a la idea: una duda, un ajuste, un dato.'
					value={body}
					onChange={e => setBody(e.target.value)}
				/>
				<button
					className='btn'
					type='submit'
					disabled={add.isPending || body.trim().length < 2}>
					<Icon name='send' />
					{add.isPending ? 'Enviando…' : 'Comentar'}
				</button>
			</form>
		</section>
	)
}
