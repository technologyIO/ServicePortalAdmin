// EquipmentBulk.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EquipmentBulk() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [jobStatus, setJobStatus] = useState({
    status: "idle",
    equipment: [],
    pm: [],
    summary: {
      totalEquipment: 0,
      processedEquipment: 0,
      totalPMExpected: 0,
      totalPMCreated: 0,
      pmCompletionPercentage: 0,
    },
    completedAt: null,
    duration: null,
    currentActivity: "Preparing to process...",
  });

  useEffect(() => {
    if (!jobId) return;

    const eventSource = new EventSource(
      `${process.env.REACT_APP_BASE_URL}/bulk/equipment/progress/${jobId}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        toast.error(data.error);
        eventSource.close();
        return;
      }

      setJobStatus((prev) => ({
        ...prev,
        ...data,
        equipment: data.equipmentResults || prev.equipment,
        pm: data.pmResults || prev.pm,
        summary: data.summary
          ? {
              ...prev.summary,
              ...data.summary,
            }
          : prev.summary,
        currentActivity: data.currentActivity || prev.currentActivity,
      }));

      if (data.totalEquipment > 0) {
        const newProgress = Math.round(
          (data.processedEquipment / data.totalEquipment) * 100
        );
        setProgress(newProgress);
      }

      if (data.status === "completed" || data.status === "failed") {
        eventSource.close();
        if (data.status === "completed") {
          toast.success("Bulk upload completed successfully!");
        } else {
          toast.error("Bulk upload failed");
        }
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [jobId]);

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
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      setFile(null);
      return;
    }
    setFile(selectedFile);
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

    setIsUploading(true);
    setJobId(null);
    setProgress(0);
    setJobStatus({
      status: "processing",
      equipment: [],
      pm: [],
      summary: {
        totalEquipment: 0,
        processedEquipment: 0,
        totalPMExpected: 0,
        totalPMCreated: 0,
        pmCompletionPercentage: 0,
      },
      completedAt: null,
      duration: null,
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/bulk/equipment/bulk-upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setJobId(response.data.jobId);
      setActiveTab("progress");
      toast.success("Upload started. Processing in progress...");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
      setIsUploading(false);
    }
  };

  const csvContent = `equipmentid,name,materialdescription,serialnumber,materialcode,status,currentcustomer,endcustomer,custWarrantystartdate,custWarrantyenddate,dealerwarrantystartdate,dealerwarrantyenddate,dealer,palnumber,installationreportno
EQID-001,Equipment A,"High quality equipment for industrial use",SN-001,MAT3333,Active,CUST006,Customer Y,2025-01-01,2025-12-31,2024-12-01,2025-06-30,Dealer A,PAL-001,IR-001
EQID-002,Equipment B,"Light duty equipment for daily operations",SN-002,MAT3334,Inactive,CUST002,Customer Z,2024-05-01,2025-04-30,2024-04-15,2024-10-15,Dealer B,PAL-002,IR-002
EQID-003,Equipment C,"Heavy-duty equipment for construction sites",SN-003,MAT3335,Active,CUST003,Customer X,2025-02-01,2026-01-31,2025-01-10,2025-07-10,Dealer C,PAL-003,IR-003
EQID-004,Equipment D,"Compact machine for small scale industries",SN-004,MAT3336,Inactive,CUST004,Customer W,2024-06-01,2025-05-31,2024-05-01,2024-11-01,Dealer D,PAL-004,IR-004
EQID-005,Equipment E,"Advanced equipment with AI support",SN-005,MAT3337,Active,CUST005,Customer V,2025-03-15,2026-03-14,2025-02-20,2025-08-20,Dealer E,PAL-005,IR-005
EQID-006,Equipment F,"Multi-purpose industrial machine",SN-006,MAT3338,Active,CUST007,Customer U,2024-07-01,2025-06-30,2024-06-15,2024-12-15,Dealer F,PAL-006,IR-006
EQID-007,Equipment G,"Durable outdoor equipment for heavy weather",SN-007,MAT3339,Inactive,CUST008,Customer T,2023-11-01,2024-10-31,2023-10-01,2024-04-01,Dealer G,PAL-007,IR-007
`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "equipment_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setJobId(null);
    setError("");
    setActiveTab("upload");
    setJobStatus({
      status: "idle",
      equipment: [],
      pm: [],
      summary: {
        totalEquipment: 0,
        processedEquipment: 0,
        totalPMExpected: 0,
        totalPMCreated: 0,
        pmCompletionPercentage: 0,
      },
      completedAt: null,
      duration: null,
    });
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      Created: { color: "green", text: "Created" },
      Updated: { color: "blue", text: "Updated" },
      Failed: { color: "red", text: "Failed" },
      Due: { color: "orange", text: "Due" },
      Completed: { color: "purple", text: "Completed" },
      Processing: { color: "yellow", text: "Processing" },
    };

    const { color, text } = statusMap[status] || {
      color: "gray",
      text: "Unknown",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
      >
        {text}
      </span>
    );
  };

  const renderActivityLog = () => {
    const activities = [
      {
        status:
          jobStatus.status === "processing"
            ? "active"
            : jobStatus.status === "completed"
            ? "completed"
            : "pending",
        text: "File uploaded and validated",
      },
      {
        status:
          jobStatus.summary.processedEquipment > 0
            ? "completed"
            : jobStatus.status === "processing"
            ? "active"
            : "pending",
        text: `Processing equipment (${jobStatus.summary.processedEquipment}/${jobStatus.summary.totalEquipment})`,
      },
      {
        status:
          jobStatus.summary.pmCompletionPercentage > 0
            ? "completed"
            : jobStatus.status === "processing" &&
              jobStatus.summary.processedEquipment ===
                jobStatus.summary.totalEquipment
            ? "active"
            : "pending",
        text: `Creating PM tasks (${jobStatus.summary.totalPMCreated}/${jobStatus.summary.totalPMExpected})`,
      },
      {
        status: jobStatus.status === "completed" ? "completed" : "pending",
        text: "Finalizing records",
      },
    ];

    return (
      <div className="space-y-4 mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Processing Steps
        </h4>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 mt-1 w-5 h-5 rounded-full flex items-center justify-center 
                ${
                  activity.status === "completed"
                    ? "bg-green-500 text-white"
                    : activity.status === "active"
                    ? "bg-blue-500 text-white animate-pulse"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {activity.status === "completed" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : activity.status === "active" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 animate-spin"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <div
                className={`text-sm ${
                  activity.status === "completed"
                    ? "text-gray-600"
                    : activity.status === "active"
                    ? "font-medium text-blue-600"
                    : "text-gray-400"
                }`}
              >
                {activity.text}
                {activity.status === "active" && jobStatus.currentActivity && (
                  <div className="text-xs text-gray-500 mt-1 animate-pulse">
                    Current: {jobStatus.currentActivity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-2">
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-4xl h-[470px] mx-auto">
        {/* Header */}
        <div className="p-5 border-b pb-2 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Equipment Bulk Upload
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Upload multiple equipment records at once
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center text-sm h-10 gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors self-start"
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
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Template
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="pt-0">
          {/* Tabs */}
          <div className="mb-4">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "upload"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                Upload
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "progress"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("progress")}
                disabled={!jobId}
              >
                Progress
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "results"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("results")}
                disabled={jobStatus.status !== "completed"}
              >
                Results
              </button>
            </div>
          </div>

          {/* Upload Tab */}
          {activeTab === "upload" && (
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
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}
              <div
                className={`relative border-2 border-dashed rounded-lg transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : file
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center py-4">
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-green-600"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{file.name}</span>
                        <button
                          className="h-6 w-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700"
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
                          <span className="sr-only">Remove file</span>
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
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
                      <p className="mb-2 text-sm text-center">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-center text-gray-500">
                        CSV or Excel files only (max 5MB)
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
                    disabled={isUploading}
                    className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 ${
                      isUploading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    !file || isUploading
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
                  Upload File
                </button>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <div className="space-y-6 h-[400px] px-4 overflow-y-auto py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800">
                    Upload Progress
                  </h3>
                  <span className="text-sm font-medium">
                    {jobStatus.status === "processing" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1 animate-spin"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : jobStatus.status === "completed" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Pending
                      </span>
                    )}
                  </span>
                </div>

                {jobStatus.status !== "idle" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Equipment Processed:{" "}
                          {jobStatus.summary.processedEquipment} /{" "}
                          {jobStatus.summary.totalEquipment}
                        </span>
                        <span className="text-gray-600">
                          {Math.round(
                            (jobStatus.summary.processedEquipment /
                              jobStatus.summary.totalEquipment) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (jobStatus.summary.processedEquipment /
                                jobStatus.summary.totalEquipment) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          PM Tasks Created: {jobStatus.summary.totalPMCreated} /{" "}
                          {jobStatus.summary.totalPMExpected}
                        </span>
                        <span className="text-gray-600">
                          {jobStatus.summary.pmCompletionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${jobStatus.summary.pmCompletionPercentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {renderActivityLog()}

                    {jobStatus.duration && (
                      <div className="text-sm text-gray-500 mt-4">
                        Processing completed in {jobStatus.duration}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Show real-time updates section */}
              {jobStatus.status === "processing" && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Real-time Updates
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {jobStatus.equipment.length > 0 ? (
                      <div className="space-y-2">
                        {jobStatus.equipment.slice(-5).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="truncate max-w-xs">
                              {item.serialnumber || `Equipment ${index + 1}`}
                            </span>
                            {renderStatusBadge(item.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Waiting for first records to process...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && jobStatus.status === "completed" && (
            <div className="space-y-6 h-[400px] px-2 overflow-y-auto py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Equipment Created
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {
                          jobStatus.equipment.filter(
                            (e) => e.status === "Created"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Equipment Updated
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {
                          jobStatus.equipment.filter(
                            (e) => e.status === "Updated"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        PM Tasks Created
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {jobStatus.summary.totalPMCreated}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Failed Records
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {
                          jobStatus.equipment.filter(
                            (e) => e.status === "Failed"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="bg-red-100 p-2 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Equipment Results
                </h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
                  {jobStatus.equipment.length > 0 ? (
                    jobStatus.equipment.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.serialnumber || "Unknown"}
                          </p>
                          {item.error && (
                            <p className="text-sm text-red-500 mt-1">
                              {item.error}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No equipment processed
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  PM Results
                </h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
                  {jobStatus.pm.length > 0 ? (
                    jobStatus.pm.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.serialnumber || "Unknown"} -{" "}
                            {item.pmType || "PM"}
                          </p>
                          {item.error && (
                            <p className="text-sm text-red-500 mt-1">
                              {item.error}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(item.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No PM tasks created
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
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
        {/* Footer */}
        <div className="p-3 pt-2 mt-2 border-t border-gray-200 bg-gray-100">
          <div className="flex flex-col items-start text-sm text-gray-500">
            <p className="font-medium">Notes:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: CSV, Excel (.xls, .xlsx)</li>
              <li>Processing large files may take several minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
