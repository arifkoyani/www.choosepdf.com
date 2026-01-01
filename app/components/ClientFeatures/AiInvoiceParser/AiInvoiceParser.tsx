"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp } from "lucide-react";
import Spinner from "../../ui/loader/loader";
import { toast } from "sonner";

type AppState = "select" | "uploading" | "processing" | "checking" | "ready";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface InvoiceData {
  business_information: {
    business_name: string;
    street_address_line_01: string;
    street_address_line_02: string;
    phone_number: string;
    email_address: string;
    website: string;
  };
  invoice_details: {
    invoice_number: string;
    invoice_date: string;
    due_date: string;
  };
  customer_information: {
    customer_name: string;
    street_address_line_01: string;
    street_address_line_02: string;
  };
  summary: {
    subtotal: string;
    discount: string;
    tax_rate: string;
    tax: string;
    total: string;
  };
  payment_terms: {
    terms: string;
    late_fee: string;
  };
  conditions_instructions: {
    text: string;
  };
  lineItems: Array<{
    service: string;
    description: string;
    quantity_hours: string;
    rate: string;
    amount: string;
  }>;
}

const AiInvoiceParser = () => {
  const [state, setState] = useState<AppState>("select");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [jobId, setJobId] = useState("");
  const [originalFileUrl, setOriginalFileUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [toEmail, setToEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedLanguages = [
    "Albanian (Shqip)", "Bosnian (Bosanski)", "Bulgarian (Български)", "Croatian (Hrvatski)",
    "Czech (Čeština)", "Danish (Dansk)", "Dutch (Nederlands)", "English", "Estonian (Eesti)",
    "Finnish (Suomi)", "French (Français)", "German (Deutsch)", "Greek (Ελληνικά)",
    "Hungarian (Magyar)", "Icelandic (Íslenska)", "Italian (Italiano)", "Latvian (Latviešu)",
    "Lithuanian (Lietuvių)", "Norwegian (Norsk)", "Polish (Polski)", "Portuguese (Português)",
    "Romanian (Română)", "Russian (Русский)", "Serbian (Српски)", "Slovak (Slovenčina)",
    "Slovenian (Slovenščina)", "Spanish (Español)", "Swedish (Svenska)", "Turkish (Türkçe)",
    "Ukrainian (Українська)"
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = ["application/pdf"];
    const validExtensions = ["pdf"];
    const fileExtension = file.name.toLowerCase().split(".").pop();

    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || "");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFileType(file)) {
        uploadFile(file);
      } else {
        alert("Please select a PDF file (.pdf)");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setState("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (data.error === false) {
        const newFile: UploadedFile = {
          id: fileId,
          name: file.name,
          url: data.url,
          size: formatFileSize(file.size),
          type: file.type,
        };

        setUploadedFiles([newFile]);
        await processInvoice(data.url);
      } else {
        setState("select");
        alert("contact choosepdf support team");
      }
    } catch (error) {
      console.error("Upload error: contact choosepdf support team", error);
      setState("select");
      alert("contact choosepdf support team");
    }
  };

  const processInvoice = async (fileUrl: string) => {
    setState("processing");

    try {
      const response = await fetch("/api/aiinvoiceparser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fileUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error === true) {
        const errorMsg = data.message || "Processing failed. Please try again.";
        alert(`Processing failed: ${errorMsg}`);
        setState("select");
        return;
      }

      if (data.error === false && data.jobId) {
        setJobId(data.jobId);
        setOriginalFileUrl(data.originalUrl || fileUrl);
        await checkJobStatus(data.jobId, data.originalUrl || fileUrl);
      } else {
        alert("Processing failed. Please try again.");
        setState("select");
      }
    } catch (error) {
      console.error("Processing error:", error);
      alert("Processing failed. Please try again.");
      setState("select");
    }
  };

  const checkJobStatus = async (currentJobId: string, originalUrl: string) => {
    setState("checking");

    try {
      const checkStatus = async (): Promise<void> => {
        const response = await fetch(`/api/aiinvoiceparser?jobId=${currentJobId}&originalUrl=${encodeURIComponent(originalUrl)}`, {
          method: "GET",
        });

        const data = await response.json();

        if (data.error === true) {
          throw new Error(data.message || "Job failed");
        }

        if (data.status === "success") {
          setResultUrl(data.url);
          setInvoiceData(data.body);
          setState("ready");
        } else if (data.status === "working") {
          // Continue checking after 2 seconds
          setTimeout(() => checkStatus(), 2000);
        } else {
          throw new Error(data.message || "Job failed");
        }
      };

      await checkStatus();
    } catch (error) {
      console.error("Job check error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to process invoice. Please try again.";
      alert(errorMsg);
      setState("select");
    }
  };

  const removeFile = () => {
    setUploadedFiles([]);
    setState("select");
    setJobId("");
    setResultUrl("");
    setInvoiceData(null);
    setToEmail("");
  };

  const resetConverter = () => {
    setState("select");
    setUploadedFiles([]);
    setJobId("");
    setResultUrl("");
    setInvoiceData(null);
    setDownloading(false);
    setToEmail("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadFile = async (url: string, filename: string) => {
    setDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };


  const handleSendEmail = async () => {
    if (!toEmail || !resultUrl) {
      alert("Recipient email and file URL are required");
      return;
    }

    setSendingEmail(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail,
          fileUrl: resultUrl,
        }),
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      let data;
      if (isJson) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Server returned non-JSON response");
      }

      if (!response.ok) {
        const errorMessage = data.message || "Email send failed";
        throw new Error(errorMessage);
      }

      if (!data.error) {
        toast.success("Email sent successfully", {
          description: "Your email has been delivered.",
          duration: 5000,
          position: "bottom-right",
        });
        setToEmail("");
      } else {
        const errorMessage = data.message || "contact choosepdf support team";
        toast.error("Failed to send email", {
          description: errorMessage,
          duration: 3000,
          position: "bottom-right",
        });
      }
    } catch (err) {
      console.error("Email send error:", err);
      const errorMessage = err instanceof Error ? err.message : "contact choosepdf support team";
      toast.error("Failed to send email", {
        description: errorMessage,
        duration: 3000,
        position: "bottom-right",
      });
    } finally {
      setSendingEmail(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-start py-8">
      <div className="pb-8 flex flex-col justify-center items-center space-y-3">
        <h1 className="text-gray-600 text-xl font-medium">AI Invoice Parser</h1>
        <p className="text-sm text-gray-600 text-center max-w-2xl">
          Process invoices faster than ever by extracting data and structuring it automatically with our advanced AI
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <strong>Supported Languages:</strong> {supportedLanguages.slice(0, 5).join(", ")} and {supportedLanguages.length - 5} more
        </p>
      </div>

      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-none border-none bg-transparent">
        <div className="space-y-6">
          {/* Upload Section */}
          {state === "select" && uploadedFiles.length === 0 && (
            <div className="space-y-4 bg-transparent rounded-xl p-4 flex flex-col items-center justify-between">
              <div className="w-full mx-auto min-h-16 bg-[#f4f4f5] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="relative w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ fontSize: 0 }}
                  />
                  <div className="w-full min-h-16 flex justify-center items-center cursor-pointer bg-[#ff911d] border-2 border-solid border-[#ff911d] rounded-lg hover:border-[#ff911d] transition-colors">
                    <MonitorUp className="w-6 h-6 text-[#f4f4f5]" />
                  </div>
                </div>
              </div>

              <span>
                <p className="text-sm text-gray-600 text-center">
                  Extract invoice data with AI precision. Get quick and accurate data from any invoice, no matter the layout.
                </p>
                <p className="text-sm text-gray-600 text-center">Supported: PDF</p>
              </span>
            </div>
          )}

          {/* Upload Progress */}
          {state === "uploading" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Uploading PDF invoice...</p>
            </div>
          )}

          {/* Processing */}
          {state === "processing" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Starting AI invoice processing...</p>
            </div>
          )}

          {/* Checking Job Status */}
          {state === "checking" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Processing invoice with AI...</p>
              <p className="text-sm text-gray-600">This may take a few moments</p>
            </div>
          )}

          {/* Uploaded File Info */}
          {uploadedFiles.length > 0 && state !== "ready" && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-red-500" />
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{uploadedFiles[0]?.name}</p>
                  <p className="text-xs text-gray-600">{uploadedFiles[0]?.size}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(uploadedFiles[0]?.url, "_blank")}
                  title="Open in new tab"
                  className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                >
                  <MoveUpRight className="w-4 h-4 text-gray-700" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  title="Remove file"
                  className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Ready State - Display Results */}
          {state === "ready" && resultUrl && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully parsed invoice!
                </p>
              </div>

              {/* Download and Open Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => downloadFile(resultUrl, "invoice-data.json")}
                  disabled={downloading}
                  className="flex-1 bg-[#ff911d] hover:bg-[#e67e0a] text-white cursor-pointer"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download JSON Data
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(resultUrl, "_blank")}
                  title="Open in new tab"
                  className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                >
                  <MoveUpRight className="w-4 h-4 text-gray-700" />
                </Button>
              </div>

              {/* Email Input and Send Button */}
              <div className="pt-2">
                <h3 className="text-sm mb-3 text-gray-900">Share and Receive Invoice Data via Email</h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="email"
                    placeholder="Enter recipient email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="border-1 border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:border-[#ff911d] text-gray-900"
                  />
                  <Button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || !resultUrl || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Parse Another Invoice
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AiInvoiceParser;
