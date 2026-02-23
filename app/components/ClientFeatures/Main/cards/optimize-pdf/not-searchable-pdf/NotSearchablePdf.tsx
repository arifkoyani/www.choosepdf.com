import { EyeOff } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function NotSearchablePdf() {
	return (
		<ToolCard
			href="/make-pdf-unsearchable"
			title="Make Unsearchable"
			description="Disable text search in PDF"
			icon={<EyeOff className="w-6 h-6" />}
			iconGradient="blue"
		/>
	);
}
