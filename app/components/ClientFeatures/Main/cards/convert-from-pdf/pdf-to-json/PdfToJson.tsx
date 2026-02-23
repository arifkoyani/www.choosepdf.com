import { FileJson } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToJson() {
	return (
		<ToolCard
			href="/pdf-to-json"
			title="PDF to JSON"
			description="Convert PDF to JSON data"
			icon={<FileJson className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
