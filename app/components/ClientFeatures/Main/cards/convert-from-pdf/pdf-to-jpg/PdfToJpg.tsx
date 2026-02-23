import { Image } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToJpg() {
	return (
		<ToolCard
			href="/pdf-to-jpg"
			title="PDF to JPG"
			description="Convert PDF pages to images"
			icon={<Image className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
