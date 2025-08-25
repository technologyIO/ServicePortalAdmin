// BulkUpload/ResultsTab.js
import { Plus, Edit, RefreshCw, Wrench, XCircle, Calendar, TrendingUp, Clock, Database, Activity } from "lucide-react";

export default function ResultsTab({ processingData, jobProgress }) {
  // Get the final summary data from the last API response
  const summary = processingData?.summary || jobProgress?.summary || {};
  
  // Use ONLY API response data - NO static fallbacks
  const totalCreated = jobProgress?.counts?.created || summary?.operationBreakdown?.created || 0;
  const totalUpdated = jobProgress?.counts?.updated || summary?.operationBreakdown?.updated || 0;
  const totalPMRegenerated = summary?.operationBreakdown?.pmRegenerated || 0;
  const totalFailed = jobProgress?.counts?.failed || summary?.operationBreakdown?.failed || 0;
  const totalPMCreated = jobProgress?.counts?.pmGenerated || summary?.totalPMCreated || 0;
  const totalPMExpected = summary?.totalPMExpected || 0;
  
  // Get breakdown data from API response only
  const pmTypeBreakdown = summary?.pmTypeBreakdown || {};
  const statusBreakdown = summary?.statusBreakdown || {};
  const performance = summary?.performance || {};
  
  // Get record counts from correct API response structure
  const totalRecords = jobProgress?.progress?.totalRecords || processingData?.totalRecords || 0;
  const processedRecords = jobProgress?.progress?.processedRecords || processingData?.processedRecords || 0;
  const duration = jobProgress?.timing?.duration || processingData?.duration || 0;
  
  return (
    <div className="space-y-8">
      {/* File Processing Summary */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Database size={24} />
          Processing Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-800">{totalRecords}</div>
            <div className="text-sm text-blue-600">Total Records</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-800">{processedRecords}</div>
            <div className="text-sm text-green-600">Processed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-800">{totalPMCreated}</div>
            <div className="text-sm text-purple-600">PM Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-800">{duration}s</div>
            <div className="text-sm text-orange-600">Duration</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Equipment Created</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{totalCreated}</p>
              <p className="text-xs text-green-600 mt-1">New records added</p>
            </div>
            <div className="bg-green-200 p-3 rounded-full">
              <Plus size={24} className="text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Equipment Updated</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{totalUpdated}</p>
              <p className="text-xs text-blue-600 mt-1">Existing records modified</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <Edit size={24} className="text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">PM Regenerated</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">{totalPMRegenerated}</p>
              <p className="text-xs text-purple-600 mt-1">PMs refreshed</p>
            </div>
            <div className="bg-purple-200 p-3 rounded-full">
              <RefreshCw size={24} className="text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">PM Tasks Created</p>
              <p className="text-3xl font-bold text-orange-800 mt-2">{totalPMCreated}</p>
              <p className="text-xs text-orange-600 mt-1">
                {totalPMExpected > 0 ? `${Math.round((totalPMCreated / totalPMExpected) * 100)}% success` : 
                 totalPMCreated > 0 ? '100% success' : 'No data'}
              </p>
            </div>
            <div className="bg-orange-200 p-3 rounded-full">
              <Wrench size={24} className="text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Failed Records</p>
              <p className="text-3xl font-bold text-red-800 mt-2">{totalFailed}</p>
              <p className="text-xs text-red-600 mt-1">Processing errors</p>
            </div>
            <div className="bg-red-200 p-3 rounded-full">
              <XCircle size={24} className="text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* PM Type Breakdown - Only show if data exists */}
      {Object.keys(pmTypeBreakdown).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Wrench size={20} />
            PM Type Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(pmTypeBreakdown).map(([type, count]) => (
              <div key={type} className="text-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-gray-800 mb-2">{count}</div>
                <div className="text-sm font-medium text-gray-600">{type}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {totalPMCreated > 0 ? `${Math.round((count / totalPMCreated) * 100)}%` : '0%'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Breakdown - Only show if data exists */}
      {Object.keys(statusBreakdown).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar size={20} />
            PM Status Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-b from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-yellow-800 mb-2">
                {statusBreakdown.Due || 0}
              </div>
              <div className="text-sm font-medium text-yellow-700">Due Tasks</div>
              <div className="text-xs text-yellow-600 mt-1">
                {totalPMCreated > 0 ? `${Math.round(((statusBreakdown.Due || 0) / totalPMCreated) * 100)}%` : '0%'}
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-b from-red-50 to-red-100 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-red-800 mb-2">
                {statusBreakdown.Overdue || 0}
              </div>
              <div className="text-sm font-medium text-red-700">Overdue Tasks</div>
              <div className="text-xs text-red-600 mt-1">
                {totalPMCreated > 0 ? `${Math.round(((statusBreakdown.Overdue || 0) / totalPMCreated) * 100)}%` : '0%'}
              </div>
            </div>
            <div className="text-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {statusBreakdown.Lapsed || 0}
              </div>
              <div className="text-sm font-medium text-gray-700">Lapsed Tasks</div>
              <div className="text-xs text-gray-600 mt-1">
                {totalPMCreated > 0 ? `${Math.round(((statusBreakdown.Lapsed || 0) / totalPMCreated) * 100)}%` : '0%'}
              </div>
            </div>
          </div>
        </div>
      )}

     

      {/* No Data Message */}
      {totalPMCreated === 0 && totalCreated === 0 && totalUpdated === 0 && totalPMRegenerated === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-yellow-600 mb-4">
            <Activity size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Processing Data Available</h3>
          <p className="text-yellow-700">
            Processing data will appear here once the bulk upload operation completes.
          </p>
        </div>
      )}

      {/* Processing Details */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4">Processing Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-indigo-700">File:</span>
            <span className="ml-2 text-indigo-600">
              {jobProgress?.fileInfo?.name || processingData?.fileName || 'N/A'} 
              ({jobProgress?.fileInfo?.size || 'Unknown size'})
            </span>
          </div>
          <div>
            <span className="font-medium text-indigo-700">Started:</span>
            <span className="ml-2 text-indigo-600">
              {jobProgress?.timing?.startTime ? new Date(jobProgress.timing.startTime).toLocaleString() : 
               processingData?.startTime ? new Date(processingData.startTime).toLocaleString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium text-indigo-700">Completed:</span>
            <span className="ml-2 text-indigo-600">
              {jobProgress?.timing?.endTime ? new Date(jobProgress.timing.endTime).toLocaleString() : 
               processingData?.endTime ? new Date(processingData.endTime).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
