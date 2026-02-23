import { Cpu } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToJsonByaI() {
	return (
		<ToolCard
			href="/pdf-to-json-by-ai"
			title="PDF to JSON by AI"
			description="AI-powered PDF to JSON"
			icon={<Cpu className="w-6 h-6" />}
			iconGradient="green"
			badgeClassName="bg-green-100 text-green-700"
		/>
	);
}
