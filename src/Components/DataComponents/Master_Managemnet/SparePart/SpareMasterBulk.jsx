"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { EventSourcePolyfill } from "event-source-polyfill";

function SpareMasterBulk({ getData, closeModal }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [result, setResult] = useState(null);

  // Progress modal states
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressData, setProgressData] = useState({
    processed: 0,
    total: 0,
    currentStatus: "",
    created: 0,
    updated: 0,
    failed: 0,
  });
  const [latestRecord, setLatestRecord] = useState(null);
  const [eventSource, setEventSource] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
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
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    setShowProgressModal(true);
    setProgressData({
      processed: 0,
      total: 0,
      currentStatus: "Starting upload...",
      created: 0,
      updated: 0,
      failed: 0,
    });
    setLatestRecord(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Close any existing event source
      if (eventSource) {
        eventSource.close();
      }

      // Create new EventSource connection
      const es = new EventSourcePolyfill(
        `${process.env.REACT_APP_BASE_URL}/bulk/sparemaster/bulk-upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "text/event-stream",
          },
        }
      );

      setEventSource(es);

      es.onopen = () => {
        console.log("Connection to server opened");
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received SSE data:", data);

          if (data.type === "init") {
            setProgressData((prev) => ({
              ...prev,
              total: data.data.totalRecords,
              currentStatus: data.data.message,
            }));
          } else if (data.type === "progress") {
            setProgressData((prev) => ({
              ...prev,
              processed: data.data.processed,
              total: data.data.total,
              currentStatus: data.data.currentStatus,
              updated: prev.updated + (data.data.latestRecord.status === "updated" ? 1 : 0),
            }));
            setLatestRecord(data.data.latestRecord);
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      es.onerror = (error) => {
        console.error("EventSource error:", error);
        if (es.readyState === EventSource.CLOSED) {
          console.log("Connection was closed");
          setIsUploading(false);
          toast.success("Upload completed successfully!");
        } else {
          setError("An error occurred during upload. Please try again.");
          setIsUploading(false);
          toast.error("Upload failed!");
        }
        es.close();
      };

    } catch (err) {
      console.error("Upload error:", err);
      toast.error("An error occurred during upload setup. Please try again.");
      setError("An error occurred during upload setup. Please try again.");
      setShowProgressModal(false);
      setIsUploading(false);
    }
  };

  // SpareMaster sample CSV content (5 rows)
  const csvContent = `Sub_grp,PartNumber,Description,Type,Rate,DP,Charges,spareiamegUrl
Electronics,SP-001,Smartphone Battery,Accessory,250,200,50,https://example.com/image1.jpg
Electronics,SP-002,Tablet Screen,Accessory,500,400,100,https://example.com/image2.jpg
Appliances,SP-003,Vacuum Filter,Accessory,150,120,30,https://example.com/image3.jpg
Furniture,SP-004,Office Chair Cushion,Accessory,75,60,15,https://example.com/image4.jpg
Electronics,SP-005,Wireless Charger,Accessory,300,250,50,https://example.com/image5.jpg`;

  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sparemaster_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setActiveTab("upload");
    setProgressData({
      processed: 0,
      total: 0,
      currentStatus: "",
      created: 0,
      updated: 0,
      failed: 0,
    });
    setLatestRecord(null);
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  const closeProgressModal = () => {
    if (!isUploading) {
      setShowProgressModal(false);
    }
  };

  return (
    <div className="container mx-auto px-2">
      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Upload Progress
              </h3>
              {!isUploading && (
                <button
                  onClick={closeProgressModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing Records</span>
                <span>
                  {progressData.processed} / {progressData.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width:
                      progressData.total > 0
                        ? `${(progressData.processed / progressData.total) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {progressData.currentStatus}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {progressData.created}
                </div>
                <div className="text-xs text-gray-500">Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {progressData.updated}
                </div>
                <div className="text-xs text-gray-500">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {progressData.failed}
                </div>
                <div className="text-xs text-gray-500">Failed</div>
              </div>
            </div>

            {/* Latest Record */}
            {latestRecord && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-800 mb-1">
                  Latest Record:
                </div>
                <div className="text-sm text-gray-600">
                  <div>Part Number: {latestRecord.partNumber}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span>Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        latestRecord.status === "created"
                          ? "bg-green-100 text-green-800"
                          : latestRecord.status === "updated"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {latestRecord.status}
                    </span>
                  </div>
                  {latestRecord.message && (
                    <div className="mt-1 text-xs text-gray-500">
                      {latestRecord.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading Spinner */}
            {isUploading && (
              <div className="flex justify-center mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Completion Message */}
            {!isUploading && progressData.processed === progressData.total && progressData.total > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-green-800 text-sm">
                <div className="flex items-center gap-2">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Upload completed successfully!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of your component remains the same */}
      {/* Card container */}
      <div className="bg-white rounded-xl overflow-hidden w-full max-w-4xl mx-auto">
        {/* Card header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Spare Master Bulk Upload
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                This will update existing Spare Master records (based on unique
                PartNumber) and add new ones.
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

        {/* Card content */}
        <div className="p-5 pt-0">
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
            </div>
          </div>

          {/* Upload tab content */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              {/* Error alert */}
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

              {/* File upload area */}
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

              {/* Action buttons */}
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
        </div>
      </div>
    </div>
  );
}

export default SpareMasterBulk;