import { FileText } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function TxtToPdf() {
	return (
		<ToolCard
			href="/txt-to-pdf"
			title="TXT to PDF"
			description="Convert text files to PDF"
			icon={<FileText className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
