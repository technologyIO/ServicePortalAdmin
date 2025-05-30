"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function PendingInstallationBulk({ closeModal, getData }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

  const [processingState, setProcessingState] = useState({
    status: "idle", // 'idle' | 'processing' | 'completed' | 'error'
    startTime: null,
    endTime: null,
    duration: null,
    totalRecords: 0,
    processedRecords: 0,
    successCount: 0,
    errorCount: 0,
    currentRecord: null,
    message: "Ready to upload",
    errors: [],
    summary: {
      totalRecords: 0,
      processed: 0,
      failed: 0,
      completionPercentage: 0
    }
  });

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

  const handleDownload = () => {
    const csvContent = `invoiceno,invoicedate,distchnl,customerid,material,description,serialnumber,salesdist,salesoff,currentcustomerid,mtl_grp4,key,status
9016032553,11-12-2022,2,111111,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E22GD0300,DS_KL,COK,1020882,1YR,,Active
9836025727,31-03-2025,1,111111,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E25GD0400,DN_DL,DEL,1049037,2YR,,Active`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "pending_installation_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFile(null);
    setIsUploading(false);
    setError(null);
    setProcessingState({
      status: "idle",
      startTime: null,
      endTime: null,
      duration: null,
      totalRecords: 0,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      currentRecord: null,
      message: "Ready to upload",
      errors: [],
      summary: {
        totalRecords: 0,
        processed: 0,
        failed: 0,
        completionPercentage: 0
      }
    });
    setActiveTab("upload");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    setActiveTab("results");

    // Initialize processing state
    setProcessingState({
      status: "processing",
      startTime: new Date(),
      endTime: null,
      duration: null,
      totalRecords: 0,
      processedRecords: 0,
      successCount: 0,
      errorCount: 0,
      currentRecord: null,
      message: "Starting file processing...",
      errors: [],
      summary: {
        totalRecords: 0,
        processed: 0,
        failed: 0,
        completionPercentage: 0
      }
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      let accumulatedData = "";
      
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/bulk/pendinginstallation/bulk-upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onDownloadProgress: (progressEvent) => {
            // Handle streaming response
            const chunk = progressEvent.event.target.responseText;
            accumulatedData += chunk;
            
            // Split by newlines and process each complete JSON object
            const lines = accumulatedData.split('\n');
            
            // Process all complete lines (leave incomplete one in buffer)
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (line) {
                try {
                  const data = JSON.parse(line);
                  updateProcessingState(data);
                } catch (e) {
                  console.error("Error parsing progress update:", e);
                }
              }
            }
            
            // Keep the last (potentially incomplete) line for next chunk
            accumulatedData = lines[lines.length - 1];
          },
        }
      );

      // Final update with completed status
      if (response.data) {
        updateProcessingState({
          ...response.data,
          status: "completed",
          endTime: new Date(),
          duration: `${((new Date() - new Date(response.data.startTime)) / 1000).toFixed(2)}s`
        });
      }

      if (response.data?.errors?.length > 0) {
        toast.error(
          `Process completed with ${response.data.errors.length} errors`
        );
      } else {
        toast.success("All records processed successfully!");
        getData();
      }
    } catch (err) {
      console.error("Upload error:", err);
      
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "An error occurred during upload";
      
      toast.error(errorMessage);
      setError(errorMessage);
      
      setProcessingState(prev => ({
        ...prev,
        status: "error",
        endTime: new Date(),
        duration: `${((new Date() - prev.startTime) / 1000).toFixed(2)}s`,
        message: "Processing failed",
        errors: [...prev.errors, { error: errorMessage }]
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const updateProcessingState = (data) => {
    setProcessingState(prev => {
      const newState = {
        ...prev,
        ...data,
        summary: {
          totalRecords: data.totalRecords || prev.summary.totalRecords,
          processed: data.processedRecords || prev.summary.processed,
          failed: data.errorCount || prev.summary.failed,
          completionPercentage: data.totalRecords > 0 
            ? Math.round(((data.processedRecords || 0) / data.totalRecords) * 100)
            : prev.summary.completionPercentage
        }
      };
      
      // Update message if not provided in the data
      if (!data.message) {
        if (data.status === "processing") {
          newState.message = `Processing ${data.processedRecords || 0} of ${data.totalRecords || '?'} records`;
        } else if (data.status === "completed") {
          newState.message = `Completed processing ${data.processedRecords || 0} records`;
        }
      }
      
      return newState;
    });
  };

  const CircularProgressBar = ({ percentage }) => {
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24" viewBox="0 0 100 100">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className="text-blue-600 transition-all duration-300 ease-in-out"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="absolute text-xl font-bold text-blue-700">
          {percentage}%
        </span>
      </div>
    );
  };

  const renderResultsTab = () => {
    if (processingState.status === "idle") {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
          <p className="text-gray-500">Upload a file to see processing results</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-10 h-[370px] overflow-y-auto">
        {processingState.status === "processing" && (
          <div className="flex flex-col items-center justify-center py-8">
            <CircularProgressBar percentage={processingState.summary.completionPercentage} />
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
              Processing Pending Installations
            </h3>
            <p className="text-gray-600 mb-1">
              {processingState.message}
            </p>
            {processingState.currentRecord && (
              <p className="text-sm text-gray-500 mb-4">
                Current: {processingState.currentRecord.serialnumber || 'N/A'}
              </p>
            )}
            <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${processingState.summary.completionPercentage}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 w-full max-w-md">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-800">Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {processingState.summary.totalRecords}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800">Processed</p>
                <p className="text-xl font-bold text-green-900">
                  {processingState.summary.processed}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm text-red-800">Failed</p>
                <p className="text-xl font-bold text-red-900">
                  {processingState.summary.failed}
                </p>
              </div>
            </div>
          </div>
        )}

        {processingState.status === "completed" && (
          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-green-800">Processing Completed</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Successfully processed {processingState.summary.processed} of {processingState.summary.totalRecords} records in {processingState.duration}.
                    {processingState.summary.failed > 0 && (
                      <span> {processingState.summary.failed} records failed.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-500">Total Records</h4>
                  <span className="text-2xl font-bold text-gray-800">
                    {processingState.summary.totalRecords}
                  </span>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-500">Success</h4>
                  <span className="text-2xl font-bold text-green-600">
                    {processingState.summary.processed}
                  </span>
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-500">Failed</h4>
                  <span className="text-2xl font-bold text-red-600">
                    {processingState.summary.failed}
                  </span>
                </div>
              </div>
            </div>

            {processingState.errors.length > 0 && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                  <h4 className="font-medium text-gray-800">Error Details</h4>
                </div>
                <div className="overflow-y-auto max-h-60">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {processingState.errors.slice(0, 10).map((error, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {error.serialnumber || error.record || 'N/A'}
                          </td>
                          <td className="px-4 py-2 whitespace-normal text-sm text-red-600">
                            {error.error || error.message || 'Unknown error'}
                          </td>
                        </tr>
                      ))}
                      {processingState.errors.length > 10 && (
                        <tr>
                          <td colSpan="2" className="px-4 py-2 text-center text-sm text-gray-500">
                            + {processingState.errors.length - 10} more errors
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {processingState.status === "error" && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Processing Failed</h3>
                <p className="text-sm text-red-700 mt-1">
                  {processingState.message}
                </p>
                {processingState.duration && (
                  <p className="text-xs text-red-600 mt-1">
                    Duration: {processingState.duration}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-xl h-[470px] overflow-hidden w-full max-w-4xl mx-auto">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Pending Installation Bulk Upload
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Upload pending installation records from a CSV or Excel file.
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

        <div className="p-5 pt-0">
          <div className="mb-4">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "upload"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("upload")}
                disabled={isUploading}
              >
                Upload
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "results"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("results")}
              >
                Results
                {processingState.errorCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-4 text-white bg-red-500 rounded-full">
                    {processingState.errorCount}
                  </span>
                )}
              </button>
            </div>
          </div>

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
                      isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
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
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
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
                      Processing...
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === "results" && renderResultsTab()}
        </div>
      </div>
    </div>
  );
}

export default PendingInstallationBulk;