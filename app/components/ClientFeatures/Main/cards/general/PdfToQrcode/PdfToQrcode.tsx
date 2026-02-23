import { QrCode } from "lucide-react";
import ToolCard from "../../ToolCard";

export default function PdfToQrcode() {
	return (
		<ToolCard
			href="/pdf-to-qrcode"
			title="PDF to QR Code"
			description="Generate QR codes from PDFs"
			icon={<QrCode className="w-6 h-6" />}
			iconGradient="slate"
		/>
	);
}
