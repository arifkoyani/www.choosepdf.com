"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp, Image as ImageIcon } from "lucide-react";
import Spinner from "../../ui/loader/loader";
import { toast } from "sonner";

type AppState = "select-pdf" | "uploading-pdf" | "select-image" | "uploading-image" | "configuring" | "replacing" | "ready";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface ReplaceImageResult {
  url: string;
  name: string;
}

const SearchTextReplaceImageInPdf = () => {
  const [state, setState] = useState<AppState>("select-pdf");
  const [pdfFile, setPdfFile] = useState<UploadedFile | null>(null);
  const [imageFile, setImageFile] = useState<UploadedFile | null>(null);
  const [replaceImageResults, setReplaceImageResults] = useState<ReplaceImageResult[]>([]);
  const [downloading, setDownloading] = useState<{ [key: number]: boolean }>({});
  const [searchString, setSearchString] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [pages, setPages] = useState("0");
  const [errorMessage, setErrorMessage] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isValidPdfType = (file: File): boolean => {
    const validTypes = ["application/pdf"];
    const validExtensions = ["pdf"];
    const fileExtension = file.name.toLowerCase().split(".").pop();
    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || "");
  };

  const isValidImageType = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"];
    const validExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const fileExtension = file.name.toLowerCase().split(".").pop();
    return validTypes.includes(file.type) || validExtensions.includes(fileExtension || "");
  };

  const handlePdfFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidPdfType(file)) {
        uploadFile(file, "pdf");
      } else {
        alert("Please select a PDF file (.pdf)");
      }
    }
    if (pdfFileInputRef.current) pdfFileInputRef.current.value = "";
  };

  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidImageType(file)) {
        uploadFile(file, "image");
      } else {
        alert("Please select a valid image file (JPG, PNG, GIF, BMP, WebP)");
      }
    }
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
  };

  const uploadFile = async (file: File, fileType: "pdf" | "image") => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setState(fileType === "pdf" ? "uploading-pdf" : "uploading-image");
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
        const uploadedFile: UploadedFile = {
          id: fileId,
          name: file.name,
          url: data.url,
          size: formatFileSize(file.size),
          type: file.type,
        };

        if (fileType === "pdf") {
          setPdfFile(uploadedFile);
          setState("select-image");
        } else {
          setImageFile(uploadedFile);
          setState("configuring");
        }
      } else {
        setState(fileType === "pdf" ? "select-pdf" : "select-image");
        alert("contact choosepdf support team");
      }
    } catch (error) {
      console.error("Upload error: contact choosepdf support team", error);
      setState(fileType === "pdf" ? "select-pdf" : "select-image");
      alert("contact choosepdf support team");
    }
  };

  const replaceTextWithImage = async () => {
    if (!pdfFile || !imageFile) {
      alert("Please upload both PDF and image files first");
      return;
    }

    if (!searchString.trim()) {
      setErrorMessage("Please enter a search string");
      return;
    }

    setErrorMessage("");
    setState("replacing");

    try {
      const response = await fetch("/api/searchtextreplaceimageinpdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: pdfFile.url,
          searchString: searchString.trim(),
          caseSensitive: caseSensitive,
          replaceImage: imageFile.url,
          pages: pages || "0",
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error === true) {
        const errorMsg = data.message || "Replace text with image failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("configuring");
        return;
      }

      if (data.error === false && data.urls && data.urls.length > 0) {
        const results = data.urls.map((url: string, index: number) => ({
          url: url,
          name: `text-replaced-with-image-${pdfFile.name || `document-${index + 1}.pdf`}`,
        }));

        setReplaceImageResults(results);
        setErrorMessage("");
        setState("ready");
      } else {
        const errorMsg = data.message || "Replace text with image failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("configuring");
      }
    } catch (error) {
      console.error("Replace text with image error:", error);
      const errorMsg = error instanceof Error ? error.message : "Replace text with image failed. Please try again.";
      setErrorMessage(errorMsg);
      setState("configuring");
    }
  };

  const removePdfFile = () => {
    setPdfFile(null);
    setState("select-pdf");
    setReplaceImageResults([]);
    setSearchString("");
    setCaseSensitive(false);
    setPages("0");
    setErrorMessage("");
    setToEmail("");
  };

  const removeImageFile = () => {
    setImageFile(null);
    setState("select-image");
    setReplaceImageResults([]);
    setSearchString("");
    setCaseSensitive(false);
    setPages("0");
    setErrorMessage("");
    setToEmail("");
  };

  const resetConverter = () => {
    setState("select-pdf");
    setPdfFile(null);
    setImageFile(null);
    setReplaceImageResults([]);
    setSearchString("");
    setCaseSensitive(false);
    setPages("0");
    setErrorMessage("");
    setDownloading({});
    setToEmail("");
    if (pdfFileInputRef.current) pdfFileInputRef.current.value = "";
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
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
    if (!toEmail || replaceImageResults.length === 0) {
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
          fileUrl: replaceImageResults[0].url,
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
        <h1 className="text-gray-600 text-xl font-medium">Search Text Replace Image in PDF</h1>
        <p className="text-sm text-gray-600 text-center max-w-2xl">
          Search for specific text in your PDF and replace it with an image. Modify PDF documents by replacing text with images.
        </p>
      </div>

      <Card className="w-full max-w-6xl p-6 sm:p-8 shadow-none border-none bg-transparent">
        <div className="space-y-6">
          {/* Step 1: PDF Upload Section */}
          {state === "select-pdf" && !pdfFile && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ff911d] text-white font-semibold text-sm">
                  1
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Upload PDF File</h2>
              </div>
              
              <div className="w-full mx-auto bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-[#ff911d]">
                <div className="relative w-full p-8">
                  <input
                    ref={pdfFileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ fontSize: 0 }}
                  />
                  <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-[#ff911d] flex items-center justify-center">
                      <MonitorUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-800 mb-1">Click to upload PDF</p>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-2">Supported: PDF files only</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PDF Upload Progress */}
          {state === "uploading-pdf" && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Step 2: Image Upload Section */}
          {state === "select-image" && pdfFile && !imageFile && (
            <div className="space-y-6">
              {/* Uploaded PDF File Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm font-semibold text-green-800">Step 1 Complete: PDF Uploaded</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-red-500" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{pdfFile.name}</p>
                      <p className="text-xs text-gray-600">{pdfFile.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pdfFile.url, "_blank")}
                      title="Open in new tab"
                      className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                    >
                      <MoveUpRight className="w-4 h-4 text-gray-700" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removePdfFile}
                      title="Remove file"
                      className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ff911d] text-white font-semibold text-sm">
                    2
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Upload Image File</h2>
                </div>
                
                <div className="w-full mx-auto bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-[#ff911d]">
                  <div className="relative w-full p-8">
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      style={{ fontSize: 0 }}
                    />
                    <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-[#ff911d] flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-800 mb-1">Click to upload Image</p>
                        <p className="text-sm text-gray-500">or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-2">Supported: JPG, PNG, GIF, BMP, WebP</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Upload Progress */}
          {state === "uploading-image" && (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          )}

          {/* Step 3: Configuration Section */}
          {pdfFile && imageFile && !replaceImageResults.length && state !== "replacing" && (
            <div className="space-y-6">
              {/* Uploaded Files Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm font-semibold text-green-800">Step 1 & 2 Complete: Files Ready</span>
                </div>
                
                <div className="space-y-2">
                  {/* PDF File */}
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{pdfFile.name}</p>
                        <p className="text-xs text-gray-600">{pdfFile.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(pdfFile.url, "_blank")}
                        title="Open in new tab"
                        className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                      >
                        <MoveUpRight className="w-4 h-4 text-gray-700" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removePdfFile}
                        title="Remove file"
                        className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image File */}
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{imageFile.name}</p>
                        <p className="text-xs text-gray-600">{imageFile.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(imageFile.url, "_blank")}
                        title="Open in new tab"
                        className="border-gray-300 hover:bg-gray-100 cursor-pointer"
                      >
                        <MoveUpRight className="w-4 h-4 text-gray-700" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeImageFile}
                        title="Remove file"
                        className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Search String Input */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ff911d] text-white font-semibold text-sm">
                    3
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Enter Text to Replace</h2>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="searchString" className="text-base font-semibold text-gray-800 block mb-2">
                        Search for text in PDF:
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Enter the exact text you want to find and replace with the uploaded image.
                      </p>
                      <input
                        type="text"
                        id="searchString"
                        placeholder="e.g., Your Company Name, Copyright Text, etc."
                        value={searchString}
                        onChange={(e) => {
                          setSearchString(e.target.value);
                          setErrorMessage("");
                        }}
                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-[#ff911d] text-gray-900 transition-all"
                      />
                    </div>

                    {/* Options */}
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="caseSensitive"
                          checked={caseSensitive}
                          onChange={(e) => {
                            setCaseSensitive(e.target.checked);
                            setErrorMessage("");
                          }}
                          className="w-5 h-5 text-[#ff911d] border-gray-300 rounded focus:ring-[#ff911d] cursor-pointer"
                        />
                        <label htmlFor="caseSensitive" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Case sensitive search
                        </label>
                      </div>

                      <div>
                        <label htmlFor="pages" className="text-sm font-medium text-gray-700 block mb-2">
                          Pages to search (0 = all pages):
                        </label>
                        <input
                          type="text"
                          id="pages"
                          placeholder="0"
                          value={pages}
                          onChange={(e) => {
                            setPages(e.target.value);
                            setErrorMessage("");
                          }}
                          className="w-40 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff911d] focus:border-[#ff911d] text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave as 0 to search all pages</p>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium">
                          <strong>Error:</strong> {errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Replace Button */}
                <Button
                  onClick={replaceTextWithImage}
                  disabled={!searchString.trim()}
                  className="w-full bg-[#ff911d] hover:bg-[#e67e0a] disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Replace Text with Image
                </Button>

                {/* Note */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                  <p className="text-blue-700 text-sm">
                    <strong>💡 Tip:</strong> The search string will be replaced with the uploaded image. Empty space around the image will be automatically cropped for better results. Use page number 0 to replace on all pages, or specify specific page numbers like "1,3,5" or "1-5".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Replacing Process */}
          {state === "replacing" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Replacing text with image in PDF...</p>
              <p className="text-sm text-gray-600">This may take a few moments for PDF processing...</p>
            </div>
          )}

          {/* Ready State - Download Result */}
          {state === "ready" && replaceImageResults.length > 0 && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully replaced text with image in PDF!
                </p>
              </div>

              <div className="space-y-3">
                {replaceImageResults.map((result, index) => (
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
                    disabled={sendingEmail || !replaceImageResults[0] || !toEmail}
                    className="bg-[#f16625] text-white cursor-pointer"
                  >
                    {sendingEmail ? "Sending..." : "Send Email"}
                  </Button>
                </div>
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Replace Text with Image in Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SearchTextReplaceImageInPdf;
