"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  User,
  FileText,
  Settings,
  Trash2,
  Pencil,
  Eye,
  Download,
  Upload,
  LogIn,
  LogOut,
  ShieldCheck,
  TriangleAlert,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Users,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

// Utility Functions - Define at the top before component
const formatActionName = (action) => {
  return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const getActionIcon = (action) => {
  const iconClass = "w-4 h-4";
  switch (action) {
    case "login":
    case "login_web":
    case "login_mobile":
      return <LogIn className={iconClass} />;
    case "logout":
      return <LogOut className={iconClass} />;
    case "create":
      return <FileText className={iconClass} />;
    case "update":
      return <Pencil className={iconClass} />;
    case "delete":
      return <Trash2 className={iconClass} />;
    case "view":
      return <Eye className={iconClass} />;
    case "download":
      return <Download className={iconClass} />;
    case "bulk_upload":
      return <Upload className={iconClass} />;
    case "configuration":
      return <Settings className={iconClass} />;
    case "security_alert":
      return <ShieldCheck className={iconClass} />;
    case "forgot_password":
    case "password_reset":
    case "password_change":
    case "otp_verify":
      return <ShieldCheck className={iconClass} />;
    case "error":
    case "login_failed":
      return <XCircle className={iconClass} />;
    default:
      return <Clock className={iconClass} />;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "success":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
          <CheckCircle className="w-3 h-3" />
          Success
        </span>
      );
    case "warning":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
          <TriangleAlert className="w-3 h-3" />
          Warning
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200">
          <XCircle className="w-3 h-3" />
          Error
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
          <Clock className="w-3 h-3" />
          Info
        </span>
      );
  }
};

// Searchable Select Component
const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select option...",
  icon: Icon,
  className = "",
  allOption = true,
  defaultAllText = "All", // Add this prop to customize "All" text
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    const baseOptions = allOption
      ? [{ value: "all", label: defaultAllText }]
      : [];
    const mainOptions = options.map((option) =>
      typeof option === "string" ? { value: option, label: option } : option
    );

    const allOptions = [...baseOptions, ...mainOptions];

    if (!searchTerm) return allOptions;

    return allOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, allOption, defaultAllText]);

  // Get display label for selected value
  const getDisplayLabel = () => {
    if (value === "all") {
      return allOption ? defaultAllText : placeholder;
    }

    // First check in main options
    const foundOption = options.find((opt) =>
      typeof opt === "string" ? opt === value : opt.value === value
    );

    if (foundOption) {
      return typeof foundOption === "string" ? foundOption : foundOption.label;
    }

    // If not found, return the value itself or placeholder
    return value || placeholder;
  };

  // Handle option select
  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="relative w-full pl-9 pr-8 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
      >
        {/* Icon */}
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}

        {/* Selected Value */}
        <span className="block truncate text-sm text-gray-900">
          {getDisplayLabel()}
        </span>

        {isOpen ? (
          <ChevronUp className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search options..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div ref={listRef} className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${
                    highlightedIndex === index
                      ? "bg-blue-50 text-blue-900"
                      : value === option.value
                      ? "bg-blue-100 text-blue-900 font-medium"
                      : "text-gray-900"
                  }`}
                >
                  {option.label}
                  {value === option.value && (
                    <CheckCircle className="inline ml-2 w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityLogs = () => {
  // State Management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const itemsPerPage = 10;

  // API Data State
  const [activityData, setActivityData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    successCount: 0,
    errorCount: 0,
    warningCount: 0,
    criticalCount: 0,
    activeUsers: 0,
    successRate: 0,
  });
  const [filterOptions, setFilterOptions] = useState({
    uniqueActions: [],
    uniqueUsers: [],
    uniqueModules: [],
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // API Configuration
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Prepare options for searchable selects using useMemo to avoid recreating on every render
  const activityOptions = useMemo(
    () =>
      filterOptions.uniqueActions.map((action) => ({
        value: action,
        label: formatActionName(action),
      })),
    [filterOptions.uniqueActions]
  );

  const userOptions = useMemo(
    () => filterOptions.uniqueUsers,
    [filterOptions.uniqueUsers]
  );
  const moduleOptions = useMemo(
    () => filterOptions.uniqueModules,
    [filterOptions.uniqueModules]
  );

  const statusOptions = useMemo(
    () => [
      { value: "success", label: "Success" },
      { value: "warning", label: "Warning" },
      { value: "error", label: "Error" },
      { value: "info", label: "Info" },
    ],
    []
  );

  const dateOptions = useMemo(
    () => [
      { value: "today", label: "Today" },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
    ],
    []
  );

  // Fetch Activity Logs Function
  const fetchActivityLogs = async (
    pageNum = currentPage,
    resetPage = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: resetPage ? 1 : pageNum.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        action: selectedActivity,
        user: selectedUser,
        module: selectedModule,
        status: selectedStatus,
        dateRange: dateRange,
      });

      const response = await api.get(`/api/activity-logs?${params}`);

      if (response.data.success) {
        const {
          logs,
          stats: statsData,
          filters,
          pagination: paginationData,
        } = response.data.data;

        setActivityData(logs);
        setStats(statsData);
        setFilterOptions(filters);
        setPagination(paginationData);

        if (resetPage) {
          setCurrentPage(1);
        }
      } else {
        throw new Error(
          response.data.message || "Failed to fetch activity logs"
        );
      }
    } catch (err) {
      console.error("Fetch activity logs error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch activity logs"
      );

      // Set empty data on error
      setActivityData([]);
      setStats({
        total: 0,
        successCount: 0,
        errorCount: 0,
        warningCount: 0,
        criticalCount: 0,
        activeUsers: 0,
        successRate: 0,
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchActivityLogs(1, true);
  }, []);

  // Debounced search and filter effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchActivityLogs(1, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    selectedActivity,
    selectedUser,
    selectedModule,
    selectedStatus,
    dateRange,
  ]);

  useEffect(() => {
    if (currentPage !== pagination.currentPage && !loading) {
      fetchActivityLogs(currentPage, false);
    }
  }, [currentPage]);

  // Refresh function
  const handleRefresh = () => {
    fetchActivityLogs(currentPage, false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedActivity("all");
    setSelectedUser("all");
    setSelectedModule("all");
    setSelectedStatus("all");
    setDateRange("all");
    setCurrentPage(1);
  };

  // Error Component
  const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">
        Error Loading Data
      </h3>
      <p className="text-red-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
      <span className="text-gray-600">Loading activity logs...</span>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Activity Logs Found
      </h3>
      <p className="text-gray-500 mb-4">
        {searchTerm || selectedActivity !== "all" || selectedUser !== "all"
          ? "Try adjusting your filters or search terms."
          : "No activity logs have been recorded yet."}
      </p>
      {(searchTerm || selectedActivity !== "all" || selectedUser !== "all") && (
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50 p-2">
      <div className="max-w-8xl mx-auto">
        {/* Ultra Compact Single Line Header */}
        <div className="flex items-center justify-between py-3 px-4 bg-white border-b border-gray-200 mb-4">
          {/* Left: Title with Icon */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Activity Logs</h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Real-time monitoring
              </p>
            </div>
          </div>

          {/* Center: Compact Stats */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Total */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-blue-600">Total</p>
              </div>
            </div>

            {/* Success */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-100">
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">
                  {stats.successRate}%
                </p>
                <p className="text-xs text-green-600">Success</p>
              </div>
            </div>

            {/* Users */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
              <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-purple-600">Users</p>
              </div>
            </div>

            {/* Alerts */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-100">
              <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
                <TriangleAlert className="w-3 h-3 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">
                  {stats.criticalCount}
                </p>
                <p className="text-xs text-red-600">Alerts</p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <div className="lg:hidden flex items-center gap-1 text-xs text-gray-600">
              <span className="font-medium">{pagination.totalLogs}</span>
              <span>entries</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </div>
        </div>

        {/* Mobile Stats Row - Only on small screens */}
        <div className="lg:hidden grid grid-cols-4 gap-2 px-4 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-blue-600">Total</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">
              {stats.successRate}%
            </p>
            <p className="text-xs text-green-600">Success</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">
              {stats.activeUsers}
            </p>
            <p className="text-xs text-purple-600">Users</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-sm font-bold text-gray-900">
              {stats.criticalCount}
            </p>
            <p className="text-xs text-red-600">Alerts</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}

            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities, users, or modules..."
                className=" w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <SearchableSelect
              value={selectedActivity}
              onChange={setSelectedActivity}
              options={activityOptions}
              placeholder="All Activities"
              defaultAllText="All Activities"
              icon={Filter}
              className="min-w-[200px]"
            />

            <SearchableSelect
              value={selectedUser}
              onChange={setSelectedUser}
              options={userOptions}
              placeholder="All Users"
              defaultAllText="All Users"
              icon={User}
              className="min-w-[200px]"
            />

            <SearchableSelect
              value={selectedModule}
              onChange={setSelectedModule}
              options={moduleOptions}
              placeholder="All Modules"
              defaultAllText="All Modules"
              icon={Settings}
              className="min-w-[200px]"
            />

            <SearchableSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={statusOptions}
              placeholder="All Status"
              defaultAllText="All Status"
              icon={CheckCircle}
              className="min-w-[150px]"
            />

            <SearchableSelect
              value={dateRange}
              onChange={setDateRange}
              options={dateOptions}
              placeholder="All Time"
              defaultAllText="All Time"
              icon={Calendar}
              className="min-w-[150px]"
            />

            {/* Clear Filters Button */}
            {(searchTerm ||
              selectedActivity !== "all" ||
              selectedUser !== "all" ||
              selectedModule !== "all" ||
              selectedStatus !== "all" ||
              dateRange !== "all") && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && !loading && (
          <div className="mb-6">
            <ErrorMessage
              message={error}
              onRetry={() => fetchActivityLogs(currentPage, false)}
            />
          </div>
        )}

        {/* Activity Table */}
        <div className="bg-white rounded-xl shadow-sm border mb-10 border-gray-200 overflow-hidden">
          {loading && !initialLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <LoadingSpinner />
            </div>
          )}
          <div className="overflow-y-auto min-h-screen">
            <div className="overflow-x-auto">
              {activityData.length === 0 && !loading ? (
                <EmptyState />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activityData.map((activity) => {
                      const timestamp = formatTimestamp(activity.timestamp);

                      return (
                        <tr
                          key={activity._id || activity.id}
                          className="hover:bg-blue-50 transition-colors duration-150"
                        >
                          {/* User */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                {activity.user?.name
                                  ?.split(" ")
                                  .map((n, i, arr) =>
                                    i === 0 || i === arr.length - 1
                                      ? n[0]
                                      : null
                                  )
                                  .join("") || "U"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {activity.user?.name || "Unknown User"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {activity.user?.role ||
                                    activity.user?.email ||
                                    "No Role"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                {getActionIcon(activity.action)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {formatActionName(activity.action)}
                              </span>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="text-sm text-gray-900 font-medium">
                                {activity.description}
                              </div>
                              {activity.details && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {activity.details}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Module */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {activity.module}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(activity.status)}
                          </td>

                          {/* Time */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {timestamp.time}
                            </div>
                            <div className="text-xs text-gray-500">
                              {timestamp.date}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-700">
                Showing {(pagination.currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  pagination.currentPage * itemsPerPage,
                  pagination.totalLogs
                )}{" "}
                of {pagination.totalLogs} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={!pagination.hasPrevPage || loading}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={loading}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 ${
                            pagination.currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, pagination.totalPages)
                    )
                  }
                  disabled={!pagination.hasNextPage || loading}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
