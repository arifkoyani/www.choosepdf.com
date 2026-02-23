import { Image } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function JpgToPdf() {
	return (
		<ToolCard
			href="/jpg-to-pdf"
			title="JPG to PDF"
			description="Convert JPG images to PDF"
			icon={<Image className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
