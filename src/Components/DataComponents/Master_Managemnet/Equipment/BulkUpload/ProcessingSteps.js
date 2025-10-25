// BulkUpload/ProcessingSteps.js
import { CheckCircle2, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { getProcessingSteps } from "./Utils/helpers";

export default function ProcessingSteps({ processingData, jobProgress }) {
  const steps = getProcessingSteps(processingData, jobProgress);
  
  const getStepIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "active":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepBgColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "active":
        return "bg-blue-50 border-blue-200";
      case "failed":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Processing Status</h3>
      
      {/* Progress Bar */}
      {jobProgress?.progressPercentage !== undefined && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-blue-600">{jobProgress.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${jobProgress.progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className={`p-4 rounded-lg border ${getStepBgColor(step.status)}`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                  <span className="text-xs text-gray-500">Step {index + 1}</span>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
                
                {/* Current operation for active step */}
                {step.status === "active" && jobProgress?.currentOperation && (
                  <div className="mt-2 text-xs text-blue-600 italic">
                    {jobProgress.currentOperation}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
