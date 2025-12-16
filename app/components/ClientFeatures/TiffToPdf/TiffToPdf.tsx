"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp } from "lucide-react";
import Spinner from "../../ui/loader/loader";
import { toast } from "sonner";

type AppState = "select" | "uploading" | "ready-to-convert" | "converting" | "ready";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface ConvertResult {
  urls: string[];
}

const TiffToPdf = () => {
  const [state, setState] = useState<AppState>("select");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [downloading, setDownloading] = useState<{ [key: number]: boolean }>({});
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
    const validTypes = ["image/tiff", "image/tif"];
    const validExtensions = ["tiff", "tif"];
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
        alert("Please select a valid TIFF image file (.tiff, .tif)");
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
        setState("ready-to-convert");
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

  const convertTiffToPdf = async () => {
    if (!uploadedFile) {
      setErrorMessage("Please upload a TIFF file first");
      return;
    }

    setState("converting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/tifftopdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: uploadedFile.url,
          pages: "",
          password: "",
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error === true) {
        const errorMsg = data.message || "TIFF to PDF conversion failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("ready-to-convert");
        return;
      }

      if (data.error === false && data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
        setConvertResult({
          urls: data.urls,
        });
        setErrorMessage("");
        setState("ready");
      } else {
        const errorMsg = data.message || "TIFF to PDF conversion failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("ready-to-convert");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      const errorMsg = error instanceof Error ? error.message : "TIFF to PDF conversion failed. Please try again.";
      setErrorMessage(errorMsg);
      setState("ready-to-convert");
    }
  };

  const resetConverter = () => {
    setState("select");
    setUploadedFile(null);
    setConvertResult(null);
    setErrorMessage("");
    setToEmail("");
    setDownloading({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadFile = async (url: string, filename: string, index: number) => {
    setDownloading(prev => ({ ...prev, [index]: true }));
    try {
      const response = await fetch(url, { credentials: "omit" });
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
      alert(`Failed to download ${filename}`);
    } finally {
      setDownloading(prev => ({ ...prev, [index]: false }));
    }
  };

  const sendEmail = async () => {
    if (!toEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!convertResult || !convertResult.urls || convertResult.urls.length === 0) {
      toast.error("No converted files to send");
      return;
    }

    setSendingEmail(true);

    try {
      // Send email with the first converted file URL
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toEmail: toEmail.trim(),
          fileUrl: convertResult.urls[0],
        }),
      });

      const data = await response.json();

      if (data.error === false) {
        toast.success("Email sent successfully!");
        setToEmail("");
      } else {
        toast.error(data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Email error:", error);
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-start py-8">
      <div className="pb-8 flex flex-col justify-center items-center space-y-3">
        <h1 className="text-gray-600 text-xl font-medium">Convert TIFF to PDF</h1>
        <p className="text-sm text-gray-500 text-center max-w-2xl px-4">
          Convert your TIFF images to high-quality PDF documents.
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
                    accept=".tiff,.tif,image/tiff,image/tif"
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
                  Upload your TIFF image file to convert it to PDF format.
                </p>
                <p className="text-sm text-gray-600 text-center">Supported: TIFF, TIF</p>
              </span>
            </div>
          )}

          {/* Upload Progress */}
          {state === "uploading" && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Ready to Convert State */}
          {uploadedFile && state === "ready-to-convert" && (
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
                    onClick={resetConverter}
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

              {/* Convert Button */}
              <Button
                onClick={convertTiffToPdf}
                className="w-full bg-[#ff911d] hover:bg-[#e67e0a] cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Convert TIFF to PDF
              </Button>
            </div>
          )}

          {/* Converting Process */}
          {state === "converting" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Converting TIFF to PDF...</p>
              <p className="text-sm text-gray-600">This may take a few moments...</p>
            </div>
          )}

          {/* Ready State - Show Results */}
          {state === "ready" && convertResult && convertResult.urls && convertResult.urls.length > 0 && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully converted TIFF to PDF! {convertResult.urls.length} file(s) converted.
                </p>
              </div>

              {/* Converted Files */}
              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Converted PDF Files ({convertResult.urls.length})</h2>
                
                <div className="space-y-3">
                  {convertResult.urls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-green-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">converted-image-{index + 1}.pdf</p>
                          <p className="text-xs text-gray-600 break-all overflow-hidden line-clamp-2">
                            {url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, "_blank")}
                          title="Open in new tab"
                          className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                        >
                          <MoveUpRight className="w-4 h-4 text-gray-700" />
                        </Button>
                        <Button
                          onClick={() => downloadFile(url, `converted-image-${index + 1}.pdf`, index)}
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

                {/* Email Section */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700">
                    Share PDF file via email
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff911d] text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                    />
                    <Button
                      onClick={sendEmail}
                      disabled={sendingEmail || !toEmail.trim()}
                      className="bg-[#ff911d] cursor-pointer hover:bg-[#e67e0a] text-white border-none px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Convert Another Image
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TiffToPdf;
