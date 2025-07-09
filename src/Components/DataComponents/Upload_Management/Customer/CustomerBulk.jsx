"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  FileSpreadsheet,
  Users,
  UserPlus,
  UserCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  Info,
  AlertCircle,
} from "lucide-react";

export default function CustomerBulk({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({});
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (!isUploading) {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isUploading]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setUploadResponse(null);
      setIsUploading(false);
      setActiveTab("overview");
      setExpandedSections({});
    }
  }, [isOpen]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "application/csv",
      ];
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const fileName = droppedFile.name.toLowerCase();

      if (
        validTypes.includes(droppedFile.type) ||
        validExtensions.some((ext) => fileName.endsWith(ext))
      ) {
        setFile(droppedFile);
      } else {
        alert("Please upload an Excel (.xlsx, .xls) or CSV file");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadResponse(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/bulk/customer/bulk-upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const update = JSON.parse(line);

              // Handle different types of updates
              if (update.totalRecords !== undefined) {
                // This is a complete response or initial response
                setUploadResponse(update);
              } else if (update.currentCounts !== undefined) {
                // This is a progress update - merge with existing response
                setUploadResponse((prev) => {
                  if (!prev) return prev;

                  return {
                    ...prev,
                    processedRecords:
                      update.processedRecords || prev.processedRecords,
                    createdCount: update.currentCounts.created,
                    updatedCount: update.currentCounts.updated,
                    skippedCount: update.currentCounts.skipped,
                    failedCount: update.currentCounts.failed,
                    stats: update.stats || prev.stats,
                    status: update.status || prev.status,
                  };
                });
              } else {
                // This might be a final complete response
                setUploadResponse((prev) => {
                  if (!prev) return update;

                  // Merge the update with previous response
                  return {
                    ...prev,
                    ...update,
                  };
                });
              }
            } catch (parseError) {
              console.warn(
                "Failed to parse update:",
                parseError,
                "Line:",
                line
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadResponse({
        status: "failed",
        startTime: new Date().toISOString(),
        totalRecords: 0,
        processedRecords: 0,
        createdCount: 0,
        updatedCount: 0,
        failedCount: 1,
        skippedCount: 0,
        failures: [
          {
            error: error.message || "Upload failed. Please try again.",
            suggestion: "Check your internet connection and file format.",
            timestamp: new Date().toISOString(),
          },
        ],
        creations: [],
        updates: [],
        skips: [],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "customercodeid",
      "customername",
      "hospitalname",
      "street",
      "city",
      "postalcode",
      "district",
      "state",
      "region",
      "country",
      "telephone",
      "taxnumber1",
      "taxnumber2",
      "email",
      "status",
      "customertype",
    ];
    const csvContent = headers.join(",");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-emerald-700 bg-emerald-100 border-emerald-200";
      case "completed_with_errors":
        return "text-amber-700 bg-amber-100 border-amber-200";
      case "completed_with_skips":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "failed":
        return "text-red-700 bg-red-100 border-red-200";
      case "processing":
        return "text-blue-700 bg-blue-100 border-blue-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getProgressColor = () => {
    if (!uploadResponse) return "bg-blue-500";
    if (uploadResponse.summary?.successRate) {
      const successRate = Number.parseFloat(
        uploadResponse.summary.successRate.replace("%", "")
      );
      if (successRate >= 95) return "bg-emerald-500";
      if (successRate >= 80) return "bg-blue-500";
      if (successRate >= 60) return "bg-amber-500";
      return "bg-red-500";
    }
    const successRate =
      uploadResponse.totalRecords > 0
        ? ((uploadResponse.createdCount + uploadResponse.updatedCount) /
            uploadResponse.totalRecords) *
          100
        : 0;
    if (successRate >= 95) return "bg-emerald-500";
    if (successRate >= 80) return "bg-blue-500";
    if (successRate >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Upload Completed Successfully";
      case "completed_with_errors":
        return "Upload Completed with Errors";
      case "completed_with_skips":
        return "Upload Completed with Skips";
      case "failed":
        return "Upload Failed";
      case "processing":
        return "Processing Upload...";
      default:
        return "Upload Status Unknown";
    }
  };

  // Custom Tab Component
  const TabButton = ({ id, label, isActive, onClick, count }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700 border border-blue-200"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`ml-2 px-2 py-1 text-xs rounded-full ${
            isActive ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  // Custom Progress Component
  const ProgressBar = ({ value, className = "" }) => (
    <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
      <div
        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );

  // Custom Badge Component
  const Badge = ({ children, variant = "default" }) => {
    const variants = {
      default: "bg-gray-100 text-gray-800",
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
      error: "bg-red-100 text-red-800",
      info: "bg-blue-100 text-blue-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}
      >
        {children}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users size={24} />
                </div>
                Bulk Customer Upload
              </h2>
              <p className="text-gray-500 mt-1">
                Import and manage customer data efficiently
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 h-[300px] overflow-y-auto flex flex-col">
          {!uploadResponse ? (
            <div className="p-6 space-y-6">
              {/* Template Download */}
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Need a template?
                  </h3>
                  <p className="text-sm text-blue-700">
                    Download our Excel template with the required format
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>

              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : file
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="p-4 bg-emerald-100 rounded-full">
                        <FileSpreadsheet className="h-12 w-12 text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-800">
                        File Ready for Upload
                      </h3>
                      <p className="text-emerald-600 font-medium">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div
                    className="space-y-4 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex justify-center">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        Drop your Excel file here
                      </h3>
                      <p className="text-gray-500">
                        or{" "}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-800 font-medium underline"
                        >
                          browse to upload
                        </button>
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Supports .xlsx, .xls, and .csv files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Progress Header */}
              <div className="p-6 bg-gray-50 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    ) : uploadResponse.status === "completed" ? (
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    ) : uploadResponse.status === "completed_with_errors" ? (
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    ) : uploadResponse.status === "completed_with_skips" ? (
                      <Clock className="h-6 w-6 text-blue-600" />
                    ) : uploadResponse.status === "failed" ? (
                      <XCircle className="h-6 w-6 text-red-600" />
                    ) : (
                      <Loader2 className="h-6 w-6 text-gray-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {isUploading
                          ? "Processing Upload..."
                          : getStatusText(uploadResponse.status)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {uploadResponse.processedRecords || 0} of{" "}
                        {uploadResponse.totalRecords || 0} records processed
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                      uploadResponse.status
                    )}`}
                  >
                    {uploadResponse.status.replace(/_/g, " ").toUpperCase()}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {uploadResponse.totalRecords > 0
                        ? Math.round(
                            (uploadResponse.processedRecords /
                              uploadResponse.totalRecords) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <ProgressBar
                    value={
                      uploadResponse.totalRecords > 0
                        ? (uploadResponse.processedRecords /
                            uploadResponse.totalRecords) *
                          100
                        : 0
                    }
                  />
                </div>
              </div>
              <div className="">
                {/* Stats Grid */}
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Total
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {uploadResponse.totalRecords || 0}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                          Created
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-700">
                        {uploadResponse.createdCount || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                          Updated
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {uploadResponse.updatedCount || 0}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                          Skipped
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">
                        {uploadResponse.skippedCount || 0}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                          Failed
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-red-700">
                        {uploadResponse.failedCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  {uploadResponse.stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                            Processing Time
                          </span>
                        </div>
                        <p className="text-lg font-bold text-purple-700">
                          {uploadResponse.stats.processingTime?.toFixed(2)}s
                        </p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                            Records/Second
                          </span>
                        </div>
                        <p className="text-lg font-bold text-indigo-700">
                          {uploadResponse.stats.recordsPerSecond?.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-teal-600" />
                          <span className="text-xs font-medium text-teal-600 uppercase tracking-wide">
                            Success Rate
                          </span>
                        </div>
                        <p className="text-lg font-bold text-teal-700">
                          {uploadResponse.summary?.successRate || "0%"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Processing Summary */}
                  {uploadResponse.summary && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-gray-600" />
                        Processing Summary
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Success Rate</p>
                          <p className="text-2xl font-bold text-emerald-600">
                            {uploadResponse.summary.successRate}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Creation Rate</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {uploadResponse.summary.creationRate}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Update Rate</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {uploadResponse.summary.updateRate}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Failure Rate</p>
                          <p className="text-2xl font-bold text-red-600">
                            {uploadResponse.summary.failureRate}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Skip Rate</p>
                          <p className="text-2xl font-bold text-amber-600">
                            {uploadResponse.summary.skipRate}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Time Taken</p>
                          <p className="text-2xl font-bold text-gray-600">
                            {uploadResponse.summary.timeTaken}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs for Detailed Results */}
                {!isUploading && (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Tab Navigation */}
                    <div className="px-6 py-4 bg-gray-50 border-b">
                      <div className="flex space-x-2 overflow-x-auto">
                        <TabButton
                          id="overview"
                          label="Overview"
                          isActive={activeTab === "overview"}
                          onClick={setActiveTab}
                        />
                        {(uploadResponse.createdCount > 0 ||
                          uploadResponse.creations?.length > 0) && (
                          <TabButton
                            id="created"
                            label="Created"
                            count={
                              uploadResponse.createdCount ||
                              uploadResponse.creations?.length ||
                              0
                            }
                            isActive={activeTab === "created"}
                            onClick={setActiveTab}
                          />
                        )}
                        {(uploadResponse.updatedCount > 0 ||
                          uploadResponse.updates?.length > 0) && (
                          <TabButton
                            id="updated"
                            label="Updated"
                            count={
                              uploadResponse.updatedCount ||
                              uploadResponse.updates?.length ||
                              0
                            }
                            isActive={activeTab === "updated"}
                            onClick={setActiveTab}
                          />
                        )}
                        {(uploadResponse.skippedCount > 0 ||
                          uploadResponse.skips?.length > 0) && (
                          <TabButton
                            id="skipped"
                            label="Skipped"
                            count={
                              uploadResponse.skippedCount ||
                              uploadResponse.skips?.length ||
                              0
                            }
                            isActive={activeTab === "skipped"}
                            onClick={setActiveTab}
                          />
                        )}
                        {(uploadResponse.failedCount > 0 ||
                          uploadResponse.failures?.length > 0) && (
                          <TabButton
                            id="failed"
                            label="Failed"
                            count={
                              uploadResponse.failedCount ||
                              uploadResponse.failures?.length ||
                              0
                            }
                            isActive={activeTab === "failed"}
                            onClick={setActiveTab}
                          />
                        )}
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                      {activeTab === "overview" && (
                        <div className="p-6 space-y-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-blue-900">
                                  Upload Summary
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  Your file has been processed successfully.
                                  Review the detailed results in the tabs above.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900">
                                Processing Results
                              </h4>
                              <div className="space-y-3">
                                {uploadResponse.createdCount > 0 && (
                                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <UserPlus className="h-4 w-4 text-emerald-600" />
                                      <span className="text-sm font-medium text-emerald-800">
                                        New Customers Created
                                      </span>
                                    </div>
                                    <Badge variant="success">
                                      {uploadResponse.createdCount}
                                    </Badge>
                                  </div>
                                )}
                                {uploadResponse.updatedCount > 0 && (
                                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-800">
                                        Existing Customers Updated
                                      </span>
                                    </div>
                                    <Badge variant="info">
                                      {uploadResponse.updatedCount}
                                    </Badge>
                                  </div>
                                )}
                                {uploadResponse.skippedCount > 0 && (
                                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-amber-600" />
                                      <span className="text-sm font-medium text-amber-800">
                                        Records Skipped
                                      </span>
                                    </div>
                                    <Badge variant="warning">
                                      {uploadResponse.skippedCount}
                                    </Badge>
                                  </div>
                                )}
                                {uploadResponse.failedCount > 0 && (
                                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <XCircle className="h-4 w-4 text-red-600" />
                                      <span className="text-sm font-medium text-red-800">
                                        Records Failed
                                      </span>
                                    </div>
                                    <Badge variant="error">
                                      {uploadResponse.failedCount}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900">
                                Performance Metrics
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm font-medium text-gray-700">
                                    Total Records Processed
                                  </span>
                                  <span className="text-sm font-bold text-gray-900">
                                    {uploadResponse.totalRecords}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm font-medium text-gray-700">
                                    Processing Time
                                  </span>
                                  <span className="text-sm font-bold text-gray-900">
                                    {uploadResponse.stats?.processingTime?.toFixed(
                                      2
                                    )}
                                    s
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm font-medium text-gray-700">
                                    Records per Second
                                  </span>
                                  <span className="text-sm font-bold text-gray-900">
                                    {uploadResponse.stats?.recordsPerSecond?.toFixed(
                                      1
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "created" && uploadResponse.creations && (
                        <div className="p-6">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-emerald-900">
                                  Successfully Created Records
                                </h4>
                                <p className="text-sm text-emerald-700 mt-1">
                                  {uploadResponse.createdCount} new customer
                                  records have been created in the system.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer Code
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer Name
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hospital Name
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created At
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {uploadResponse.creations.map(
                                  (record, index) => (
                                    <tr
                                      key={index}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {record.customercodeid}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-700">
                                        {record.details?.customername || "N/A"}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-700">
                                        {record.details?.hospitalname || "N/A"}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-700">
                                        {record.details?.email || "N/A"}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(
                                          record.timestamp
                                        ).toLocaleString()}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {activeTab === "updated" && uploadResponse.updates && (
                        <div className="p-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                              <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-blue-900">
                                  Successfully Updated Records
                                </h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  {uploadResponse.updatedCount} existing
                                  customer records have been updated with new
                                  information.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {uploadResponse.updates.map((record, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h5 className="font-medium text-gray-900">
                                      {record.customercodeid}
                                    </h5>
                                    <p className="text-sm text-gray-500">
                                      Updated on{" "}
                                      {new Date(
                                        record.timestamp
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <Badge variant="info">Updated</Badge>
                                </div>

                                <div className="space-y-2">
                                  <h6 className="text-sm font-medium text-gray-700">
                                    Changes Made:
                                  </h6>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(record.changes || {}).map(
                                      ([field, change]) => (
                                        <div
                                          key={field}
                                          className="bg-gray-50 p-3 rounded-lg"
                                        >
                                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                                            {field}
                                          </div>
                                          <div className="space-y-1">
                                            <div className="text-sm">
                                              <span className="text-red-600 line-through">
                                                {String(change.old)}
                                              </span>
                                            </div>
                                            <div className="text-sm">
                                              <span className="text-green-600 font-medium">
                                                {String(change.new)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "skipped" && uploadResponse.skips && (
                        <div className="p-6">
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-amber-900">
                                  Skipped Records
                                </h4>
                                <p className="text-sm text-amber-700 mt-1">
                                  {uploadResponse.skippedCount} records were
                                  skipped because no changes were detected or
                                  they matched existing data.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {uploadResponse.skips.map((record, index) => (
                              <div
                                key={index}
                                className="border border-amber-200 rounded-lg p-4 bg-amber-50"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h5 className="font-medium text-amber-900">
                                      {record.customercodeid}
                                    </h5>
                                    <p className="text-sm text-amber-700">
                                      Skipped on{" "}
                                      {new Date(
                                        record.timestamp
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <Badge variant="warning">Skipped</Badge>
                                </div>

                                <div className="bg-white p-3 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-amber-800">
                                        Reason:
                                      </p>
                                      <p className="text-sm text-amber-700">
                                        {record.message}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {record.details && (
                                  <div className="mt-3 bg-white p-3 rounded-lg">
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                                      Existing Record Details:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-gray-500">
                                          Name:
                                        </span>{" "}
                                        <span className="text-gray-900">
                                          {record.details.existingRecord
                                            ?.customername || "N/A"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">
                                          Email:
                                        </span>{" "}
                                        <span className="text-gray-900">
                                          {record.details.existingRecord
                                            ?.email || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "failed" && uploadResponse.failures && (
                        <div className="p-6">
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-red-900">
                                  Failed Records
                                </h4>
                                <p className="text-sm text-red-700 mt-1">
                                  {uploadResponse.failedCount} records failed to
                                  process due to validation errors or missing
                                  required data.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {uploadResponse.failures.map((failure, index) => (
                              <div
                                key={index}
                                className="border border-red-200 rounded-lg p-4 bg-red-50"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h5 className="font-medium text-red-900">
                                      {failure.data?.customercodeid ||
                                        failure.record?.customercodeid ||
                                        "Unknown Record"}
                                    </h5>
                                    <p className="text-sm text-red-700">
                                      Failed on{" "}
                                      {new Date(
                                        failure.timestamp
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <Badge variant="error">Failed</Badge>
                                </div>

                                <div className="space-y-3">
                                  <div className="bg-white p-3 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium text-red-800">
                                          Error:
                                        </p>
                                        <p className="text-sm text-red-700">
                                          {failure.error}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {failure.suggestion && (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <div className="flex items-start gap-2">
                                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-medium text-blue-800">
                                            Suggestion:
                                          </p>
                                          <p className="text-sm text-blue-700">
                                            {failure.suggestion}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {failure.data && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                                        Record Data:
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <span className="text-gray-500">
                                            Customer Code:
                                          </span>{" "}
                                          <span className="text-gray-900">
                                            {failure.data.customercodeid}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">
                                            Customer Name:
                                          </span>{" "}
                                          <span className="text-gray-900">
                                            {failure.data.customername}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {uploadResponse && uploadResponse.endTime && (
              <span>
                Completed at {new Date(uploadResponse.endTime).toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {uploadResponse ? "Close" : "Cancel"}
            </button>
            {!uploadResponse && (
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700    disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Start Upload
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
