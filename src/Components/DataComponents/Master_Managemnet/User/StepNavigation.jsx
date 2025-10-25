"use client"

export default function StepNavigation({ currentStep, steps }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  step.id === currentStep
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110"
                    : step.id < currentStep
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    step.id === currentStep
                      ? "text-blue-600"
                      : step.id < currentStep
                        ? "text-green-600"
                        : "text-gray-500"
                  }`}
                >
                  {step.name}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Step Names */}
      <div className="sm:hidden mt-4 text-center">
        <p className="text-sm font-medium text-blue-600">{steps.find((s) => s.id === currentStep)?.name}</p>
      </div>
    </div>
  )
}
