import { Image } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function SearchTextReplaceImage() {
	return (
		<ToolCard
			href="/search-text-replace-image-in-pdf"
			title="Replace with Image"
			description="Replace text with images PDF"
			icon={<Image className="w-6 h-6" />}
			iconGradient="amber"
		/>
	);
}
