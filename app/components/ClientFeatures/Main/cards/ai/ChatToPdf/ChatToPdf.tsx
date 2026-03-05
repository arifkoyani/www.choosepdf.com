import { MessageCircle } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function ChatToPdf() {
	return (
		<ToolCard
			href="/chat-to-pdf-using-ai"
			title="Chat to PDF"
			description="AI-powered PDF"
			icon={<MessageCircle className="w-6 h-6" />}
			iconGradient="orange"
			badgeClassName="bg-pink-100 text-pink-700"
		/>
	);
}
