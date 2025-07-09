"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    oldPassword: "",
    newPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const toggleOldPasswordVisibility = () =>
    setShowOldPassword(!showOldPassword);
  const toggleNewPasswordVisibility = () =>
    setShowNewPassword(!showNewPassword);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required";
    }
    if (!formData.oldPassword.trim()) {
      errors.oldPassword = "Current password is required";
    }
    if (!formData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }
    if (
      formData.oldPassword === formData.newPassword &&
      formData.oldPassword.trim()
    ) {
      errors.newPassword =
        "New password must be different from current password";
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
        `${process.env.REACT_APP_BASE_URL}/collections/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeid: formData.employeeId,
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully!");
        // Clear form
        setFormData({ employeeId: "", oldPassword: "", newPassword: "" });
        navigate("/login");
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      <span>Resetting...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Enhanced Header */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Logo Section */}

          {/* Form Section */}
          <div className="px-6 py-6">
            {/* Title and Description */}
            <div className="text-center mb-6">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
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
                Reset Your Password
              </h3>
              <p className="text-gray-600 text-sm">
                Enter your current password and create a new secure password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee ID */}
              <div className="space-y-1">
                <label
                  htmlFor="employeeId"
                  className="text-xs font-medium text-gray-700 block"
                >
                  Employee ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) =>
                      handleInputChange("employeeId", e.target.value)
                    }
                    placeholder="Enter your Employee ID"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white text-sm ${
                      formErrors.employeeId
                        ? "border-red-300 focus:border-red-500"
                        : "border-transparent focus:border-blue-500"
                    }`}
                    disabled={isLoading}
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
                {formErrors.employeeId && (
                  <p className="text-red-500 text-xs">
                    {formErrors.employeeId}
                  </p>
                )}
              </div>

              {/* Current Password */}
              <div className="space-y-1">
                <label
                  htmlFor="oldPassword"
                  className="text-xs font-medium text-gray-700 block"
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    id="oldPassword"
                    value={formData.oldPassword}
                    onChange={(e) =>
                      handleInputChange("oldPassword", e.target.value)
                    }
                    placeholder="Enter your current password"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white pr-12 text-sm ${
                      formErrors.oldPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-transparent focus:border-blue-500"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={toggleOldPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showOldPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                        <path d="m2.854 2.146a.5.5 0 1 0-.708.708l10.5 10.5a.5.5 0 0 0 .708-.708l-10.5-10.5z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                      </svg>
                    )}
                  </button>
                </div>
                {formErrors.oldPassword && (
                  <p className="text-red-500 text-xs">
                    {formErrors.oldPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label
                  htmlFor="newPassword"
                  className="text-xs font-medium text-gray-700 block"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="Enter your new password"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white pr-12 text-sm ${
                      formErrors.newPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-transparent focus:border-blue-500"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                        <path d="m2.854 2.146a.5.5 0 1 0-.708.708l10.5 10.5a.5.5 0 0 0 .708-.708l-10.5-10.5z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                      </svg>
                    )}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <p className="text-red-500 text-xs">
                    {formErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Reset Password Button */}
              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200 transform text-sm ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                }`}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : "Reset Password"}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
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
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center space-y-3 shadow-2xl mx-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-700 font-medium text-sm">
              Resetting Password...
            </p>
            <p className="text-gray-500 text-xs text-center">
              Please wait while we update your password
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
