import { useCountUp } from '@/hooks/ui/use_count_up'

export function CountUp({ to, delay }: { to: number; delay?: number }) {
	return <>{useCountUp(to, delay)}</>
}
