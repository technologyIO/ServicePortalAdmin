import React, { useEffect, useState, useCallback } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Modal,
  ModalDialog,
  Option,
  Select,
  TextField,
} from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../LoadingSpinner";
import { Download, Filter, Plus, RefreshCw, Upload } from "lucide-react";

function AdminRegion() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});

  const limit = 10;
  const [selectedStates, setSelectedStates] = useState([]);
  const [country, setcountry] = useState([]);
  const [selectedcountry, setSelectedcountry] = useState([]);
  const [totalRegions, setTotalRegions] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSpinning, setisSpinning] = useState(false);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloadingRegion, setIsDownloadingRegion] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;
  // Add these states at the top with other states
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Add these functions
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(data?.map((region) => region._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (regionId) => {
    if (selectedRows.includes(regionId)) {
      setSelectedRows(selectedRows.filter((id) => id !== regionId));
    } else {
      setSelectedRows([...selectedRows, regionId]);
    }
  };

  const downloadRegionExcel = async () => {
    setIsDownloadingRegion(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/regions/export-regions`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `regions_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download Region Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingRegion(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal((prev) => !prev);
    setEditModal(false);
    setCurrentData({});
  };

  const handleOpenModal = (region) => {
    setCurrentData(region);
    setEditModal(true);
    setShowModal(true);

    // Set the selected country for editing
    const matchedCountry = country.find((c) => c.name === region.country);
    setSelectedcountry(matchedCountry || null);
  };

  useEffect(() => {
    const fetchcountry = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allcountry`
        );
        const formatted = res.data?.countries?.map((country) => ({
          ...country,
          label: country.name,
        }));
        setcountry(formatted);
      } catch (error) {
        console.error("Error fetching country:", error);
      }
    };

    fetchcountry();
  }, []);

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
          .delete(
            `${process.env.REACT_APP_BASE_URL}/collections/api/region/${id}`
          )
          .then((res) => {
            Swal.fire("Deleted!", "Region has been deleted.", "success");
            getAllData();
          })
          .catch((error) => {
            console.log(error);

            // Handle different error scenarios
            if (error.response && error.response.status === 400) {
              // Region is linked with users and/or states
              const errorData = error.response.data;

              if (
                (errorData.linkedUsers && errorData.linkedUsers.length > 0) ||
                (errorData.linkedStates && errorData.linkedStates.length > 0)
              ) {
                let htmlContent = `
                <div style="text-align: left;">
                  <p style="margin-bottom: 15px;">${errorData.message}</p>
              `;

                // Show linked users if any
                if (errorData.linkedUsers && errorData.linkedUsers.length > 0) {
                  const usersList = errorData.linkedUsers
                    .map((user) => `• ${user.name} (${user.employeeid})`)
                    .join("\n");

                  htmlContent += `
                  <div style="margin-bottom: 15px;">
                    <p style="margin-bottom: 5px;"><strong>Linked Users (${errorData.linkedUsersCount}):</strong></p>
                    <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-line; border-left: 4px solid #2196f3;">
${usersList}
                    </div>
                  </div>
                `;
                }

                // Show linked states if any
                if (
                  errorData.linkedStates &&
                  errorData.linkedStates.length > 0
                ) {
                  const statesList = errorData.linkedStates
                    .map(
                      (state) =>
                        `• ${state.name} (${state.stateId}) - ${state.status}`
                    )
                    .join("\n");

                  htmlContent += `
                  <div style="margin-bottom: 15px;">
                    <p style="margin-bottom: 5px;"><strong>Linked States (${errorData.linkedStatesCount}):</strong></p>
                    <div style="background: #fff3e0; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-line; border-left: 4px solid #ff9800;">
${statesList}
                    </div>
                  </div>
                `;
                }

                htmlContent += `
                  <p style="margin-top: 15px; color: #6c757d; font-size: 14px;">
                    <strong>Note:</strong> Please remove this region from all linked users and states before deleting it.
                  </p>
                </div>
              `;

                Swal.fire({
                  title: "Cannot Delete Region",
                  html: htmlContent,
                  icon: "error",
                  confirmButtonText: "OK",
                  customClass: {
                    popup: "swal-wide",
                  },
                });
              } else {
                // Fallback error message
                Swal.fire({
                  title: "Cannot Delete Region",
                  text:
                    errorData.message ||
                    "Region is linked and cannot be deleted",
                  icon: "error",
                  confirmButtonText: "OK",
                });
              }
            } else if (error.response && error.response.status === 404) {
              // Region not found
              Swal.fire({
                title: "Region Not Found",
                text: "The region you're trying to delete doesn't exist.",
                icon: "error",
                confirmButtonText: "OK",
              });
            } else {
              // Generic error
              Swal.fire({
                title: "Error",
                text:
                  error.response?.data?.message ||
                  error.message ||
                  "Failed to delete region",
                icon: "error",
                confirmButtonText: "OK",
              });
            }
          });
      }
    });
  };
  const handleToggleStatus = async (
    id,
    currentStatus,
    regionName,
    currentCountry
  ) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/collections/api/region/${id}`,
        {
          regionName: regionName,
          country: currentCountry,
          status: newStatus,
        }
      );

      if (response.status === 200) {
        toast.success(
          `Region ${
            newStatus === "Active" ? "activated" : "deactivated"
          } successfully!`
        );

        getAllData();
      }
    } catch (error) {
      console.error("Error updating status:", error);

      // Handle different error scenarios
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;

        // Check if it's a user link error (for deactivation)
        if (errorData.linkedUsers && errorData.linkedUsers.length > 0) {
          // Show detailed error with linked users
          const usersList = errorData.linkedUsers
            .map((user) => `• ${user.name} (${user.employeeid})`)
            .join("\n");

          Swal.fire({
            title: "Cannot Deactivate Region",
            html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 10px;">${errorData.message}</p>
              <p style="margin-bottom: 10px;"><strong>Linked Users (${errorData.linkedUsersCount}):</strong></p>
              <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-line; border-left: 4px solid #2196f3;">
${usersList}
              </div>
              <p style="margin-top: 10px; color: #6c757d; font-size: 14px;">
                <strong>Note:</strong> Please remove this region from all linked users before deactivating it.
              </p>
            </div>
          `,
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
              popup: "swal-wide",
            },
          });
        } else {
          // Other 400 errors (validation, etc.)
          Swal.fire({
            title: "Cannot Update Status",
            text: errorData.message || "Failed to update region status",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } else if (error.response && error.response.status === 404) {
        // Region not found
        Swal.fire({
          title: "Region Not Found",
          text: "The region you're trying to update doesn't exist.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        // Generic error - use toast for other errors
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to update status"
        );
      }
    }
  };

  const handleSearch = async (pageNum = 1) => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setPage(1);
      getAllData();
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    setPage(pageNum);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchregion?q=${searchQuery}&page=${pageNum}&limit=${limit}`
      );

      setData(response.data.regions || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalRegions(response.data.totalRegions || 0);
      setLoader(false);
    } catch (error) {
      console.error("Error searching regions:", error);
      setData([]);
      setTotalPages(1);
      setTotalRegions(0);
      setLoader(false);
    }
  };

  const getAllData = useCallback(
    async (pageNum = page) => {
      try {
        console.log("🔄 Refreshing data..."); // Debug log
        setLoader(true);
        setPage(pageNum);

        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/api/allregion?page=${pageNum}&limit=${limit}`
        );

        console.log("📊 New data received:", res.data); // Debug log
        setData(res.data.regions);
        setTotalPages(res.data.totalPages);
        setTotalRegions(res.data.totalRegion || 0);
      } catch (error) {
        console.error("Failed to fetch region data:", error);
        setData([]);
        setTotalPages(1);
        setTotalRegions(0);
      } finally {
        setLoader(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    if (!searchQuery) {
      getAllData();
    }
  }, [searchQuery]);
  useEffect(() => {
    getAllData();
  }, [getAllData]);
  useEffect(() => {
    if (isSearchMode && searchQuery) {
      handleSearch(page);
    } else if (!isSearchMode) {
      getAllData(page);
    }
  }, [page]);
  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditData(id);
    } else {
      handleAddData();
    }
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddData = () => {
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/collections/api/region`,
        currentData
      )
      .then(() => {
        getAllData();
        toast.success("Region added successfully!");
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message || "Failed to add region.";
        console.error(errorMsg);
        toast.error(errorMsg);
      });
  };

  const handleEditData = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/collections/api/region/${id}`,
        currentData
      )
      .then(() => {
        getAllData();
        handleCloseModal();
        toast.success("Region updated successfully!");
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message || "Failed to update region.";
        console.error(errorMsg);
        toast.error(errorMsg);
      });
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1); // Let useEffect handle the data loading
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1); // Let useEffect handle the data loading
    }
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
            {/* Top Row: Search and Main Actions */}
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
                          if (searchQuery.trim()) {
                            handleSearch(1);
                          } else {
                            setIsSearchMode(false);
                            setSearchQuery("");
                            setPage(1);
                            getAllData(1);
                          }
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        if (value === "" && isSearchMode) {
                          setIsSearchMode(false);
                          setPage(1);
                          getAllData(1);
                        }
                      }}
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
                {/* Refresh Button Always Visible */}
                <button
                  type="button"
                  onClick={() => {
                    setisSpinning(true);
                    getAllData();
                    setTimeout(() => setisSpinning(false), 1000);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-md font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""} `}
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
              </div>
            </div>

            {/* Bottom Row: Filter, Download Excel */}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button
                onClick={downloadRegionExcel}
                disabled={isDownloadingRegion}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDownloadingRegion
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
                }`}
              >
                {isDownloadingRegion ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <span className="hidden sm:inline">Downloading...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download Excel</span>
                    <span className="sm:inline hidden">Download</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add this div before the table */}
          <div className="flex justify-between items-center ">
            <div className="text-sm text-gray-600">
              {isSearchMode && searchQuery ? (
                <span>
                  Search Results:{" "}
                  <span className="font-semibold">{totalRegions}</span> regions
                  found for "{searchQuery}"
                </span>
              ) : (
                <span>
                  Total Records:{" "}
                  <span className="font-semibold">{totalRegions}</span> regions
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full overflow-x-auto">
            <table className="w-full  border  min-w-max caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b bg-blue-700 ">
                <tr className="border-b transition-colors  text-white hover:bg-muted/50 data-[state=selected]:bg-muted">
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
                    Region Name
                  </th>

                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Country
                  </th>

                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Created Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Modified Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data && data.length > 0 ? (
                  <>
                    {data.map((region, regionIndex) => {
                      const regionId = region?._id || `region-${regionIndex}`;
                      const createdAt = region?.createdAt
                        ? moment(region.createdAt).format("MMM D, YYYY")
                        : "N/A";
                      const modifiedAt = region?.modifiedAt
                        ? moment(region.modifiedAt).format("MMM D, YYYY")
                        : createdAt;

                      const countries = Array.isArray(region.country)
                        ? region.country
                        : [region.country];

                      return countries.map((country, stateIndex) => (
                        <tr
                          key={`${regionId}-${stateIndex}`}
                          className={`border-b transition-colors ${
                            selectedRows?.includes(regionId)
                              ? "bg-gray-300"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {/* 🟢 Only show these fields once using rowSpan */}
                          {stateIndex === 0 && (
                            <>
                              <th
                                scope="col"
                                className="p-4"
                                rowSpan={countries.length}
                              >
                                <div className="flex items-center">
                                  <input
                                    id={`checkbox-${regionIndex}`}
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                                    checked={selectedRows?.includes(regionId)}
                                    onChange={() => handleRowSelect(regionId)}
                                  />

                                  <label
                                    htmlFor={`checkbox-${regionIndex}`}
                                    className="sr-only"
                                  >
                                    Select row
                                  </label>
                                </div>
                              </th>
                              <td
                                className="p-4 font-bold text-md capitalize align-middle whitespace-nowrap"
                                rowSpan={countries.length}
                              >
                                {region.regionName}
                              </td>
                            </>
                          )}

                          <td className="p-4 text-md capitalize align-middle whitespace-nowrap">
                            {country}
                          </td>
                          <td>
                            <span
                              className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                                region?.status === "Active"
                                  ? "bg-green-100 text-green-800 border-green-400"
                                  : region?.status === "Inactive"
                                  ? "bg-red-100 text-red-800  border-red-400"
                                  : "bg-orange-100 text-orange-800  border-orange-400"
                              }`}
                            >
                              {region?.status}
                            </span>
                          </td>
                          {stateIndex === 0 && (
                            <>
                              <td
                                className="p-4 align-middle whitespace-nowrap"
                                rowSpan={countries.length}
                              >
                                {createdAt}
                              </td>
                              <td
                                className="p-4 align-middle whitespace-nowrap"
                                rowSpan={countries.length}
                              >
                                {modifiedAt}
                              </td>
                              <td
                                className="p-4 align-middle whitespace-nowrap"
                                rowSpan={countries.length}
                              >
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => handleOpenModal(region)}
                                    title="Edit Region"
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
                                      onClick={() => handleDelete(region._id)}
                                      title="Delete Region"
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
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="sr-only peer "
                                      checked={region?.status === "Active"}
                                      onChange={() =>
                                        handleToggleStatus(
                                          region?._id,
                                          region?.status,
                                          region?.regionName,
                                          region?.country // Pass current country data
                                        )
                                      }
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute  pt-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                  </label>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ));
                    })}
                  </>
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4">
                      {isSearchMode
                        ? `No regions found for "${searchQuery}"`
                        : "No regions found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                      onClick={() => setPage(p)} // Change this line
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
          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className="z-[1] thin-scroll"
            size="lg"
          >
            <ModalDialog size="lg" className="p-2  thin-scroll">
              <div className="flex items-start justify-between p-2 border-b px-5 border-solid border-blueGray-200 rounded-t thin-scroll">
                <h3 className="text-xl font-semibold">
                  {editModal ? "Update Region" : "Create Region"}
                </h3>
                <div
                  onClick={() => handleCloseModal()}
                  className=" border p-2 rounded-[4px] hover:bg-gray-200 cursor-pointer "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="bi bi-x-lg font-semibold "
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
                <div className=" w-[300px] md:w-[500px] lg:w-[700px] border-b border-solid border-blueGray-200 p-3 flex-auto max-h-[380px] overflow-y-auto">
                  <div className="grid md:grid-cols-2 md:gap-6 w-full">
                    <div className="relative  w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900 ">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Region Name"
                        onChange={(e) =>
                          handleFormData("regionName", e.target.value)
                        }
                        id="regionName"
                        value={currentData?.regionName}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5     "
                      />
                    </div>
                    {/* <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Region ID
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Region ID"
                        onChange={(e) =>
                          handleFormData("regionID", e.target.value)
                        }
                        value={currentData?.regionID || ""}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div> */}

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900 ">
                        Status
                      </label>

                      <Select
                        variant="soft"
                        className="rounded-[4px] py-2 border"
                        defaultValue={currentData?.status || ""}
                        onChange={(e, value) => handleFormData("status", value)}
                      >
                        <Option value="">Select Status</Option>
                        <Option value="Active">Active</Option>
                        <Option value="Pending">Pending</Option>
                        <Option value="Inactive">Inactive</Option>
                      </Select>
                    </div>
                  </div>
                  <div className="relative  w-full mb-5 group">
                    <label className="block mb-2 text-sm font-medium text-gray-900 ">
                      Country{" "}
                    </label>
                    <Autocomplete
                      options={country}
                      value={selectedcountry}
                      onChange={(event, value) => {
                        setSelectedcountry(value);
                        const selected = value?.label || "";
                        handleFormData("country", selected);
                      }}
                      getOptionLabel={(option) => option.label ?? ""}
                      isOptionEqualToValue={(option, value) =>
                        option._id === value._id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Country"
                          variant="outlined"
                        />
                      )}
                      sx={{
                        width: "100%",
                        "& .MuiAutocomplete-inputRoot": {
                          flexWrap: "wrap",
                          alignItems: "flex-start",
                          paddingTop: "8px",
                          paddingBottom: "8px",
                        },
                        "& .MuiChip-root": {
                          margin: "2px",
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end mt-3 rounded-b">
                  <button
                    onClick={() => handleCloseModal()}
                    type="button"
                    className=" focus:outline-none border h-8  shadow text-black flex items-center hover:bg-gray-200  font-medium rounded-[4px] text-sm px-5 py-2.5    me-2 mb-2"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 h-8 hover:bg-blue-800 focus:ring-4  flex items-center px-8 focus:ring-blue-300 font-medium rounded-[4px] text-sm  py-2.5 me-2 mb-2 :bg-blue-600 :hover:bg-blue-700 focus:outline-none :focus:ring-blue-800 me-2 mb-2"
                  >
                    {editModal ? "Update Region" : "Create Region"}
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

export default AdminRegion;
