"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [employeeid, setEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!employeeid.trim()) {
      errors.employeeid = "Employee ID is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ employeeid }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP sent successfully!");
        // Navigate to OTP verification with employeeid
        navigate("/verify-otp", { state: { employeeid, email: data.email } });
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      <span>Sending OTP...</span>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Enhanced Header */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Logo Section */}

          {/* Form Section */}
          <div className="px-6 py-3">
            {/* Title and Description */}
            <div className="text-center mb-6">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Reset Your Password
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We'll send a 4-digit OTP to your registered email address. Enter
                your Employee ID below to get started.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Employee ID Input */}
              <div className="space-y-2">
                <label
                  htmlFor="employeeid"
                  className="text-sm font-medium text-gray-700 block"
                >
                  Employee ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="employeeid"
                    value={employeeid}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                      if (formErrors.employeeid) {
                        setFormErrors((prev) => ({ ...prev, employeeid: "" }));
                      }
                    }}
                    placeholder="Enter your Employee ID"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white text-sm ${
                      formErrors.employeeid
                        ? "border-red-300 focus:border-red-500"
                        : "border-transparent focus:border-blue-500"
                    }`}
                    disabled={isLoading}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                {formErrors.employeeid && (
                  <p className="text-red-500 text-xs">
                    {formErrors.employeeid}
                  </p>
                )}
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 transform text-sm ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                }`}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : "Send OTP"}
              </button>
            </form>
          </div>
          <div className="my-5 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 mx-auto"
              disabled={isLoading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center space-y-3 shadow-2xl mx-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-700 font-medium text-sm">Sending OTP...</p>
            <p className="text-gray-500 text-xs text-center">
              Please wait while we send the verification code
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
