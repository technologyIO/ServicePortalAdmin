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
  Database,
  ArrowLeft,
  RefreshCw,
  FileText,
  BarChart3,
  Activity,
  Eye,
  AlertTriangle,
  XCircle,
  Edit,
  Plus,
  Wrench,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

// Import separate components and utilities
import { validateFileStructure } from "./BulkUpload/EquipmentBulkUploadValidation";
import { handleDownloadTemplate } from "./BulkUpload/EquipmentBulkUploadTemplate";
import FileUploadArea from "./BulkUpload/FileUploadArea";
import ProcessingSteps from "./BulkUpload/ProcessingSteps";
import LiveUpdates from "./BulkUpload/LiveUpdates";
import { renderStatusBadge } from "./BulkUpload/Utils/helpers";
import ResultsTab from "./BulkUpload/ResultsTab";

export default function EquipmentBulkUploadPage() {
  // All state variables
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [jobId, setJobId] = useState(null);
  const [jobProgress, setJobProgress] = useState({
    status: "idle",
    fileName: "",
    fileSize: 0,
    totalRecords: 0,
    processedRecords: 0,
    createdCount: 0,
    updatedCount: 0,
    failedCount: 0,
    pmCount: 0,
    progressPercentage: 0,
    currentOperation: "Ready to start...",
    startTime: null,
    endTime: null,
    estimatedEndTime: null,
    errorMessage: "",
    fieldMappingInfo: {
      detectedFields: [],
      mappedFields: [],
      unmappedFields: [],
    },
  });

  const [processingData, setProcessingData] = useState({
    status: "idle",
    fileName: "",
    fileType: "",
    fileSize: 0,
    startTime: null,
    endTime: null,
    duration: null,
    totalRecords: 0,
    processedRecords: 0,
    equipmentResults: [],
    pmResults: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      hasNext: false,
      hasPrev: false,
    },
    summary: {
      operations: {
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        pmRegenerated: 0,
      },
      pm: {
        totalExpected: 0,
        created: 0,
        failed: 0,
        skipped: 0,
        completionPercentage: 0,
      },
      statusBreakdown: { Due: 0, Overdue: 0, Lapsed: 0 },
      pmTypeBreakdown: { WPM: 0, EPM: 0, CPM: 0, NPM: 0 },
      errorBreakdown: {},
      statusUpdates: { total: 0, byStatus: {} },
    },
    performance: {
      parseTime: 0,
      validationTime: 0,
      dbWriteTime: 0,
      pmGenerationTime: 0,
    },
    errors: [],
    warnings: [],
    fieldMappingInfo: {
      detectedFields: [],
      mappedFields: [],
      unmappedFields: [],
    },
  });

  const [liveUpdates, setLiveUpdates] = useState([]);
  const [fileValidation, setFileValidation] = useState(null);
  const progressIntervalRef = useRef(null);
  // Add these state variables with other states
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const perPageLimit = 10; // Items per page
  const [errorActiveTab, setErrorActiveTab] = useState("errors");

  // Filter states
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [pmFilter, setPmFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEquipment, setExpandedEquipment] = useState(new Set());
  // Add these state variables
  const [allErrors, setAllErrors] = useState([]);
  const [allWarnings, setAllWarnings] = useState([]);
  const [errorSummary, setErrorSummary] = useState({});
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatOptions = [
    { value: "csv", label: "CSV", extension: ".csv" },
    { value: "xlsx", label: "Excel (XLSX)", extension: ".xlsx" },
    { value: "json", label: "JSON", extension: ".json" },
    { value: "txt", label: "Text File", extension: ".txt" },
  ];

  useEffect(() => {
    const fetchErrors = async () => {
      if (
        processingData.status === "completed" &&
        jobId &&
        allErrors.length === 0
      ) {
        try {
          console.log("Fetching errors for jobId:", jobId); // Debug log
          const errorData = await fetchAllErrors(jobId);
          console.log("Received error data:", errorData); // Debug log

          if (errorData && errorData.summary) {
            setAllErrors(errorData.errors || []);
            setAllWarnings(errorData.warnings || []);
            setErrorSummary({
              totalErrors: errorData.summary.totalErrors || 0,
              totalWarnings: errorData.summary.totalWarnings || 0,
              errorBreakdown: errorData.summary.errorsByCategory || {},
              errorBySource: errorData.summary.errorsBySource || {},
              failedEquipment: errorData.summary.failedEquipment || [],
            });
            console.log("Updated error summary:", errorData.summary); // Debug log
          }
        } catch (error) {
          console.error("Failed to fetch errors:", error);
        }
      }
    };

    fetchErrors();
  }, [processingData.status, jobId, allErrors.length]);

  // API and polling functions
  const pollJobProgress = async (jobId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/bulk/equipment/status/${jobId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.status}`);
      }

      const progressData = await response.json();

      // Update jobProgress state with new data
      setJobProgress(progressData);

      // Update processing data with latest info
      setProcessingData((prev) => ({
        ...prev,
        processedRecords:
          progressData.progress?.processedRecords || prev.processedRecords,
        totalRecords: progressData.progress?.totalRecords || prev.totalRecords,
      }));

      if (
        progressData.progress?.currentOperation &&
        progressData.progress.currentOperation !==
          jobProgress.progress?.currentOperation
      ) {
        addLiveUpdate(`🔄 ${progressData.progress.currentOperation}`, "info");
      }

      // Add real-time updates for counts
      if (
        progressData.counts?.pmGenerated >
        (jobProgress.counts?.pmGenerated || 0)
      ) {
        addLiveUpdate(
          `⚙️ PM tasks generated: ${progressData.counts.pmGenerated}`,
          "success"
        );
      }

      if (progressData.status === "COMPLETED") {
        addLiveUpdate(
          "✅ Processing completed! Fetching results...",
          "success"
        );

        // Update final counts
        setProcessingData((prev) => ({
          ...prev,
          summary: {
            ...prev.summary,
            ...progressData.summary,
            totalPMCreated:
              progressData.counts?.pmGenerated ||
              progressData.summary?.totalPMCreated,
          },
        }));

        await fetchJobResult(jobId);
        setIsProcessing(false);
        clearInterval(progressIntervalRef.current);
        setTimeout(() => setActiveTab("results"), 1000);
      } else if (progressData.status === "FAILED") {
        addLiveUpdate(
          `❌ Processing failed: ${progressData.errorMessage}`,
          "error"
        );
        setError(progressData.errorMessage || "Processing failed");
        setIsProcessing(false);
        clearInterval(progressIntervalRef.current);
      }
    } catch (error) {
      console.error("Error polling progress:", error);
      addLiveUpdate(`⚠️ Progress update failed: ${error.message}`, "warning");
    }
  };
  // Add this helper function to extract all errors from equipment data
  const extractAllErrors = (equipmentResults) => {
    const allErrors = [];
    const allWarnings = [];

    equipmentResults.forEach((equipment) => {
      // Add equipment-level errors
      if (equipment.allErrors && equipment.allErrors.length > 0) {
        equipment.allErrors.forEach((error) => {
          allErrors.push({
            ...error,
            serialNumber: equipment.serialnumber,
            equipmentId: equipment.equipmentid,
            lineNumber: equipment.lineNumber,
            source: "equipment",
          });
        });
      }

      // Add equipment-level warnings
      if (equipment.warnings && equipment.warnings.length > 0) {
        equipment.warnings.forEach((warning) => {
          allWarnings.push({
            ...warning,
            serialNumber: equipment.serialnumber,
            equipmentId: equipment.equipmentid,
            lineNumber: equipment.lineNumber,
            source: "equipment",
          });
        });
      }

      // Add PM-related errors
      if (equipment.pmResults && equipment.pmResults.length > 0) {
        equipment.pmResults.forEach((pm) => {
          if (pm.status === "Failed" || pm.error) {
            allErrors.push({
              category: pm.category || "PM_Error",
              field: pm.pmType,
              message: pm.error || pm.reason || "PM task failed",
              serialNumber: equipment.serialnumber,
              equipmentId: equipment.equipmentid,
              lineNumber: equipment.lineNumber,
              pmType: pm.pmType,
              source: "pm",
            });
          }
        });
      }
    });

    return { allErrors, allWarnings };
  };
  // Add this function to your component
  const fetchAllErrors = async (jobId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/bulk/equipment/errors/${jobId}?includeWarnings=true`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch errors: ${response.status}`);
      }
      const data = await response.json();

      // Return the data in the expected format
      return {
        errors: data.errors || [],
        warnings: data.warnings || [],
        summary: {
          totalErrors: data.totalErrors || 0,
          totalWarnings: data.totalWarnings || 0,
          errorsByCategory: data.errorBreakdown || {},
          errorsBySource: data.errorBySource || {},
          failedEquipment: data.failedEquipment || [],
        },
      };
    } catch (error) {
      console.error("Error fetching all errors:", error);
      return {
        errors: [],
        warnings: [],
        summary: {
          totalErrors: 0,
          totalWarnings: 0,
          errorsByCategory: {},
          errorsBySource: {},
          failedEquipment: [],
        },
      };
    }
  };

  // In your main component, update the processingData state when you get the final response
  const fetchJobResult = async (jobId, page = 1, append = false) => {
    try {
      setIsLoadingMore(page > 1);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/bulk/equipment/results/${jobId}?page=${page}&limit=${perPageLimit}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.status}`);
      }

      const resultData = await response.json();

      // Extract PM results from equipment data
      const allPMResults = [];
      if (resultData.data && Array.isArray(resultData.data)) {
        resultData.data.forEach((equipment) => {
          if (equipment.pmResults && Array.isArray(equipment.pmResults)) {
            equipment.pmResults.forEach((pm) => {
              allPMResults.push({
                ...pm,
                serialnumber: equipment.serialnumber,
                equipmentId: equipment.equipmentid,
                lineNumber: equipment.lineNumber,
              });
            });
          }
        });
      }

      setProcessingData((prev) => ({
        ...prev,
        status: "completed",
        endTime: page === 1 ? new Date() : prev.endTime,
        duration:
          page === 1
            ? `${((new Date() - prev.startTime) / 1000).toFixed(2)}s`
            : prev.duration,
        equipmentResults: append
          ? [...(prev.equipmentResults || []), ...(resultData.data || [])]
          : resultData.data || [],
        pmResults: append
          ? [...(prev.pmResults || []), ...allPMResults]
          : allPMResults,
        pagination: {
          currentPage: page,
          totalPages: resultData.pagination?.totalPages || 1,
          totalRecords: resultData.pagination?.total || 0,
          hasNext: resultData.pagination?.hasNext || false,
          hasPrev: resultData.pagination?.hasPrev || false,
        },
        summary:
          page === 1
            ? {
                ...prev.summary,
                totalPMCreated: jobProgress.counts?.pmGenerated || 0,
                totalPMExpected: jobProgress.summary?.totalPMExpected || 0,
                operationBreakdown: {
                  created: jobProgress.counts?.created || 0,
                  updated: jobProgress.counts?.updated || 0,
                  failed: jobProgress.counts?.failed || 0,
                  pmRegenerated:
                    jobProgress.summary?.operationBreakdown?.pmRegenerated || 0,
                },
                pmTypeBreakdown: jobProgress.summary?.pmTypeBreakdown || {},
                statusBreakdown: jobProgress.summary?.statusBreakdown || {},
                performance: jobProgress.summary?.performance || {},
              }
            : prev.summary,
        errors: page === 1 ? resultData.errors || [] : prev.errors,
        warnings: page === 1 ? resultData.warnings || [] : prev.warnings,
      }));

      setCurrentPage(page);
      setIsLoadingMore(false);

      // Fetch error details on first page load
      if (page === 1) {
        try {
          console.log("Fetching errors in fetchJobResult for jobId:", jobId); // Debug log
          const errorData = await fetchAllErrors(jobId);
          console.log("Error data in fetchJobResult:", errorData); // Debug log

          if (errorData && errorData.summary) {
            setAllErrors(errorData.errors || []);
            setAllWarnings(errorData.warnings || []);
            setErrorSummary({
              totalErrors: errorData.summary.totalErrors || 0,
              totalWarnings: errorData.summary.totalWarnings || 0,
              errorBreakdown: errorData.summary.errorsByCategory || {},
              errorBySource: errorData.summary.errorsBySource || {},
              failedEquipment: errorData.summary.failedEquipment || [],
            });
          }
        } catch (errorFetchError) {
          console.error("Failed to fetch error details:", errorFetchError);
        }

        // Live updates only for first page
        const pmGenerated = jobProgress.counts?.pmGenerated || 0;
        const pmRegenerated =
          jobProgress.summary?.operationBreakdown?.pmRegenerated || 0;

        if (pmRegenerated > 0) {
          addLiveUpdate(
            `📊 Equipment: ${pmRegenerated} PM regenerated`,
            "success"
          );
        }

        if (pmGenerated > 0) {
          addLiveUpdate(`⚙️ PM Tasks: ${pmGenerated} created`, "success");
        }

        if (allPMResults.length > 0) {
          addLiveUpdate(
            `📋 Extracted ${allPMResults.length} individual PM tasks from equipment records`,
            "info"
          );
        }

        const processedCount = jobProgress.progress?.processedRecords || 0;
        if (processedCount > 0) {
          addLiveUpdate(
            `✅ Successfully processed ${processedCount} equipment records`,
            "success"
          );
        }
      } else {
        addLiveUpdate(
          `📄 Loaded page ${page} - ${
            resultData.data?.length || 0
          } more records`,
          "info"
        );
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      addLiveUpdate(`❌ Failed to fetch results: ${error.message}`, "error");
      setIsLoadingMore(false);
    }
  };
  // Add this useEffect to debug data availability
  useEffect(() => {
    console.log("Debug - Error Summary:", errorSummary);
    console.log("Debug - All Errors:", allErrors);
    console.log("Debug - All Warnings:", allWarnings);
    console.log("Debug - Processing Status:", processingData.status);
  }, [errorSummary, allErrors, allWarnings, processingData.status]);

  const downloadErrorsInFormat = (format) => {
    try {
      const errors = allErrors || [];
      const warnings = allWarnings || [];
      const allData = [...errors, ...warnings];

      if (allData.length === 0) {
        addLiveUpdate("ℹ️ No errors or warnings to download", "info");
        return;
      }

      let content, mimeType, filename;
      const timestamp = new Date().toISOString().split("T")[0];

      switch (format) {
        case "csv":
          content = generateCSV(allData);
          mimeType = "text/csv;charset=utf-8;";
          filename = `errors-warnings-${timestamp}.csv`;
          break;

        case "xlsx":
          // For XLSX, you'll need a library like xlsx or exceljs
          content = generateExcel(allData);
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          filename = `errors-warnings-${timestamp}.xlsx`;
          break;

        case "json":
          content = JSON.stringify(allData, null, 2);
          mimeType = "application/json;charset=utf-8;";
          filename = `errors-warnings-${timestamp}.json`;
          break;

        case "txt":
          content = generateTextFile(allData);
          mimeType = "text/plain;charset=utf-8;";
          filename = `errors-warnings-${timestamp}.txt`;
          break;

        default:
          content = generateCSV(allData);
          mimeType = "text/csv;charset=utf-8;";
          filename = `errors-warnings-${timestamp}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addLiveUpdate(
        `📁 Downloaded ${allData.length} items as ${format.toUpperCase()}`,
        "success"
      );
    } catch (error) {
      console.error("Download failed:", error);
      addLiveUpdate(`❌ Download failed: ${error.message}`, "error");
    }
  };

  const generateCSV = (data) => {
    const headers = [
      "Sr No",
      "Type",
      "Category",
      "Source",
      "Message",
      "Serial Number",
      "Line Number",
    ];

    const csvRows = [headers.join(",")];

    data.forEach((item, index) => {
      const row = [
        index + 1,
        item.type || (allErrors.includes(item) ? "Error" : "Warning"),
        item.category || "",
        item.source || "",
        `"${(item.message || "").replace(/"/g, '""')}"`,
        item.serialNumber || "",
        item.lineNumber || "",
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  const generateTextFile = (data) => {
    let content = "ERRORS & WARNINGS REPORT\n";
    content += "=".repeat(30) + "\n\n";

    data.forEach((item, index) => {
      const type =
        item.type || (allErrors.includes(item) ? "ERROR" : "WARNING");
      content += `${index + 1}. [${type}] ${item.message}\n`;
      if (item.serialNumber) content += `   Serial: ${item.serialNumber}\n`;
      if (item.lineNumber) content += `   Line: ${item.lineNumber}\n`;
      content += "\n";
    });

    return content;
  };

  const generateExcel = (data) => {
    // You'll need to install: npm install xlsx
    // import * as XLSX from 'xlsx';

    const ws = XLSX.utils.json_to_sheet(
      data.map((item, index) => ({
        "Sr No": index + 1,
        Type: item.type || (allErrors.includes(item) ? "Error" : "Warning"),
        Category: item.category || "",
        Source: item.source || "",
        Message: item.message || "",
        "Serial Number": item.serialNumber || "",
        "Line Number": item.lineNumber || "",
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors & Warnings");
    return XLSX.write(wb, { bookType: "xlsx", type: "array" });
  };

  const isDisabled =
    (allErrors?.length || 0) === 0 && (allWarnings?.length || 0) === 0;

  const startProgressPolling = (jobId) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    progressIntervalRef.current = setInterval(() => {
      pollJobProgress(jobId);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const addLiveUpdate = (message, type = "info") => {
    const update = {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLiveUpdates((prev) => [update, ...prev.slice(0, 49)]);
  };

  // File handling functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = async (selectedFile) => {
    setError("");
    setFileValidation(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (
      !["csv", "xls", "xlsx", "tsv", "json", "xml"].includes(
        fileExtension || ""
      )
    ) {
      setError(
        "Please upload a supported file (.csv, .xls, .xlsx, .tsv, .json, .xml)"
      );
      setFile(null);
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError("File size exceeds 500MB limit");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("Validating file structure...");
    addLiveUpdate(
      `File selected: ${selectedFile.name} (${(
        selectedFile.size /
        1024 /
        1024
      ).toFixed(2)} MB)`,
      "info"
    );

    const validation = await validateFileStructure(selectedFile);
    setFileValidation(validation);

    if (!validation.isValid) {
      if (validation.error) {
        setError(validation.error);
        addLiveUpdate(`File validation failed: ${validation.error}`, "error");
      } else {
        const missingFieldsText = validation.missingFields.join(", ");
        const errorMessage = `Missing required columns: ${missingFieldsText}.\n\nFound ${
          validation.foundRequired
        }/${
          validation.totalRequired
        } required columns.\n\nAvailable columns:\n${validation.headers.join(
          ", "
        )}`;
        setError(errorMessage);
        addLiveUpdate(
          `File validation failed: Missing required columns`,
          "error"
        );
      }
      setFile(null);
      return;
    }

    setError("");
    addLiveUpdate(
      `✅ File validated successfully: ${selectedFile.name} - All ${validation.totalRequired} required columns found!`,
      "success"
    );

    if (validation.mappedColumns) {
      const mappedList = Object.entries(validation.mappedColumns)
        .map(([field, header]) => `${field}: "${header}"`)
        .join(", ");
      addLiveUpdate(`📋 Column mapping: ${mappedList}`, "info");
    }
  };

  // Drag and drop handlers
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

  // Upload handler
  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setLiveUpdates([]);
    setProcessingData({
      ...processingData,
      status: "processing",
      fileName: file.name,
      fileType: file.name.split(".").pop()?.toUpperCase() || "Unknown",
      fileSize: file.size,
      startTime: new Date(),
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      addLiveUpdate("🚀 Starting file upload and validation...", "info");

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 900000);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/bulk/equipment/start`,
        {
          method: "POST",
          body: formData,
          signal: abortController.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        let message = `HTTP error! status: ${response.status}`;
        if (errorData.errors) {
          if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            message = errorData.errors[0].message || message;
          } else if (typeof errorData.errors === "string") {
            message = errorData.errors;
          } else if (typeof errorData.errors === "object") {
            message = JSON.stringify(errorData.errors);
          }
        }
        throw new Error(message);
      }

      const data = await response.json();

      if (data.jobId) {
        setJobId(data.jobId);
        addLiveUpdate(
          `✅ Upload started successfully. Job ID: ${data.jobId}`,
          "success"
        );
        addLiveUpdate(
          "🔄 Processing in progress... Real-time updates will appear below",
          "info"
        );
        startProgressPolling(data.jobId);
      } else {
        throw new Error("No job ID received from server");
      }
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

  // Template download handler
  const handleDownloadTemplateClick = () => {
    handleDownloadTemplate();
    addLiveUpdate("📁 Template downloaded successfully", "success");
  };

  // Reset function
  const resetForm = () => {
    setFile(null);
    setError("");
    setActiveTab("upload");
    setLiveUpdates([]);
    setIsProcessing(false);
    setFileValidation(null);
    setEquipmentFilter("all");
    setPmFilter("all");
    setSearchTerm("");
    setExpandedEquipment(new Set());
    setJobId(null);

    // Add these lines to reset error states
    setAllErrors([]);
    setAllWarnings([]);
    setErrorSummary({});

    setJobProgress({
      status: "idle",
      fileName: "",
      fileSize: 0,
      totalRecords: 0,
      processedRecords: 0,
      createdCount: 0,
      updatedCount: 0,
      failedCount: 0,
      pmCount: 0,
      progressPercentage: 0,
      currentOperation: "Ready to start...",
      startTime: null,
      endTime: null,
      estimatedEndTime: null,
      errorMessage: "",
      fieldMappingInfo: {
        detectedFields: [],
        mappedFields: [],
        unmappedFields: [],
      },
    });

    setProcessingData({
      status: "idle",
      fileName: "",
      fileType: "",
      fileSize: 0,
      startTime: null,
      endTime: null,
      duration: null,
      totalRecords: 0,
      processedRecords: 0,
      equipmentResults: [],
      pmResults: [],
      summary: {
        operations: {
          created: 0,
          updated: 0,
          skipped: 0,
          failed: 0,
          pmRegenerated: 0,
        },
        pm: {
          totalExpected: 0,
          created: 0,
          failed: 0,
          skipped: 0,
          completionPercentage: 0,
        },
        statusBreakdown: { Due: 0, Overdue: 0, Lapsed: 0 },
        pmTypeBreakdown: { WPM: 0, EPM: 0, CPM: 0, NPM: 0 },
        errorBreakdown: {},
        statusUpdates: { total: 0, byStatus: {} },
      },
      performance: {
        parseTime: 0,
        validationTime: 0,
        dbWriteTime: 0,
        pmGenerationTime: 0,
      },
      errors: [],
      warnings: [],
      fieldMappingInfo: {
        detectedFields: [],
        mappedFields: [],
        unmappedFields: [],
      },
    });
  };

  // Filtered results
  const filteredEquipmentResults = useMemo(() => {
    let filtered = processingData.equipmentResults || [];

    if (equipmentFilter !== "all") {
      filtered = filtered.filter((item) => {
        const status = item.status.toLowerCase();
        return (
          status === equipmentFilter ||
          (equipmentFilter === "pmregenerated" && status === "pmregenerated") ||
          (equipmentFilter === "created" && status === "created") ||
          (equipmentFilter === "updated" && status === "updated") ||
          (equipmentFilter === "failed" && status === "failed")
        );
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.serialnumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.equipmentid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [processingData.equipmentResults, equipmentFilter, searchTerm]);

  const filteredPMResults = useMemo(() => {
    let filtered = processingData.pmResults || [];

    if (pmFilter !== "all") {
      filtered = filtered.filter((item) => {
        const status =
          item.status?.toLowerCase() || item.pmStatus?.toLowerCase() || "";
        return status === pmFilter;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.serialnumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.pmType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.equipmentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [processingData.pmResults, pmFilter, searchTerm]);

  const toggleEquipmentExpansion = (serialnumber) => {
    const newExpanded = new Set(expandedEquipment);
    if (newExpanded.has(serialnumber)) {
      newExpanded.delete(serialnumber);
    } else {
      newExpanded.add(serialnumber);
    }
    setExpandedEquipment(newExpanded);
  };
  // Add this component before the Equipment Results section
  const PaginationControls = ({
    currentPage,
    totalPages,
    totalRecords,
    hasNext,
    hasPrev,
    onPageChange,
    isLoading,
    recordsShown,
    type = "equipment",
  }) => {
    const startRecord = (currentPage - 1) * perPageLimit + 1;
    const endRecord = Math.min(currentPage * perPageLimit, totalRecords);

    return (
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          Showing {recordsShown} {type} records
          {totalRecords > 0 && (
            <span className="text-gray-500">
              ({startRecord}-{endRecord} of {totalRecords} total)
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrev || isLoading}
              className={`px-3 py-2 text-sm font-medium rounded-md border ${
                !hasPrev || isLoading
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={isLoading}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={isLoading || currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-md border ${
                      currentPage === totalPages || isLoading
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNext || isLoading}
              className={`px-3 py-2 text-sm font-medium rounded-md border ${
                !hasNext || isLoading
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  Loading...
                </div>
              ) : (
                "Next"
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Equipment Bulk Upload & PM Generation
                </h1>
                <p className="text-sm text-gray-500">
                  Import equipment data with intelligent field mapping and
                  automatic PM task generation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {processingData.status === "completed" && (
                <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Processing Complete</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{jobProgress.progressPercentage}% Complete</span>
                </div>
              )}
              {jobId && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Job: {jobId}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Template Download Section */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-2">
                <FileSpreadsheet size={24} />
                Download Template with Smart Field Mapping
              </h3>
              <p className="text-blue-700 mb-4">
                Get the Excel/CSV template with all required fields. Our system
                supports flexible field naming and intelligent column mapping.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  9 Required Fields
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Smart Mapping
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Multi-Format Support
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  Auto PM Generation
                </span>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplateClick}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Download size={20} />
              Download Template
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === "upload"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                <div className="flex items-center gap-2">
                  <Upload size={16} />
                  Upload & Process
                  {isProcessing && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </div>
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === "results"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("results")}
                disabled={processingData.status !== "completed"}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  Results & Analytics
                  {processingData.status === "completed" && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </div>
              </button>

              {/* Update the errors tab button condition */}
              {(errorSummary.totalErrors > 0 ||
                errorSummary.totalWarnings > 0 ||
                allErrors.length > 0 ||
                allWarnings.length > 0 ||
                processingData.status === "completed") && (
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === "errors"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("errors")}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Issues & Errors
                    {((errorSummary.totalErrors || 0) +
                      (errorSummary.totalWarnings || 0) ||
                      allErrors.length + allWarnings.length) > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                        {(errorSummary.totalErrors || 0) +
                          (errorSummary.totalWarnings || 0) ||
                          allErrors.length + allWarnings.length}
                      </span>
                    )}
                  </div>
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Upload Tab */}
            {activeTab === "upload" && (
              <div className="space-y-8">
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          Upload Error
                        </h3>
                        <div className="mt-1 text-sm text-red-700">
                          <pre className="whitespace-pre-wrap font-sans">
                            {error}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isProcessing ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* File Upload Area */}
                    <div className="lg:col-span-2">
                      <FileUploadArea
                        file={file}
                        isDragging={isDragging}
                        fileValidation={fileValidation}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleDrop={handleDrop}
                        handleFileChange={handleFileChange}
                        setFile={setFile}
                        setFileValidation={setFileValidation}
                        addLiveUpdate={addLiveUpdate}
                      />

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-4 mt-6">
                        {file && (
                          <button
                            onClick={resetForm}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          onClick={handleUpload}
                          disabled={
                            !file || (fileValidation && !fileValidation.isValid)
                          }
                          className={`px-8 py-3 rounded-lg flex items-center gap-2 font-medium transition-all ${
                            !file || (fileValidation && !fileValidation.isValid)
                              ? "bg-gray-300 cursor-not-allowed text-gray-500"
                              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          }`}
                        >
                          <Upload size={16} />
                          {fileValidation && fileValidation.isValid
                            ? "Upload & Process Equipment ✓"
                            : "Upload & Process Equipment"}
                        </button>
                      </div>
                    </div>

                    {/* Live Updates Sidebar */}
                    <div className="space-y-6">
                      <LiveUpdates
                        liveUpdates={liveUpdates}
                        isProcessing={false}
                        jobProgress={jobProgress}
                      />
                    </div>
                  </div>
                ) : (
                  /* Processing View */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Processing Steps */}
                    <div className="lg:col-span-2 space-y-8">
                      <ProcessingSteps
                        processingData={processingData}
                        jobProgress={jobProgress}
                      />
                      {/* Statistics */}

                      {processingData.status !== "idle" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-3xl font-bold text-blue-600">
                                  {jobProgress?.progress?.processedRecords ||
                                    processingData?.processedRecords ||
                                    0}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Equipment Processed
                                </div>
                                <div className="text-xs text-blue-500 mt-1">
                                  of{" "}
                                  {jobProgress?.progress?.totalRecords ||
                                    processingData?.totalRecords ||
                                    0}{" "}
                                  total
                                </div>
                              </div>
                              <div className="text-2xl">
                                {jobProgress?.progress?.processedRecords ===
                                jobProgress?.progress?.totalRecords
                                  ? "✅"
                                  : "⏳"}
                              </div>
                            </div>
                            {jobProgress?.progress?.percentage && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Progress</span>
                                  <span>
                                    {jobProgress.progress.percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${jobProgress.progress.percentage}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-3xl font-bold text-green-600">
                                  {jobProgress?.counts?.pmGenerated ||
                                    jobProgress?.summary?.totalPMCreated ||
                                    processingData?.summary?.totalPMCreated ||
                                    0}
                                </div>
                                <div className="text-sm text-gray-600">
                                  PM Tasks Created
                                </div>
                                <div className="text-xs text-green-500 mt-1">
                                  {jobProgress?.summary
                                    ?.pmCompletionPercentage ||
                                    processingData?.summary
                                      ?.pmCompletionPercentage ||
                                    (jobProgress?.status === "COMPLETED"
                                      ? "100"
                                      : "0")}
                                  % complete
                                </div>
                              </div>
                              <div className="text-2xl">
                                {jobProgress?.counts?.pmGenerated > 0
                                  ? "⚙️"
                                  : "⏸️"}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-3xl font-bold text-purple-600">
                                  {jobProgress?.summary?.operationBreakdown
                                    ?.pmRegenerated ||
                                    processingData?.summary?.operationBreakdown
                                      ?.pmRegenerated ||
                                    (jobProgress?.status === "COMPLETED"
                                      ? jobProgress?.progress?.processedRecords
                                      : 0) ||
                                    0}
                                </div>
                                <div className="text-sm text-gray-600">
                                  PM Regenerated
                                </div>
                                <div className="text-xs text-purple-500 mt-1">
                                  Equipment refreshed
                                </div>
                              </div>
                              <div className="text-2xl">🔄</div>
                            </div>
                          </div>

                          <div className="bg-white border border-red-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-3xl font-bold text-red-600">
                                  {jobProgress?.counts?.failed ||
                                    processingData?.summary?.operationBreakdown
                                      ?.failed ||
                                    (processingData?.warnings?.length || 0) +
                                      (processingData?.errors?.length || 0)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Issues
                                </div>
                                <div className="text-xs text-red-500 mt-1">
                                  {jobProgress?.counts?.failed > 0
                                    ? "Errors found"
                                    : "No issues"}
                                </div>
                              </div>
                              <div className="text-2xl">
                                {(jobProgress?.counts?.failed || 0) > 0
                                  ? "❌"
                                  : "✅"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Overall Progress Bar */}
                      {isProcessing &&
                        jobProgress?.progress?.percentage !== undefined && (
                          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-800">
                                Processing Progress
                              </h3>
                              <span className="text-sm text-gray-500">
                                {jobProgress.timing?.elapsedTime}s elapsed
                              </span>
                            </div>

                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {jobProgress.progress?.currentOperation ||
                                  "Processing..."}
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {jobProgress.progress.percentage}%
                              </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${jobProgress.progress.percentage}%`,
                                }}
                              ></div>
                            </div>

                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>
                                {jobProgress.progress?.processedRecords || 0} /{" "}
                                {jobProgress.progress?.totalRecords || 0}{" "}
                                records
                              </span>
                              <span>
                                {jobProgress.timing?.duration
                                  ? `Completed in ${jobProgress.timing.duration}s`
                                  : `ETA: ${Math.max(
                                      0,
                                      Math.round(
                                        (jobProgress.timing?.estimatedEndTime -
                                          Date.now()) /
                                          1000
                                      )
                                    )}s`}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Live Updates During Processing */}
                    <div>
                      <LiveUpdates
                        liveUpdates={liveUpdates}
                        isProcessing={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Results Tab */}

            {activeTab === "results" &&
              processingData.status === "completed" && (
                <ResultsTab
                  processingData={processingData}
                  jobProgress={jobProgress}
                />
              )}

            {activeTab === "errors" && (
              <div className="space-y-6">
                {processingData.status !== "completed" ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="animate-spin mr-2" size={20} />
                    <span>Loading error details...</span>
                  </div>
                ) : (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {errorSummary.totalErrors || 0}
                            </div>
                            <div className="text-sm text-red-700">
                              Total Errors
                            </div>
                          </div>
                          <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">
                              {errorSummary.totalWarnings || 0}
                            </div>
                            <div className="text-sm text-yellow-700">
                              Total Warnings
                            </div>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">
                              {errorSummary.failedEquipment?.length || 0}
                            </div>
                            <div className="text-sm text-blue-700">
                              Failed Records
                            </div>
                          </div>
                          <AlertCircle className="h-8 w-8 text-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="flex items-center gap-3 mb-4">
                      {/* Format Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          disabled={isDisabled}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                            isDisabled
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          {
                            formatOptions.find(
                              (opt) => opt.value === selectedFormat
                            )?.label
                          }
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${
                              isDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isDropdownOpen && !isDisabled && (
                          <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-10">
                            {formatOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSelectedFormat(option.value);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                  selectedFormat === option.value
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={() => downloadErrorsInFormat(selectedFormat)}
                        disabled={isDisabled}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                          isDisabled
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        <Download size={16} />
                        Download (
                        {(allErrors?.length || 0) +
                          (allWarnings?.length || 0)}{" "}
                        items)
                      </button>

                      {/* Click outside to close dropdown */}
                      {isDropdownOpen && (
                        <div
                          className="fixed inset-0 z-5"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                      )}
                    </div>

                    {/* Sub-tabs for Errors */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="border-b border-gray-200">
                        <nav
                          className="flex space-x-6 px-6"
                          aria-label="Error Tabs"
                        >
                          <button
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                              errorActiveTab === "errors"
                                ? "border-red-500 text-red-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => setErrorActiveTab("errors")}
                          >
                            <div className="flex items-center gap-2">
                              <XCircle size={16} />
                              Errors ({allErrors.length})
                            </div>
                          </button>

                          <button
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                              errorActiveTab === "warnings"
                                ? "border-yellow-500 text-yellow-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => setErrorActiveTab("warnings")}
                          >
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={16} />
                              Warnings ({allWarnings.length})
                            </div>
                          </button>

                          <button
                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                              errorActiveTab === "failed"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() => setErrorActiveTab("failed")}
                          >
                            <div className="flex items-center gap-2">
                              <Database size={16} />
                              Failed Records (
                              {
                                filteredEquipmentResults.filter(
                                  (eq) => eq.status.toLowerCase() === "failed"
                                ).length
                              }
                              )
                            </div>
                          </button>
                        </nav>
                      </div>

                      {/* Sub-tab Content */}
                      <div className="p-6">
                        {/* Errors Tab Content */}
                        {errorActiveTab === "errors" && (
                          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {allErrors.length > 0 ? (
                              allErrors.map((error, index) => (
                                <div
                                  key={error.id || index}
                                  className="p-4 hover:bg-gray-50"
                                >
                                  <div className="flex items-start space-x-3">
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                          {error.category}
                                        </span>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                          {error.source}
                                        </span>
                                        {error.lineNumber && (
                                          <span className="text-xs text-gray-500">
                                            Line {error.lineNumber}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-red-800 font-medium mb-1">
                                        {error.message}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-gray-600">
                                        {error.serialNumber && (
                                          <span>
                                            Serial:{" "}
                                            <strong>
                                              {error.serialNumber}
                                            </strong>
                                          </span>
                                        )}
                                        {error.equipmentId && (
                                          <span>
                                            Equipment:{" "}
                                            <strong>{error.equipmentId}</strong>
                                          </span>
                                        )}
                                        {error.field && (
                                          <span>
                                            Field:{" "}
                                            <strong>{error.field}</strong>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 text-center text-gray-500">
                                <CheckCircle2
                                  size={48}
                                  className="mx-auto mb-4 text-green-300"
                                />
                                <p className="text-lg font-medium">
                                  No errors found
                                </p>
                                <p className="text-sm">
                                  All records were processed successfully
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Warnings Tab Content */}
                        {errorActiveTab === "warnings" && (
                          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {allWarnings.length > 0 ? (
                              allWarnings.map((warning, index) => (
                                <div
                                  key={warning.id || index}
                                  className="p-4 hover:bg-gray-50"
                                >
                                  <div className="flex items-start space-x-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                          {warning.category}
                                        </span>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                          {warning.source}
                                        </span>
                                        {warning.lineNumber && (
                                          <span className="text-xs text-gray-500">
                                            Line {warning.lineNumber}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-yellow-800 font-medium mb-1">
                                        {warning.message}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-gray-600">
                                        {warning.serialNumber && (
                                          <span>
                                            Serial:{" "}
                                            <strong>
                                              {warning.serialNumber}
                                            </strong>
                                          </span>
                                        )}
                                        {warning.equipmentId && (
                                          <span>
                                            Equipment:{" "}
                                            <strong>
                                              {warning.equipmentId}
                                            </strong>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 text-center text-gray-500">
                                <CheckCircle2
                                  size={48}
                                  className="mx-auto mb-4 text-green-300"
                                />
                                <p className="text-lg font-medium">
                                  No warnings found
                                </p>
                                <p className="text-sm">
                                  All records processed without warnings
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Failed Records Tab Content */}
                        {errorActiveTab === "failed" && (
                          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {filteredEquipmentResults.filter(
                              (eq) => eq.status.toLowerCase() === "failed"
                            ).length > 0 ? (
                              filteredEquipmentResults
                                .filter(
                                  (eq) => eq.status.toLowerCase() === "failed"
                                )
                                .map((equipment, index) => (
                                  <div
                                    key={index}
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                          <span className="font-semibold text-gray-900 text-lg">
                                            {equipment.serialnumber}
                                          </span>
                                          {renderStatusBadge(equipment.status)}
                                          {equipment.equipmentid && (
                                            <span className="text-sm text-gray-500">
                                              ID: {equipment.equipmentid}
                                            </span>
                                          )}
                                        </div>
                                        {equipment.reason && (
                                          <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">
                                              Reason:
                                            </span>{" "}
                                            {equipment.reason}
                                          </p>
                                        )}
                                        {equipment.error && (
                                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-sm text-red-700">
                                              <span className="font-medium">
                                                Error:
                                              </span>{" "}
                                              {equipment.error}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="p-12 text-center text-gray-500">
                                <Database
                                  size={48}
                                  className="mx-auto mb-4 text-gray-300"
                                />
                                <p className="text-lg font-medium">
                                  No failed records
                                </p>
                                <p className="text-sm">
                                  All equipment records processed successfully
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
