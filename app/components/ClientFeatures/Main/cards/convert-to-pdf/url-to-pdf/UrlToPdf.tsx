import { Link2 } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function UrlToPdf() {
	return (
		<ToolCard
			href="/url-to-pdf"
			title="URL to PDF"
			description="Convert web pages to PDF"
			icon={<Link2 className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
