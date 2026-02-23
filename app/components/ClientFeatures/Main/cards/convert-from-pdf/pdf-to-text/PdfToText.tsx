import { FileText } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToText() {
	return (
		<ToolCard
			href="/pdf-to-text"
			title="PDF to Text"
			description="Extract text from PDF files"
			icon={<FileText className="w-6 h-6" />}
			iconGradient="lime"
		/>
	);
}
