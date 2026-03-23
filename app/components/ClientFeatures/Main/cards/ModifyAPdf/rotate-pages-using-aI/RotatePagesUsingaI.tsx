import { RotateCcw } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function RotatePagesUsingaI() {
	return (
		<ToolCard
			href="/rotate-pdf-pages-using-ai"
			title="Rotate Pages AI"
			description="Auto-rotate pages using AI"
			icon={<RotateCcw className="w-6 h-6" />}
			iconGradient="yellow"
		/>
	);
}
