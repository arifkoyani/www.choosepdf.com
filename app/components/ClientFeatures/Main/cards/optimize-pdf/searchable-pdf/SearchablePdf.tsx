import { Search } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function SearchablePdf() {
	return (
		<ToolCard
			href="/make-pdf-searchable"
			title="Make Searchable"
			description="Enable text search in PDF"
			icon={<Search className="w-6 h-6" />}
			iconGradient="cyan"
		/>
	);
}
