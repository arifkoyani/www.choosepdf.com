import { Replace } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function SearchTextAndReplace() {
	return (
		<ToolCard
			href="/search-text-replace-in-pdf"
			title="Search & Replace"
			description="Find and replace text in PDF"
			icon={<Replace className="w-6 h-6" />}
			iconGradient="amber"
		/>
	);
}
