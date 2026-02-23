import { Pencil } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function EditPdf() {
	return (
		<ToolCard
			href="/edit-pdf"
			title="Edit PDF"
			description="Edit PDF content directly"
			icon={<Pencil className="w-6 h-6" />}
			iconGradient="amber"
		/>
	);
}
