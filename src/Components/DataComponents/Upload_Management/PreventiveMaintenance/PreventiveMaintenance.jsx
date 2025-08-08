import React, { useEffect, useState } from "react";

import FormControl from "@mui/joy/FormControl";

import Input from "@mui/joy/Input";

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
  const [searchTotalRecords, setSearchTotalRecords] = useState(0); // New state for search total

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [cityList, setCityList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDownloadingPM, setIsDownloadingPM] = useState(false);

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
  const getCities = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/collections/city`)
      .then((res) => {
        setCityList(res.data.city);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    // getCities();
  }, []);

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
        `${process.env.REACT_APP_BASE_URL}/upload/pmsearch?q=${searchQuery}&page=${page}&limit=${limit}`
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
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setPage(1);
      getData();
      return;
    }

    setPage(1);
    setLoader(true);
    setIsSearchMode(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/upload/pmsearch?q=${searchQuery}&page=1&limit=${limit}`
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
          response.data.totalRecords || response.data.pms.length;
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
      setSearchTotalRecords(totalSearchRecords); // ✅ now only uses totalRecords
    } catch (error) {
      console.error("Error searching records:", error);
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

  // Updated useEffect to handle search mode
  useEffect(() => {
    if (isSearchMode && searchQuery.trim()) {
      handleSearchWithPagination();
    } else if (!isSearchMode) {
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3 justify-center">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search"
                  startDecorator={<SearchIcon />}
                  value={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </FormControl>
              <button
                onClick={handleSearch}
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 mb-2"
              >
                Search
              </button>
              {isSearchMode && (
                <button
                  onClick={clearSearch}
                  type="button"
                  className="text-white w-full col-span-2 px-5 md:col-span-1 bg-gray-600 hover:bg-gray-700 focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 mb-2"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2"
              >
                Create
              </button>
              <button
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2"
              >
                Filter
              </button>
              <button
                className={`text-white w-full text-nowrap col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2 ${
                  isDownloadingPM
                    ? "bg-gray-500 cursor-not-allowed"
                    : "text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2"
                }`}
                onClick={downloadPMExcel}
                disabled={isDownloadingPM}
              >
                {isDownloadingPM ? (
                  <>
                    <div className="flex items-center">
                      <LoadingSpinner />
                      Downloading...
                    </div>
                  </>
                ) : (
                  <>Download Excel</>
                )}
              </button>
            </div>
          </div>

          {/* {selectedRows?.length > 0 && (
            <div className="flex justify-center">
              <button
                type="button"
                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 focus:ring-red-800 font-medium rounded-[4px] text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Delete Selected
              </button>
            </div>
          )} */}

          {/* Updated total records display */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded ">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {isSearchMode ? (
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
              {Math.min(page * limit, getCurrentTotalRecords())} of{" "}
              {getCurrentTotalRecords()}{" "}
              {isSearchMode ? "search results" : "entries"}
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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&amp;_tr:last-child]:border-0">
                {data?.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={item?._id}
                      className="border-b transition-colors data-[state=selected]:bg-muted"
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center p-8 text-gray-500">
                      {isSearchMode
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
