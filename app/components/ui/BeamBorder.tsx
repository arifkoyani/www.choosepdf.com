'use client'

import { ReactNode } from 'react'

interface BeamBorderProps {
	children: ReactNode
	className?: string
}

export default function BeamBorder({ children, className = '' }: BeamBorderProps) {
	return (
		<div className={`relative ${className}`}>
			{/* Animated border wrapper */}
			<div className="relative rounded-2xl p-[2px] beam-border-gradient">
				{/* Inner content */}
				<div className="relative bg-white shadow-xl rounded-2xl">
					{children}
				</div>
			</div>
		</div>
	)
}

