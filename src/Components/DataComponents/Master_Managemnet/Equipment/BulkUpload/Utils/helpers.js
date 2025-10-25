// BulkUpload/Utils/helpers.js
export const renderStatusBadge = (status) => {
  const statusMap = {
    Created: { bg: "bg-green-100", text: "text-green-800", label: "Created", icon: "✓" },
    Updated: { bg: "bg-blue-100", text: "text-blue-800", label: "Updated", icon: "↻" },
    Failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed", icon: "✕" },
    PM_Regenerated: { bg: "bg-purple-100", text: "text-purple-800", label: "PM Regenerated", icon: "🔄" },
    pmregenerated: { bg: "bg-purple-100", text: "text-purple-800", label: "PM Regenerated", icon: "🔄" },
    Due: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Due", icon: "⏰" },
    Overdue: { bg: "bg-red-100", text: "text-red-800", label: "Overdue", icon: "⚠" },
    Lapsed: { bg: "bg-gray-100", text: "text-gray-800", label: "Lapsed", icon: "🔒" },
    Completed: { bg: "bg-purple-100", text: "text-purple-800", label: "Completed", icon: "✓" },
    Success: { bg: "bg-green-100", text: "text-green-800", label: "Success", icon: "✓" },
    Processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Processing", icon: "⟳" },
    Skipped: { bg: "bg-gray-100", text: "text-gray-800", label: "Skipped", icon: "⏭" },
  };

  const config = statusMap[status] || {
    bg: "bg-gray-100", text: "text-gray-800", label: status || "Unknown", icon: "?",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

 
export const getProcessingSteps = (processingData, jobProgress) => {
  // Get data from the correct sources based on your API structure
  const totalRecords = jobProgress?.totalRecords || processingData?.totalRecords || 0;
  const processedRecords = jobProgress?.processedRecords || processingData?.processedRecords || 0;
  
  // Fix: Get counts from the correct API response structure
  const createdCount = jobProgress?.counts?.created || processingData?.summary?.operationBreakdown?.created || 0;
  const updatedCount = jobProgress?.counts?.updated || processingData?.summary?.operationBreakdown?.updated || 0;
  const pmGeneratedCount = jobProgress?.counts?.pmGenerated || processingData?.summary?.totalPMCreated || 0;
  const pmRegeneratedCount = processingData?.summary?.operationBreakdown?.pmRegenerated || 0;

  return [
    {
      id: 1,
      title: "File Validation & Parsing",
      description: `Parsed ${processingData?.fileName || jobProgress?.fileInfo?.name || 'file'} (${processingData?.fileType || 'XLSX'}) - ${processingData?.summary?.performance?.parseTime || 0}ms`,
      status: processingData?.status !== "idle" ? "completed" : "pending",
    },
    {
      id: 2,
      title: "Data Validation & Processing", 
      description: `${processedRecords}/${totalRecords} records validated - ${processingData?.summary?.performance?.validationTime || 0}ms`,
      status: processedRecords > 0 
        ? processedRecords === totalRecords ? "completed" : "active"
        : jobProgress?.progress?.percentage >= 30 ? "active" : "pending",
    },
    {
      id: 3,
      title: "Equipment Database Operations",
      description: `${createdCount} created, ${updatedCount} updated, ${pmRegeneratedCount} PM regenerated - ${processingData?.summary?.performance?.equipmentProcessTime || 0}ms`,
      status: (createdCount > 0 || updatedCount > 0 || pmRegeneratedCount > 0)
        ? "completed" 
        : jobProgress?.progress?.percentage >= 60 ? "active" : "pending",
    },
    {
      id: 4,
      title: "PM Task Generation & Database Commit",
      description: `${pmGeneratedCount}/${processingData?.summary?.totalPMExpected || 0} PM tasks created - ${processingData?.summary?.performance?.pmProcessTime || 0}ms`,
      status: jobProgress?.status === "COMPLETED" || processingData?.status === "completed" ? "completed" : 
              jobProgress?.progress?.percentage >= 75 ? "active" : "pending",
    },
  ];
};

