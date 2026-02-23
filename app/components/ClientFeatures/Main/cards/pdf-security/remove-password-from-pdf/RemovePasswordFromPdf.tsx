import { Unlock } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function RemovePasswordFromPdf() {
	return (
		<ToolCard
			href="/remove-password-from-pdf"
			title="Remove Password"
			description="Unlock password-protected PDFs"
			icon={<Unlock className="w-6 h-6" />}
			iconGradient="red"
		/>
	);
}
