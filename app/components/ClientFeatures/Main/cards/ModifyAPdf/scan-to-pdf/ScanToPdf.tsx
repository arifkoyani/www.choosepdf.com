import { ScanLine } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function ScanToPdf() {
	return (
		<ToolCard
			href="/scan-to-pdf"
			title="Scan to PDF"
			description="Scan documents and save as PDF"
			icon={<ScanLine className="w-6 h-6" />}
			iconGradient="orange"
		/>
	);
}
