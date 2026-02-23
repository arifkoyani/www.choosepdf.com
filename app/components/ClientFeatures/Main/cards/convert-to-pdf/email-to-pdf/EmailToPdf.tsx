import { Mail } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function EmailToPdf() {
	return (
		<ToolCard
			href="/email-to-pdf"
			title="Email to PDF"
			description="Convert emails to PDF format"
			icon={<Mail className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
