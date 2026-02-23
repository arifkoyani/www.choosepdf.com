import Link from "next/link";
import { ReactNode } from "react";

const gradientClasses: Record<string, string> = {
	orange: "bg-gradient-to-br from-orange-500 to-orange-600",
	purple: "bg-gradient-to-br from-purple-500 to-purple-600",
	yellow: "bg-gradient-to-br from-yellow-500 to-yellow-600",
	red: "bg-gradient-to-br from-red-500 to-red-600",
	blue: "bg-gradient-to-br from-blue-500 to-blue-600",
	cyan: "bg-gradient-to-br from-cyan-500 to-cyan-600",
	teal: "bg-gradient-to-br from-teal-500 to-teal-600",
	green: "bg-gradient-to-br from-green-500 to-green-600",
	lime: "bg-gradient-to-br from-lime-500 to-lime-600",
	amber: "bg-gradient-to-br from-amber-500 to-amber-600",
	pink: "bg-gradient-to-br from-pink-500 to-pink-600",
	indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600",
	slate: "bg-gradient-to-br from-slate-500 to-slate-600",
};

interface ToolCardProps {
	href: string;
	title: string;
	description: string;
	icon: ReactNode;
	iconGradient?: keyof typeof gradientClasses;
	badge?: string;
	badgeClassName?: string;
}

export default function ToolCard({
	href,
	title,
	description,
	icon,
	iconGradient = "orange",
	badge,
	badgeClassName = "bg-green-100 text-green-700",
}: ToolCardProps) {
	const iconBoxClass = gradientClasses[iconGradient] || gradientClasses.orange;
	return (
		<div>
			<Link
				href={href}
				className="tool-card-hover  flex items-center justify-center  block px-4 py-14 bg-white rounded-4xl border border-neutral-300 shadow-xs hover:border-orange-200 transition-all duration-200"
			>
				<div className="flex items-start gap-4">
					<div
						className={`flex-shrink-0 w-12 h-12 ${iconBoxClass} rounded-xl flex items-center justify-center`}
					>
						<span className="w-6 h-6 text-white [&>svg]:w-6 [&>svg]:h-6 [&>svg]:text-white">
							{icon}
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-base font-semibold text-neutral-900 mb-1">
							{title}
						</h3>
						<p className="text-sm text-neutral-600">{description}</p>
						{badge && (
							<span
								className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${badgeClassName}`}
							>
								{badge}
							</span>
						)}
					</div>
				</div>
			</Link>
		</div>
	);
}
