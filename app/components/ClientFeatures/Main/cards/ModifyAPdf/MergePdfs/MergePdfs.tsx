import { Files } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function MergePdfs() {
	return (
		<ToolCard
			href="/merge-pdfs"
			title="Merge PDFs"
			description="Combine multiple PDFs into one"
			icon={<Files className="w-6 h-6" />}
			iconGradient="orange"
		/>
	);
}
