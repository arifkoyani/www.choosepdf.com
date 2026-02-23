import { Receipt } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function AIInvoiceParser() {
	return (
		<ToolCard
			href="/ai-invoice-parser"
			title="AI Invoice Parser"
			description="Extract invoice data with AI"
			icon={<Receipt className="w-6 h-6" />}
			iconGradient="indigo"
			badgeClassName="bg-indigo-100 text-indigo-700"
		/>
	);
}
