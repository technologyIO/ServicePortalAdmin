import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [employee, setEmployee] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/collections/login/web`,
        {
          employeeid: employee,
          password: password,
        }
      );

      // Store the token and user info under "user"
      localStorage.setItem(
        "user",
        JSON.stringify({
          token: response.data.token,
          details: response.data.user,
        })
      );

      toast.success("Login Successful!");
      setEmployee("");
      setPassword("");

      window.location.href = "/service-manage";
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-60 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-100 rounded-full opacity-60 blur-xl"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-blue-200 rounded-full opacity-40 blur-lg"></div>

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div> */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Service Portal
            </h1>
            <p className="text-gray-600 text-sm">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee ID Field */}
            <div className="space-y-2">
              <label
                htmlFor="employee"
                className="block text-sm font-semibold text-gray-700"
              >
                Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="employee"
                  type="text"
                  placeholder="Enter your employee ID"
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-400 hover:text-blue-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Links */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline font-medium"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => navigate("/reset-password")}
                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline font-medium"
              >
                Reset password
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !employee || !password}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
        </div>

        {/* Additional Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-200 rounded-full opacity-30 blur-xl"></div>
      </div>
    </div>
  );
}

export default Login;
