"use client";

import {
  Download,
  Database,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  Package,
} from "lucide-react";
import { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

function ProductBulk({ isOpen, onClose, getData }) {
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [resultFilter, setResultFilter] = useState("All");
  const [isDragging, setIsDragging] = useState(false);
  const abortControllerRef = useRef(null);

  const [processingData, setProcessingData] = useState({
    status: "idle", // idle, processing, completed, failed, cancelled
    startTime: null,
    endTime: null,
    duration: null,
    totalRecords: 0,
    processedRecords: 0,
    successfulRecords: 0,
    failedRecords: 0,
    results: [],
    summary: {
      created: 0,
      updated: 0,
      failed: 0,
      duplicatesInFile: 0,
      existingRecords: 0,
      skippedTotal: 0,
    },
    headerMapping: {},
    errors: [],
    warnings: [],
    batchProgress: {
      currentBatch: 0,
      totalBatches: 0,
      batchSize: 1000,
      currentBatchRecords: 0,
      estimatedTimeRemaining: null,
    },
    uploadProgress: 0,
  });

  const [liveUpdates, setLiveUpdates] = useState([]);
  const [fileValidation, setFileValidation] = useState(null);

  const validateFileStructure = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          let headers = [];
          const fileName = file.name.toLowerCase();

          if (fileName.endsWith(".csv")) {
            // Parse CSV headers
            const text = e.target.result;
            const firstLine = text.split("\n")[0];
            headers = firstLine
              .split(",")
              .map((h) => h.trim().replace(/"/g, ""));
          } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            // Parse Excel headers
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
              header: 1,
            });
            headers = jsonData[0] || [];
          }

          // Normalize headers for comparison (matching backend logic)
          const normalizedHeaders = headers.map((h) =>
            h
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .trim()
          );

          // Check for required fields (matching backend MAP) - NOW WITH 5 REQUIRED FIELDS
          const requiredFields = {
            partnoid: [
              "partno",
              "partnoid",
              "partnumber",
              "part_number",
              "partno",
              "partnoid",
            ],
            product: [
              "productdescription",
              "productdesc",
              "product",
              "productdescription1",
            ],
            productgroup: ["productgroup", "group", "productgroup"],
            subgrp: ["subgrp", "subgroup", "sub_grp", "subgroup"],
            frequency: ["frequency", "freq"],
            installationcheckliststatusboolean: [
              "installationcheckliststatus",
              "installationcheckliststatusboolean",
              "installationcheckliststatus",
            ],
            pmcheckliststatusboolean: [
              "pmcheckliststatus",
              "pmcheckliststatusboolean",
              "pmcheckliststatus",
            ],
          };

          const foundFields = {};
          const mappedColumns = {};

          for (const [field, variations] of Object.entries(requiredFields)) {
            const foundVariation = variations.find((variation) =>
              normalizedHeaders.includes(variation)
            );
            foundFields[field] = !!foundVariation;

            if (foundVariation) {
              // Find the original header name for this variation
              const originalHeader = headers.find(
                (h) =>
                  h
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "")
                    .trim() === foundVariation
              );
              mappedColumns[field] = originalHeader;
            }
          }

          // All 7 fields are now required
          const isValid =
            foundFields.partnoid &&
            foundFields.product &&
            foundFields.productgroup &&
            foundFields.subgrp &&
            foundFields.frequency &&
            foundFields.installationcheckliststatusboolean &&
            foundFields.pmcheckliststatusboolean;

          const missingFields = Object.entries(foundFields)
            .filter(([field, found]) => !found)
            .map(([field]) => {
              const fieldLabels = {
                partnoid: "Part No",
                product: "Product Description",
                productgroup: "Product Group",
                subgrp: "Sub_GRp",
                frequency: "Frequency",
                installationcheckliststatusboolean:
                  "Installation checklist Status",
                pmcheckliststatusboolean: "PM checklist Status",
              };
              return fieldLabels[field] || field;
            });

          resolve({
            isValid,
            headers: headers,
            foundFields,
            mappedColumns,
            missingFields,
            totalRequired: Object.keys(requiredFields).length,
            foundRequired: Object.values(foundFields).filter(Boolean).length,
          });
        } catch (error) {
          resolve({
            isValid: false,
            error: `File parsing error: ${error.message}`,
            headers: [],
            foundFields: {},
            mappedColumns: {},
            missingFields: [],
            totalRequired: 5,
            foundRequired: 0,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          isValid: false,
          error: "Failed to read file",
          headers: [],
          foundFields: {},
          mappedColumns: {},
          missingFields: [],
          totalRequired: 5,
          foundRequired: 0,
        });
      };

      // Read file based on type
      if (file.name.toLowerCase().endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Enhanced live update function with better categorization
  const addLiveUpdate = useCallback((message, type = "info", data = null) => {
    const update = {
      id: Date.now() + Math.random(),
      message,
      type, // info, success, warning, error, progress
      timestamp: new Date().toLocaleTimeString(),
      data,
    };
    setLiveUpdates((prev) => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
  }, []);

  // Enhanced status counts calculation
  const statusCounts = processingData.results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const filterTabs = [
    { label: "All", value: "All", count: processingData.results.length },
    { label: "Created", value: "Created", count: statusCounts.Created || 0 },
    { label: "Updated", value: "Updated", count: statusCounts.Updated || 0 },
    { label: "Skipped", value: "Skipped", count: statusCounts.Skipped || 0 },
    { label: "Failed", value: "Failed", count: statusCounts.Failed || 0 },
  ];

  const filteredResults =
    resultFilter === "All"
      ? processingData.results
      : processingData.results.filter((r) => r.status === resultFilter);

  // Enhanced file validation with product-specific fields
  const validateAndSetFile = useCallback(
    async (selectedFile) => {
      setError("");
      setFileValidation(null);

      if (!selectedFile) {
        setFile(null);
        return;
      }

      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = ["csv", "xls", "xlsx"];

      if (!allowedExtensions.includes(fileExtension || "")) {
        setError(
          `Please upload a valid file format. Allowed: ${allowedExtensions.join(
            ", "
          )}`
        );
        setFile(null);
        return;
      }

      const maxSizeBytes = 100 * 1024 * 1024; // 100MB
      if (selectedFile.size > maxSizeBytes) {
        setError(`File size exceeds ${maxSizeBytes / (1024 * 1024)}MB limit`);
        setFile(null);
        return;
      }

      // Set file and show validation loading
      setFile(selectedFile);
      setError("Validating file structure...");
      addLiveUpdate(
        `File selected: ${selectedFile.name} (${(
          selectedFile.size / 1024
        ).toFixed(2)} KB)`,
        "info"
      );

      // Validate file structure
      const validation = await validateFileStructure(selectedFile);
      setFileValidation(validation);

      if (!validation.isValid) {
        if (validation.error) {
          setError(validation.error);
          addLiveUpdate(`File validation failed: ${validation.error}`, "error");
        } else {
          const missingFieldsText = validation.missingFields.join(", ");
          const errorMessage = `Missing required columns: ${missingFieldsText}. \nFound columns: ${validation.headers.join(
            ", "
          )}.`;
          setError(errorMessage);
          addLiveUpdate(`File validation failed: ${errorMessage}`, "error");
        }
        setFile(null);
        return;
      }

      setError(""); // Clear error if validation passes
      addLiveUpdate(
        `✅ File validated successfully: ${selectedFile.name} - Required columns found!`,
        "success"
      );
    },
    [addLiveUpdate]
  );
  // Download function add karo - Product ke fields ke according
  const handleDownloadErrors = (exportType = "failed") => {
    let dataToExport = [];

    // Filter data based on export type
    switch (exportType) {
      case "failed":
        dataToExport = processingData.results.filter(
          (item) => item.status === "Failed"
        );
        break;
      case "all_errors":
        dataToExport = processingData.results.filter(
          (item) =>
            item.status === "Failed" || (item.error && item.error.trim() !== "")
        );
        break;
      case "all_results":
        dataToExport = processingData.results;
        break;
      default:
        dataToExport = processingData.results.filter(
          (item) => item.status === "Failed"
        );
    }

    if (dataToExport.length === 0) {
      alert("No data available for export");
      return;
    }

    // Prepare data for Excel - Product fields ke according
    const excelData = dataToExport.map((item) => ({
      // "Row Number": item.row || "",
      "Part No ID": item.partnoid || "",
      // "Product Description": item.product || "",
      // "Product Group": item.productgroup || "",
      // "Sub Group": item.subgrp || "",
      // Frequency: item.frequency || "",
      // "Date of Launch": item.dateoflaunch || "",
      // "End of Sale Date": item.endofsaledate || "",
      // "End of Support Date": item.endofsupportdate || "",
      // "Ex Support Available": item.exsupportavlb || "",
      // "Installation Checklist Status":
      //   item.installationcheckliststatusboolean || "",
      // "PM Checklist Status": item.pmcheckliststatusboolean || "",
      Status: item.status || "",
      Action: item.action || "",
      Error: item.error || "",
      Warnings: Array.isArray(item.warnings)
        ? item.warnings.join("; ")
        : item.warnings || "",
      "Assigned Status": item.assignedStatus || "",
      "Status Changed": item.statusChanged ? "Yes" : "No",
      Changes:
        item.changesText ||
        (Array.isArray(item.changeDetails)
          ? item.changeDetails
              .map((c) => `${c.field}: "${c.oldValue}" → "${c.newValue}"`)
              .join("; ")
          : ""),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = Object.keys(excelData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15), // Minimum width 15
    }));
    worksheet["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Error Records");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `product_errors_${exportType}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);

    // Add live update
    addLiveUpdate(`📥 Product error data exported: ${filename}`, "success");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    validateAndSetFile(selectedFile);
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

  // Enhanced upload function with product-specific API endpoint
  const handleUpload = async () => {
    if (!file) return;

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    setIsProcessing(true);
    setLiveUpdates([]);
    setError("");

    const initialProcessingData = {
      status: "processing",
      startTime: new Date(),
      endTime: null,
      duration: null,
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      results: [],
      summary: {
        created: 0,
        updated: 0,
        failed: 0,
        duplicatesInFile: 0,
        existingRecords: 0,
        skippedTotal: 0,
      },
      headerMapping: {},
      errors: [],
      warnings: [],
      batchProgress: {
        currentBatch: 0,
        totalBatches: 0,
        batchSize: 1000,
        currentBatchRecords: 0,
        estimatedTimeRemaining: null,
      },
      uploadProgress: 0,
    };

    setProcessingData(initialProcessingData);

    const formData = new FormData();
    formData.append("file", file);

    // Add additional metadata for products
    formData.append("batchSize", "1000");
    formData.append("validateOnly", "false");
    formData.append("skipDuplicates", "true");
    formData.append("updateExisting", "true");

    try {
      addLiveUpdate("Initiating bulk product upload...", "info");

      const timeoutMs = 15 * 60 * 1000; // 15 minutes timeout for products
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, timeoutMs);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/bulk/product/bulk-upload`,
        {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
          headers: {
            // Don't set Content-Type for FormData - browser will set it with boundary
            Accept: "application/x-ndjson, application/json",
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Upload failed: ${response.status} - ${
            errorData.message || response.statusText
          }`
        );
      }

      addLiveUpdate(
        "File uploaded successfully. Processing product records...",
        "success"
      );

      // Handle streaming response
      await handleStreamingResponse(response);
    } catch (err) {
      if (err.name === "AbortError") {
        addLiveUpdate("Upload cancelled by user", "warning");
        setProcessingData((prev) => ({
          ...prev,
          status: "cancelled",
          endTime: new Date(),
          duration: `${((new Date() - prev.startTime) / 1000).toFixed(2)}s`,
        }));
      } else {
        const errorMessage = err.message || "Unknown error occurred";
        addLiveUpdate(`Upload failed: ${errorMessage}`, "error");
        setError(`Upload failed: ${errorMessage}`);

        setProcessingData((prev) => ({
          ...prev,
          status: "failed",
          endTime: new Date(),
          duration: `${((new Date() - prev.startTime) / 1000).toFixed(2)}s`,
        }));
      }
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  // Enhanced streaming response handler
  const handleStreamingResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let partialLine = "";
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = partialLine + decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          partialLine = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            await processStreamLine(line);
          }
        }

        // Process any remaining partial line
        if (partialLine.trim()) {
          await processStreamLine(partialLine);
        }

        break; // Success - exit retry loop
      } catch (streamError) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw streamError;
        }

        addLiveUpdate(
          `Stream error (retry ${retryCount}/${maxRetries}): ${streamError.message}`,
          "warning"
        );

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 2000 * retryCount));
      }
    }
  };

  // Process individual stream lines
  const processStreamLine = async (line) => {
    try {
      const data = JSON.parse(line);

      setProcessingData((prev) => {
        const newData = {
          ...prev,
          ...data,
          results: data.results || prev.results,
          summary: data.summary
            ? { ...prev.summary, ...data.summary }
            : prev.summary,
          headerMapping: data.headerMapping || prev.headerMapping,
          errors: data.errors || prev.errors,
          warnings: data.warnings || prev.warnings,
          batchProgress: data.batchProgress || prev.batchProgress,
        };

        // Handle different types of updates
        handleProgressUpdates(data, prev);

        // Final status updates
        if (data.status === "completed") {
          const duration = `${((new Date() - prev.startTime) / 1000).toFixed(
            2
          )}s`;
          addLiveUpdate(
            `✅ Bulk product upload completed successfully in ${duration}! ` +
              `Total: ${data.totalRecords}, ` +
              `Created: ${data.summary?.created || 0}, ` +
              `Updated: ${data.summary?.updated || 0}, ` +
              `Failed: ${data.summary?.failed || 0}`,
            "success"
          );
          setIsProcessing(false);
          setActiveTab("results");

          // Refresh parent data if callback provided
          if (getData && typeof getData === "function") {
            getData();
          }
        } else if (data.status === "failed") {
          addLiveUpdate("❌ Bulk product upload failed!", "error");
          setIsProcessing(false);
        }

        return newData;
      });
    } catch (parseError) {
      console.error("Error parsing stream data:", parseError, "Line:", line);
      addLiveUpdate(`Parse error: ${parseError.message}`, "error");
    }
  };

  // Handle various progress updates for products
  const handleProgressUpdates = (data, prevData) => {
    // Batch progress updates
    if (
      data.batchProgress?.currentBatch > prevData.batchProgress?.currentBatch
    ) {
      addLiveUpdate(
        `📦 Processing batch ${data.batchProgress.currentBatch}/${data.batchProgress.totalBatches} (${data.batchProgress.batchSize} products)`,
        "progress"
      );
    }

    // Record processing updates
    if (data.processedRecords > prevData.processedRecords) {
      const recordsProcessed =
        data.processedRecords - prevData.processedRecords;
      const progressPercent = (
        (data.processedRecords / data.totalRecords) *
        100
      ).toFixed(1);
      addLiveUpdate(
        `⚡ Processed ${recordsProcessed} products (${data.processedRecords}/${data.totalRecords} - ${progressPercent}%)`,
        "progress"
      );
    }

    // Individual record updates
    if (data.latestRecords?.length > 0) {
      const latest = data.latestRecords[data.latestRecords.length - 1];
      const statusEmoji = {
        Created: "✅",
        Updated: "🔄",
        Failed: "❌",
        Skipped: "⏭️",
      };

      addLiveUpdate(
        `${statusEmoji[latest.status] || "📝"} ${latest.status}: ${
          latest.partNo
        } - ${latest.productDescription}`,
        latest.status === "Failed" ? "error" : "info"
      );
    }

    // Summary updates
    ["created", "updated", "failed", "duplicatesInFile"].forEach((key) => {
      if (data.summary?.[key] > prevData.summary?.[key]) {
        const count = data.summary[key] - prevData.summary[key];
        const labels = {
          created: "✨ Created",
          updated: "🔄 Updated",
          failed: "❌ Failed",
          duplicatesInFile: "🔄 Duplicates found",
        };
        addLiveUpdate(
          `${labels[key]} ${count} products (Total: ${data.summary[key]})`,
          key === "failed"
            ? "error"
            : key === "duplicatesInFile"
            ? "warning"
            : "success"
        );
      }
    });
  };

  // Cancel upload function
  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLiveUpdate("Cancelling upload...", "warning");
    }
  };

  const handleDownload = () => {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Create data with headers and empty rows
    const data = [
      [
        "Part No",
        "Product Description",
        "Product Group",
        "Sub_GRp",
        "Frequency",
        "Date of Launch",
        "End Of Sale",
        "End of Support",
        "Ex-support avlb",
        "Installation checklist Status",
        "PM checklist Status",
        "Status",
      ], // Headers with Status field added
      ["", "", "", "", "", "", "", "", "", "", "", ""], // Empty row 1
      ["", "", "", "", "", "", "", "", "", "", "", ""], // Empty row 2
      ["", "", "", "", "", "", "", "", "", "", "", ""], // Empty row 3
    ];

    // Convert to worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Template");

    // Write and download file
    XLSX.writeFile(workbook, "product_bulk_upload_template.xlsx");

    addLiveUpdate("📥 Product template downloaded successfully", "success");
  };

  const resetForm = () => {
    setFile(null);
    setError("");
    setActiveTab("upload");
    setLiveUpdates([]);
    setIsProcessing(false);
    setResultFilter("All");
    setProcessingData({
      status: "idle",
      startTime: null,
      endTime: null,
      duration: null,
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      results: [],
      summary: {
        created: 0,
        updated: 0,
        failed: 0,
        duplicatesInFile: 0,
        existingRecords: 0,
        skippedTotal: 0,
      },
      headerMapping: {},
      errors: [],
      warnings: [],
      batchProgress: {
        currentBatch: 0,
        totalBatches: 0,
        batchSize: 1000,
        currentBatchRecords: 0,
        estimatedTimeRemaining: null,
      },
      uploadProgress: 0,
    });
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      Created: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Created",
        icon: "✅",
      },
      Updated: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Updated",
        icon: "🔄",
      },
      Failed: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Failed",
        icon: "❌",
      },
      Skipped: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Skipped",
        icon: "⏭️",
      },
      Processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Processing",
        icon: "⚡",
      },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: "Unknown",
      icon: "❓",
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

  // Enhanced processing steps for products
  const getProcessingSteps = () => {
    const steps = [
      {
        id: 1,
        title: "File Upload & Validation",
        description:
          processingData.uploadProgress > 0
            ? `Upload progress: ${processingData.uploadProgress}%`
            : "Validating file format, size, and required product columns (Part No, Product Description)",
        status: processingData.status !== "idle" ? "completed" : "pending",
        icon: Upload,
      },
      {
        id: 2,
        title: "Product Header Mapping & Analysis",
        description:
          Object.keys(processingData.headerMapping).length > 0
            ? `Mapped columns: ${Object.keys(processingData.headerMapping).join(
                ", "
              )}`
            : "Analyzing product file structure and mapping columns",
        status:
          Object.keys(processingData.headerMapping).length > 0
            ? "completed"
            : processingData.status === "processing"
            ? "active"
            : "pending",
        icon: Package,
      },
      {
        id: 3,
        title: "Batch Processing Product Records",
        description:
          processingData.batchProgress.totalBatches > 0
            ? `Batch ${processingData.batchProgress.currentBatch}/${
                processingData.batchProgress.totalBatches
              } - ${processingData.processedRecords}/${
                processingData.totalRecords
              } products (${(
                (processingData.processedRecords /
                  processingData.totalRecords) *
                100
              ).toFixed(1)}%)`
            : `Processing ${processingData.processedRecords}/${processingData.totalRecords} product records`,
        status:
          processingData.processedRecords > 0
            ? processingData.processedRecords === processingData.totalRecords
              ? "completed"
              : "active"
            : processingData.status === "processing"
            ? "active"
            : "pending",
        icon: Clock,
      },
      {
        id: 4,
        title: "Finalizing & Product Summary",
        description:
          processingData.status === "completed"
            ? `✅ Completed: ${processingData.summary.created} created, ${processingData.summary.updated} updated, ${processingData.summary.failed} failed`
            : "Generating final product summary and cleanup",
        status: processingData.status === "completed" ? "completed" : "pending",
        icon: CheckCircle,
      },
    ];

    return steps;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header - Updated to match Customer design */}
        <div className="relative bg-gradient-to-r from-blue-50 to-emerald-50 p-6 text-black">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package size={24} />
                </div>
                Bulk Product Upload
              </h2>
              <p className="text-gray-500 mt-1">
                Import and manage Product data efficiently with batch processing
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Template Download Section - Matching Customer design */}
        <div className="flex m-3 justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div>
            <h3 className="font-semibold text-blue-900">Need a template?</h3>
            <p className="text-sm text-blue-700">
              Download our CSV template with all required Product columns: Part
              No, Product Description (required) and optional fields like
              Product Group, Sub Group, Frequency, Date of Launch, End Of Sale,
              End of Support, etc.
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Download Template
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tabs - Matching Customer design */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === "upload"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                Upload
                {isProcessing && (
                  <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs bg-blue-600 text-white rounded-full animate-pulse">
                    !
                  </span>
                )}
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === "results"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("results")}
                disabled={processingData.status !== "completed"}
              >
                Results
                {processingData.status === "completed" && (
                  <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs bg-green-600 text-white rounded-full">
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="space-y-6 h-[400px] overflow-y-auto">
              {/* File Upload Section */}
              {!isProcessing && (
                <div className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-500 flex-shrink-0 mt-0.5"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          Error
                        </h3>
                        <p className="text-sm text-red-700 mt-1 whitespace-pre-line">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    className={`relative border-2 border-dashed h-[250px] rounded-lg transition-all duration-200 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 scale-105"
                        : file
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center py-12">
                      {file ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue-600"
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <span className="font-medium text-lg">
                                {file.name}
                              </span>
                              <button
                                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setFile(null);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                            <span className="text-sm text-gray-500 mt-2 block">
                              {(file.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue-600"
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          </div>
                          <p className="mb-2 text-lg text-center">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-sm text-center text-gray-500">
                            CSV or Excel files only (max 50MB)
                          </p>
                          <p className="text-xs text-center text-blue-600 mt-2">
                            Required columns: Part No, Product Description
                          </p>
                          <p className="text-xs text-center text-gray-600 mt-1">
                            Optional: Product Group, Sub Group, Frequency, Date
                            of Launch, End of Sale, etc.
                          </p>
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
                      disabled={
                        !file || (fileValidation && !fileValidation.isValid)
                      }
                      className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
                        !file || (fileValidation && !fileValidation.isValid)
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white transition-colors`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      {fileValidation && fileValidation.isValid
                        ? "Start Batch Upload Product Data ✓"
                        : "Start Batch Upload Product Data"}
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Status Section */}
              {isProcessing && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Processing Steps */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        Batch Processing Status
                      </h3>

                      {/* Batch Progress Indicator */}
                      {processingData.batchProgress.totalBatches > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-blue-800">
                              Batch Progress
                            </span>
                            <span className="text-sm text-blue-600">
                              {processingData.batchProgress.currentBatch}/
                              {processingData.batchProgress.totalBatches}
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (processingData.batchProgress.currentBatch /
                                    processingData.batchProgress.totalBatches) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            Processing {processingData.batchProgress.batchSize}{" "}
                            records per batch
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {getProcessingSteps().map((step) => (
                          <div key={step.id} className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  step.status === "completed"
                                    ? "bg-green-500 text-white"
                                    : step.status === "active"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                {step.status === "completed" ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : step.status === "active" ? (
                                  <svg
                                    className="animate-spin h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
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
                  </div>

                  {/* Live Updates */}
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Real-time Updates
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {liveUpdates.length > 0 ? (
                          liveUpdates.map((update) => (
                            <div
                              key={update.id}
                              className={`p-2 rounded text-xs ${
                                update.type === "error"
                                  ? "bg-red-50 text-red-700"
                                  : update.type === "success"
                                  ? "bg-green-50 text-green-700"
                                  : update.type === "warning"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <span>{update.message}</span>
                                <span className="text-gray-500 ml-2">
                                  {update.timestamp}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4">
                            Batch processing will start soon...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && processingData.status === "completed" && (
            <div className="space-y-6 h-[400px] overflow-y-auto px-2">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Records Created
                      </p>
                      <p className="text-2xl font-bold text-green-800 mt-2">
                        {processingData.summary.created}
                      </p>
                    </div>
                    <div className="bg-green-200 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Records Updated
                      </p>
                      <p className="text-2xl font-bold text-blue-800 mt-2">
                        {processingData.summary.updated}
                      </p>
                    </div>
                    <div className="bg-blue-200 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        File Duplicates
                      </p>
                      <p className="text-2xl font-bold text-orange-800 mt-2">
                        {processingData.summary.duplicatesInFile}
                      </p>
                    </div>
                    <div className="bg-orange-200 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-orange-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Existing Records
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-2">
                        {processingData.summary.existingRecords}
                      </p>
                    </div>
                    <div className="bg-gray-200 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">
                        Failed Records
                      </p>
                      <p className="text-2xl font-bold text-red-800 mt-2">
                        {processingData.summary.failed}
                      </p>
                    </div>
                    <div className="bg-red-200 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Summary */}
              {processingData.duration && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-sm text-gray-800 mb-2">
                    Batch Processing Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Records:</span>
                      <span className="ml-2 font-medium">
                        {processingData.totalRecords}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Batches:</span>
                      <span className="ml-2 font-medium">
                        {processingData.batchProgress.totalBatches || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="ml-2 font-medium">
                        {processingData.duration}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Skipped:</span>
                      <span className="ml-2 font-medium">
                        {processingData.summary.skippedTotal}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completed At:</span>
                      <span className="ml-2 font-medium">
                        {new Date(processingData.endTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Results */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">
                    Detailed Results ({filteredResults.length} records)
                  </h3>
                  {/* Export Options - Failed records ke liye */}
                  {processingData.results.some(
                    (item) => item.status === "Failed" || item.error
                  ) && (
                    <div className="">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <div className="relative">
                            <select
                              id="export-type"
                              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                              onChange={(e) =>
                                handleDownloadErrors(e.target.value)
                              }
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Choose Export Type
                              </option>
                              <option value="failed">
                                Failed Records Only (
                                {
                                  processingData.results.filter(
                                    (item) => item.status === "Failed"
                                  ).length
                                }
                                )
                              </option>
                              <option value="all_errors">
                                All Records with Errors (
                                {
                                  processingData.results.filter(
                                    (item) =>
                                      item.status === "Failed" ||
                                      (item.error && item.error.trim() !== "")
                                  ).length
                                }
                                )
                              </option>
                              <option value="all_results">
                                All Processing Results (
                                {processingData.results.length})
                              </option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <Download size={16} className="text-red-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex -mb-px">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setResultFilter(tab.value)}
                        className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 ${
                          resultFilter === tab.value
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab.label}
                        <span className="ml-2 inline-block rounded-full px-2 bg-gray-100 text-xs text-gray-600">
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {processingData.results.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredResults.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-500">
                                  Row {item.row}
                                </span>
                                <span className="text-sm font-medium text-gray-800">
                                  Part No: {item.partNo}
                                </span>
                                <span className="text-sm font-medium text-gray-800">
                                  Description: {item.productDescription}
                                </span>
                              </div>
                              {item.action && (
                                <div className="text-xs text-blue-600">
                                  {item.action}
                                </div>
                              )}
                              {item.error && (
                                <div className="text-xs text-red-500 mt-1">
                                  Error: {item.error}
                                </div>
                              )}
                              {item.warnings && item.warnings.length > 0 && (
                                <div className="text-xs text-yellow-600 mt-1">
                                  Warnings: {item.warnings.join(", ")}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              {renderStatusBadge(item.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      No results to display
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pb-4 gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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

export default ProductBulk;
