import { FileText } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function WordToPdf() {
	return (
		<ToolCard
			href="/word-to-pdf"
			title="Word to PDF"
			description="Convert Word documents to PDF"
			icon={<FileText className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
