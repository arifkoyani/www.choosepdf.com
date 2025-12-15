"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2 } from "lucide-react";
import Spinner from "../../ui/loader/loader";
import { toast } from "sonner";

type AppState = "input" | "converting" | "ready";

interface ConvertResult {
  url: string;
  name: string;
}

const HtmlToPdf = () => {
  const [state, setState] = useState<AppState>("input");
  const [htmlCode, setHtmlCode] = useState<string>("");
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const convertHtmlToPdf = async () => {
    if (!htmlCode.trim()) {
      setErrorMessage("Please enter HTML code");
      return;
    }

    setState("converting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/htmltopdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: htmlCode,
          name: "converted-document.pdf",
          margins: "5px 5px 5px 5px",
          paperSize: "Letter",
          orientation: "Portrait",
          printBackground: true,
          header: "",
          footer: "",
          mediaType: "print",
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error === true) {
        const errorMsg = data.message || "HTML to PDF conversion failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("input");
        return;
      }

      if (data.error === false && data.url) {
        setConvertResult({
          url: data.url,
          name: "converted-document.pdf",
        });
        setErrorMessage("");
        setState("ready");
      } else if (data.error === false && data.urls && data.urls.length > 0) {
        // Handle multiple URLs (though HTML to PDF typically returns one)
        setConvertResult({
          url: data.urls[0],
          name: "converted-document.pdf",
        });
        setErrorMessage("");
        setState("ready");
      } else {
        const errorMsg = data.message || "HTML to PDF conversion failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("input");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      const errorMsg = error instanceof Error ? error.message : "HTML to PDF conversion failed. Please try again.";
      setErrorMessage(errorMsg);
      setState("input");
    }
  };

  const resetConverter = () => {
    setState("input");
    setConvertResult(null);
    setHtmlCode("");
    setErrorMessage("");
    setDownloading(false);
    setToEmail("");
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
    if (!toEmail || !convertResult) {
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
          fileUrl: convertResult.url,
        }),
      });

      // Check if response is JSON
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
        <h1 className="text-gray-600 text-xl font-medium">HTML to PDF</h1>
        <p className="text-sm text-gray-500 text-center max-w-2xl px-4">
          Convert your HTML code into professional PDF documents with perfect formatting and layout preservation.
        </p>
      </div>

      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-none border-none bg-transparent">
        <div className="space-y-6">
          {/* Input Section */}
          {state === "input" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label htmlFor="html-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your HTML code
                </label>
                <textarea
                  id="html-input"
                  value={htmlCode}
                  onChange={(e) => {
                    setHtmlCode(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Paste your HTML code here..."
                  className="w-full p-4 border border-gray-300 rounded-lg h-64 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {errorMessage}
                  </p>
                </div>
              )}

              {/* Convert Button */}
              <Button
                onClick={convertHtmlToPdf}
                disabled={!htmlCode.trim()}
                className="w-full bg-[#ff911d] hover:bg-[#e67e0a] cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-5 h-5 mr-2" />
                Convert HTML to PDF
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Enter your HTML code in the textarea above and click the button to convert it to PDF.
              </p>
            </div>
          )}

          {/* Converting Process */}
          {state === "converting" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Converting HTML to PDF...</p>
              <p className="text-sm text-gray-600">This may take a few moments for HTML processing...</p>
            </div>
          )}

          {/* Ready State - Download Result */}
          {state === "ready" && convertResult && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully converted HTML to PDF!
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-red-500" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{convertResult.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(convertResult.url, "_blank")}
                    title="Open in new tab"
                    className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    <MoveUpRight className="w-4 h-4 text-gray-700" />
                  </Button>
                  <Button
                    onClick={() => downloadFile(convertResult.url, convertResult.name)}
                    disabled={downloading}
                    className="bg-[#ff911d] hover:bg-[#e67e0a] text-white cursor-pointer"
                    size="sm"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Email Input and Send Button */}
              <div className="pt-2">
                <h3 className="text-sm mb-3 text-gray-900">Share and Receive PDF via Email</h3>
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
                    disabled={sendingEmail || !convertResult || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Convert Another HTML
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default HtmlToPdf;
