"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Settings,
  Activity,
  Shield,
  ArrowRight,
  BarChart3,
  Sparkles,
  TrendingUp,
  Zap,
  Upload,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function ServiceMangePage() {
  const [selectedItem, setSelectedItem] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const avatarImage =
    user?.details?.profileimage ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286";
  const userName = user?.details?.firstname || "Admin";
  const userId = user?.details?.employeeid || "EMP001";
  const userRole = user?.details?.role?.roleName || "Administrator";
  const department = user?.details?.department || "IT Department";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    window.location.reload();
  };

  useEffect(() => {
    setSelectedItem(location.pathname);
    setTimeout(() => setIsLoaded(true), 100);
  }, [location.pathname]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsMobileOpen(false);
  };

  const handleManageUsersClick = () => {
    navigate("/user");
    handleItemClick("/user");
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
      }
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      .animate-gradient { 
        background-size: 200% 200%;
        animation: gradient-shift 3s ease infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-gray-50 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-gray-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Header */}
      <header
        className={`bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg transition-all duration-700 ${
          isLoaded ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg animate-pulse-glow">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Service Portal
                </h1>
                <p className="text-sm text-gray-500">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <span className="text-base font-semibold text-gray-700 block">
                  Welcome back, {userName}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {userRole} - {department}
                </span>
              </div>
              <div className="relative group">
                {avatarImage ? (
                  <div className="relative">
                    <img
                      src={avatarImage || "/placeholder.svg"}
                      alt={userName}
                      className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-110 transition-all duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Welcome Section */}
        <div
          className={`text-center mb-16 transition-all duration-1000 delay-300 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-100 to-gray-100 rounded-full mb-6 animate-float shadow-2xl">
              <Settings className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-6">
            Welcome to Service Portal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Manage your services, users, and system settings from this central
            hub. Experience seamless administration with our enhanced dashboard
            interface.
          </p>

          {/* Primary CTA */}
          <button
            onClick={handleManageUsersClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group inline-flex items-center animate-gradient"
          >
            <Users className="mr-3 h-6 w-6" />
            Manage Users
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        </div>

        {/* User Info Card */}
        <div
          className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border-0 p-8 mb-12 hover:shadow-3xl transition-all duration-500 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            User Information
            <TrendingUp className="h-5 w-5 ml-2 text-blue-500" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredCard("id")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="text-sm text-blue-600 font-semibold mb-2 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                Employee ID
              </div>
              <div className="text-2xl font-bold text-gray-900">{userId}</div>
              {hoveredCard === "id" && (
                <div className="text-xs text-blue-500 mt-2 animate-pulse">
                  Active Status
                </div>
              )}
            </div>
            <div
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredCard("name")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="text-sm text-gray-600 font-semibold mb-2 flex items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-2 animate-pulse"></div>
                Full Name
              </div>
              <div className="text-2xl font-bold text-gray-900">{userName}</div>
              {hoveredCard === "name" && (
                <div className="text-xs text-gray-500 mt-2 animate-pulse">
                  Verified User
                </div>
              )}
            </div>
            <div
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredCard("role")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="text-sm text-blue-600 font-semibold mb-2 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                Role
              </div>
              <div className="text-2xl font-bold text-gray-900">{userRole}</div>
              {hoveredCard === "role" && (
                <div className="text-xs text-blue-500 mt-2 animate-pulse">
                  Full Access
                </div>
              )}
            </div>
            <div
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHoveredCard("dept")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="text-sm text-gray-600 font-semibold mb-2 flex items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-2 animate-pulse"></div>
                Department
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {department}
              </div>
              {hoveredCard === "dept" && (
                <div className="text-xs text-gray-500 mt-2 animate-pulse">
                  Primary Unit
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border-0 p-10 transition-all duration-700 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Quick Actions
            <Zap className="h-5 w-5 ml-2 text-blue-500" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Management */}
            <button
              onClick={() => {
                navigate("/user");
                handleItemClick("/user");
              }}
              className="group w-full p-8 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-left"
            >
              <div className="flex items-start">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                    User Management
                  </div>
                  <div className="text-gray-600 group-hover:text-gray-700 transition-colors">
                    Manage user accounts, roles, permissions, and access
                    controls for all system users
                  </div>
                  <div className="mt-3 text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300 inline-flex items-center">
                    Manage Users <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </button>

            {/* Customer Management */}
            <button
              onClick={() => {
                navigate("/customer");
                handleItemClick("/customer");
              }}
              className="group w-full p-8 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-300 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-left"
            >
              <div className="flex items-start">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                    Customer Management
                  </div>
                  <div className="text-gray-600 group-hover:text-gray-700 transition-colors">
                    Handle customer data, profiles, services, and relationship
                    management operations
                  </div>
                  <div className="mt-3 text-green-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300 inline-flex items-center">
                    Manage Customers <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </button>

            {/* Admin Geo Management */}
            <button
              onClick={() => {
                navigate("/admin-geo");
                handleItemClick("/admin-geo");
              }}
              className="group w-full p-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-300 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-left"
            >
              <div className="flex items-start">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                    Admin Geo Management
                  </div>
                  <div className="text-gray-600 group-hover:text-gray-700 transition-colors">
                    Configure geographical settings, locations, zones, and
                    regional administrative controls
                  </div>
                  <div className="mt-3 text-purple-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300 inline-flex items-center">
                    Configure Geo <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Footer Section */}
        <div
          className={`text-center mt-12 transition-all duration-700 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "1200ms" }}
        >
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 text-lg font-semibold transition-all duration-300 hover:scale-105 px-6 py-2 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>

        {/* Enhanced Navigation Hint */}
        <div
          className={`text-center mt-8 transition-all duration-700 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "1500ms" }}
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-gray-50 rounded-full border border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-500 mr-2" />
            <p className="text-sm text-gray-600">
              Pro tip: Use keyboard shortcuts for faster navigation and enhanced
              productivity
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export const renderNestedItems = (
  items,
  level = 0,
  navigate,
  handleItemClick,
  selectedItem
) => {
  return items.map((item) => {
    return (
      <div key={item.path}>
        <button
          onClick={() => {
            navigate(item.path);
            handleItemClick(item.path);
          }}
          className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm ${
            selectedItem === item.path
              ? "bg-blue-100 text-blue-800 font-medium"
              : "text-gray-700 hover:text-blue-800 hover:bg-blue-50"
          }`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <span>{item.label || item.component}</span>
        </button>
      </div>
    );
  });
};  
