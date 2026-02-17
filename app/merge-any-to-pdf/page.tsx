import type { Metadata } from "next";
import MergeClient from "../components/ClientFeatures/MergeAnyToPdf/MergeAnyToPdfClient";

export const metadata: Metadata = {
	title: "Merge Any to PDF - Combine PDF, DOC, XLS, Images & ZIP Files | ChoosePDF",
	description: "Merge various document types into a single PDF. Combine PDF, DOC, DOCX, XLS, XLSX, RTF, TXT, images (JPG, PNG), and ZIP files into one PDF document. 100% free, no sign-up required.",
	keywords: [
		"merge pdf",
		"combine pdf",
		"merge documents",
		"merge doc to pdf",
		"merge xls to pdf",
		"merge images to pdf",
		"merge zip to pdf",
		"combine files to pdf",
		"pdf merger",
		"document merger",
		"free pdf tools",
		"online pdf merger"
	],
	authors: [{ name: "ChoosePDF" }],
	creator: "ChoosePDF",
	publisher: "ChoosePDF",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://choosepdf.com"),
	alternates: {
		canonical: "/merge-any-to-pdf",
	},
	openGraph: {
		title: "Merge Any to PDF - Combine Multiple File Types | ChoosePDF",
		description: "Merge PDF, DOC, DOCX, XLS, XLSX, RTF, TXT, images, and ZIP files into a single PDF. Free online tool, no sign-up required.",
		url: "/merge-any-to-pdf",
		siteName: "ChoosePDF",
		images: [
			{
				url: "/og-image-merge-pdf.jpg",
				width: 1200,
				height: 630,
				alt: "Merge Any to PDF Tool - ChoosePDF",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Merge Any to PDF - Combine Multiple File Types | ChoosePDF",
		description: "Merge PDF, DOC, XLS, images, and ZIP files into a single PDF. 100% free, no sign-up required.",
		images: ["/og-image-merge-pdf.jpg"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		// Add your verification codes here if needed
		// google: "your-google-verification-code",
		// yandex: "your-yandex-verification-code",
	},
	category: "PDF Tools",
};

export default function MergeAnyToPdfPage() {
	return <MergeClient />
}