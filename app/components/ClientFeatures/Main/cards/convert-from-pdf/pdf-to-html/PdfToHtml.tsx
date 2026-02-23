import { Code } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToHtml() {
	return (
		<ToolCard
			href="/pdf-to-html"
			title="PDF to HTML"
			description="Convert PDF to HTML format"
			icon={<Code className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
