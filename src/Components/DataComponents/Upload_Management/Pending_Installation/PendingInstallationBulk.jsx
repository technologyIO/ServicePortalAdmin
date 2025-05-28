import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function PendingInstallationBulk() {
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
        `${process.env.REACT_APP_BASE_URL}/bulk/pendinginstallation/bulk-upload`,
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

      if (response.data.errors && response.data.errors.length > 0) {
        toast.error("Some records failed to upload. Check the Results tab for details.");
      } else {
        toast.success("All records uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during upload. Please try again.");
      setError(err.response?.data?.message || "An error occurred during upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
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
    setProgress(0);
    setResult(null);
    setError(null);
    setActiveTab("upload");
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

          {activeTab === "results" && result && (
            <div className="space-y-6 h-[370px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">
                      Total Records
                    </p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">
                      {result.totalRecords}
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

              <div className="h-px bg-gray-200 w-full"></div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Upload Results
                </h3>
                {result.errors && result.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-red-600 mb-2">
                      Errors ({result.errors.length})
                    </h4>
                    <div className="border border-red-200 rounded-lg divide-y divide-red-200 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="p-3">
                          <p className="font-medium text-red-800">
                            {error.record} (SN: {error.serialnumber})
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            {error.error}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {result.insertionResults.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.serialnumber}
                        </p>
                        {item.error && (
                          <p className="text-sm text-red-600">{item.error}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "Processed" ? (
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
                            item.status === "Processed"
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
            </div>
          )}
        </div>

        <div className="p-3 pt-2 border-t border-gray-200 bg-gray-100">
          <div className="flex flex-col items-start text-sm text-gray-500">
            <p className="font-medium">Notes:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: CSV, Excel (.xls, .xlsx)</li>
              <li>Required fields: Invoice No, Invoice Date, DistChnl, Customer id, Material, Description, Serial No, SalesDist, SalesOff, Current Customer id, Mtl.Grp4</li>
              <li>Empty values are allowed for optional fields</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingInstallationBulk;