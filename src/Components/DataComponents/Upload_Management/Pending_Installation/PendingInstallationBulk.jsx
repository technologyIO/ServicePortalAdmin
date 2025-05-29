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

  // States for processing progress
  const [processingState, setProcessingState] = useState({
    status: "idle", // 'idle' | 'processing' | 'completed' | 'error'
    current: 0,
    total: 0,
    percentage: 0,
    processed: 0,
    failed: 0,
    currentRecord: null,
    message: "",
    insertionResults: [],
    errors: [],
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

  // Pending Installation sample CSV content
  const csvContent = `invoiceno,invoicedate,distchnl,customerid,customername1,customername2,customercity,customerpostalcode,material,description,serialnumber,salesdist,salesoff,customercountry,customerregion,currentcustomerid,currentcustomername1,currentcustomername2,currentcustomercity,currentcustomerregion,currentcustomerpostalcode,currentcustomercountry,mtl_grp4,key,status
9016032553,11-12-2022,2,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E22GD0300,DS_KL,COK,,,1020882,,,,,,,1YR,,Active
9836025727,31-03-2025,1,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E25GD0400,DN_DL,DEL,,,1049037,,,,,,,2YR,,Active
9016028833,03-11-2020,2,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E20GB0168,SOUTH3,COK,,,1046504,,,,,,,1YR,,Active
9016028820,31-10-2020,2,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E20GB0164,EAST,GAU,,,1010245,,,,,,,1YR,,Active
9216007774,30-11-2021,2,111111,,,,,3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E21GB0128,DN_DL,DEL,,,1009488,,,,,,,2YR,,Active
9016032557,13-12-2022,2,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E22GD0301,DN_DL,DEL,,,1010028,,,,,,,1YR,,Active
9016029365,17-02-2021,2,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E20GB0148,EAST,GAU,,,1020156,,,,,,,1YR,,Active
9016033014,31-05-2023,2,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E23GD0329,DN_UP,LKO,,,1021702,,,,,,,2YR,,Active
9016034679,21-05-2025,5,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E25GD0407,DN_PB,CHD,,,1056275,,,,,,,2YR,,Active
9016034680,21-05-2025,2,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E25GD0408,DS_KA,BLR,,,1053507,,,,,,,2YR,,Active
9016034251,30-11-2024,2,111111,,,,,F3-05-390-0142-14,Surgiskan 100 with Re-Usable Pat. Plate,E24GD0390,DN_UP,LKO,,,1021702,,,,,,,2YR,,Active
9016033953,05-07-2024,1,111111,,,,,F3-86-390-0999-24,TruSkan S500 ER2TNS+CO2,H24GK6353,D_CORP,BLR,,,1051426,,,,,,,1YR,1478898624,Active
9016034554,25-03-2025,2,111111,,,,,F3-86-390-0999-24,TruSkan S500 ER2TNS+CO2,H25GM6794,DN_DL,DEL,,,1009488,,,,,,,2YR,1154072537,Active
9016034554,25-03-2025,2,111111,,,,,F3-86-390-0999-24,TruSkan S500 ER2TNS+CO2,H25GM6802,DN_DL,DEL,,,1009488,,,,,,,2YR,1999955610,Active`;

  const handleDownload = () => {
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
      current: 0,
      total: 0,
      percentage: 0,
      processed: 0,
      failed: 0,
      currentRecord: null,
      message: "",
      insertionResults: [],
      errors: [],
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

    // Reset processing state
    setProcessingState({
      status: "processing",
      current: 0,
      total: 0,
      percentage: 0,
      processed: 0,
      failed: 0,
      currentRecord: null,
      message: "Starting upload...",
      insertionResults: [],
      errors: [],
    });

    setActiveTab("results");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/bulk/pendinginstallation/bulk-upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onDownloadProgress: (progressEvent) => {
            // Handle streaming response
            const responseText = progressEvent.event.target.responseText;
            const lines = responseText.trim().split("\n");

            // Process each line (each progress update)
            lines.forEach((line) => {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  setProcessingState((prev) => ({
                    ...prev,
                    status: data.status,
                    current: data.current || prev.current,
                    total: data.total || prev.total,
                    percentage: data.percentage || prev.percentage,
                    processed: data.processed || prev.processed,
                    failed: data.failed || prev.failed,
                    currentRecord: data.currentRecord || prev.currentRecord,
                    message: data.message || prev.message,
                    insertionResults:
                      data.insertionResults || prev.insertionResults,
                    errors: data.errors || prev.errors,
                  }));
                } catch (e) {
                  console.error("Error parsing progress update:", e);
                }
              }
            });
          },
        }
      );

      // Final completion (in case the streaming didn't already update the state)
      if (response.data) {
        setProcessingState((prev) => ({
          ...prev,
          status: "completed",
          total: response.data.totalRecords,
          processed: response.data.processed,
          failed: response.data.errors?.length || 0,
          insertionResults: response.data.insertionResults || [],
          errors: response.data.errors || [],
          message: `Completed processing ${response.data.processed} records`,
        }));
      }

      if (response.data?.errors && response.data.errors.length > 0) {
        toast.error(
          `Processed with ${response.data.errors.length} errors. Check the Results tab for details.`
        );
      } else {
        toast.success("All records processed successfully!");
        closeModal();
        getData();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during upload. Please try again.");
      setError(
        err.response?.data?.message ||
          "An error occurred during upload. Please try again."
      );
      setProcessingState((prev) => ({
        ...prev,
        status: "error",
        message: "Error during processing",
      }));
    } finally {
      setIsUploading(false);
    }
  };

  // Function to render the circular progress indicator
  const CircularProgressBar = ({ percentage }) => {
    const circumference = 2 * Math.PI * 40; // r = 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
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
                disabled={processingState.status === "processing"}
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
                disabled={processingState.status === "idle"}
              >
                Results
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

              {isUploading && (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="flex items-center justify-center mb-4">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-600"
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
                  </div>
                  <p className="text-blue-700 font-medium">Uploading file...</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {file && (
                  <button
                    onClick={resetForm}
                    disabled={
                      isUploading || processingState.status === "processing"
                    }
                    className={`px-4 py-2 border border-gray-300 rounded-lg text-gray-700 ${
                      isUploading || processingState.status === "processing"
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={handleUpload}
                  disabled={
                    !file ||
                    isUploading ||
                    processingState.status === "processing"
                  }
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    !file ||
                    isUploading ||
                    processingState.status === "processing"
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

          {activeTab === "results" && (
            <div className="space-y-6 pb-10 h-[370px] overflow-y-auto">
              {processingState.status === "processing" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <CircularProgressBar
                    percentage={processingState.percentage}
                  />
                  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
                    Creating Pending Installations
                  </h3>
                  <p className="text-gray-600 mb-1">
                    {processingState.message}
                  </p>
                  {processingState.currentRecord && (
                    <p className="text-sm text-gray-500 mb-4">
                      Current: {processingState.currentRecord.serialnumber}{" "}
                      (Invoice: {processingState.currentRecord.invoiceno})
                    </p>
                  )}
                  <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${processingState.percentage}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-md">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">Created</p>
                      <p className="text-xl font-bold text-blue-900">
                        {processingState.processed}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-800">Failed</p>
                      <p className="text-xl font-bold text-red-900">
                        {processingState.failed}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PendingInstallationBulk;
