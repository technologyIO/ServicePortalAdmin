import React, { useEffect, useState } from "react";

import FormControl from "@mui/joy/FormControl";

import Input from "@mui/joy/Input";

import SearchIcon from "@mui/icons-material/Search";
import { Download, Filter, Plus, RefreshCw, Upload } from "lucide-react";

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
import BulkModal from "../BulkUpload.jsx/BulkModal";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../LoadingSpinner";

const AdminBranch = () => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const limit = 10;
  const [loader, setLoader] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalBranches, setTotalBranches] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [isDownloadingBranch, setIsDownloadingBranch] = useState(false);

  const downloadBranchExcel = async () => {
    setIsDownloadingBranch(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/branches/export-branches`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `branches_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download Branch Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingBranch(false);
    }
  };
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/collections/branch/${id}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        toast.success(
          `Branch ${
            newStatus === "Active" ? "activated" : "deactivated"
          } successfully!`
        );
        getAllData(); // Refresh the data
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
            title: "Cannot Deactivate Branch",
            html: `
            <div style="text-align: left;">
              <p style="margin-bottom: 10px;">${errorData.message}</p>
              <p style="margin-bottom: 10px;"><strong>Linked Users (${errorData.linkedUsersCount}):</strong></p>
              <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-line;">
${usersList}
              </div>
              <p style="margin-top: 10px; color: #6c757d; font-size: 14px;">
                <strong>Note:</strong> Please remove this branch from all linked users before deactivating it.
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
            text: errorData.message || "Failed to update branch status",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } else if (error.response && error.response.status === 404) {
        // Branch not found
        Swal.fire({
          title: "Branch Not Found",
          text: "The branch you're trying to update doesn't exist.",
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

  // Loading Spinner Component

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
  const handleRowSelect = (countryId) => {
    if (selectedRows.includes(countryId)) {
      // Deselect the row
      setSelectedRows(selectedRows.filter((id) => id !== countryId));
    } else {
      // Select the row
      setSelectedRows([...selectedRows, countryId]);
    }
  };

  const handleCloseModal = () => {
    setShowModal((prev) => !prev);
    setEditModal(false);
    setCurrentData({});
  };

  const [state, setState] = useState([]);

  // Get All State
  useEffect(() => {
    const getRegions = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allstate`
        );

        setState(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    getRegions();
  }, []);

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
  // Add this function inside your AdminBranch component
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select branches to delete");
      return;
    }

    Swal.fire({
      title: "Delete Selected Branches?",
      text: `You are about to delete ${selectedRows.length} branches permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${process.env.REACT_APP_BASE_URL}/collections/branch/bulk`, {
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
            getAllData();
          })
          .catch((error) => {
            console.error("Bulk delete error:", error);
            Swal.fire({
              title: "Error!",
              text:
                error.response?.data?.message || "Failed to delete branches",
              icon: "error",
            });
          });
      }
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
          .delete(`${process.env.REACT_APP_BASE_URL}/collections/branch/${id}`)
          .then((res) => {
            Swal.fire(
              "Deleted!",
              "Branch has been deleted successfully.",
              "success"
            );
            getAllData(); // Refresh the data
          })
          .catch((error) => {
            console.log(error);

            // Handle different error scenarios
            if (error.response && error.response.status === 400) {
              // Branch is linked with users and/or cities
              const errorData = error.response.data;

              if (
                (errorData.linkedUsers && errorData.linkedUsers.length > 0) ||
                (errorData.linkedCities && errorData.linkedCities.length > 0)
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

                // Show linked cities if any
                if (
                  errorData.linkedCities &&
                  errorData.linkedCities.length > 0
                ) {
                  const citiesList = errorData.linkedCities
                    .map(
                      (city) =>
                        `• ${city.name}${
                          city.cityID ? ` (${city.cityID})` : ""
                        } - ${city.status}`
                    )
                    .join("\n");

                  htmlContent += `
                  <div style="margin-bottom: 15px;">
                    <p style="margin-bottom: 5px;"><strong>Linked Cities (${errorData.linkedCitiesCount}):</strong></p>
                    <div style="background: #fff3e0; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-line; border-left: 4px solid #ff9800;">
${citiesList}
                    </div>
                  </div>
                `;
                }

                htmlContent += `
                  <p style="margin-top: 15px; color: #6c757d; font-size: 14px;">
                    <strong>Note:</strong> Please remove this branch from all linked users and cities before deleting it.
                  </p>
                </div>
              `;

                Swal.fire({
                  title: "Cannot Delete Branch",
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
                  title: "Cannot Delete Branch",
                  text:
                    errorData.message ||
                    "Branch is linked and cannot be deleted",
                  icon: "error",
                  confirmButtonText: "OK",
                });
              }
            } else if (error.response && error.response.status === 404) {
              // Branch not found
              Swal.fire({
                title: "Branch Not Found",
                text: "The branch you're trying to delete doesn't exist.",
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
                  "Failed to delete branch",
                icon: "error",
                confirmButtonText: "OK",
              });
            }
          });
      }
    });
  };

  const handleSearch = async (pageNum = 1) => {
    if (!searchQuery.trim()) {
      getAllData();
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    setPage(pageNum);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchbranch?q=${searchQuery}&page=${pageNum}&limit=${limit}`
      );

      setData(response.data.branches || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalBranches(response.data.totalBranches || 0);
      setLoader(false);
    } catch (error) {
      console.error("Search error:", error);
      setData([]);
      setTotalPages(1);
      setTotalBranches(0);
      setLoader(false);
    }
  };

  const getAllData = (pageNum = page) => {
    setLoader(true);
    setIsSearchMode(false);
    setPage(pageNum);
    setSearchQuery("");

    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/branch?page=${pageNum}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.branches);
        setTotalPages(res.data.totalPages);
        setTotalBranches(res.data.totalBranches || 0);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error);
        setData([]);
        setTotalPages(1);
        setTotalBranches(0);
      });
  };

  useEffect(() => {
    if (!searchQuery) {
      getAllData();
    }
  }, [searchQuery]);

  useEffect(() => {
    getAllData();
  }, [page]);

  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditData(id);
    } else {
      handleAddData();
    }
    // Don't call handleCloseModal() here - it's now handled in success callbacks
  };

  const handleAddData = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/collections/branch`, currentData)
      .then((res) => {
        getAllData();
        handleCloseModal();
        toast.success("Branch added successfully");
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong"
        );
      });
  };

  const handleEditData = (id) => {
    axios
      .patch(
        `${process.env.REACT_APP_BASE_URL}/collections/branch/${id}`,
        currentData
      )
      .then((res) => {
        getAllData();
        handleCloseModal(); // Add this line
        toast.success("Branch updated successfully");
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong"
        );
      });
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      if (isSearchMode) {
        handleSearch(newPage);
      } else {
        getAllData(newPage);
      }
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      if (isSearchMode) {
        handleSearch(newPage);
      } else {
        getAllData(newPage);
      }
    }
  };

  const handlePageClick = (pageNum) => {
    if (isSearchMode) {
      handleSearch(pageNum);
    } else {
      getAllData(pageNum);
    }
  };

  return (
    <>
      {loader ? (
        <div className="flex items-center justify-center h-[60vh]">
          <span class="CustomLoader"></span>
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch(1);
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
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-md font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
                >
                  <RefreshCw className="w-4 h-4" />
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
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

              <button
                onClick={downloadBranchExcel}
                disabled={isDownloadingBranch}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDownloadingBranch
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
                }`}
              >
                {isDownloadingBranch ? (
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
              {isSearchMode ? (
                <span>
                  Search Results:{" "}
                  <span className="font-semibold">{totalBranches}</span>{" "}
                  branches found for "{searchQuery}"
                </span>
              ) : (
                <span>
                  Total Records:{" "}
                  <span className="font-semibold">{totalBranches}</span>{" "}
                  branches
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
                    Branch Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    State
                  </th>

                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Branch Short Code
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
              <tbody className="[&amp;_tr:last-child]:border-0  ">
                {data?.map((i, index) => (
                  <tr
                    key={i._id}
                    className={`border-b transition-colors ${
                      selectedRows?.includes(i?._id)
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
                          checked={selectedRows?.includes(i?._id)}
                          onChange={() => handleRowSelect(i?._id)}
                        />
                        <label
                          htmlFor={`checkbox-${index}`}
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </th>
                    <td className="p-4 font-bold text-md capitalize align-middle whitespace-nowrap">
                      {i?.name}
                    </td>
                    <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.state}
                    </td>

                    <td className="p-4  text-md capitalize align-middle whitespace-nowrap">
                      {i?.branchShortCode}
                    </td>
                    <td>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                          i?.status === "Active"
                            ? "bg-green-100 text-green-800 border-green-400"
                            : i?.status === "Inactive"
                            ? "bg-red-100 text-red-800  border-red-400"
                            : "bg-orange-100 text-orange-800  border-orange-400"
                        }`}
                      >
                        {i?.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      {moment(i?.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      {moment(i?.modifiedAt).format("MMM D, YYYY")}
                    </td>

                    <td className="p-4 align-middle whitespace-nowrap">
                      <div className="flex gap-4 ">
                        <button
                          onClick={() => {
                            handleOpenModal(i);
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
                              fill-rule="evenodd"
                              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                            />
                          </svg>
                        </button>
                        {currentUserRole === "Super Admin" && (
                          <button
                            onClick={() => handleDelete(i?._id)}
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
                        <td className=" align-middle whitespace-nowrap">
                          <div className="flex gap-2 items-center justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer "
                                checked={i?.status === "Active"}
                                onChange={() =>
                                  handleToggleStatus(i?._id, i?.status)
                                }
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute  pt-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </td>
                      </div>
                    </td>
                  </tr>
                ))}
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
                      onClick={() => handlePageClick(p)}
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

          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              {/* Modal Content */}

              <div className="bg-gray-200 rounded-lg p-6 w-[80vh]  relative">
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
            className=""
            size="lg"
          >
            <ModalDialog size="lg" className="p-2 ">
              <div className="flex items-start justify-between p-2  px-5 border-solid border-blueGray-200 rounded-t thin-scroll">
                <h3 className="text-2xl font-semibold">
                  {editModal ? "Update Branch" : "Create Branch"}
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
                  handleSubmit(currentData?._id);
                }}
                className=""
              >
                <div className=" w-[300px] md:w-[500px] lg:w-[700px] border-b border-solid border-blueGray-200 p-3 flex-auto max-h-[380px] overflow-y-auto">
                  <div class="relative z-0 w-full mb-5 group">
                    <label class="block mb-2 text-sm font-medium text-gray-900">
                      Branch Name{" "}
                      <span className="text-red-500 text-lg ml-1">*</span>
                    </label>
                    <input
                      onChange={(e) => handleFormData("name", e.target.value)}
                      type="text"
                      required
                      name="name"
                      id="name"
                      value={currentData?.name}
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      placeholder=" "
                    />
                  </div>
                  <div class="grid md:grid-cols-2 md:gap-6">
                    <div class="relative z-0 w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900">
                        Branch Short Code{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        onChange={(e) =>
                          handleFormData("branchShortCode", e.target.value)
                        }
                        type="text"
                        name="name"
                        id="name"
                        value={currentData?.branchShortCode}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                        placeholder=" "
                        required
                      />
                    </div>
                    <div className="">
                      <div>
                        <label class="block mb-2 text-sm font-medium text-gray-900">
                          Select State{" "}
                          <span className="text-red-500 text-lg ml-1">*</span>
                        </label>
                        <Autocomplete
                          className="h-10 w-full"
                          required
                          options={state} // Data from API
                          getOptionLabel={(option) => option.name} // Display the country name
                          value={
                            state.find((s) => s.name === currentData?.state) ||
                            null
                          } // Add this line
                          renderInput={(params) => (
                            <TextField {...params} name="state" label="State" />
                          )}
                          sx={{ width: 300 }}
                          onChange={(event, value) =>
                            handleFormData("state", value ? value.name : "")
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block mb-2 text-sm font-medium text-gray-900">
                      Select Status
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
                <div className="flex items-center justify-end mt-3 rounded-b">
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Add this to prevent form submission
                      handleCloseModal();
                    }}
                    type="button"
                    class="focus:outline-none border h-8  shadow text-black flex items-center hover:bg-gray-200  font-medium rounded-[4px] text-sm px-5 py-2.5    me-2 mb-2"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    className="text-white bg-blue-700 h-8 hover:bg-blue-800 focus:ring-4  flex items-center px-8 focus:ring-blue-300 font-medium rounded-[4px] text-sm  py-2.5 me-2 mb-2 :bg-blue-600 :hover:bg-blue-700 focus:outline-none :focus:ring-blue-800 me-2 mb-2"
                  >
                    {editModal ? "Update Branch" : "Create Branch"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
        </>
      )}
    </>
  );
};

export default AdminBranch;
