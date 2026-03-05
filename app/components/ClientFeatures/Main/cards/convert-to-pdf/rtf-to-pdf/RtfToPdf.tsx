import { FileText } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function RtfToPdf() {
	return (
		<ToolCard
			href="/rtf-to-pdf"
			title="RTF to PDF"
			description="Convert RTF Files to PDF"
			icon={<FileText className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
