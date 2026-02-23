import { FileSpreadsheet } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToXls() {
	return (
		<ToolCard
			href="/pdf-to-xls"
			title="PDF to XLS"
			description="Convert PDF to Excel XLS"
			icon={<FileSpreadsheet className="w-6 h-6" />}
			iconGradient="green"
		/>
	);
}
