import React from "react";

const steps = [
  { id: 1, name: "Role Information" },
  { id: 2, name: "User Details" },
  { id: 3, name: "Skills" },
  { id: 4, name: "Location Details" },
];

export default function StepNavigation({ currentStep }) {
  return (
    <nav className="flex items-center justify-center" aria-label="Progress">
      <ol className="flex items-center space-x-8 w-full">
        {steps.map((step) => (
          <li key={step.name} className="flex-1">
            {step.id < currentStep ? (
              <div className="group flex flex-col border-t-4 border-blue-700 pt-4 pb-2">
                <span className="text-sm font-medium text-blue-700">
                  {step.name}
                </span>
              </div>
            ) : step.id === currentStep ? (
              <div
                className="flex flex-col border-t-4 border-blue-700 pt-4 pb-2"
                aria-current="step"
              >
                <span className="text-sm font-medium text-blue-700">
                  {step.name}
                </span>
              </div>
            ) : (
              <div className="group flex flex-col border-t-4 border-gray-200 pt-4 pb-2">
                <span className="text-sm font-medium text-gray-500">
                  {step.name}
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}