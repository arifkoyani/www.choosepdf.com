"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp } from "lucide-react";
import Spinner from "../../ui/loader/loader";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

type AppState = "select" | "uploading" | "tabs" | "splitting" | "ready";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface SplitResult {
  url: string;
  name: string;
}

interface SplitOption {
  id: string;
  label: string;
  inputType: "single" | "range" | "multiple" | "text";
  placeholder: string;
  example: string;
  apiPayload: string;
  description: string;
  formatInput: (input: string, startPage?: string, endPage?: string) => string;
}

const splitOptions: SplitOption[] = [
  {
    id: "single",
    label: "Single Page",
    inputType: "single",
    placeholder: "Enter page number",
    example: "3",
    apiPayload: "3",
    description: "Only this single page will be split.",
    formatInput: (input) => input.trim(),
  },
  {
    id: "range",
    label: "Page Range",
    inputType: "range",
    placeholder: "Start Page / End Page",
    example: "3 → 7",
    apiPayload: "3-7",
    description: "Split all pages from start to end.",
    formatInput: (_, startPage, endPage) => `${startPage}-${endPage}`,
  },
  {
    id: "multiple",
    label: "Multiple Pages",
    inputType: "multiple",
    placeholder: "e.g., 1,3,5",
    example: "1,3,5",
    apiPayload: "1,3,5",
    description: "Split only selected pages.",
    formatInput: (input) => input.trim(),
  },
  {
    id: "multiple-ranges",
    label: "Multiple Ranges",
    inputType: "text",
    placeholder: "e.g., 1-2,4-6",
    example: "1-2,4-6",
    apiPayload: "1-2,4-6",
    description: "Split multiple ranges of pages.",
    formatInput: (input) => input.trim(),
  },
  {
    id: "range-end",
    label: "Range to End",
    inputType: "single",
    placeholder: "e.g., 3",
    example: "3",
    apiPayload: "3-",
    description: "Start from this page to the last page.",
    formatInput: (input) => `${input.trim()}-`,
  },
  {
    id: "mixed",
    label: "Mixed Pages & Ranges",
    inputType: "text",
    placeholder: "e.g., 1-2,5,7-",
    example: "1-2,5,7-",
    apiPayload: "1-2,5,7-",
    description: "Combine single pages, ranges, and ranges-to-end.",
    formatInput: (input) => input.trim(),
  },
  {
    id: "inverted-single",
    label: "Inverted Single Page",
    inputType: "single",
    placeholder: "e.g., !1 or 1",
    example: "!1",
    apiPayload: "!1",
    description: "Select page from the end (last page).",
    formatInput: (input) => {
      const trimmed = input.trim();
      return trimmed.startsWith("!") ? trimmed : `!${trimmed}`;
    },
  },
  {
    id: "inverted-range",
    label: "Inverted Range",
    inputType: "single",
    placeholder: "e.g., !2 or 2",
    example: "!2-",
    apiPayload: "!2-",
    description: "Start from reverse-indexed page to the last page.",
    formatInput: (input) => {
      const trimmed = input.trim();
      const page = trimmed.startsWith("!") ? trimmed.substring(1) : trimmed;
      return `!${page}-`;
    },
  },
  {
    id: "combination-inverted",
    label: "Combination with Inverted",
    inputType: "text",
    placeholder: "e.g., 1, !1",
    example: "1, !1",
    apiPayload: "1,!1",
    description: "Combine normal pages and inverted pages.",
    formatInput: (input) => input.trim(),
  },
  {
    id: "all-pages",
    label: "All Pages",
    inputType: "text",
    placeholder: "Leave blank for full PDF",
    example: "(empty)",
    apiPayload: "",
    description: "The full PDF will be split.",
    formatInput: () => "",
  },
];

const SplitPdf = () => {
  const [state, setState] = useState<AppState>("select");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [downloading, setDownloading] = useState<{ [key: number]: boolean }>({});
  const [selectedTab, setSelectedTab] = useState("single");
  const [pageNumbers, setPageNumbers] = useState("");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setState("tabs");
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

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    setPageNumbers("");
    setStartPage("");
    setEndPage("");
  };

  const removeFile = () => {
    setUploadedFiles([]);
    setState("select");
    setSplitResults([]);
    setPageNumbers("");
    setStartPage("");
    setEndPage("");
    setSelectedTab("single");
  };

  const splitPdf = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload a PDF file first");
      return;
    }

    const selectedOption = splitOptions.find((option) => option.id === selectedTab);
    if (!selectedOption) {
      alert("Please select a split option");
      return;
    }

    let pagesValue = "";
    if (selectedOption.inputType === "range") {
      if (!startPage.trim() || !endPage.trim()) {
        alert("Please enter both start and end page numbers");
        return;
      }
      pagesValue = selectedOption.formatInput("", startPage, endPage);
    } else {
      if (selectedOption.id === "all-pages") {
        pagesValue = "";
      } else if (!pageNumbers.trim()) {
        alert("Please specify page numbers to split");
        return;
      } else {
        pagesValue = selectedOption.formatInput(pageNumbers);
      }
    }

    setState("splitting");

    try {
      const response = await fetch("/api/splitpdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadedFiles[0].url,
          pages: pagesValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Split failed");
      }

      const data = await response.json();

      if (data.error === false && data.urls && data.urls.length > 0) {
        const results = data.urls.map((url: string, index: number) => ({
          url: url,
          name: `split-document-${index + 1}.pdf`,
        }));

        setSplitResults(results);
        setState("ready");
      } else {
        alert(`PDF split failed: ${data.message || "Please try again."}`);
        setState("tabs");
      }
    } catch (error) {
      console.error("Split error:", error);
      alert("PDF split failed. Please try again.");
      setState("tabs");
    }
  };

  const resetConverter = () => {
    setState("select");
    setUploadedFiles([]);
    setSplitResults([]);
    setPageNumbers("");
    setStartPage("");
    setEndPage("");
    setSelectedTab("single");
    setDownloading({});
    setToEmail("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadFile = async (url: string, filename: string, index: number) => {
    setDownloading((prev) => ({ ...prev, [index]: true }));
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
      setDownloading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleSendEmail = async () => {
    if (!toEmail || splitResults.length === 0) {
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
          fileUrl: splitResults[0].url,
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
        <h1 className="text-gray-600 text-xl font-medium">Split PDF into Multiple Documents</h1>
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
                  Split PDF into separate documents by extracting specific pages or ranges.
                </p>
                <p className="text-sm text-gray-600 text-center">Supported: PDF</p>
              </span>
            </div>
          )}

          {/* Upload Progress */}
          {state === "uploading" && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Tabs Section - After Upload */}
          {uploadedFiles.length > 0 && !splitResults.length && state !== "splitting" && (
            <div className="space-y-4">
              {/* Uploaded File Info */}
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

              {/* Page Input Field */}
              <div className="space-y-4">
                <div className="text-left">
                  <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="flex flex-wrap w-full h-auto p-1 gap-1 bg-gray-100 rounded-md">
                      {splitOptions.map((option) => (
                        <TabsTrigger
                          key={option.id}
                          value={option.id}
                          className="text-xs px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 data-[state=active]:bg-[#ff911d] data-[state=active]:text-white data-[state=active]:border-[#ff911d] data-[state=active]:font-semibold whitespace-nowrap transition-all cursor-pointer"
                        >
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {splitOptions.map((option) => (
                      <TabsContent key={option.id} value={option.id} className="mt-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-gray-700">{option.label}</h4>
                            <code className="bg-white px-3 py-1 rounded border text-[#ff911d] font-mono text-xs">
                              {option.apiPayload || "(empty)"}
                            </code>
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                          
                          {/* Single Input Field */}
                          {option.inputType === "single" && (
                            <div className="space-y-2">
                              <label className="text-xs text-gray-500">Enter page number (starts from 1, not 0):</label>
                              <input
                                type="text"
                                value={pageNumbers}
                                onChange={(e) => setPageNumbers(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                                placeholder={option.placeholder}
                              />
                              <p className="text-xs text-gray-400">Example: {option.example}</p>
                              <p className="text-xs text-blue-600 font-medium">Note: Page numbers start from 1, not 0</p>
                            </div>
                          )}

                          {/* Range Input Fields (Start and End) */}
                          {option.inputType === "range" && (
                            <div className="space-y-2">
                              <label className="text-xs text-gray-500">Enter page range (starts from 1, not 0):</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={startPage}
                                  onChange={(e) => setStartPage(e.target.value)}
                                  className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                                  placeholder="Start Page"
                                />
                                <span className="text-gray-500">→</span>
                                <input
                                  type="text"
                                  value={endPage}
                                  onChange={(e) => setEndPage(e.target.value)}
                                  className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                                  placeholder="End Page"
                                />
                              </div>
                              <p className="text-xs text-gray-400">Example: {option.example}</p>
                              <p className="text-xs text-blue-600 font-medium">Note: Page numbers start from 1, not 0</p>
                            </div>
                          )}

                          {/* Multiple Pages Input */}
                          {option.inputType === "multiple" && (
                            <div className="space-y-2">
                              <label className="text-xs text-gray-500">Enter page numbers (comma-separated, starts from 1, not 0):</label>
                              <input
                                type="text"
                                value={pageNumbers}
                                onChange={(e) => setPageNumbers(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                                placeholder={option.placeholder}
                              />
                              <p className="text-xs text-gray-400">Example: {option.example}</p>
                              <p className="text-xs text-blue-600 font-medium">Note: Page numbers start from 1, not 0</p>
                            </div>
                          )}

                          {/* Text Input (for complex patterns) */}
                          {option.inputType === "text" && (
                            <div className="space-y-2">
                              <label className="text-xs text-gray-500">
                                {option.id === "all-pages" ? "Leave blank for full PDF:" : "Enter page pattern (starts from 1, not 0):"}
                              </label>
                              <input
                                type="text"
                                value={pageNumbers}
                                onChange={(e) => setPageNumbers(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                                placeholder={option.placeholder}
                                disabled={option.id === "all-pages"}
                              />
                              <p className="text-xs text-gray-400">Example: {option.example}</p>
                              {option.id !== "all-pages" && (
                                <p className="text-xs text-blue-600 font-medium">Note: Page numbers start from 1, not 0</p>
                              )}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>

              {/* Split Button */}
              <Button
                onClick={splitPdf}
                className="w-full bg-green-600 hover:bg-green-700 cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Split PDF
              </Button>

              {/* Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-blue-700 text-sm">
                  <strong>Note:</strong> When splitting a document, the pages parameter controls which pages to split
                  out into individual documents. The page limit should not exceed the number of pages in the document -
                  for example, you cannot split a 100 page document into 200 individual documents, however you can split
                  it into 100 individual documents.
                </p>
              </div>
            </div>
          )}

          {/* Splitting Process */}
          {state === "splitting" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Splitting PDF...</p>
              <p className="text-sm text-gray-600">This may take a few moments for PDF processing and splitting...</p>
            </div>
          )}

          {/* Ready State - Download Split Files */}
          {state === "ready" && splitResults.length > 0 && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully split PDF into {splitResults.length} document{splitResults.length > 1 ? "s" : ""}!
                </p>
              </div>

              <div className="space-y-3">
                {splitResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{result.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.url, "_blank")}
                        title="Open in new tab"
                        className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                      >
                        <MoveUpRight className="w-4 h-4 text-gray-700" />
                      </Button>
                      <Button
                        onClick={() => downloadFile(result.url, result.name, index)}
                        disabled={downloading[index]}
                        className="bg-[#ff911d] hover:bg-[#e67e0a] text-white cursor-pointer"
                        size="sm"
                      >
                        {downloading[index] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
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
                    disabled={sendingEmail || !splitResults[0] || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Split Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SplitPdf;
