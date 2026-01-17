"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { X, Download, FileText, MoveUpRight, Loader2, MonitorUp } from "lucide-react";
import Spinner from "../../ui/loader/loader";

type AppState = "select" | "uploading" | "ready-to-convert" | "converting" | "ready";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
}

interface ConvertResult {
  url: string;
}

type BarcodeType = "QRCode" | "PDF417" | "DataMatrix" | "Aztec" | "MaxiCode";

const barcodeTypes: { id: BarcodeType; label: string; description: string }[] = [
  { id: "QRCode", label: "QRCode", description: "2D, which supports all ASCII, ideal for URLs" },
  { id: "PDF417", label: "PDF417", description: "Linear, which supports all ASCII and binary data" },
  { id: "DataMatrix", label: "DataMatrix", description: "2D, which supports all ASCII" },
  { id: "Aztec", label: "Aztec", description: "2D, which is full ASCII" },
  { id: "MaxiCode", label: "MaxiCode", description: "2D, which all ASCII" },
];

const PdfToQrcode = () => {
  const [state, setState] = useState<AppState>("select");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedBarcodeType, setSelectedBarcodeType] = useState<BarcodeType | null>(null);
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
        alert("Please select a valid PDF file (.pdf)");
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

  const convertPdfToQrcode = async () => {
    if (!uploadedFile) {
      setErrorMessage("Please upload a PDF file first");
      return;
    }

    if (!selectedBarcodeType) {
      setErrorMessage("Please select a barcode type");
      return;
    }

    setState("converting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/pdftoqrcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "qrcode.png",
          type: selectedBarcodeType,
          value: uploadedFile.url,
          inline: false,
          async: false,
          expiration: 60,
          profiles: JSON.stringify({
            Angle: 1,
            CaptionFont: "Arial, 12",
            NarrowBarWidth: 15,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error === true) {
        const errorMsg = data.message || "PDF to QRCode conversion failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("ready-to-convert");
        return;
      }

      if (data.error === false && data.url) {
        setConvertResult({
          url: data.url,
        });
        setErrorMessage("");
        setState("ready");
      } else {
        const errorMsg = data.message || "PDF to QRCode conversion failed. Please try again.";
        setErrorMessage(errorMsg);
        setState("ready-to-convert");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      const errorMsg = error instanceof Error ? error.message : "PDF to QRCode conversion failed. Please try again.";
      setErrorMessage(errorMsg);
      setState("ready-to-convert");
    }
  };

  const resetConverter = () => {
    setState("select");
    setUploadedFile(null);
    setConvertResult(null);
    setErrorMessage("");
    setSelectedBarcodeType(null);
    setDownloading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadFile = async (url: string, filename: string) => {
    setDownloading(true);
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
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#f4f4f5] flex flex-col items-center justify-start py-8">
      <div className="pb-8 flex flex-col justify-center items-center space-y-3">
        <h1 className="text-gray-600 text-xl font-medium">Convert PDF to QRCode</h1>
        <p className="text-sm text-gray-500 text-center max-w-2xl px-4">
          Generate QRCode from your PDF files.
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
                  Upload your PDF file to generate QRCode.
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

              {/* Barcode Type Tabs */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Barcode Type
                </label>
                <div className="flex flex-wrap gap-3">
                  {barcodeTypes.map((barcodeType) => (
                    <button
                      key={barcodeType.id}
                      type="button"
                      onClick={() => setSelectedBarcodeType(barcodeType.id)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border-2 ${
                        selectedBarcodeType === barcodeType.id
                          ? "bg-[#ff911d] text-white border-[#ff911d] shadow-lg"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#ff911d] hover:bg-[#fff5f0]"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold">{barcodeType.label}</div>
                        <div className="text-xs mt-1 opacity-90">{barcodeType.description}</div>
                      </div>
                    </button>
                  ))}
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
                onClick={convertPdfToQrcode}
                disabled={!selectedBarcodeType}
                className="w-full bg-[#ff911d] hover:bg-[#e67e0a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-lg py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Convert PDF to QRCode
              </Button>
            </div>
          )}

          {/* Converting Process */}
          {state === "converting" && (
            <div className="flex flex-col items-center space-y-4 py-12">
              <Spinner />
              <p className="text-gray-700 font-medium">Converting PDF to QRCode...</p>
              <p className="text-sm text-gray-600">This may take a few moments...</p>
            </div>
          )}

          {/* Ready State - Show Results */}
          {state === "ready" && convertResult && convertResult.url && (
            <div className="space-y-5">
              <div className="p-5 bg-transparent border-2 border-transparent rounded-xl">
                <p className="text-[#8f969c] text-center">
                  Successfully converted PDF to QRCode!
                </p>
              </div>

              {/* Converted File */}
              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Generated QRCode</h2>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">qrcode.png</p>
                      <p className="text-xs text-gray-600 break-all overflow-hidden line-clamp-2">
                        {convertResult.url}
                      </p>
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
                      onClick={() => downloadFile(convertResult.url, "qrcode.png")}
                      disabled={downloading}
                      className="bg-[#ff911d] hover:bg-[#e67e0a] text-white cursor-pointer disabled:opacity-50"
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
              </div>

              <Button onClick={resetConverter} variant="outline" className="mt-2 w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-6 cursor-pointer">
                Convert Another PDF
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PdfToQrcode;
