import { SearchX } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function SearchTextDelete() {
	return (
		<ToolCard
			href="/search-text-delete-in-pdf"
			title="Search & Delete"
			description="Find and delete text in PDF"
			icon={<SearchX className="w-6 h-6" />}
			iconGradient="amber"
		/>
	);
}
