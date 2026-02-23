import { Image } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PngToPdf() {
	return (
		<ToolCard
			href="/png-to-pdf"
			title="PNG to PDF"
			description="Convert PNG images to PDF"
			icon={<Image className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
