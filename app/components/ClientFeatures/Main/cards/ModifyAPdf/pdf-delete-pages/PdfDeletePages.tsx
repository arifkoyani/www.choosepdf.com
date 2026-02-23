import { Trash2 } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfDeletePages() {
	return (
		<ToolCard
			href="/delete-pages-from-pdf"
			title="Delete Pages"
			description="Remove unwanted PDF pages"
			icon={<Trash2 className="w-6 h-6" />}
			iconGradient="red"
		/>
	);
}
