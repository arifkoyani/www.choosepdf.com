import { Paperclip } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function ExtractAttachmentsFromPdf() {
	return (
		<ToolCard
			href="/extract-attachments-from-pdf"
			title="Extract Attachments"
			description="Extract files from PDF"
			icon={<Paperclip className="w-6 h-6" />}
			iconGradient="slate"
		/>
	);
}
