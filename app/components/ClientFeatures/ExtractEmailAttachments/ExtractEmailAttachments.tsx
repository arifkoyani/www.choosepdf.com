"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp, Copy } from "lucide-react";
import Spinner from "../../ui/loader/loader";
import { toast } from "sonner";

type AppState = "select" | "uploading" | "ready-to-extract" | "extracting" | "ready";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface EmailAttachment {
  filename: string;
  url: string;
}

interface EmailExtractData {
  from: string;
  subject: string;
  bodyHtml: string | null;
  bodyText: string;
  attachments: EmailAttachment[];
}

interface ExtractResult {
  emailData: EmailExtractData;
  hasAttachments: boolean;
  message?: string;
}

const ExtractEmailAttachments = () => {
  const [state, setState] = useState<AppState>("select");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isValidFileType = (file: File): boolean => {
    const validTypes = [
      "message/rfc822", // .eml
      "application/vnd.ms-outlook", // .msg
      "application/x-msmsg" // .msg alternative
    ];
    const validExtensions = ["eml", "msg"];
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
        alert("Please select an EML or MSG file (.eml, .msg)");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (file: File) => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setState("uploading");
    setErrorMessage("");

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

        setUploadedFile(newFile);
        setState("ready-to-extract");
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

  const extractEmailAttachments = async () => {
    if (!uploadedFile) {
      setErrorMessage("Please upload an email file first");
      return;
    }

    setState("extracting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/extractemailattachments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadedFile.url,
          inline: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error === true) {
        const errorMsg = data.message || "Email attachment extraction failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("ready-to-extract");
        return;
      }

      if (data.error === false && data.body) {
        setExtractResult({
          emailData: data.body,
          hasAttachments: data.hasAttachments || false,
          message: data.message,
        });
        setErrorMessage("");
        setState("ready");
      } else {
        const errorMsg = data.message || "Email attachment extraction failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("ready-to-extract");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      const errorMsg = error instanceof Error ? error.message : "Email attachment extraction failed. Please try again.";
      setErrorMessage(errorMsg);
      setState("ready-to-extract");
    }
  };

  const resetExtractor = () => {
    setState("select");
    setUploadedFile(null);
    setExtractResult(null);
    setErrorMessage("");
    setDownloadingFiles(new Set());
    setCopiedField(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadAttachment = async (attachment: EmailAttachment) => {
    setDownloadingFiles(prev => new Set(prev).add(attachment.filename));
    
    try {
      const response = await fetch(attachment.url, { credentials: "omit" });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = attachment.filename;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert(`Failed to download ${attachment.filename}`);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(attachment.filename);
        return newSet;
      });
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      alert("Failed to copy text");
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-start py-8">
      <div className="pb-8 flex flex-col justify-center items-center space-y-3">
        <h1 className="text-gray-600 text-xl font-medium">Extract Email Attachments</h1>
        <p className="text-sm text-gray-500 text-center max-w-2xl px-4">
          Extract attachments and content from your email files (.eml/.msg).
        </p>
      </div>

      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-none border-none bg-transparent">
        <div className="space-y-6">
          {/* Upload Section */}
          {state === "select" && !uploadedFile && (
            <div className="space-y-4 bg-transparent rounded-xl p-4 flex flex-col items-center justify-between">
              <div className="w-full mx-auto min-h-16 bg-[#f4f4f5] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="relative w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".eml,.msg"
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
                  Upload your email file to extract attachments and email content.
                </p>
                <p className="text-sm text-gray-600 text-center">Supported: EML, MSG</p>
              </span>
            </div>
          )}

          {/* Upload Progress */}
          {state === "uploading" && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Ready to Extract State */}
          {uploadedFile && state === "ready-to-extract" && (
            <div className="space-y-4">
              {/* Uploaded File Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-600">{uploadedFile.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(uploadedFile.url, "_blank")}
                    title="Open in new tab"
                    className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                  >
                    <MoveUpRight className="w-4 h-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetExtractor}
                    title="Remove file"
                    className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {errorMessage}
                  </p>
                </div>
              )}

              {/* Extract Button */}
              <Button
                onClick={extractEmailAttachments}
                className="w-full bg-[#ff911d] hover:bg-[#e67e0a] cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Extract Email Attachments
              </Button>
            </div>
          )}

          {/* Extracting Process */}
          {state === "extracting" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Extracting email attachments...</p>
              <p className="text-sm text-gray-600">This may take a few moments for email processing...</p>
            </div>
          )}

          {/* Ready State - Show Results */}
          {state === "ready" && extractResult && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  {extractResult.hasAttachments 
                    ? `Successfully extracted ${extractResult.emailData.attachments.length} attachment(s)!`
                    : "Email processed successfully!"}
                </p>
              </div>

              {/* No Attachments Message */}
              {!extractResult.hasAttachments && extractResult.message && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 text-center">
                    <strong>Note:</strong> {extractResult.message}
                  </p>
                </div>
              )}

              {/* Email Content */}
              <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Extracted Email Content</h2>
                
                {/* Email Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From */}
                  <div className="space-y-2">
                    <label className="font-medium text-sm text-gray-700">From</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="truncate flex-1 text-gray-900">{extractResult.emailData.from}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(extractResult.emailData.from, "from")}
                        className="ml-2"
                      >
                        <Copy className="w-4 h-4 text-gray-700" />
                        {copiedField === "from" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                      </Button>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="font-medium text-sm text-gray-700">Subject</label>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="truncate flex-1 text-gray-900">{extractResult.emailData.subject}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(extractResult.emailData.subject, "subject")}
                        className="ml-2"
                      >
                        <Copy className="w-4 h-4 text-gray-700" />
                        {copiedField === "subject" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Body Text */}
                {extractResult.emailData.bodyText && (
                  <div className="space-y-2">
                    <label className="font-medium text-sm text-gray-700">Message Body</label>
                    <div className="relative">
                      <pre className="p-4 bg-gray-50 rounded whitespace-pre-wrap max-h-60 overflow-y-auto text-sm text-gray-900">
                        {extractResult.emailData.bodyText}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(extractResult.emailData.bodyText, "body")}
                        className="absolute top-2 right-2"
                      >
                        <Copy className="w-4 h-4 text-gray-700" />
                        {copiedField === "body" && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {extractResult.hasAttachments && extractResult.emailData.attachments && extractResult.emailData.attachments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Attachments ({extractResult.emailData.attachments.length})</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {extractResult.emailData.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-gray-700">
                                {attachment.filename.split('.').pop()?.toUpperCase() || "FILE"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-gray-900">{attachment.filename}</p>
                              <div className="text-xs text-gray-600 break-all overflow-hidden line-clamp-2">
                                {attachment.url}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(attachment.url, `url-${index}`)}
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4 text-gray-700" />
                              {copiedField === `url-${index}` && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                            </Button>
                            <Button
                              onClick={() => downloadAttachment(attachment)}
                              disabled={downloadingFiles.has(attachment.filename)}
                              className="bg-[#ff911d] hover:bg-[#e67e0a] text-white"
                              size="sm"
                            >
                              {downloadingFiles.has(attachment.filename) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={resetExtractor} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Extract Another Email
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExtractEmailAttachments;
