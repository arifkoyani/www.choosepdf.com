import { Image } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToWebP() {
	return (
		<ToolCard
			href="/pdf-to-webp"
			title="PDF to WebP"
			description="Convert PDF to WebP images"
			icon={<Image className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
