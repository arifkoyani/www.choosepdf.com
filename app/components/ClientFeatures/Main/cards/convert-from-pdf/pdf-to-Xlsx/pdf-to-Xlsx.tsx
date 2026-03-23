import { Table } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToXlsx() {
	return (
		<ToolCard
			href="/pdf-to-xlsx"
			title="PDF to XLSX"
			description="Convert PDF to Excel XLSX"
			icon={<Table className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
