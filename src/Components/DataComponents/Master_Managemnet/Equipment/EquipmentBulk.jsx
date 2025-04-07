import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EquipmentBulk() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [result, setResult] = useState(null);

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
      // 5MB limit
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
    setProgress(0);
    setError(null);
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/bulk/equipment/bulk-upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          },
        }
      );
  
      setResult(response.data);
      setActiveTab("results");
  
      // Check if any result has status "Failed"
      const failedResult = response.data.results.find(item => item.status === "Failed");
      if (failedResult) {
        toast.error(failedResult.error || "One or more uploads failed.");
      }
  
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload. Please try again.");
      setError("An error occurred during upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  

  const csvContent = `name,materialdescription,serialnumber,materialcode,status,currentcustomer,endcustomer,custWarrantystartdate,custWarrantyenddate,dealerwarrantystartdate,dealerwarrantyenddate,dealer,palnumber,installationreportno
Equipment A,"High quality equipment for industrial use",SN-A-001,MC-A-100,Active,Customer X,Customer Y,2025-01-01,2025-12-31,2024-12-01,2025-06-30,Dealer A,PAL-001,IR-001
Equipment B,"Light duty equipment for daily operations",SN-B-002,MC-B-200,Inactive,Customer Y,Customer Z,2024-05-01,2025-04-30,2024-04-15,2024-10-15,Dealer B,PAL-002,IR-002
Equipment C,"Heavy duty industrial equipment",SN-C-003,MC-C-300,Active,Customer Z,Customer A,2025-02-01,2026-01-31,2025-01-15,2025-07-15,Dealer C,PAL-003,IR-003
Equipment D,"Portable equipment for outdoor usage",SN-D-004,MC-D-400,Maintenance,Customer A,Customer B,2025-03-01,2026-02-28,2025-02-15,2025-08-15,Dealer D,PAL-004,IR-004
Equipment E,"High performance equipment",SN-E-005,MC-E-500,Active,Customer B,Customer C,2025-04-01,2026-03-31,2025-03-15,2025-09-15,Dealer E,PAL-005,IR-005
Equipment F,"Standard equipment for mid-level operations",SN-F-006,MC-F-600,Inactive,Customer C,Customer D,2024-07-01,2025-06-30,2024-06-15,2024-12-15,Dealer F,PAL-006,IR-006
Equipment G,"Versatile equipment for various tasks",SN-G-007,MC-G-700,Active,Customer D,Customer E,2025-05-01,2026-04-30,2025-04-15,2025-10-15,Dealer G,PAL-007,IR-007
Equipment H,"Robust equipment for heavy operations",SN-H-008,MC-H-800,Active,Customer E,Customer F,2025-06-01,2026-05-31,2025-05-15,2025-11-15,Dealer H,PAL-008,IR-008
Equipment I,"Eco-friendly equipment",SN-I-009,MC-I-900,Active,Customer F,Customer G,2025-07-01,2026-06-30,2025-06-15,2025-12-15,Dealer I,PAL-009,IR-009
Equipment J,"Next-gen equipment with advanced features",SN-J-010,MC-J-1000,Active,Customer G,Customer H,2025-08-01,2026-07-31,2025-07-15,2026-01-15,Dealer J,PAL-010,IR-010`;

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
    setResult(null);
    setError(null);
    setActiveTab("upload");
  };

  return (
    <div className="container mx-auto px-2">
      {/* Card container */}
      <div className="bg-white rounded-xl   overflow-hidden w-full max-w-4xl h-[470px]   mx-auto  ">
        {/* Card header */}
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
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "results"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("results")}
                disabled={!result}
              >
                Results
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
                className={`relative border-2 border-dashed rounded-lg  transition-colors ${
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

              {/* Progress bar */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

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

          {/* Results tab content */}
          {activeTab === "results" && result && (
            <div className="space-y-6 h-[400px] overflow-y-auto py-4">
              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">
                      Total Records
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">
                      {result.total}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">
                      Processed
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">
                      {result.processed}
                    </p>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-gray-200 w-full"></div>

              {/* Results list */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Processing Results
                </h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {(result?.results || []).map((item, index) => (
                    <div
                      key={index}
                      className="p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.serialnumber}
                        </p>
                        {item.message && (
                          <p className="text-sm text-gray-500">
                            {item.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "Created" ? (
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
                            className="text-green-500"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                        ) : (
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
                            className="text-red-500"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        )}
                        <span
                          className={
                            item.status === "Created"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action button */}
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

        {/* Card footer */}
        <div className="p-3 pt-2 border-t border-gray-200 bg-gray-100">
          <div className="flex flex-col items-start text-sm text-gray-500">
            <p className="font-medium">Notes:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: CSV, Excel (.xls, .xlsx)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
