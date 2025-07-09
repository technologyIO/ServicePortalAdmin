"use client";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [employeeid] = useState(location.state?.employeeid || "");
  const [email] = useState(location.state?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const inputRefs = useRef([]);

  // Timer for resend OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((timer) => timer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Set initial timer
  useEffect(() => {
    setResendTimer(60); // 60 seconds initial timer
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Clear errors when user starts typing
    if (formErrors.otp) {
      setFormErrors((prev) => ({ ...prev, otp: "" }));
    }

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }

    // Focus previous input on backspace
    if (!element.value && element.previousSibling) {
      element.previousSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    if (paste.length === 4 && /^\d+$/.test(paste)) {
      const newOtp = paste.split("");
      setOtp(newOtp);
      inputRefs.current[3].focus();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 4) {
      errors.otp = "Please enter complete 4-digit OTP";
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
    const enteredOtp = otp.join("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/verify-otp-pass`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeid,
            otp: enteredOtp,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP verified successfully!");
        navigate("/reset-password-otp", {
          state: { resetToken: data.resetToken },
        });
      } else {
        toast.error(`Error: ${data.message}`);
        // Clear OTP on error
        setOtp(["", "", "", ""]);
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // For resend OTP
  const handleResendOTP = async () => {
    setIsResending(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/collections/resend-otp`,
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
        toast.success(`New OTP sent to ${data.email || email}`);
        setResendTimer(60); // Reset timer
        setOtp(["", "", "", ""]); // Clear current OTP
        inputRefs.current[0].focus();
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      <span>Verifying...</span>
    </div>
  );

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Enhanced Header */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Logo Section */}

          {/* Form Section */}
          <div className="px-6 py-6">
            {/* Title and Description */}
            <div className="text-center mb-6">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Enter Verification Code
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We've sent a 4-digit verification code to
                {email && (
                  <span className="block font-medium text-blue-600 mt-1">
                    {email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}
                  </span>
                )}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block text-center">
                  Enter 4-Digit Code
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                      onPaste={handlePaste}
                      className={`w-14 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        formErrors.otp
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white"
                      } ${data ? "border-blue-400 bg-blue-50" : ""}`}
                      disabled={isLoading || isResending}
                    />
                  ))}
                </div>
                {formErrors.otp && (
                  <p className="text-red-500 text-xs text-center">
                    {formErrors.otp}
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 transform text-sm ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                }`}
                disabled={isLoading || isResending}
              >
                {isLoading ? <LoadingSpinner /> : "Verify OTP"}
              </button>
            </form>

            {/* Resend Section */}
            <div className="mt-6 text-center">
              {resendTimer > 0 ? (
                <div className="text-gray-500 text-sm">
                  <p>Didn't receive the code?</p>
                  <p className="font-medium mt-1">
                    Resend in{" "}
                    <span className="text-blue-600 font-bold">
                      {formatTimer(resendTimer)}
                    </span>
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleResendOTP}
                  className={`text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 mx-auto ${
                    isResending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isResending || isLoading}
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Help Section */}

            {/* Back Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 mx-auto"
                disabled={isLoading || isResending}
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
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(isLoading || isResending) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center space-y-3 shadow-2xl mx-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-700 font-medium text-sm">
              {isLoading ? "Verifying OTP..." : "Sending new code..."}
            </p>
            <p className="text-gray-500 text-xs text-center">
              {isLoading
                ? "Please wait while we verify your code"
                : "Please wait while we send a new code"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
