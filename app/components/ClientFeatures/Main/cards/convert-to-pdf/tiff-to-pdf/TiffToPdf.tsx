import { Image } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function TiffToPdf() {
	return (
		<ToolCard
			href="/tiff-to-pdf"
			title="TIFF to PDF"
			description="Convert TIFF images to PDF"
			icon={<Image className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
