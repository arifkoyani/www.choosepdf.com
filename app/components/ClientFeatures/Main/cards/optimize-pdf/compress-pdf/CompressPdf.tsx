import { Archive } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function CompressPdf() {
	return (
		<ToolCard
			href="/compress-pdf"
			title="Compress PDF"
			description="Reduce PDF file size efficiently"
			icon={<Archive className="w-6 h-6" />}
			iconGradient="blue"
		/>
	);
}
