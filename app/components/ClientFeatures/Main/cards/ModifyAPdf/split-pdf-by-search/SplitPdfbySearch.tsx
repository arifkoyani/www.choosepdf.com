import { FileText } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function SplitPdfbySearch() {
	return (
		<ToolCard
			href="/split-pdf-by-search"
			title="Split PDF by Text"
			description="Split PDF based on text content"
			icon={<FileText className="w-6 h-6" />}
			iconGradient="purple"
		/>
	);
}
