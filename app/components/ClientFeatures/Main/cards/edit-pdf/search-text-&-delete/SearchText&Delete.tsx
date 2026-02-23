import { Trash2 } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function SearchTextDelete() {
	return (
		<ToolCard
			href="/search-text-delete-in-pdf"
			title="Search & Delete"
			description="Find and delete text in PDF"
			icon={<Trash2 className="w-6 h-6" />}
			iconGradient="amber"
		/>
	);
}
