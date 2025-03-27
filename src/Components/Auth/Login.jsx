import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [employee, setEmployee] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form reload

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/auth/adminlogin`,
        {
          employeeId: employee,
          password,
        }
      );

      if (response.status === 200) {
        const userData = response.data;

        // Save user data to localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        // Navigate to the dashboard or user page
        window.location.href = "/user";
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Invalid Employee ID or Password");
      } else {
        setErrorMessage("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center">
        <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
        <div className="z-10 w-full max-w-md">
          <form
            onSubmit={handleLogin} // Attach login handler
            className="bg-white shadow-2xl rounded-lg px-8 pt-8 pb-8 mb-4"
          >
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-dark">Service Portal</h2>
              <p className="text-gray-600 mt-1">Log in to your account</p>
            </div>
            {errorMessage && (
              <div className="mb-4 text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <div className="mb-4">
              <label
                htmlFor="employee"
                className="block text-gray-900 text-sm font-bold mb-2"
              >
                Employee ID
              </label>
              <input
                id="employee"
                placeholder="EMP1"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-900 text-sm font-bold mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-eye-slash"
                      viewBox="0 0 16 16"
                    >
                      {/* SVG Path */}
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-eye"
                      viewBox="0 0 16 16"
                    >
                      {/* SVG Path */}
                    </svg>
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end mb-6">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
