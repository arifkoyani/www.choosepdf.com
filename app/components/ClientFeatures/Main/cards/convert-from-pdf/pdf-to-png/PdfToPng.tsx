import { Image } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToPng() {
	return (
		<ToolCard
			href="/pdf-to-png"
			title="PDF to PNG"
			description="Convert PDF to PNG images"
			icon={<Image className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
