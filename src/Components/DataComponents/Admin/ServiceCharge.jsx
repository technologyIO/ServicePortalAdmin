import React, { useEffect, useState } from "react";
import { Modal, ModalDialog } from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import LoadingSpinner from "../../../LoadingSpinner";
import toast from "react-hot-toast";
import { Download, Filter, Plus, RefreshCw, Upload } from "lucide-react";

// API root

const emptyData = {
  partNumber: "",
  description: "",
  Product: "",
  cmcPrice: "",
  ncmcPrice: "",
  onCallVisitCharge: {
    withinCity: "",
    outsideCity: "",
  },
  remarks: "",
  status: "Active",
};

function ServiceCharge() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentData, setCurrentData] = useState(emptyData);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loader, setLoader] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [totalServiceCharges, setTotalServiceCharges] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;
  const [isSpinning, setisSpinning] = useState(false);
  const [isDownloadingServiceCharge, setIsDownloadingServiceCharge] =
    useState(false);

  const downloadServiceChargeExcel = async () => {
    setIsDownloadingServiceCharge(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/servicecharges/export-servicecharges`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `service_charges_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download Service Charge Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingServiceCharge(false);
    }
  };
  // Data fetch
  const handleToggleStatus = async (id, currentStatus, partNumber) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/admin/service-charge/${id}`,
        {
          partNumber: partNumber, // Include partNumber as required by backend
          status: newStatus,
        }
      );

      if (response.status === 200) {
        toast.success(
          `Service Charge ${
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

  const getData = async (newPage = page) => {
    setLoader(true);
    setPage(newPage);

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/admin/service-charge/allservicecharge?page=${newPage}&limit=${limit}`
      );
      setData(res.data.serviceCharges || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalServiceCharges(res.data.totalServiceCharge || 0);
    } catch {
      setData([]);
      setTotalPages(1);
      setTotalServiceCharges(0);
    }
    setLoader(false);
  };

  // Search
  const handleSearch = async (pageNum = 1) => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    setPage(pageNum);

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/admin/service-charge/searchservice?q=${searchQuery}&page=${pageNum}&limit=${limit}`
      );
      setData(res.data.serviceCharges || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalServiceCharges(res.data.totalServiceCharges || 0);
    } catch {
      setData([]);
      setTotalPages(1);
      setTotalServiceCharges(0);
    }
    setLoader(false);
  };
  // Create
  const handleCreate = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/admin/service-charge`,
        {
          ...currentData,
          cmcPrice: Number(currentData.cmcPrice),
          ncmcPrice: Number(currentData.ncmcPrice),
          onCallVisitCharge: {
            withinCity: Number(currentData.onCallVisitCharge.withinCity),
            outsideCity: Number(currentData.onCallVisitCharge.outsideCity),
          },
        }
      );
      toast.success(
        res.data?.message || "Service charge created successfully!"
      );
      getData();
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create service charge. Please try again."
      );
    }
    handleCloseModal();
  };

  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);
  // Update
  const handleEdit = async (id) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/admin/service-charge/${id}`,
        {
          ...currentData,
          cmcPrice: Number(currentData.cmcPrice),
          ncmcPrice: Number(currentData.ncmcPrice),
          onCallVisitCharge: {
            withinCity: Number(currentData.onCallVisitCharge.withinCity),
            outsideCity: Number(currentData.onCallVisitCharge.outsideCity),
          },
        }
      );
      toast.success(
        res.data?.message || "Service charge updated successfully!"
      );
      getData();
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update service charge. Please try again."
      );
    }
    handleCloseModal();
  };

  // Delete
  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete?",
      text: "Can't be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${process.env.REACT_APP_BASE_URL}/admin/service-charge/${id}`
          )
          .then(() => {
            Swal.fire("Deleted!", "", "success");
            setSelectedRows((prev) => prev.filter((row) => row !== id));
            getData();
          });
      }
    });
  };

  // Modal controls
  const handleCloseModal = () => {
    setShowModal(false);
    setEditModal(false);
    setCurrentData(emptyData);
  };
  const handleOpenModal = (item) => {
    setEditModal(!!item?._id);
    setCurrentData(
      item && item._id
        ? {
            ...item,
            onCallVisitCharge: { ...item.onCallVisitCharge },
          }
        : { ...emptyData }
    );
    setShowModal(true);
  };

  // Form controls
  const handleFormData = (name, value) => {
    if (name === "withinCity" || name === "outsideCity") {
      setCurrentData((prev) => ({
        ...prev,
        onCallVisitCharge: {
          ...prev.onCallVisitCharge,
          [name]: value,
        },
      }));
    } else {
      setCurrentData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Submit
  const handleSubmit = (id) => {
    if (editModal && id) handleEdit(id);
    else handleCreate();
  };

  // Select logic
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedRows(!selectAll ? data.map((item) => item._id) : []);
  };
  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
    );
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (!selectedRows.length) return;
    Swal.fire({
      title: `Delete ${selectedRows.length}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete All",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${process.env.REACT_APP_BASE_URL}/admin/service-charge/bulk-delete`,
            { ids: selectedRows }
          )
          .then(() => {
            setSelectedRows([]);
            getData();
            Swal.fire("Deleted!", "", "success");
          });
      }
    });
  };

  // Pagination
  const handlePreviousPage = () => page > 1 && setPage(page - 1);
  const handleNextPage = () => page < totalPages && setPage(page + 1);

  useEffect(() => {
    if (isSearchMode && searchQuery) {
      handleSearch(page);
    } else if (!isSearchMode) {
      getData(page);
    }
  }, [page]);
  useEffect(() => {
    getData();
  }, []);
  useEffect(() => {
    setPage(1);
    if (!searchQuery) getData(1);
    // eslint-disable-next-line
  }, [searchQuery]);

  return (
    <>
      {/* Top controls */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
            <div className="relative flex-1">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search records, users, or data..."
                  startDecorator={<SearchIcon />}
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);

                    if (value === "" && isSearchMode) {
                      setIsSearchMode(false);
                      setPage(1);
                      getData(1);
                    }
                  }}
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

          {/* Primary Action Buttons */}
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
              onClick={() => handleOpenModal()}
              type="button"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>
          </div>
        </div>

        {/* Secondary Actions Row */}
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
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDownloadingServiceCharge
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
            }`}
            onClick={downloadServiceChargeExcel}
            disabled={isDownloadingServiceCharge}
          >
            {isDownloadingServiceCharge ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span className="hidden sm:inline">Downloading...</span>
                <span className="sm:hidden">...</span>
              </div>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Excel</span>
                <span className="sm:hidden">Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bulk delete */}
      {/* {selectedRows.length > 0 && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleBulkDelete}
            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 font-medium rounded text-sm px-5 py-2"
          >
            Delete Selected
          </button>
        </div>
      )} */}
      {/* Table */}
      <div className="flex justify-between items-center ">
        <div className="text-sm text-gray-600">
          {isSearchMode && searchQuery ? (
            <span>
              Search Results:{" "}
              <span className="font-semibold">{totalServiceCharges}</span>{" "}
              service charges found for "{searchQuery}"
            </span>
          ) : (
            <span>
              Total Records:{" "}
              <span className="font-semibold">{totalServiceCharges}</span>{" "}
              service charges
            </span>
          )}
        </div>
      </div>
      <div className="overflow-x-auto w-full rounded shadow-sm">
        <table className="w-full border text-sm min-w-max">
          <thead className="bg-blue-700">
            <tr className="text-white">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3">Part Number</th>
              <th className="p-3">Description</th>
              <th className="p-3">Product</th>
              <th className="p-3">CMC Price</th>
              <th className="p-3">NCMC Price</th>
              <th className="p-3">On-Call (With in city)</th>
              <th className="p-3">On-Call (Outside city)</th>
              <th className="p-3">Remarks</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Modified</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loader ? (
              <tr>
                <td colSpan={12} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-6 text-center text-gray-400">
                  No Data
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item._id}
                  className={`border-b transition-colors ${
                    selectedRows?.includes(item?._id)
                      ? "bg-gray-300"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item._id)}
                      onChange={() => handleRowSelect(item._id)}
                    />
                  </td>
                  <td className="p-3">{item.partNumber}</td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3">{item.Product}</td>
                  <td className="p-3">{item.cmcPrice}</td>
                  <td className="p-3">{item.ncmcPrice}</td>
                  <td className="p-3">{item?.onCallVisitCharge?.withinCity}</td>
                  <td className="p-3">
                    {item?.onCallVisitCharge?.outsideCity}
                  </td>
                  <td className="p-3">{item.remarks}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                        item?.status === "Active"
                          ? "bg-green-100 text-green-800 border-green-400"
                          : item?.status === "Inactive"
                          ? "bg-red-100 text-red-800  border-red-400"
                          : "bg-orange-100 text-orange-800  border-orange-400"
                      }`}
                    >
                      {item?.status || "Active"}
                    </span>
                  </td>
                  <td className="p-3">
                    {moment(item.createdAt).format("MMM D, YYYY")}
                  </td>
                  <td className="p-3">
                    {moment(item.updatedAt).format("MMM D, YYYY")}
                  </td>
                  <td className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="border p-1 bg-blue-700 text-white rounded mr-2"
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
                        onClick={() => handleDelete(item._id)}
                        className="border p-1 bg-red-600 text-white rounded"
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
                        checked={item?.status === "Active"}
                        onChange={() =>
                          handleToggleStatus(
                            item?._id,
                            item?.status || "Active",
                            item?.partNumber
                          )
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute  pt-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center my-4">
        <button
          className={`border rounded p-1 ${
            page === 1 ? "cursor-not-allowed" : "cursor-pointer"
          } w-[100px] bg-gray-100 font-semibold`}
          onClick={handlePreviousPage}
          disabled={page === 1}
        >
          Previous
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)
            )
            .map((p, i, arr) => (
              <React.Fragment key={p}>
                {i > 0 && p !== arr[i - 1] + 1 && <span>...</span>}
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
          className="border rounded p-1 hover:bg-blue-500 bg-blue-700 w-[100px] text-white font-semibold"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={handleCloseModal} size="lg">
        <ModalDialog size="lg" className="p-2 w-[700px] thin-scroll">
          <div className="flex items-start justify-between p-2 border-b px-5">
            <h3 className="text-xl font-semibold">
              {editModal ? "Update Service Charge" : "Create Service Charge"}
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
            className="thin-scroll"
          >
            <div className="grid md:grid-cols-2 gap-4 my-7">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Part Number
                </label>
                <input
                  type="text"
                  required
                  value={currentData.partNumber}
                  onChange={(e) => handleFormData("partNumber", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={currentData.description}
                  onChange={(e) =>
                    handleFormData("description", e.target.value)
                  }
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Product
                </label>
                <input
                  type="text"
                  required
                  value={currentData.Product}
                  onChange={(e) => handleFormData("Product", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  CMC Price
                </label>
                <input
                  type="number"
                  required
                  value={currentData.cmcPrice}
                  onChange={(e) => handleFormData("cmcPrice", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  NCMC Price
                </label>
                <input
                  type="number"
                  required
                  value={currentData.ncmcPrice}
                  onChange={(e) => handleFormData("ncmcPrice", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  On-Call (Within City)
                </label>
                <input
                  type="number"
                  required
                  value={currentData.onCallVisitCharge.withinCity}
                  onChange={(e) => handleFormData("withinCity", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  On-Call (Outside City)
                </label>
                <input
                  type="number"
                  required
                  value={currentData.onCallVisitCharge.outsideCity}
                  onChange={(e) =>
                    handleFormData("outsideCity", e.target.value)
                  }
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Remarks
                </label>
                <input
                  type="text"
                  value={currentData.remarks}
                  onChange={(e) => handleFormData("remarks", e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded p-2 w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-3 rounded-b">
              <button
                type="button"
                onClick={handleCloseModal}
                className="border shadow text-black hover:bg-gray-200 font-medium rounded px-5 py-2"
              >
                Close
              </button>
              <button
                type="submit"
                className="text-white bg-blue-700  hover:bg-blue-800 font-medium rounded px-8 py-2"
              >
                {editModal ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default ServiceCharge;
