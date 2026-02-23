import { RotateCw } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function RotatePagesUsingaI() {
	return (
		<ToolCard
			href="/rotate-pdf-pages-using-ai"
			title="Rotate Pages AI"
			description="Auto-rotate pages using AI"
			icon={<RotateCw className="w-6 h-6" />}
			iconGradient="yellow"
		/>
	);
}
