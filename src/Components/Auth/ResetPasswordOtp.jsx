"use client";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const ResetPasswordOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken] = useState(location.state?.resetToken || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Password strength checker
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: "Very Weak", color: "text-red-500", bg: "bg-red-500" };
      case 2:
        return { text: "Weak", color: "text-orange-500", bg: "bg-orange-500" };
      case 3:
        return { text: "Fair", color: "text-yellow-500", bg: "bg-yellow-500" };
      case 4:
        return { text: "Good", color: "text-blue-500", bg: "bg-blue-500" };
      case 5:
        return { text: "Strong", color: "text-green-500", bg: "bg-green-500" };
      default:
        return { text: "", color: "", bg: "" };
    }
  };

  // Handle input changes
  const handlePasswordChange = (value) => {
    setPassword(value);
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (formErrors.confirmPassword) {
      setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!password.trim()) {
      errors.password = "New password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    if (!resetToken) {
      errors.general = "Invalid reset token. Please start the process again.";
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
        `${process.env.REACT_APP_BASE_URL}/collections/reset-password-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken,
            newPassword: password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successfully!");
        // Clear form
        setPassword("");
        setConfirmPassword("");
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

  const passwordStrength = getPasswordStrength(password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Create New Password
              </h3>
              <p className="text-gray-600 text-sm">
                Your identity has been verified. Please create a new secure
                password.
              </p>
            </div>

            {/* General Error */}
            {formErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm text-center">
                  {formErrors.general}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-gray-700 block"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Enter your new password"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white pr-12 text-sm ${
                      formErrors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-transparent focus:border-blue-500"
                    }`}
                    disabled={isLoading}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? (
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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        Password Strength:
                      </span>
                      <span
                        className={`text-xs font-medium ${strengthInfo.color}`}
                      >
                        {strengthInfo.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.bg}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {formErrors.password && (
                  <p className="text-red-500 text-xs">{formErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-medium text-gray-700 block"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleConfirmPasswordChange(e.target.value)
                    }
                    placeholder="Confirm your new password"
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border-2 transition-all duration-200 focus:outline-none focus:bg-white pr-12 text-sm ${
                      formErrors.confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : confirmPassword && password === confirmPassword
                        ? "border-green-300 focus:border-green-500"
                        : "border-transparent focus:border-blue-500"
                    }`}
                    disabled={isLoading}
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
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

                  {/* Match Indicator */}
                  {confirmPassword && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      {password === confirmPassword ? (
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs">
                    {formErrors.confirmPassword}
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

            {/* Password Requirements */}

            {/* Success Message */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                After resetting your password, you'll be redirected to the login
                page.
              </p>
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
              Updating Password...
            </p>
            <p className="text-gray-500 text-xs text-center">
              Please wait while we secure your new password
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordOtp;
