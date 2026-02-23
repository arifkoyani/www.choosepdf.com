import { Image } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToTiff() {
	return (
		<ToolCard
			href="/pdf-to-tiff"
			title="PDF to TIFF"
			description="Convert PDF to TIFF images"
			icon={<Image className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
