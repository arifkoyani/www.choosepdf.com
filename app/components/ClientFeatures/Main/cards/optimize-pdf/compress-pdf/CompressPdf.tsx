import { Minimize2 } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function CompressPdf() {
	return (
		<ToolCard
			href="/compress-pdf"
			title="Compress PDF"
			description="Reduce PDF size efficiently"
			icon={<Minimize2 className="w-6 h-6" />}
			iconGradient="blue"
		/>
	);
}
