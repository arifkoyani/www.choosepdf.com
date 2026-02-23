import { RotateCw } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function RotateSelectedPages() {
	return (
		<ToolCard
			href="/rotate-pdf-selected-pages"
			title="Rotate Selected Pages"
			description="Rotate specific PDF pages"
			icon={<RotateCw className="w-6 h-6" />}
			iconGradient="yellow"
		/>
	);
}
