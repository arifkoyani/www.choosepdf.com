import { FileText } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function MergeAnyToPdf() {
	return (
		<ToolCard
			href="/merge-any-to-pdf"
			title="Merge Any to PDF"
			description="Combine multiple files into pdf"
			icon={<FileText className="w-6 h-6" />}
			iconGradient="orange"
		/>
	);
}
