import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

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

      navigate("/user");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center">
      <div className="absolute inset-0 bg-blue-900/30 backdrop-blur-sm"></div>
      <div className="z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-lg px-8 pt-8 pb-8 mb-4"
        >
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-dark">Service Portal</h2>
            <p className="text-gray-600 mt-1">Log in to your account</p>
          </div>

          {/* Employee ID Field */}
          <div className="mb-4">
            <label htmlFor="employee" className="block text-gray-900 text-sm font-bold mb-2">
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

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-900 text-sm font-bold mb-2">
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
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-end mb-6">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="white"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 00-10 10h4z"
                  ></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
