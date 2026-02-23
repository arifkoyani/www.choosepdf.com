import { ImagePlus } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function SearchTextReplaceImage() {
	return (
		<ToolCard
			href="/search-text-replace-image-in-pdf"
			title="Replace with Image"
			description="Replace text with images in PDF"
			icon={<ImagePlus className="w-6 h-6" />}
			iconGradient="amber"
		/>
	);
}
