import { MessageCircle } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function ChatToPdf() {
	return (
		<ToolCard
			href="/chat-to-pdf-using-ai"
			title="Chat to PDF"
			description="AI-powered PDF conversations"
			icon={<MessageCircle className="w-6 h-6" />}
			iconGradient="pink"
			badgeClassName="bg-pink-100 text-pink-700"
		/>
	);
}
