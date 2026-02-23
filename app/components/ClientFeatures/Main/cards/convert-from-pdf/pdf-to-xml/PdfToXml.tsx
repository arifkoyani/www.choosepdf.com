import { Code } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToXml() {
	return (
		<ToolCard
			href="/pdf-to-xml"
			title="PDF to XML"
			description="Convert PDF to XML format"
			icon={<Code className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
