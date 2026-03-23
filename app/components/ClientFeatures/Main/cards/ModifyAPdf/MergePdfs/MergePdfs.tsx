import { Layers } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function MergePdfs() {
	return (
		<ToolCard
			href="/merge-pdfs"
			title="Merge PDFs"
			description="Combine multiple PDFs"
			icon={<Layers className="w-6 h-6" />}
			iconGradient="orange"
		/>
	);
}
