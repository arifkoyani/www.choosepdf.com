import { Lock } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function AddPasswordToPdf() {
	return (
		<ToolCard
			href="/add-password-to-pdf"
			title="Add Password"
			description="Protect PDF with password"
			icon={<Lock className="w-6 h-6" />}
			iconGradient="red"
		/>
	);
}
