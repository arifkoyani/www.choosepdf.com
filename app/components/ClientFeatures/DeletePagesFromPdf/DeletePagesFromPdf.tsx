"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp } from "lucide-react";
import Spinner from "../../ui/loader/loader";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";

type AppState = "select" | "uploading" | "tabs" | "deleting" | "ready";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface DeleteResult {
  url: string;
  name: string;
}

const DeletePagesFromPdf = () => {
  const [state, setState] = useState<AppState>("select");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [deleteResults, setDeleteResults] = useState<DeleteResult[]>([]);
  const [downloading, setDownloading] = useState<{ [key: number]: boolean }>({});
  const [selectedTab, setSelectedTab] = useState("single");
  const [pageNumbers, setPageNumbers] = useState("");
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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
    setErrorMessage("");
  };

  const removeFile = () => {
    setUploadedFiles([]);
    setState("select");
    setDeleteResults([]);
    setPageNumbers("");
    setStartPage("");
    setEndPage("");
    setErrorMessage("");
    setSelectedTab("single");
  };

  const deletePages = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload a PDF file first");
      return;
    }

    // Clear previous errors
    setErrorMessage("");

    let pagesValue = "";
    if (selectedTab === "range") {
      if (!startPage.trim() || !endPage.trim()) {
        setErrorMessage("Please enter both start and end page numbers");
        return;
      }
      pagesValue = `${startPage.trim()}-${endPage.trim()}`;
    } else if (selectedTab === "single") {
      if (!pageNumbers.trim()) {
        setErrorMessage("Please specify page number to delete");
        return;
      }
      pagesValue = pageNumbers.trim();
    } else if (selectedTab === "multiple") {
      if (!pageNumbers.trim()) {
        setErrorMessage("Please specify page numbers to delete");
        return;
      }
      pagesValue = pageNumbers.trim();
    }

    setState("deleting");

    try {
      const response = await fetch("/api/deletepages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadedFiles[0].url,
          pages: pagesValue,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error === true) {
        // Capture error message from API
        const errorMsg = data.message || "Delete pages failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("tabs");
        return;
      }

      if (data.error === false && data.urls && data.urls.length > 0) {
        const results = data.urls.map((url: string, index: number) => ({
          url: url,
          name: `deleted-pages-document-${index + 1}.pdf`,
        }));

        setDeleteResults(results);
        setErrorMessage("");
        setState("ready");
      } else {
        const errorMsg = data.message || "Delete pages failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("tabs");
      }
    } catch (error) {
      console.error("Delete pages error:", error);
      const errorMsg = error instanceof Error ? error.message : "Delete pages failed. Please try again.";
      setErrorMessage(errorMsg);
      setState("tabs");
    }
  };

  const resetConverter = () => {
    setState("select");
    setUploadedFiles([]);
    setDeleteResults([]);
    setPageNumbers("");
    setStartPage("");
    setEndPage("");
    setErrorMessage("");
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
    if (!toEmail || deleteResults.length === 0) {
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
          fileUrl: deleteResults[0].url,
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
        <h1 className="text-gray-600 text-xl font-medium">Delete Pages from PDF</h1>
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
                  Delete specific pages from your PDF document.
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
          {uploadedFiles.length > 0 && !deleteResults.length && state !== "deleting" && (
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
                      <TabsTrigger
                        value="single"
                        className="text-xs px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 data-[state=active]:bg-[#ff911d] data-[state=active]:text-white data-[state=active]:border-[#ff911d] data-[state=active]:font-semibold whitespace-nowrap transition-all cursor-pointer"
                      >
                        Single Page
                      </TabsTrigger>
                      <TabsTrigger
                        value="range"
                        className="text-xs px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 data-[state=active]:bg-[#ff911d] data-[state=active]:text-white data-[state=active]:border-[#ff911d] data-[state=active]:font-semibold whitespace-nowrap transition-all cursor-pointer"
                      >
                        Page Range
                      </TabsTrigger>
                      <TabsTrigger
                        value="multiple"
                        className="text-xs px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 data-[state=active]:bg-[#ff911d] data-[state=active]:text-white data-[state=active]:border-[#ff911d] data-[state=active]:font-semibold whitespace-nowrap transition-all cursor-pointer"
                      >
                        Multiple Pages
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-700">Single Page</h4>
                          <code className="bg-white px-3 py-1 rounded border text-[#ff911d] font-mono text-xs">
                            Example: 3
                          </code>
                        </div>
                        <p className="text-sm text-gray-600">Delete only this single page from the PDF.</p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={pageNumbers}
                            onChange={(e) => {
                              setPageNumbers(e.target.value);
                              setErrorMessage("");
                            }}
                            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                            placeholder="Enter page number"
                          />
                          <p className="text-xs text-blue-600 font-medium">The pages Number is 1-based, meaning the first page is 1 and not 0.</p>
                          {errorMessage && selectedTab === "single" && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-700">
                                <strong>Error:</strong> {errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="range" className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-700">Page Range</h4>
                          <code className="bg-white px-3 py-1 rounded border text-[#ff911d] font-mono text-xs">
                            Example: 3-7
                          </code>
                        </div>
                        <p className="text-sm text-gray-600">Delete all pages from start to end.</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={startPage}
                              onChange={(e) => {
                                setStartPage(e.target.value);
                                setErrorMessage("");
                              }}
                              className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                              placeholder="Start Page"
                            />
                            <span className="text-gray-500">→</span>
                            <input
                              type="text"
                              value={endPage}
                              onChange={(e) => {
                                setEndPage(e.target.value);
                                setErrorMessage("");
                              }}
                              className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                              placeholder="End Page"
                            />
                          </div>
                          <label className="text-xs text-blue-600 font-medium">The pages Number is 1-based, meaning the first page is 1 and not 0.</label>
                          {errorMessage && selectedTab === "range" && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-700">
                                <strong>Error:</strong> {errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="multiple" className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-700">Multiple Pages</h4>
                          <code className="bg-white px-3 py-1 rounded border text-[#ff911d] font-mono text-xs">
                            Example: 1,3,5
                          </code>
                        </div>
                        <p className="text-sm text-gray-600">Delete only selected pages from the PDF.</p>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={pageNumbers}
                            onChange={(e) => {
                              setPageNumbers(e.target.value);
                              setErrorMessage("");
                            }}
                            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-transparent text-gray-900"
                            placeholder="e.g., 1,3,5"
                          />
                          <p className="text-xs text-blue-600 font-medium">The pages Number is 1-based, meaning the first page is 1 and not 0.</p>
                          {errorMessage && selectedTab === "multiple" && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-700">
                                <strong>Error:</strong> {errorMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Delete Button */}
              <Button
                onClick={deletePages}
                className="w-full bg-red-600 hover:bg-red-700 cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Delete Pages
              </Button>

              {/* Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                <p className="text-blue-700 text-sm">
                  <strong>Note:</strong> Enter the page numbers you want to delete from the PDF. The remaining pages will be preserved in the output document.
                </p>
              </div>
            </div>
          )}

          {/* Deleting Process */}
          {state === "deleting" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Deleting pages from PDF...</p>
              <p className="text-sm text-gray-600">This may take a few moments for PDF processing...</p>
            </div>
          )}

          {/* Ready State - Download Result */}
          {state === "ready" && deleteResults.length > 0 && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully deleted pages from PDF!
                </p>
              </div>

              <div className="space-y-3">
                {deleteResults.map((result, index) => (
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
                    disabled={sendingEmail || !deleteResults[0] || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Delete Pages from Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DeletePagesFromPdf;
