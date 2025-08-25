import { Activity, RefreshCw } from "lucide-react";

export default function LiveUpdates({ liveUpdates, isProcessing, jobProgress }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Activity size={16} />
                Live Processing Updates
                {isProcessing && (
                    <div className="ml-auto flex items-center gap-2">
                        <RefreshCw size={12} className="animate-spin text-blue-500" />
                        <span className="text-xs text-blue-500">Live</span>
                    </div>
                )}
            </h4>

            {/* Progress Summary */}
            {jobProgress?.progress && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-800">Current Status</span>
                        <span className="text-xs text-blue-600">{jobProgress.progress.percentage}%</span>
                    </div>
                    <div className="text-sm text-blue-700 mb-2">
                        {jobProgress.progress.currentOperation}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-blue-600">Records:</span>
                            <span className="ml-1 font-medium">
                                {jobProgress.progress.processedRecords}/{jobProgress.progress.totalRecords}
                            </span>
                        </div>
                        <div>
                            <span className="text-blue-600">PM Created:</span>
                            <span className="ml-1 font-medium">{jobProgress.counts?.pmGenerated || 0}</span>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${jobProgress.progress.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Real-time Statistics Cards */}
            {jobProgress?.progress && (
                <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className="p-2 bg-green-50 rounded border border-green-200 text-center">
                        <div className="text-lg font-bold text-green-700">
                            {jobProgress.progress.processedRecords || 0}
                        </div>
                        <div className="text-xs text-green-600">Processed</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded border border-purple-200 text-center">
                        <div className="text-lg font-bold text-purple-700">
                            {jobProgress.counts?.pmGenerated || 0}
                        </div>
                        <div className="text-xs text-purple-600">PM Tasks</div>
                    </div>
                </div>
            )}

            {/* Timing Information */}
            {jobProgress?.timing && (
                <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>
                            <strong>Elapsed:</strong> {jobProgress.timing.elapsedTime}s
                        </span>
                        <span>
                            <strong>Status:</strong> {jobProgress.status}
                        </span>
                    </div>
                    {jobProgress.timing.duration && (
                        <div className="text-xs text-gray-600 mt-1">
                            <strong>Total Duration:</strong> {jobProgress.timing.duration}s
                        </div>
                    )}
                </div>
            )}

            {/* Live Updates List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {liveUpdates.length > 0 ? (
                    liveUpdates.map((update) => (
                        <div
                            key={update.id}
                            className={`flex items-start space-x-2 p-2 rounded text-xs ${
                                update.type === "success"
                                    ? "bg-green-50 text-green-700 border-l-2 border-green-500"
                                    : update.type === "error"
                                    ? "bg-red-50 text-red-700 border-l-2 border-red-500"
                                    : update.type === "warning"
                                    ? "bg-yellow-50 text-yellow-700 border-l-2 border-yellow-500"
                                    : "bg-gray-50 text-gray-700 border-l-2 border-gray-500"
                            }`}
                        >
                            <span className="text-gray-500 font-mono text-xs">
                                {update.timestamp}
                            </span>
                            <span className="flex-1">{update.message}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-xs text-gray-500 text-center py-4">
                        {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                                <RefreshCw size={12} className="animate-spin" />
                                Waiting for processing updates...
                            </div>
                        ) : (
                            "No updates yet. Processing will start shortly..."
                        )}
                    </div>
                )}
            </div>

            {/* Footer Status */}
            {jobProgress && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                            Job ID: {jobProgress.jobId || 'Unknown'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            jobProgress.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-700' 
                                : jobProgress.status === 'PROCESSING' 
                                ? 'bg-blue-100 text-blue-700' 
                                : jobProgress.status === 'FAILED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                            {jobProgress.status}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
