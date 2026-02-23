import { Code } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function HtmlToPdf() {
	return (
		<ToolCard
			href="/html-to-pdf"
			title="HTML to PDF"
			description="Convert HTML pages to PDF"
			icon={<Code className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
