import React, { useEffect, useState } from "react";

import FormControl from "@mui/joy/FormControl";

import Input from "@mui/joy/Input";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

import SearchIcon from "@mui/icons-material/Search";

import { Modal, ModalDialog, Option, Select } from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import BulkModal from "../../BulkUpload.jsx/BulkModal";
import LoadingSpinner from "../../../../LoadingSpinner";
import toast from "react-hot-toast";

function PreventiveMaintenance() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(true);
  const limit = 10;
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTotalRecords, setSearchTotalRecords] = useState(0);

  // Filter states - only 3 filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    pmStatus: "",
    region: "",
  });
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [regionOptions, setRegionOptions] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDownloadingPM, setIsDownloadingPM] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;
  const [isSpinning, setisSpinning] = useState(false);

  const downloadPMExcel = async () => {
    setIsDownloadingPM(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/pm/export-pm`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pm_data_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download PM Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingPM(false);
    }
  };

  // Add this function inside your PreventiveMaintenance component
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select PM records to delete");
      return;
    }

    Swal.fire({
      title: "Delete Selected PM Records?",
      text: `You are about to delete ${selectedRows.length} PM records permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${process.env.REACT_APP_BASE_URL}/upload/pms/bulk`, {
            data: { ids: selectedRows },
          })
          .then((response) => {
            Swal.fire({
              title: "Deleted!",
              text: response.data.message,
              icon: "success",
            });
            setSelectedRows([]);
            setSelectAll(false);
            // Refresh data based on current mode
            if (isSearchMode && searchQuery.trim()) {
              handleSearchWithPagination();
            } else {
              getData();
            }
          })
          .catch((error) => {
            console.error("Bulk delete error:", error);
            Swal.fire({
              title: "Error!",
              text:
                error.response?.data?.message || "Failed to delete PM records",
              icon: "error",
            });
          });
      }
    });
  };

  useEffect(() => {
    // getCities();
  }, []);

  const getRegionOptions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/upload/pms/regions`
      );
      if (response.data.success) {
        setRegionOptions(response.data.regions);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      // Select all rows
      setSelectedRows(data?.map((country) => country._id));
    } else {
      // Deselect all rows
      setSelectedRows([]);
    }
  };
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/upload/pms/${id}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        toast.success(
          `Equipment ${
            newStatus === "Active" ? "activated" : "deactivated"
          } successfully!`
        );
        getData(); // Refresh the data
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };
  const handleRowSelect = (countryId) => {
    if (selectedRows.includes(countryId)) {
      // Deselect the row
      setSelectedRows(selectedRows.filter((id) => id !== countryId));
    } else {
      // Select the row
      setSelectedRows([...selectedRows, countryId]);
    }
  };

  const applyFilters = async () => {
    setLoader(true);
    setIsFilterMode(true);
    setIsSearchMode(false);
    setPage(1);

    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", limit.toString());

      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.pmStatus) params.append("pmStatus", filters.pmStatus);
      if (filters.region) params.append("region", filters.region);

      const response = await axios.get(
        `${
          process.env.REACT_APP_BASE_URL
        }/upload/pms/filter?${params.toString()}`
      );

      if (response.data.success) {
        setData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRecords(response.data.pagination.totalRecords);
        setSearchTotalRecords(response.data.pagination.totalRecords);
        toast.success(
          `Found ${response.data.pagination.totalRecords} filtered records`
        );
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      setData([]);
      setTotalPages(1);
      setTotalRecords(0);
      toast.error("Error applying filters");
    } finally {
      setLoader(false);
    }
  };
  const clearAllFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      pmStatus: "",
      region: "",
    });
    setIsFilterMode(false);
    setPage(1);
    getData();
    toast.success("Filters cleared");
  };
  const handleFilterPagination = async (newPage) => {
    if (!isFilterMode) return;

    setLoader(true);
    try {
      const params = new URLSearchParams();
      params.append("page", newPage.toString());
      params.append("limit", limit.toString());

      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.pmStatus) params.append("pmStatus", filters.pmStatus);
      if (filters.region) params.append("region", filters.region);

      const response = await axios.get(
        `${
          process.env.REACT_APP_BASE_URL
        }/upload/pms/filter?${params.toString()}`
      );

      if (response.data.success) {
        setData(response.data.data);
        setPage(newPage);
      }
    } catch (error) {
      console.error("Error in filter pagination:", error);
    } finally {
      setLoader(false);
    }
  };

  // Initialize
  useEffect(() => {
    getRegionOptions();
    getData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      getRegionOptions();
    }
  }, [data]);
  const handleCloseModal = () => {
    setShowModal((prev) => !prev);
    setEditModal(false);
    setCurrentData({});
  };

  const handleOpenModal = (country) => {
    setCurrentData(country);
    setEditModal(true);
    setShowModal(true);
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Permanently?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${process.env.REACT_APP_BASE_URL}/upload/pms/${id}`)
          .then((res) => {
            Swal.fire("Deleted!", "Record has been deleted.", "success");
          })
          .then((res) => {
            // Refresh data based on current mode
            if (isSearchMode && searchQuery.trim()) {
              handleSearchWithPagination();
            } else {
              getData();
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  // Updated search function with proper total records handling
  const handleSearchWithPagination = async () => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      getData();
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/upload/search?q=${searchQuery}&page=${page}&limit=${limit}`
      );

      let searchData = [];
      let totalPagesCount = 1;
      let totalSearchRecords = 0;

      if (Array.isArray(response.data)) {
        searchData = response.data;
        totalPagesCount = Math.ceil(response.data.length / limit);
        totalSearchRecords = response.data.length;
      } else if (
        response.data.results &&
        Array.isArray(response.data.results)
      ) {
        searchData = response.data.results;
        totalPagesCount = response.data.totalPages || 1;
        totalSearchRecords =
          response.data.totalRecords || response.data.results.length;
      } else if (response.data.pms && Array.isArray(response.data.pms)) {
        searchData = response.data.pms;
        totalPagesCount = response.data.totalPages || 1;
        totalSearchRecords =
          response.data.totalPms ||
          response.data.total ||
          response.data.pms.length;
      } else if (response.data.message === "No results found") {
        searchData = [];
        totalPagesCount = 1;
        totalSearchRecords = 0;
      } else if (response.data._id) {
        searchData = [response.data];
        totalPagesCount = 1;
        totalSearchRecords = 1;
      }

      setData(searchData);
      setTotalPages(totalPagesCount);
      setSearchTotalRecords(totalSearchRecords); // Set search total records
    } catch (error) {
      console.error("Error searching records:", error);
      setData([]);
      setTotalPages(1);
      setSearchTotalRecords(0);
    } finally {
      setLoader(false);
    }
  };

  // Updated initial search function
  const handleSearch = async (newPage = 1) => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setPage(1);
      setSearchTotalRecords(0);
      getData();
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    setPage(newPage);

    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_BASE_URL
        }/upload/pms/search?q=${encodeURIComponent(
          searchQuery
        )}&page=${newPage}&limit=${limit}`
      );

      if (response.data.success) {
        setData(response.data.pms || []);
        setTotalPages(response.data.totalPages || 1);
        setSearchTotalRecords(response.data.totalPms || 0);
      } else {
        setData([]);
        setTotalPages(1);
        setSearchTotalRecords(0);
      }
    } catch (error) {
      console.error("Search error:", error);
      setData([]);
      setTotalPages(1);
      setSearchTotalRecords(0);
    } finally {
      setLoader(false);
    }
  };

  const getData = () => {
    setLoader(true);
    setIsSearchMode(false);
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/upload/pms?page=${page}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.pms);
        setTotalPages(res.data.totalPages);
        setTotalRecords(res.data.totalPms || 0);
        setSearchTotalRecords(0); // Reset search total when getting all data
      })
      .catch((error) => {
        setLoader(false);
        console.log(error);
      });
  };

  useEffect(() => {
    if (isFilterMode) {
      handleFilterPagination(page);
    } else if (isSearchMode && searchQuery.trim()) {
      handleSearch(page); // Use same function with page parameter
    } else if (!isSearchMode && !isFilterMode) {
      getData();
    }
  }, [page]);
  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);
  // Handle search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setPage(1);
      setSearchTotalRecords(0); // Reset search total when clearing search
    }
  }, [searchQuery]);

  // Initial data load
  useEffect(() => {
    getData();
  }, []);

  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditCountry(id);
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/upload/pms`, currentData)
      .then((res) => {
        // Refresh data based on current mode
        if (isSearchMode && searchQuery.trim()) {
          handleSearchWithPagination();
        } else {
          getData();
        }
        toast.success(res.data?.message || "PMS created successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to create PMS. Please try again."
        );
      });
  };

  const handleEditCountry = (id) => {
    axios
      .put(`${process.env.REACT_APP_BASE_URL}/upload/pms/${id}`, currentData)
      .then((res) => {
        // Refresh data based on current mode
        if (isSearchMode && searchQuery.trim()) {
          handleSearchWithPagination();
        } else {
          getData();
        }
        toast.success(res.data?.message || "PMS updated successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update PMS. Please try again."
        );
      });
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Clear search function
  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setPage(1);
    setSearchTotalRecords(0);
    getData();
  };

  // Helper function to get current total records
  const getCurrentTotalRecords = () => {
    return isSearchMode ? searchTotalRecords : totalRecords;
  };

  // Helper function to get current displayed records count
  const getCurrentDisplayedCount = () => {
    return data.length;
  };

  return (
    <>
      {loader ? (
        <div className="flex items-center justify-center h-[60vh]">
          <span className="CustomLoader"></span>
        </div>
      ) : (
        <>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
                <div className="relative flex-1">
                  <FormControl sx={{ flex: 1 }} size="sm">
                    <Input
                      size="sm"
                      placeholder="Search records, users, or data..."
                      startDecorator={<SearchIcon />}
                      value={searchQuery}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch(1); // Start from page 1
                        }
                      }}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-50 h-10 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                    />
                  </FormControl>
                </div>

                <button
                  onClick={() => handleSearch(1)}
                  type="button"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setisSpinning(true);
                    getData();
                    setTimeout(() => setisSpinning(false), 1000);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-md font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={handleCloseModal}
                  type="button"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>

                {selectedRows?.length > 0 && (
                  <div className="animate-in slide-in-from-right-2 duration-300">
                    <button
                      onClick={handleBulkDelete}
                      type="button"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Delete Selected</span>
                      <span className="sm:hidden">Delete</span>
                      <span className="ml-1 bg-red-700/30 px-2 py-0.5 rounded-full text-xs">
                        ({selectedRows.length})
                      </span>
                    </button>
                  </div>
                )}

                {isSearchMode && (
                  <button
                    onClick={clearSearch}
                    type="button"
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2 whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-end items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    showFilters || isFilterMode
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white shadow-lg hover:bg-blue-50 text-gray-700"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  {showFilters ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isFilterMode && (
                    <span className="ml-1 bg-blue-700/30 px-2 py-0.5 rounded-full text-xs">
                      Active
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={downloadPMExcel}
                disabled={isDownloadingPM}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isDownloadingPM
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white shadow-lg hover:bg-blue-50 text-gray-700"
                }`}
              >
                {isDownloadingPM ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="hidden sm:inline">Downloading...</span>
                  </div>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download Excel</span>
                  </>
                )}
              </button>
            </div>
            {showFilters && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date From */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      📅 From Date
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        handleFilterChange("dateFrom", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Date To */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      📅 To Date
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        handleFilterChange("dateTo", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* PM Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      📊 PM Status
                    </label>
                    <select
                      value={filters.pmStatus}
                      onChange={(e) =>
                        handleFilterChange("pmStatus", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Due">Due</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Lapse">Lapse</option>
                    </select>
                  </div>

                  {/* Region with Autocomplete */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      🌍 Region
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type to search regions..."
                        value={filters.region}
                        onChange={(e) =>
                          handleFilterChange("region", e.target.value)
                        }
                        list="regionOptions"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <datalist id="regionOptions">
                        {regionOptions.map((region, index) => (
                          <option key={index} value={region} />
                        ))}
                      </datalist>
                      {filters.region && (
                        <button
                          onClick={() => handleFilterChange("region", "")}
                          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Active Filter Indicators */}
            {isFilterMode && (
              <div className="flex flex-wrap gap-2">
                {filters.dateFrom && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    From: {filters.dateFrom}
                  </span>
                )}
                {filters.dateTo && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    To: {filters.dateTo}
                  </span>
                )}
                {filters.pmStatus && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Status: {filters.pmStatus}
                  </span>
                )}
                {filters.region && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    Region: {filters.region}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {isFilterMode ? (
                  <>
                    Filtered Results:{" "}
                    <span className="font-bold text-blue-600">
                      {totalRecords}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      (filters applied)
                    </span>
                  </>
                ) : isSearchMode ? (
                  <>
                    Search Results:{" "}
                    <span className="font-bold text-blue-600">
                      {searchTotalRecords}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      (from {totalRecords} total records)
                    </span>
                  </>
                ) : (
                  <>
                    Total Records:{" "}
                    <span className="font-bold text-blue-600">
                      {totalRecords}
                    </span>
                  </>
                )}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Showing {data.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
              {Math.min(
                page * limit,
                isFilterMode
                  ? totalRecords
                  : isSearchMode
                  ? searchTotalRecords
                  : totalRecords
              )}{" "}
              of{" "}
              {isFilterMode
                ? totalRecords
                : isSearchMode
                ? searchTotalRecords
                : totalRecords}{" "}
              {isFilterMode
                ? "filtered results"
                : isSearchMode
                ? "search results"
                : "entries"}
            </div>
          </div>

          <div className="relative w-full overflow-x-auto">
            <table className="w-full border min-w-max caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b bg-blue-700">
                <tr className="border-b transition-colors text-white hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th scope="col" className="p-4">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <label htmlFor="checkbox-all-search" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM number (Report number)
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Document Number (Report Formate no , rev)
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Material Description
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Serial number
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Customer Code
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Region/Branch
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM due month (MM/YYYY)
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM done Date (DD/MM/YYYY)
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM Vendor Code
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM Engineer Code
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM Status (Comp, Due, Overdue, Lapse)
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&amp;_tr:last-child]:border-0">
                {data?.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={item?._id}
                      className={`border-b transition-colors ${
                        selectedRows?.includes(item?._id)
                          ? "bg-gray-300"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <th scope="col" className="p-4">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-${index}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                            checked={selectedRows?.includes(item?._id)}
                            onChange={() => handleRowSelect(item?._id)}
                          />
                          <label
                            htmlFor={`checkbox-${index}`}
                            className="sr-only"
                          >
                            checkbox
                          </label>
                        </div>
                      </th>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.pmType}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.pmNumber}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.documentnumber}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.materialDescription}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.serialNumber}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.customerCode}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.region}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.pmDueMonth}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.pmDoneDate}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.pmVendorCode}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.pmEngineerCode}
                      </td>

                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                            item?.pmStatus === "Completed"
                              ? "bg-green-100 text-green-800 border-green-400"
                              : item?.pmStatus === "Due"
                              ? "bg-blue-100 text-blue-800 border-blue-400"
                              : item?.pmStatus === "Overdue"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-400"
                              : item?.pmStatus === "Lapse"
                              ? "bg-red-100 text-red-800 border-red-400"
                              : "bg-gray-100 text-gray-800 border-gray-400"
                          }`}
                        >
                          {item?.pmStatus}
                        </span>
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                            item?.status === "Active"
                              ? "bg-green-100 text-green-800 border-green-400"
                              : item?.status === "Inactive"
                              ? "bg-red-100 text-red-800 border-red-400"
                              : "bg-gray-100 text-gray-800 border-gray-400"
                          }`}
                        >
                          {item?.status}
                        </span>
                      </td>

                      <td className="p-4 align-middle whitespace-nowrap">
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              handleOpenModal(item);
                            }}
                            className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-pencil-square"
                              viewBox="0 0 16 16"
                            >
                              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                              <path
                                fillRule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                              />
                            </svg>
                          </button>
                          {currentUserRole === "Super Admin" && (
                            <button
                              onClick={() => handleDelete(item?._id)}
                              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-trash3-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                              </svg>
                            </button>
                          )}
                          <td className="align-middle whitespace-nowrap">
                            <div className="flex gap-2 items-center justify-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer "
                                  checked={item?.status === "Active"}
                                  onChange={() =>
                                    handleToggleStatus(item?._id, item?.status)
                                  }
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute  pt-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                              </label>
                            </div>
                          </td>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="15" className="text-center p-8 text-gray-500">
                      {isFilterMode
                        ? "No records match the applied filters"
                        : isSearchMode
                        ? `No search results found for "${searchQuery}"`
                        : "No records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Updated pagination section */}
          {data?.length > 0 && (
            <div
              className="Pagination-laptopUp"
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px",
              }}
            >
              <button
                className={`border rounded p-1 ${
                  page === 1 ? "cursor-not-allowed" : "cursor-pointer"
                } w-[100px] hover:bg-gray-300 px-2 bg-gray-100 font-semibold`}
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                Previous
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((p) => {
                    // Show the first page, last page, and pages around the current page
                    return (
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 3 && p <= page + 3)
                    );
                  })
                  .map((p, i, array) => (
                    <React.Fragment key={p}>
                      {/* Add ellipsis for skipped ranges */}
                      {i > 0 && p !== array[i - 1] + 1 && <span>...</span>}
                      <button
                        className={`border px-3 rounded ${
                          p === page ? "bg-blue-700 text-white" : ""
                        }`}
                        onClick={() => setPage(p)}
                        disabled={p === page}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <button
                className="border rounded p-1 cursor-pointer hover:bg-blue-500 px-2 bg-blue-700 w-[100px] text-white font-semibold"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}

          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-gray-200 rounded-lg p-6 w-[80vh] relative">
                <button
                  onClick={closeModal}
                  className="absolute top-3 text-3xl right-3 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
                <BulkModal />
              </div>
            </div>
          )}

          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className="z-[1] thin-scroll"
            size="lg"
          >
            <ModalDialog size="lg" className="p-2 thin-scroll">
              <div className="flex items-start justify-between p-2 border-b px-5 border-solid border-blueGray-200 rounded-t thin-scroll">
                <h3 className="text-2xl font-semibold">
                  {editModal
                    ? "Update Preventive maintenance"
                    : "Create Preventive maintenance"}
                </h3>
                <div
                  onClick={() => handleCloseModal()}
                  className="border p-2 rounded-[4px] hover:bg-gray-200 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="bi bi-x-lg font-semibold"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                  </svg>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCloseModal();
                }}
                className="thin-scroll"
              >
                <div className="w-[300px] md:w-[500px] lg:w-[700px] border-b border-solid border-blueGray-200 p-3 flex-auto max-h-[380px] overflow-y-auto">
                  <div className="grid md:grid-cols-2 md:gap-6 w-full">
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Pm Type
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("pmType", e.target.value)
                        }
                        id="name"
                        value={currentData?.pmType}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Material Description
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("materialDescription", e.target.value)
                        }
                        id="name"
                        value={currentData?.materialDescription}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        pmNumber
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("pmNumber", e.target.value)
                        }
                        id="name"
                        value={currentData?.pmNumber}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        customerCode
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("customerCode", e.target.value)
                        }
                        id="name"
                        value={currentData?.customerCode}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        regionBranch
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("regionBranch", e.target.value)
                        }
                        id="name"
                        value={currentData?.regionBranch}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        pmDueMonth
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YYYY"
                        maxLength={7}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 7) {
                            handleFormData("pmDueMonth", value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
                          if (!regex.test(value) && value) {
                            alert("Invalid format. Please use MM/YYYY.");
                          }
                        }}
                        id="pmDueMonth"
                        value={currentData?.pmDueMonth || ""}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        pmDoneDate
                      </label>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        maxLength={10}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 10) {
                            handleFormData("pmDoneDate", value);
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          const regex = /^\d{2}\/\d{2}\/\d{4}$/;
                          if (!regex.test(value) && value) {
                            alert("Invalid format. Please use DD/MM/YYYY.");
                          }
                        }}
                        id="pmDoneDate"
                        value={currentData?.pmDoneDate || ""}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        pmVendorCode
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("pmVendorCode", e.target.value)
                        }
                        id="name"
                        value={currentData?.pmVendorCode}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        pmEngineerCode
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("pmEngineerCode", e.target.value)
                        }
                        id="name"
                        value={currentData?.pmEngineerCode}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        serialNumber
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("serialNumber", e.target.value)
                        }
                        id="name"
                        value={currentData?.serialNumber}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Status
                      </label>

                      <Select
                        variant="soft"
                        className="rounded-[4px] py-2 border"
                        defaultValue={currentData?.pmStatus || ""}
                        onChange={(e, value) =>
                          handleFormData("pmStatus", value)
                        }
                      >
                        <Option value="">Select Status</Option>
                        <Option value="Completed">Completed</Option>
                        <Option value="Due">Due</Option>
                        <Option value="Overdue">Overdue</Option>
                        <Option value="Lapse">Lapse</Option>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end mt-3 rounded-b">
                  <button
                    onClick={() => handleCloseModal()}
                    type="button"
                    className="focus:outline-none border h-8 shadow text-black flex items-center hover:bg-gray-200 font-medium rounded-[4px] text-sm px-5 py-2.5 me-2 mb-2"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 h-8 hover:bg-blue-800 focus:ring-4 flex items-center px-8 focus:ring-blue-300 font-medium rounded-[4px] text-sm py-2.5 me-2 mb-2 focus:outline-none"
                  >
                    {editModal
                      ? "Update Preventive Maintenance"
                      : "Create Preventive Maintenance"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
        </>
      )}
    </>
  );
}

export default PreventiveMaintenance;
