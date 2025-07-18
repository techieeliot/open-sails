import type { VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'

import { Button } from '../ui/button'

export default function TriggerIconButton({
	icon: Icon,
	isIconLeading: i = true,
	children,
	...props
}: {
	isIconLeading?: boolean
	icon?: LucideIcon
} & VariantProps<typeof Button>) {
	return (
		<Button {...props}>
			{Icon && i && <Icon className="h-5 w-5" />}
			<span className="inline">{children}</span>
			{Icon && !i && <Icon className="h-5 w-5" />}
		</Button>
	)
}
