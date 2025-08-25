import { FileSpreadsheet, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";

export default function FileUploadArea({ 
  file, 
  isDragging, 
  fileValidation, 
  handleDragOver, 
  handleDragLeave, 
  handleDrop, 
  handleFileChange, 
  setFile, 
  setFileValidation, 
  addLiveUpdate 
}) {
  return (
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
      <div className="flex flex-col items-center justify-center py-16 px-6">
        {file ? (
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <FileSpreadsheet size={32} className="text-green-600" />
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="font-semibold text-xl text-gray-900">{file.name}</span>
              <button
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setFile(null);
                  setFileValidation(null);
                  addLiveUpdate("File removed", "info");
                }}
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="text-gray-500 space-x-4">
              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <span>•</span>
              <span>{file.type || "Unknown type"}</span>
            </div>
            {fileValidation && fileValidation.isValid && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
                  <CheckCircle2 size={16} />
                  File Validated Successfully
                </div>
                <p className="text-xs text-green-600">
                  All {fileValidation.totalRequired} required columns found and mapped
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 mb-6">
              <Upload size={36} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Upload Equipment Data</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md leading-relaxed">
              Select or drag & drop your file. Our system supports multiple formats and will automatically map fields and generate PM tasks.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">.CSV</span>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">.XLSX</span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">.TSV</span>
              <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-medium">.JSON</span>
              <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-medium">.XML</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium">Max 500MB</span>
            </div>
          </>
        )}
      </div>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".csv,.xls,.xlsx,.tsv,.json,.xml"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer">
        <span className="sr-only">Upload file</span>
      </label>
    </div>
  );
}
