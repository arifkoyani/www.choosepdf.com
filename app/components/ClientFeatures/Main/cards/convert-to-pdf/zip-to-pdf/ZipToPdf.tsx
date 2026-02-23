import { Archive } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function ZipToPdf() {
	return (
		<ToolCard
			href="/zip-to-pdf"
			title="ZIP to PDF"
			description="Convert ZIP archives to PDF"
			icon={<Archive className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
