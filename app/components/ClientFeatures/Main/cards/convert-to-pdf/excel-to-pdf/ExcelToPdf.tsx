import { FileSpreadsheet } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function ExcelToPdf() {
	return (
		<ToolCard
			href="/excel-to-pdf"
			title="Excel to PDF"
			description="Convert Excel files to PDF"
			icon={<FileSpreadsheet className="w-6 h-6" />}
			iconGradient="teal"
		/>
	);
}
