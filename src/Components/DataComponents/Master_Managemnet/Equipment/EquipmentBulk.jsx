"use client";

import {
  Download,
  Users,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  Info,
  TrendingUp,
  Calendar,
  Settings,
  Database
} from "lucide-react";
import { useState } from "react";

export default function EquipmentBulk({ onClose }) {
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [processingData, setProcessingData] = useState({
    status: "idle",
    fileName: "",
    fileType: "",
    startTime: null,
    endTime: null,
    duration: null,
    totalRecords: 0,
    processedRecords: 0,
    equipmentResults: [],
    pmResults: [],
    summary: {
      totalPMExpected: 0,
      totalPMCreated: 0,
      pmCompletionPercentage: 0,
      statusBreakdown: {
        Due: 0,
        Overdue: 0,
        Lapsed: 0,
      },
      pmTypeBreakdown: {
        WPM: 0,
        EPM: 0,
        CPM: 0,
        NPM: 0,
      },
    },
    errors: [],
    warnings: [],
  });
  const [liveUpdates, setLiveUpdates] = useState([]);

  const addLiveUpdate = (message, type = "info") => {
    const update = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLiveUpdates((prev) => [update, ...prev.slice(0, 24)]);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xls", "xlsx"].includes(fileExtension || "")) {
      setError("Please upload a CSV or Excel file (.csv, .xls, .xlsx)");
      setFile(null);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      // 50MB limit
      setError("File size exceeds 50MB limit");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    addLiveUpdate(
      `File selected: ${selectedFile.name} (${(
        selectedFile.size /
        1024 /
        1024
      ).toFixed(2)} MB)`,
      "success"
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLiveUpdates([]);
    setProcessingData({
      status: "processing",
      fileName: file.name,
      fileType: file.name.split(".").pop()?.toUpperCase() || "Unknown",
      startTime: new Date(),
      endTime: null,
      duration: null,
      totalRecords: 0,
      processedRecords: 0,
      equipmentResults: [],
      pmResults: [],
      summary: {
        totalPMExpected: 0,
        totalPMCreated: 0,
        pmCompletionPercentage: 0,
        statusBreakdown: {
          Due: 0,
          Overdue: 0,
          Lapsed: 0,
        },
        pmTypeBreakdown: {
          WPM: 0,
          EPM: 0,
          CPM: 0,
          NPM: 0,
        },
      },
      errors: [],
      warnings: [],
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      addLiveUpdate("🚀 Starting file upload and validation...", "info");

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 600000); // 10 minute timeout

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/bulk/equipment/bulk-upload`,
        {
          method: "POST",
          body: formData,
          signal: abortController.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors?.[0] || `HTTP error! status: ${response.status}`
        );
      }

      addLiveUpdate("✅ File uploaded successfully. Processing data...", "success");

      // Handle JSON response (not streaming)
      const data = await response.json();
      
      setProcessingData((prev) => {
        const newData = {
          ...prev,
          ...data,
          equipmentResults: data.equipmentResults || [],
          pmResults: data.pmResults || [],
          summary: data.summary ? { ...prev.summary, ...data.summary } : prev.summary,
          errors: data.errors || [],
          warnings: data.warnings || []
        };

        // Add detailed live updates based on response
        if (data.status === "completed") {
          addLiveUpdate(`🎉 Processing completed successfully in ${data.duration}!`, "success");
          addLiveUpdate(`📊 Equipment processed: ${data.totalRecords} records`, "info");
          addLiveUpdate(`⚙️ PM tasks created: ${data.summary?.totalPMCreated || 0}`, "success");
          
          // PM Type breakdown
          if (data.summary?.pmTypeBreakdown) {
            const { WPM, EPM, CPM, NPM } = data.summary.pmTypeBreakdown;
            if (WPM > 0) addLiveUpdate(`🔧 Warranty PMs (WPM): ${WPM}`, "info");
            if (EPM > 0) addLiveUpdate(`🔧 Extended PMs (EPM): ${EPM}`, "info");
            if (CPM > 0) addLiveUpdate(`🔧 Comprehensive PMs (CPM): ${CPM}`, "info");
            if (NPM > 0) addLiveUpdate(`🔧 Non-comprehensive PMs (NPM): ${NPM}`, "info");
          }

          // Status breakdown
          if (data.summary?.statusBreakdown) {
            const { Due, Overdue, Lapsed } = data.summary.statusBreakdown;
            if (Due > 0) addLiveUpdate(`📅 Due tasks: ${Due}`, "warning");
            if (Overdue > 0) addLiveUpdate(`⚠️ Overdue tasks: ${Overdue}`, "error");
            if (Lapsed > 0) addLiveUpdate(`❌ Lapsed tasks: ${Lapsed}`, "error");
          }

          setIsProcessing(false);
          setTimeout(() => setActiveTab("results"), 2000);
          
        } else if (data.status === "failed") {
          addLiveUpdate("❌ Processing failed!", "error");
          if (data.errors?.length > 0) {
            data.errors.forEach((err) => addLiveUpdate(`Error: ${err}`, "error"));
          }
          setIsProcessing(false);
        }

        // Add warnings if any
        if (data.warnings?.length > 0) {
          data.warnings.forEach((warning) =>
            addLiveUpdate(`⚠️ ${warning}`, "warning")
          );
        }

        return newData;
      });

    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage =
        err.name === "AbortError"
          ? "Request timeout - file too large or slow connection"
          : err.message;
      addLiveUpdate(`❌ Upload failed: ${errorMessage}`, "error");
      setError(`Upload failed: ${errorMessage}`);
      setIsProcessing(false);

      setProcessingData((prev) => ({
        ...prev,
        status: "failed",
        endTime: new Date(),
        duration: `${((new Date() - prev.startTime) / 1000).toFixed(2)}s`,
      }));
    }
  };

  // Updated CSV template with all required fields matching backend field mappings
  const csvTemplate = `Material Code,Material Description,Serial Number,Equipment,Current Customer,End Customer,CustWarrantyStart,CustWarrantyEnd,DealerWarrantyStart,DealerWarrantyEnd,Dealer,PAL number,IR Number
,,,,,,,,,,`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "equipment_bulk_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addLiveUpdate("📁 Template downloaded successfully", "success");
  };

  const resetForm = () => {
    setFile(null);
    setError("");
    setActiveTab("upload");
    setLiveUpdates([]);
    setIsProcessing(false);
    setProcessingData({
      status: "idle",
      fileName: "",
      fileType: "",
      startTime: null,
      endTime: null,
      duration: null,
      totalRecords: 0,
      processedRecords: 0,
      equipmentResults: [],
      pmResults: [],
      summary: {
        totalPMExpected: 0,
        totalPMCreated: 0,
        pmCompletionPercentage: 0,
        statusBreakdown: {
          Due: 0,
          Overdue: 0,
          Lapsed: 0,
        },
        pmTypeBreakdown: {
          WPM: 0,
          EPM: 0,
          CPM: 0,
          NPM: 0,
        },
      },
      errors: [],
      warnings: [],
    });
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      Created: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Created",
        icon: "✓",
      },
      Updated: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Updated",
        icon: "↻",
      },
      Failed: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Failed",
        icon: "✕",
      },
      Due: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Due",
        icon: "⏰",
      },
      Overdue: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Overdue",
        icon: "⚠",
      },
      Lapsed: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Lapsed",
        icon: "🔒",
      },
      Completed: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Completed",
        icon: "✓",
      },
      Success: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Success",
        icon: "✓",
      },
      Processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Processing",
        icon: "⟳",
      },
    };

    const config = statusMap[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status || "Unknown",
      icon: "?",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getProcessingSteps = () => {
    const steps = [
      {
        id: 1,
        title: "File Validation & Parsing",
        description: `Parsing ${processingData.fileName} (${processingData.fileType}) with field mapping`,
        status: processingData.status !== "idle" ? "completed" : "pending",
      },
      {
        id: 2,
        title: "Equipment Data Processing",
        description: `${processingData.processedRecords}/${processingData.totalRecords} equipment records processed`,
        status:
          processingData.processedRecords > 0
            ? processingData.processedRecords === processingData.totalRecords
              ? "completed"
              : "active"
            : processingData.status === "processing"
            ? "active"
            : "pending",
      },
      {
        id: 3,
        title: "PM Task Generation",
        description: `${processingData.summary.totalPMCreated}/${processingData.summary.totalPMExpected} PM tasks created with status calculation`,
        status:
          processingData.summary.totalPMCreated > 0
            ? processingData.summary.pmCompletionPercentage === 100
              ? "completed"
              : "active"
            : processingData.processedRecords === processingData.totalRecords &&
              processingData.status === "processing"
            ? "active"
            : "pending",
      },
      {
        id: 4,
        title: "Database Commit & Finalization",
        description: "Saving all data and generating final report",
        status: processingData.status === "completed" ? "completed" : "pending",
      },
    ];

    return steps;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Database size={24} />
                </div>
                Equipment Bulk Upload & PM Generation
              </h2>
              <p className="text-blue-100 mt-1">
                Import equipment data with intelligent field mapping and automatic PM task generation
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isProcessing}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Template Download Section */}
        <div className="flex m-6 justify-between items-center p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
              <FileSpreadsheet size={20} />
              Download Template with Smart Field Mapping
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Get the Excel/CSV template with all required fields. Our system supports flexible field naming!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-blue-600">
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Material Code variations</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Date format flexibility</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Warranty fields included</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>PM auto-generation</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Download size={16} />
            Download Template
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "upload"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                <Upload size={16} className="inline mr-2" />
                Upload & Process
                {isProcessing && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "results"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("results")}
                disabled={processingData.status !== "completed"}
              >
                <TrendingUp size={16} className="inline mr-2" />
                Results & Analytics
                {processingData.status === "completed" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-6 h-[500px] overflow-y-auto">
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Upload Error
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              {!isProcessing && (
                <div className="space-y-6">
                  <div
                    className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg"
                        : file
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center py-16">
                      {file ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                            <FileSpreadsheet
                              size={32}
                              className="text-green-600"
                            />
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-3 justify-center">
                              <span className="font-semibold text-lg text-gray-900">
                                {file.name}
                              </span>
                              <button
                                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setFile(null);
                                  addLiveUpdate("File removed", "info");
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="text-sm text-gray-500 mt-2 space-x-4">
                              <span>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <span>•</span>
                              <span>{file.type || "Unknown type"}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mb-6">
                            <Upload size={32} className="text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Upload Equipment Data
                          </h3>
                          <p className="text-gray-600 mb-4 text-center max-w-md">
                            Select or drag & drop your Excel/CSV file. Our intelligent system will automatically map fields and generate PM tasks.
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                              .CSV
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                              .XLS
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                              .XLSX
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                              Max 50MB
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="absolute inset-0 cursor-pointer"
                    >
                      <span className="sr-only">Upload file</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    {file && (
                      <button
                        onClick={resetForm}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={handleUpload}
                      disabled={!file}
                      className={`px-8 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${
                        !file
                          ? "bg-gray-300 cursor-not-allowed text-gray-500"
                          : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                      }`}
                    >
                      <Upload size={16} />
                      Upload & Process Equipment
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Status */}
              {isProcessing && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Processing Steps */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Settings className="text-blue-600 animate-spin" size={20} />
                        Processing Status
                      </h3>
                      <div className="space-y-4">
                        {getProcessingSteps().map((step) => (
                          <div key={step.id} className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                  step.status === "completed"
                                    ? "bg-green-500 text-white shadow-lg"
                                    : step.status === "active"
                                    ? "bg-blue-500 text-white shadow-lg animate-pulse"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                {step.status === "completed" ? (
                                  <CheckCircle2 size={16} />
                                ) : step.status === "active" ? (
                                  <Clock size={16} className="animate-spin" />
                                ) : (
                                  step.id
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4
                                className={`font-medium ${
                                  step.status === "active"
                                    ? "text-blue-600"
                                    : "text-gray-800"
                                }`}
                              >
                                {step.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Statistics */}
                    {processingData.status !== "idle" && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                          <div className="text-2xl font-bold text-blue-600">
                            {processingData.processedRecords}
                          </div>
                          <div className="text-sm text-gray-600">
                            Equipment Processed
                          </div>
                          <div className="text-xs text-blue-500 mt-1">
                            of {processingData.totalRecords} total
                          </div>
                        </div>
                        <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                          <div className="text-2xl font-bold text-green-600">
                            {processingData.summary.totalPMCreated}
                          </div>
                          <div className="text-sm text-gray-600">
                            PM Tasks Created
                          </div>
                          <div className="text-xs text-green-500 mt-1">
                            {processingData.summary.pmCompletionPercentage}%
                            complete
                          </div>
                        </div>
                        <div className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
                          <div className="text-2xl font-bold text-yellow-600">
                            {processingData.summary.statusBreakdown.Due || 0}
                          </div>
                          <div className="text-sm text-gray-600">Due Tasks</div>
                        </div>
                        <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                          <div className="text-2xl font-bold text-red-600">
                            {processingData.warnings?.length + processingData.errors?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Issues</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Updates */}
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live Updates
                      </h4>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {liveUpdates.length > 0 ? (
                          liveUpdates.map((update) => (
                            <div
                              key={update.id}
                              className={`p-3 rounded-lg text-sm border-l-4 ${
                                update.type === "error"
                                  ? "bg-red-50 text-red-700 border-red-400"
                                  : update.type === "success"
                                  ? "bg-green-50 text-green-700 border-green-400"
                                  : update.type === "warning"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-400"
                                  : "bg-blue-50 text-blue-700 border-blue-400"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span className="flex-1">{update.message}</span>
                                <span className="text-xs opacity-75 ml-2">
                                  {update.timestamp}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-8">
                            Processing will start soon...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion Message */}
              {processingData.status === "completed" && !isProcessing && (
                <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-3">
                    🎉 Processing Completed Successfully!
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                    <div>
                      <div className="font-semibold text-green-700">
                        {processingData.totalRecords}
                      </div>
                      <div className="text-green-600">Equipment Processed</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-700">
                        {processingData.summary.totalPMCreated}
                      </div>
                      <div className="text-green-600">PM Tasks Created</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-700">
                        {processingData.duration}
                      </div>
                      <div className="text-green-600">Processing Time</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-700">
                        {processingData.summary.pmCompletionPercentage}%
                      </div>
                      <div className="text-green-600">Success Rate</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("results")}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    View Detailed Results & Analytics
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && processingData.status === "completed" && (
            <div className="space-y-6 h-[500px] overflow-y-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Equipment Created
                      </p>
                      <p className="text-2xl font-bold text-green-800 mt-2">
                        {
                          processingData.equipmentResults.filter(
                            (e) => e.status === "Created"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="bg-green-200 p-3 rounded-full">
                      <CheckCircle2 size={24} className="text-green-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Equipment Updated
                      </p>
                      <p className="text-2xl font-bold text-blue-800 mt-2">
                        {
                          processingData.equipmentResults.filter(
                            (e) => e.status === "Updated"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="bg-blue-200 p-3 rounded-full">
                      <Database size={24} className="text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">
                        PM Tasks Created
                      </p>
                      <p className="text-2xl font-bold text-purple-800 mt-2">
                        {processingData.summary.totalPMCreated}
                      </p>
                    </div>
                    <div className="bg-purple-200 p-3 rounded-full">
                      <Settings size={24} className="text-purple-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">
                        Failed Records
                      </p>
                      <p className="text-2xl font-bold text-red-800 mt-2">
                        {
                          processingData.equipmentResults.filter(
                            (e) => e.status === "Failed"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="bg-red-200 p-3 rounded-full">
                      <AlertCircle size={24} className="text-red-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PM Type Breakdown */}
              {Object.values(processingData.summary.pmTypeBreakdown).some(
                (count) => count > 0
              ) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    PM Task Type Distribution
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {processingData.summary.pmTypeBreakdown.WPM}
                      </div>
                      <div className="text-sm font-medium text-blue-700">Warranty PM</div>
                      <div className="text-xs text-blue-600 mt-1">Customer warranty period</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {processingData.summary.pmTypeBreakdown.EPM}
                      </div>
                      <div className="text-sm font-medium text-green-700">Extended PM</div>
                      <div className="text-xs text-green-600 mt-1">Dealer/Extended warranty</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {processingData.summary.pmTypeBreakdown.CPM}
                      </div>
                      <div className="text-sm font-medium text-purple-700">
                        Comprehensive PM
                      </div>
                      <div className="text-xs text-purple-600 mt-1">ZDRC AMC contracts</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        {processingData.summary.pmTypeBreakdown.NPM}
                      </div>
                      <div className="text-sm font-medium text-orange-700">
                        Non-comprehensive PM
                      </div>
                      <div className="text-xs text-orange-600 mt-1">ZDRN AMC contracts</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  PM Status Distribution (Based on Due Dates)
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                      {processingData.summary.statusBreakdown.Due}
                    </div>
                    <div className="text-sm font-medium text-yellow-700">Due Tasks</div>
                    <div className="text-xs text-yellow-600 mt-1">Current/upcoming month</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      {processingData.summary.statusBreakdown.Overdue}
                    </div>
                    <div className="text-sm font-medium text-red-700">Overdue Tasks</div>
                    <div className="text-xs text-red-600 mt-1">1-2 months past due</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-3xl font-bold text-gray-600 mb-1">
                      {processingData.summary.statusBreakdown.Lapsed}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Lapsed Tasks</div>
                    <div className="text-xs text-gray-600 mt-1">More than 2 months past</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 text-sm">
                    <Info size={16} />
                    <span className="font-medium">PM Logic Applied:</span>
                  </div>
                  <ul className="text-xs text-blue-600 mt-2 space-y-1 ml-5">
                    <li>• Shows PM as "Due" one month in advance (May shows June PM)</li>
                    <li>• 2-month grace period for overdue tasks</li>
                    <li>• Frequency based on product master (2x/year, 4x/year, etc.)</li>
                    <li>• Preserves already completed PM tasks</li>
                  </ul>
                </div>
              </div>

              {/* Processing Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-800 mb-4">Processing Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Processed:</span>
                    <span className="font-medium">
                      {processingData.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="font-medium">
                      {processingData.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed At:</span>
                    <span className="font-medium">
                      {new Date(processingData.endTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-1  ">
                {/* Equipment Results */}
               
                {/* PM Results */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-medium text-gray-800 flex items-center gap-2">
                      <Settings size={16} />
                      PM Task Results ({processingData.pmResults.length})
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {processingData.pmResults.length > 0 ? (
                      processingData.pmResults.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-800 truncate">
                                {item.serialnumber} - {item.pmType || "PM"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Due: {item.dueMonth || "N/A"}
                                {item.dueDate && (
                                  <span className="ml-2">• Date: {item.dueDate}</span>
                                )}
                                {item.created && (
                                  <span className="ml-2">• Status: {item.created}</span>
                                )}
                              </p>
                              {item.error && (
                                <p className="text-xs text-red-500 mt-1 truncate">
                                  {item.error}
                                </p>
                              )}
                            </div>
                            <div className="ml-4">
                              {renderStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No PM tasks created
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Warnings and Errors */}
              {(processingData.warnings?.length > 0 ||
                processingData.errors?.length > 0) && (
                <div className="space-y-4">
                  {processingData.warnings?.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Warnings ({processingData.warnings.length})
                      </h4>
                      <div className="space-y-1">
                        {processingData.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-yellow-700">
                            • {warning}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {processingData.errors?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Errors ({processingData.errors.length})
                      </h4>
                      <div className="space-y-1">
                        {processingData.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700">
                            • {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
