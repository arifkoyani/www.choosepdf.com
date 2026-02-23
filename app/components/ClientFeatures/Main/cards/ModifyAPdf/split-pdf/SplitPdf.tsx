import { SplitSquareVertical } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function SplitPdf() {
	return (
		<ToolCard
			href="/split-pdf"
			title="Split PDF"
			description="Extract pages from PDF files"
			icon={<SplitSquareVertical className="w-6 h-6" />}
			iconGradient="purple"
		/>
	);
}
