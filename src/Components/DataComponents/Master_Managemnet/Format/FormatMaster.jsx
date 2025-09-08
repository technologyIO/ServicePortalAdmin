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
import BulkModal from "../../BulkUpload.jsx/BulkModal";
import LoadingSpinner from "../../../../LoadingSpinner";
import toast from "react-hot-toast";

function FormatMaster() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  // Removed BranchData, state, cityList, country, dealerList because they're not needed
  const [currentData, setCurrentData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;
  const [totalFormatMasters, setTotalFormatMasters] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;
  const [isSpinning, setisSpinning] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(data?.map((item) => item._id));
    } else {
      setSelectedRows([]);
    }
  };
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((itemId) => itemId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [isDownloadingFormatMaster, setIsDownloadingFormatMaster] =
    useState(false);
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/master/format/${id}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        toast.success(
          `Format Master ${
            newStatus === "Active" ? "activated" : "deactivated"
          } successfully!`
        );
        getData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };
  // Add this function inside your FormatMaster component
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select format masters to delete");
      return;
    }

    Swal.fire({
      title: "Delete Selected Format Masters?",
      text: `You are about to delete ${selectedRows.length} format masters permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${process.env.REACT_APP_BASE_URL}/master/format/bulk`, {
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
            getData();
          })
          .catch((error) => {
            console.error("Bulk delete error:", error);
            Swal.fire({
              title: "Error!",
              text:
                error.response?.data?.message ||
                "Failed to delete format masters",
              icon: "error",
            });
          });
      }
    });
  };

  const downloadFormatMasterExcel = async () => {
    setIsDownloadingFormatMaster(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/formatmaster/export-formatmaster`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `format_master_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download Format Master Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingFormatMaster(false);
    }
  };
  // Updated Create button handler to open modal for new record creation
  const handleCreateModal = () => {
    setCurrentData({}); // clear form data
    setEditModal(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditModal(false);
    setCurrentData({});
  };

  const handleOpenModal = (record) => {
    setCurrentData(record);
    setEditModal(true);
    setShowModal(true);
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          .delete(`${process.env.REACT_APP_BASE_URL}/master/format/${id}`)
          .then(() => {
            Swal.fire("Deleted!", "Record has been deleted.", "success");
          })
          .then(() => {
            getData();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleSearch = async (pageNum = 1) => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    setPage(pageNum);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/master/searchformat?q=${searchQuery}&page=${pageNum}&limit=${limit}`
      );

      setData(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalFormatMasters(response.data.totalFormatMasters || 0);
      setLoader(false);
    } catch (error) {
      console.error("Error searching format masters:", error);
      setData([]);
      setTotalPages(1);
      setTotalFormatMasters(0);
      setLoader(false);
    }
  };

  const getData = (pageNum = page) => {
    setLoader(true);
    setPage(pageNum);

    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/master/format/paginated?page=${pageNum}&limit=${limit}`
      )
      .then((res) => {
        setData(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalFormatMasters(res.data.totalFormatMasters || 0);
        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error);
        setData([]);
        setTotalPages(1);
        setTotalFormatMasters(0);
      });
  };

  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchMode && searchQuery) {
      handleSearch(page);
    } else if (!isSearchMode) {
      getData(page);
    }
  }, [page]); // Only trigger on page changes

  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditRecord(id);
    } else {
      handleCreateRecord();
    }
  };

  const handleCreateRecord = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/master/format`, currentData)
      .then((res) => {
        getData();
        toast.success(res.data?.message || "Format created successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to create format. Please try again."
        );
      });
  };

  const handleEditRecord = (id) => {
    axios
      .put(`${process.env.REACT_APP_BASE_URL}/master/format/${id}`, currentData)
      .then((res) => {
        getData();
        toast.success(res.data?.message || "Format updated successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update format. Please try again."
        );
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
            {/* Row 1: Search Bar and Primary Actions */}
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
                            getData(1);
                          }
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        if (value === "" && isSearchMode) {
                          setIsSearchMode(false);
                          setPage(1);
                          getData(1);
                        }
                      }}
                      className="bg-gray-50 h-10 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 w-full"
                    />
                  </FormControl>
                </div>

                <button
                  onClick={() => handleSearch(1)}
                  type="button"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 whitespace-nowrap mb-2"
                >
                  Search
                </button>
              </div>

              <div className="flex gap-3">
                {/* Refresh */}
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

                {/* Create New */}
                <button
                  onClick={handleCreateModal}
                  type="button"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 whitespace-nowrap mb-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>

                {/* Conditionally show Delete Selected */}
                {selectedRows?.length > 0 &&
                  currentUserRole === "Super Admin" && (
                    <div className="animate-in slide-in-from-right-2 duration-300">
                      <button
                        onClick={handleBulkDelete}
                        type="button"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 whitespace-nowrap mb-2"
                      >
                        <span className="hidden sm:inline">
                          Delete Selected
                        </span>
                        <span className="sm:hidden">Delete</span>
                        <span className="ml-1 bg-red-700/30 px-2 py-0.5 rounded-full text-xs">
                          ({selectedRows.length})
                        </span>
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {/* Row 2: Secondary Action Buttons */}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                onClick={openModal}
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
                onClick={downloadFormatMasterExcel}
                disabled={isDownloadingFormatMaster}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isDownloadingFormatMaster
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
                }`}
              >
                {isDownloadingFormatMaster ? (
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

          <div className="flex justify-end ">
            {/* {selectedRows?.length > 0 && (
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-[4px] text-sm px-5 py-2.5 mb-2"
              >
                Delete Selected
              </button>
            )} */}
          </div>
          {/* Add this div before the table */}
          <div className="flex justify-between items-center ">
            <div className="text-sm text-gray-600">
              {isSearchMode && searchQuery ? (
                <span>
                  Search Results:{" "}
                  <span className="font-semibold">{totalFormatMasters}</span>{" "}
                  format masters found for "{searchQuery}"
                </span>
              ) : (
                <span>
                  Total Records:{" "}
                  <span className="font-semibold">{totalFormatMasters}</span>{" "}
                  format masters
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full overflow-x-auto border">
            <table className="w-full border min-w-max caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b bg-blue-700">
                <tr className="border-b text-white">
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
                  <th className="px-4 text-left font-medium">Product Group</th>
                  <th className="px-4 text-left font-medium">Chl No</th>
                  <th className="px-4 text-left font-medium">Rev No</th>
                  <th className="px-4 text-left font-medium">Type</th>
                  <th className="px-4 text-left font-medium">Status</th>
                  <th className="px-4 text-left font-medium">Created Date</th>
                  <th className="px-4 text-left font-medium">Modified Date</th>
                  <th className="px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((item, index) => (
                  <tr
                    key={item?._id}
                    className={`border-b transition-colors ${
                      selectedRows?.includes(item?._id)
                        ? "bg-gray-300"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <th scope="row" className="p-4">
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
                    <td className="p-4 capitalize">{item?.productGroup}</td>
                    <td className="p-4">{item?.chlNo}</td>
                    <td className="p-4">{item?.revNo}</td>
                    <td className="p-4">{item?.type}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                          item?.status === "Active"
                            ? "bg-green-100 text-green-800 border-green-400"
                            : "bg-red-100 text-red-800 border-red-400"
                        }`}
                      >
                        {item?.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {moment(item?.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4">
                      {moment(item?.updatedAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="border p-2 bg-blue-700 text-white rounded hover:bg-blue-500"
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
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="Pagination-laptopUp flex justify-between p-4">
              <button
                className={`border rounded p-1 w-[100px] ${
                  page === 1 ? "cursor-not-allowed" : "cursor-pointer"
                } bg-gray-100 font-semibold hover:bg-gray-300`}
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                Previous
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      (p >= page - 3 && p <= page + 3)
                  )
                  .map((p, i, array) => (
                    <React.Fragment key={p}>
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
                className="border rounded p-1 w-[100px] bg-blue-700 text-white font-semibold hover:bg-blue-500"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
          {/* Modal for Create / Edit Record */}
          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className="z-[1]"
            size="lg"
          >
            <ModalDialog size="lg" className="p-2">
              <div className="flex items-start justify-between w-[700px] p-2 px-5 border-b">
                <h3 className="text-xl font-semibold">
                  {editModal ? "Update Record" : "Create Record"}
                </h3>
                <div
                  onClick={handleCloseModal}
                  className="border p-2 rounded hover:bg-gray-200 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="bi bi-x-lg"
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
                className="p-3 max-h-[380px] overflow-y-auto"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Product Group{" "}
                      <span className="text-red-500 text-lg ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentData?.productGroup || ""}
                      onChange={(e) =>
                        handleFormData("productGroup", e.target.value)
                      }
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Chl No{" "}
                      <span className="text-red-500 text-lg ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentData?.chlNo || ""}
                      onChange={(e) => handleFormData("chlNo", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Rev No{" "}
                      <span className="text-red-500 text-lg ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={currentData?.revNo || ""}
                      onChange={(e) => handleFormData("revNo", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Type <span className="text-red-500 text-lg ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={currentData?.type || ""}
                      onChange={(e) => handleFormData("type", e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 text-sm rounded p-2"
                    />
                  </div>
                  <div className="relative">
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Status
                    </label>
                    <Select
                      variant="soft"
                      defaultValue={currentData?.status || ""}
                      onChange={(e, value) => handleFormData("status", value)}
                      className="w-full"
                    >
                      <Option value="">Select Status</Option>
                      <Option value="Active">Active</Option>
                      <Option value="Inactive">Inactive</Option>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end mt-3">
                  <button
                    onClick={handleCloseModal}
                    type="button"
                    className="border shadow text-black hover:bg-gray-200 font-medium rounded text-sm px-5 py-2.5"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 hover:bg-blue-800 flex items-center px-8 font-medium rounded text-sm py-2.5"
                  >
                    {editModal ? "Update Record" : "Create Record"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-gray-200 rounded-lg p-6 w-[80vh] relative">
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-3xl text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
                <BulkModal />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default FormatMaster;
